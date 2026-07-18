/**
 * service_submission.gs — 送信 1 件を処理するドメインロジック。
 *
 * フロー（Courier の背骨）:
 *   1. フィールド検証（required / trim）
 *   2. 記録＝確定点（appendSubmissionRow_）。同一 submissionId の再送は冪等に握り、二重記録しない
 *   3. 通知メール＝best-effort（sendNotificationMail_）。失敗しても記録は残す
 *   4. メール結果をシートの状態列へ書き戻す（best-effort）
 *   5. 送信者への自動返信＝best-effort（sendAutoReplyMail_）。設定があり宛先が妥当な時のみ
 */

/**
 * @param {object} def      FORM_DEFINITIONS の 1 エントリ
 * @param {object} payload  doPost で受けた生データ（type を含む）
 * @return {{ok: boolean, error?: string}}
 */
function handleSubmission_(def, payload) {
  // 1. 検証 ＆ 正規化。required 欠落は例外にしてクライアントに再送させる。
  const data = {};
  def.fields.forEach(function (f) {
    const raw = payload[f.name];
    const value = raw == null ? '' : String(raw).trim();
    if (f.required && value === '') {
      throw new Error(f.label + ' が入力されていません。');
    }
    // 形式検証（サーバー側の担保）。空値は上の required に委ねる。
    const formatErr = validateFieldValue_(f, value);
    if (formatErr) {
      throw new Error(formatErr);
    }
    data[f.name] = value;
  });

  const submissionId = payload.submissionId != null ? String(payload.submissionId) : '';

  // 2. 記録＝確定点。ここが成功して初めて「受け付けた」とみなす。
  //    同一 送信ID の再送なら二重記録・二重通知せず、そのまま成功を返す。
  const appended = appendSubmissionRow_(def, data, submissionId);
  if (appended.duplicate) {
    return { ok: true };
  }
  const row = appended.row;

  // 3. 通知メール＝best-effort。失敗しても記録には影響させない。
  let status;
  try {
    sendNotificationMail_(def, data);
    status = '送信済';
  } catch (mailErr) {
    status = '失敗: ' + (mailErr && mailErr.message ? mailErr.message : mailErr);
    console.error('通知メール送信に失敗: ' + (mailErr && mailErr.stack ? mailErr.stack : mailErr));
  }

  // 4. 状態列の書き戻しも best-effort（失敗はログのみ）。
  try {
    writeMailStatus_(def.sheetName, row, status);
  } catch (writeErr) {
    console.error('状態列の書き戻しに失敗: ' + (writeErr && writeErr.stack ? writeErr.stack : writeErr));
  }

  // 5. 送信者への自動返信＝best-effort。記録・通知の結果には影響させない。
  let autoReplyStatus;
  try {
    autoReplyStatus = sendAutoReplyMail_(def, data);
  } catch (replyErr) {
    autoReplyStatus = '失敗: ' + (replyErr && replyErr.message ? replyErr.message : replyErr);
    console.error('自動返信メール送信に失敗: ' + (replyErr && replyErr.stack ? replyErr.stack : replyErr));
  }
  try {
    writeAutoReplyStatus_(def.sheetName, row, autoReplyStatus);
  } catch (writeErr) {
    console.error('自動返信 状態列の書き戻しに失敗: ' + (writeErr && writeErr.stack ? writeErr.stack : writeErr));
  }

  return { ok: true };
}
