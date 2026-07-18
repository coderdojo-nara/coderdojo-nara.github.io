/**
 * main.gs — エントリポイント（doGet / doPost）。薄く保つ。
 *
 * Courier の GAS 受け口。フロント（Courier.astro）から
 * Content-Type なしの JSON 文字列 POST を受け取り、payload.type で
 * FORM_DEFINITIONS を引いて「記録（確定点）→ 通知メール（best-effort）」を行う。
 *
 * 戻り値は必ず { ok:true } / { ok:false, error } の JSON。例外は漏らさない。
 */

/**
 * 疎通確認用。ブラウザで /exec を開くと稼働メッセージを返す。
 */
function doGet() {
  return ContentService.createTextOutput('Courier is running.');
}

/**
 * フォーム送信の受け口。
 * @param {GoogleAppsScript.Events.DoPost} e
 * @return {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput_({ ok: false, error: 'リクエストボディがありません。' });
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonOutput_({ ok: false, error: 'データの形式が正しくありません。' });
    }

    const def = FORM_DEFINITIONS[payload && payload.type];
    if (!def) {
      return jsonOutput_({ ok: false, error: 'データの形式が正しくありません。' });
    }

    const result = handleSubmission_(def, payload);
    return jsonOutput_(result);
  } catch (err) {
    // 例外は漏らさず JSON 化する。記録の確定点（handleSubmission_ 内）を
    // 越えられなかった＝受付失敗なので、クライアントに再送させる。
    console.error('doPost error: ' + (err && err.stack ? err.stack : err));
    return jsonOutput_({ ok: false, error: err && err.message ? err.message : '不明なエラーが発生しました。' });
  }
}

/**
 * オブジェクトを JSON の TextOutput に変換して返す共通処理。
 * @param {object} obj
 * @return {GoogleAppsScript.Content.TextOutput}
 */
function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
