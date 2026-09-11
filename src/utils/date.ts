/** サイト全体の日付表示・年の算出は日本時間（JST）で固定する。 */
const JST_TIME_ZONE = "Asia/Tokyo";

const postDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: JST_TIME_ZONE,
});

const jstYearFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  timeZone: JST_TIME_ZONE,
});

/** 記事の日付を「2025年1月1日」形式（JST基準）で返す。 */
export function formatPostDate(date: Date): string {
  return postDateFormatter.format(date);
}

/** JST基準の年（例: "2025"）を返す。 */
export function getJstFullYear(date: Date): string {
  return jstYearFormatter.format(date);
}
