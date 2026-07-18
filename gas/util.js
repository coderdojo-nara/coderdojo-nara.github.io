/**
 * util.gs — 汎用ヘルパー。
 */

/**
 * JST の "yyyy-MM-dd HH:mm:ss" を返す（受信日時の採番に使う）。
 * @param {Date} [date]
 * @return {string}
 */
function jstTimestamp_(date) {
  return Utilities.formatDate(date || new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * "{name} 様" のようなテンプレートに data の値を差し込む。
 * 未知のキーは空文字に置換する。
 * @param {string} template
 * @param {object} data
 * @return {string}
 */
function renderTemplate_(template, data) {
  return String(template).replace(/\{(\w+)\}/g, function (_, key) {
    return data[key] != null ? String(data[key]) : '';
  });
}

/**
 * メールアドレスとして妥当そうかの簡易判定（自動返信の宛先ガード用）。
 * 任意アドレスへの送信踏み台化を避けるため、送る前に必ず通す。
 * @param {*} value
 * @return {boolean}
 */
function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value == null ? '' : value).trim());
}

/**
 * サーバー側の入力形式検証（フロントの CourierField.validation と同じ語彙）。
 * フロントの JS 検証はバイパス可能なため、記録前に GAS 側でも担保する。
 * 空値は required に委ねるので、ここでは値がある時だけ検査する。
 */
const FIELD_VALIDATORS = {
  number: {
    test: function (v) { return /^[0-9]+$/.test(v); },
    message: '半角数字で入力してください。',
  },
  halfwidth: {
    test: function (v) { return /^[\x20-\x7E]+$/.test(v); },
    message: '半角文字で入力してください。',
  },
  email: {
    test: function (v) { return isValidEmail_(v); },
    message: 'メールアドレスの形式が正しくありません。',
  },
  phone: {
    // ハイフン・空白を除去してから桁数を検査（国内 10〜11 桁）。フロントと同一ロジック。
    test: function (v) { return /^0\d{9,10}$/.test(v.replace(/[-\s]/g, '')); },
    message: '電話番号の形式が正しくありません。',
  },
};

/**
 * 1フィールドの値を検証する。問題なければ ''、あればエラーメッセージを返す。
 * @param {object} field  FORM_DEFINITIONS の field（validation / maxLength を見る）
 * @param {string} value  trim 済みの値
 * @return {string}
 */
function validateFieldValue_(field, value) {
  if (value === '') return ''; // 空は required に委ねる
  if (field.maxLength && value.length > field.maxLength) {
    return field.label + ' が長すぎます（' + field.maxLength + ' 文字以内で入力してください）。';
  }
  const rule = field.validation && FIELD_VALIDATORS[field.validation];
  if (rule && !rule.test(value)) {
    return field.label + '：' + rule.message;
  }
  return '';
}
