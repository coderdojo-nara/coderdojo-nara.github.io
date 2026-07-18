/**
 * repo_sheet.gs — スプレッドシートの読み書き（記録＝確定点）。
 *
 * - 書き込みは LockService で排他（同時送信での行崩れ防止）。
 * - 列はヘッダー名から解決（getColumnMap_）。列位置をハードコードしない。
 * - シートスキーマ: [受信日時, <各 field の label...>, 通知メール, 送信ID]
 * - 送信ID 列で冪等性を担保（再送での二重記録を防ぐ）。
 */

const RECEIVED_AT_HEADER = '受信日時';
const MAIL_STATUS_HEADER = '通知メール';
const AUTO_REPLY_STATUS_HEADER = '自動返信';
const SUBMISSION_ID_HEADER = '送信ID';

/**
 * 記録先スプレッドシートを取得する。
 * スクリプトプロパティ SPREADSHEET_ID があればそれを開き、
 * 無ければコンテナバインドのアクティブなスプレッドシートを使う。
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('記録先スプレッドシートが見つかりません。コンテナバインドで使うか、スクリプトプロパティ SPREADSHEET_ID を設定してください。');
  }
  return active;
}

/**
 * 定義からヘッダー行（[受信日時, ...labels, 通知メール]）を組み立てる。
 * @param {object} def
 * @return {string[]}
 */
function buildHeaders_(def) {
  return [RECEIVED_AT_HEADER]
    .concat(def.fields.map(function (f) { return f.label; }))
    .concat([MAIL_STATUS_HEADER, AUTO_REPLY_STATUS_HEADER, SUBMISSION_ID_HEADER]);
}

/**
 * 送信 1 件をシートに追記する（確定点）。
 * 通知メール列は仮に「送信中」を入れ、送信ID 列に一意キーを記録する。
 *
 * 冪等性：同一 送信ID の行が既にあれば追記せず、その行番号を duplicate=true で返す。
 * これにより「記録は成功したがレスポンスが届かず再送された」ケースでも二重記録しない。
 *
 * @param {object} def          FORM_DEFINITIONS の 1 エントリ
 * @param {object} data         検証済みフィールド値
 * @param {string} submissionId フロント生成の一意キー（空なら冪等判定しない）
 * @return {{row: number, duplicate: boolean}}
 */
function appendSubmissionRow_(def, data, submissionId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName(def.sheetName);
    if (!sheet) sheet = ss.insertSheet(def.sheetName);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(buildHeaders_(def));
    } else {
      // 既存シートに 送信ID 列が無ければ末尾へ追加（追加的マイグレーション）。
      ensureColumn_(sheet, SUBMISSION_ID_HEADER);
    }

    // 冪等：同一 送信ID の行があれば追記しない。
    const existing = findRowBySubmissionId_(sheet, submissionId);
    if (existing) return { row: existing, duplicate: true };

    // 既存シートの列並びに耐えるよう、ヘッダー名で位置を解決して行を組む。
    const colMap = getColumnMap_(sheet);
    const row = new Array(sheet.getLastColumn()).fill('');
    setCell_(row, colMap, RECEIVED_AT_HEADER, jstTimestamp_());
    def.fields.forEach(function (f) {
      setCell_(row, colMap, f.label, data[f.name] != null ? data[f.name] : '');
    });
    setCell_(row, colMap, MAIL_STATUS_HEADER, '送信中');
    setCell_(row, colMap, SUBMISSION_ID_HEADER, submissionId || '');

    sheet.appendRow(row);
    return { row: sheet.getLastRow(), duplicate: false };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 指定ヘッダーの列が無ければ末尾に追加する（既存シートへの追加的マイグレーション）。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} header
 */
function ensureColumn_(sheet, header) {
  if (getColumnMap_(sheet)[header] != null) return;
  sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
}

/**
 * 送信ID 列を走査し、一致する行番号（1始まり）を返す。無ければ 0。
 * submissionId が空、または 送信ID 列が無い場合は 0（＝冪等判定しない）。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} submissionId
 * @return {number}
 */
function findRowBySubmissionId_(sheet, submissionId) {
  if (!submissionId) return 0;
  const idx = getColumnMap_(sheet)[SUBMISSION_ID_HEADER];
  if (idx == null) return 0;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const values = sheet.getRange(2, idx + 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(submissionId)) return i + 2;
  }
  return 0;
}

/**
 * 指定行・指定ヘッダー列に状態を書き戻す（best-effort）。
 * 列が無ければ末尾に追加してから書く。失敗しても記録本体には影響させない。
 * @param {string} sheetName
 * @param {number} row
 * @param {string} header  書き込み先の列見出し
 * @param {string} status
 */
function writeStatusCell_(sheetName, row, header, status) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) return;
  ensureColumn_(sheet, header);
  const idx = getColumnMap_(sheet)[header];
  if (idx == null) return;
  sheet.getRange(row, idx + 1).setValue(status);
}

/**
 * 「通知メール」列に送信結果を書き戻す（best-effort）。
 * @param {string} sheetName
 * @param {number} row
 * @param {string} status  '送信済' / '失敗: ...'
 */
function writeMailStatus_(sheetName, row, status) {
  writeStatusCell_(sheetName, row, MAIL_STATUS_HEADER, status);
}

/**
 * 「自動返信」列に送信結果を書き戻す（best-effort）。
 * @param {string} sheetName
 * @param {number} row
 * @param {string} status  '送信済' / '未設定' / '対象外' / '失敗: ...'
 */
function writeAutoReplyStatus_(sheetName, row, status) {
  writeStatusCell_(sheetName, row, AUTO_REPLY_STATUS_HEADER, status);
}

/**
 * ヘッダー行（1行目）から「ヘッダー名 → 列インデックス(0始まり)」を作る。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {Object<string, number>}
 */
function getColumnMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return Object.fromEntries(headers.map(function (h, i) { return [h, i]; }));
}

/**
 * colMap にヘッダーがあれば row の該当位置に値を入れる。無ければ無視。
 * @param {Array} row
 * @param {Object<string, number>} colMap
 * @param {string} header
 * @param {*} value
 */
function setCell_(row, colMap, header, value) {
  const idx = colMap[header];
  if (idx != null) row[idx] = value;
}
