/**
 * config.gs — フォーム種別の定義（FORM_DEFINITIONS）と設定の読み取り。
 *
 * 設定の置き場所は「併用」方針：
 *   - 秘匿値・環境依存ID（記録先スプレッドシートID・通知先メール・Discord URL など）
 *       → スクリプトプロパティ（PropertiesService）。コードに直書きしない。
 *   - 運用者が触る値（シート名・通知メール文面など）
 *       → _config シート（無ければ定義のフォールバックを使う）。
 *
 * テンプレート配布モデル：スプレッドシートごとコピーして使う前提。
 * 記録先はコンテナバインドの getActiveSpreadsheet() を基本とし、
 * ID をハードコードしない（gas-development 7.2）。
 */

/**
 * フォーム種別ごとの定義。type をキーに doPost から引く。
 * 今回は contact のみ。種別追加はこのオブジェクトにキーを足すだけ。
 *
 * fields の順序 = シートのデータ列順。列はヘッダー名（label）で解決する。
 */
const FORM_DEFINITIONS = {
  contact: {
    // 記録先スプレッドシートのURL（ブラウザのアドレスバーからそのまま貼る）。
    // 空文字なら従来どおり スクリプトプロパティ SPREADSHEET_ID → コンテナバインドの順で解決。
    // 注意: デプロイ実行アカウントに対象スプレッドシートの編集権限が必要。
    spreadsheetUrl: '',
    sheetName: 'お問い合わせ',
    fields: [
      // validation / maxLength はサーバー側の形式担保（フロントの検証と揃える）。
      { name: 'name', label: 'お名前', required: true, maxLength: 100 },
      { name: 'email', label: 'メールアドレス', required: true, validation: 'email', maxLength: 254 },
      { name: 'tel', label: '電話番号', required: false, validation: 'phone', maxLength: 20 },
      { name: 'message', label: 'お問い合わせ内容', required: true, maxLength: 2000 },
    ],
    notify: {
      // 件名テンプレート。{name} 等のフィールド名を差し込む（util.gs renderTemplate_）。
      subjectTemplate: '【お問い合わせ】{name} 様',
      // replyTo に使うフィールド（送信者がそのまま返信できるように）
      replyToField: 'email',
      // 送信者への自動返信（オートレスポンダー）。省略すると自動返信しない。
      autoReply: {
        // 送信者アドレスが入っているフィールド名。空／不正な形式なら送らない。
        toField: 'email',
        // 差出人の表示名（任意）
        senderName: 'CoderDojo 奈良',
        subjectTemplate: '【自動返信】お問い合わせありがとうございます',
        // 本文テンプレート。{name} 等を差し込む（複数行可）。
        bodyTemplate: [
          '{name} 様',
          '',
          'お問い合わせいただきありがとうございます。以下の内容で承りました。',
          '担当者より改めてご連絡いたしますので、今しばらくお待ちください。',
          '',
          '──────────────────',
          'お名前　　: {name}',
          'メール　　: {email}',
          '電話番号　: {tel}',
          'お問い合わせ内容:',
          '{message}',
          '──────────────────',
          '',
          '※本メールは自動送信です。心当たりがない場合は破棄してください。',
        ].join('\n'),
      },
    },
  },
};

/**
 * _config シートのキー名（運用者が触る）。定義側のフォールバックがあるので任意。
 */
const CONFIG_KEY_NOTIFY_EMAIL = 'NOTIFY_EMAIL';

/**
 * スクリプトプロパティ ＋ _config シートを合成した設定を返す。
 * 同名キーは _config シート（運用者の指定）を優先する。
 * @return {Object<string, string>}
 */
function getConfig_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const sheetConfig = readConfigSheet_();
  // props を土台に、_config シートの値で上書きする。
  return Object.assign({}, props, sheetConfig);
}

/**
 * _config シート（キー / 値の2列）を読み取ってオブジェクト化する。
 * スプレッドシート自体が未設定、またはシートが無ければ空オブジェクト。
 * 1行目がヘッダーでも空キー扱いで無視される。
 * @return {Object<string, string>}
 */
function readConfigSheet_() {
  const ss = resolveSpreadsheet_();
  if (!ss) return {};
  const sheet = ss.getSheetByName('_config');
  if (!sheet || sheet.getLastRow() === 0) return {};

  const values = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues();
  const map = {};
  values.forEach(function (row) {
    const key = String(row[0]).trim();
    // 空行・コメント行（先頭 #）・見出し行はスキップ
    if (!key || key.charAt(0) === '#' || key === 'キー' || key === 'key') return;
    map[key] = row[1];
  });
  return map;
}
