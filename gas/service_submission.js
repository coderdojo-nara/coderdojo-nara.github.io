/**
 * service_submission.gs — 送信 1 件を処理するドメインロジック。
 *
 * 記録（スプレッドシート）と通知メールは独立した設定として扱い、
 * 「設定があるものだけ」処理する。Discord 通知はフロント側の担当。
 *
 * フロー（Courier の背骨）:
 *   1. フィールド検証（required / trim）
 *   2. 記録＝設定があれば確定点（appendSubmissionRow_）。
 *      同一 submissionId の再送は冪等に握り、二重記録しない。未設定ならスキップ
 *   3. 通知メール＝設定があれば送信（sendNotificationMail_）。未設定ならスキップ。
 *      記録がある場合は best-effort（失敗しても記録は残る）。
 *      記録が無い場合はメールが確定点（失敗ならエラーを返して再送を促す）
 *   4. メール結果をシートの状態列へ書き戻す（記録がある場合のみ・best-effort）
 *   5. 送信者への自動返信＝best-effort（sendAutoReplyMail_）。設定があり宛先が妥当な時のみ
 *
 * 記録・メールとも未設定なら何もせず成功を返す（GAS 側の処理なし＝成功扱い）。
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

  // 2. 記録＝設定があれば確定点。未設定なら skipped で返り、メール側の処理へ進む。
  //    同一 送信ID の再送なら二重記録・二重通知せず、そのまま成功を返す。
  const appended = appendSubmissionRow_(def, data, submissionId);
  if (appended.duplicate) {
    return { ok: true };
  }
  const recorded = !appended.skipped;
  const row = recorded ? appended.row : 0;

  // 3. 通知メール＝設定があれば送信（未設定は '未設定' でスキップ）。
  let status;
  let mailFailed = false;
  try {
    status = sendNotificationMail_(def, data);
  } catch (mailErr) {
    mailFailed = true;
    status = '失敗: ' + (mailErr && mailErr.message ? mailErr.message : mailErr);
    console.error('通知メール送信に失敗: ' + (mailErr && mailErr.stack ? mailErr.stack : mailErr));
  }

  // 4. 状態列の書き戻しは記録がある場合のみ（best-effort・失敗はログのみ）。
  if (recorded) {
    try {
      writeMailStatus_(def, row, status);
    } catch (writeErr) {
      console.error('状態列の書き戻しに失敗: ' + (writeErr && writeErr.stack ? writeErr.stack : writeErr));
    }
  }

  // 記録が無い場合はメールが確定点。メールも失敗すると送信内容がどこにも残らないため、
  // 成功と偽らずエラーを返してクライアントに再送を促す。
  if (!recorded && mailFailed) {
    return { ok: false, error: '受付処理に失敗しました。時間をおいて再度お試しください。' };
  }

  // 5. 送信者への自動返信＝best-effort。記録・通知の結果には影響させない。
  let autoReplyStatus;
  try {
    autoReplyStatus = sendAutoReplyMail_(def, data);
  } catch (replyErr) {
    autoReplyStatus = '失敗: ' + (replyErr && replyErr.message ? replyErr.message : replyErr);
    console.error('自動返信メール送信に失敗: ' + (replyErr && replyErr.stack ? replyErr.stack : replyErr));
  }
  if (recorded) {
    try {
      writeAutoReplyStatus_(def, row, autoReplyStatus);
    } catch (writeErr) {
      console.error('自動返信 状態列の書き戻しに失敗: ' + (writeErr && writeErr.stack ? writeErr.stack : writeErr));
    }
  }

  return { ok: true };
}
