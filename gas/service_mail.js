/**
 * service_mail.gs — 通知メール（best-effort）。
 *
 * - 宛先は設定（スクリプトプロパティ / _config）から取得。
 * - replyTo に送信者アドレス（def.notify.replyToField）を設定し、
 *   受信者がそのまま返信できるようにする。
 * - 本文・件名は定義のテンプレートからフィールド値を差し込んで生成。
 */

/**
 * 通知メールを送信する。失敗時は例外を投げ、呼び出し側で状態列に記録する。
 * @param {object} def   FORM_DEFINITIONS の 1 エントリ
 * @param {object} data  検証済みフィールド値
 */
function sendNotificationMail_(def, data) {
  const config = getConfig_();
  const to = config[CONFIG_KEY_NOTIFY_EMAIL];
  if (!to) {
    throw new Error('通知先メール（' + CONFIG_KEY_NOTIFY_EMAIL + '）が設定されていません。');
  }

  const notify = def.notify || {};
  const subject = renderTemplate_(notify.subjectTemplate || '【フォーム送信】', data);

  // 本文は「受信日時 ＋ 各フィールドの label: value」のプレーンテキスト。
  const lines = ['受信日時: ' + jstTimestamp_()];
  def.fields.forEach(function (f) {
    lines.push(f.label + ': ' + (data[f.name] != null ? data[f.name] : ''));
  });
  const body = lines.join('\n');

  const options = {};
  if (notify.replyToField && data[notify.replyToField]) {
    options.replyTo = data[notify.replyToField];
  }

  GmailApp.sendEmail(to, subject, body, options);
}

/**
 * 送信者への自動返信（オートレスポンダー）。best-effort。
 * def.notify.autoReply が未設定なら何もしない。宛先が空／不正な形式なら送らない。
 * 送信自体に失敗した場合のみ例外を投げ、呼び出し側で状態列に記録する。
 * @param {object} def   FORM_DEFINITIONS の 1 エントリ
 * @param {object} data  検証済みフィールド値
 * @return {string} 状態（'送信済' / '未設定' / '対象外' / '対象外(不正な宛先)'）
 */
function sendAutoReplyMail_(def, data) {
  const auto = (def.notify && def.notify.autoReply) || null;
  if (!auto) return '未設定';

  const to = data[auto.toField];
  if (!to) return '対象外';
  // 任意アドレスへの送信踏み台化を防ぐため、形式チェックを通った時だけ送る。
  if (!isValidEmail_(to)) return '対象外(不正な宛先)';

  const subject = renderTemplate_(auto.subjectTemplate || '【自動返信】お問い合わせありがとうございます', data);
  const body = renderTemplate_(auto.bodyTemplate || 'お問い合わせいただきありがとうございます。', data);

  const options = {};
  if (auto.senderName) options.name = auto.senderName;
  // 送信者からの返信は運用者の通知先へ集約する（設定があれば）。
  const notifyTo = getConfig_()[CONFIG_KEY_NOTIFY_EMAIL];
  if (notifyTo) options.replyTo = notifyTo;

  GmailApp.sendEmail(to, subject, body, options);
  return '送信済';
}
