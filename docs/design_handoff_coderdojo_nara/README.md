# Handoff: CoderDojo 奈良 サイトリニューアル

## Overview
CoderDojo 奈良（子ども向けの無料プログラミングクラブ）の公式サイトのリニューアルデザインです。現行サイト（https://coderdojo-nara.github.io/ ）の文章をそのまま活かしつつ、保護者・メンター/支援者候補にも安心感・信頼感を与える「クリーンモダン」方向にリデザインしています。全5ページ（ホーム / About / 参加する / Blog / お問い合わせ）で構成されます。

主要な設計意図:
- **CoderDojoの理解を最優先の導線**に（Aboutへの誘導を各所に配置）。
- **次回開催日を最も目立つ要素**として、ホームのヒーロー横に固定カードで表示。
- 参加申し込みは connpass 経由、お問い合わせは Google フォーム / X という現行の外部導線を踏襲。

## About the Design Files
このバンドルに含まれる `.dc.html` ファイルは **HTMLで作成されたデザイン参照（プロトタイプ）** です。意図した見た目と挙動を示すものであり、そのまま本番コードとして流用する前提ではありません。

これらのファイルは独自のランタイム（`support.js` に依存する「Design Component」形式）で書かれており、そのままでは通常の環境では動きません。**タスクは、これらのHTMLデザインをターゲットのコードベースの既存環境（React / Vue / Astro / 静的HTML など）に、その環境の確立されたパターンとライブラリを用いて作り直すこと**です。環境がまだ無い場合は、プロジェクトに最適なフレームワークを選定して実装してください。

> 現行サイトは GitHub Pages（静的サイトジェネレータ）で運用されているため、**Astro もしくは同種の静的サイトジェネレータ + Markdown による記事管理**が最も自然な移行先です。ただし最終判断は実装者に委ねます。

`.dc.html` を読む際の対応関係:
- `<helmet>…</helmet>` 内 = `<head>` 相当（フォント読み込み・リセットCSS）。
- `<x-dc>` の中身に相当する本文 = そのページの `<body>` マークアップ。
- スタイルは基本すべて**インラインstyle**。トークン化されていないため、下記「Design Tokens」を参照して実装側で変数化してください。
- Blog ページの記事データは、ロジッククラスの `renderVals()` 内の `posts` 配列に入っています（実装ではCMS/Markdownフロントマターに置き換え）。

## Fidelity
**High-fidelity (hifi)**。最終的な配色・タイポグラフィ・余白・角丸・影・ホバー挙動まで作り込んであります。実装側の既存ライブラリ/パターンを使いつつ、見た目はこのデザインに忠実に再現してください。

## Screens / Views

共通要素（全ページ）:
- **ヘッダーナビ**: 背景 `#1F3A5F`、文字 `#fff`。左にロゴ「CoderDojo 奈良」(font-weight 900 / 20px / letter-spacing 0.02em)。右にリンク（ホーム / About / 参加する / Blog / お問い合わせ、14px）＋ CTAボタン「参加申し込み」(背景 `#E8A23D` / 文字 `#22303F` / font-weight 700 / padding 8px 20px / radius 6px)。現在ページのリンクは `#fff` + weight 700、非アクティブは `#C4D0DE`。
- 内側コンテナ幅: `max-width: 1200px; margin: 0 auto; padding: 0 32px`。狭い画面ではナビは `flex-wrap: wrap; gap: 16px`。
- **フッター**: 背景 `#16293F`、文字 `#8FA3B8`、13px。左にコピーライト、右にナビ複製＋ X リンク（`#E8A23D` / weight 700）。`flex-wrap: wrap`。

### 1. ホーム (Home.dc.html)
- **Purpose**: サイトの入口。CoderDojoの概要理解と次回開催日の把握、参加/About への誘導。
- **Layout**:
  - ヒーロー: 背景 `linear-gradient(180deg,#F4F6F9 0%,#fff 100%)`。`grid-template-columns: 1fr 400px; gap: 48px; padding: 64px 32px`。左=見出し＋本文＋ボタン、右=次回開催カード。
  - ヒーロー下に全幅の写真バンド（高さ320px）。
  - Be Cool!セクション: `grid 320px 1fr`。
  - 開催情報 3カラム（場所/開催日/参加費、罫線で仕切ったテーブル風カード）＋ 参加誘導バナー（ネイビー地）。背景 `#F4F6F9`。
  - 最近のブログ記事リスト（4件、罫線区切り）。
- **主要コンポーネント**:
  - 見出し `h1`: 42px / weight 900 / line-height 1.4 / color `#1F3A5F`。「CoderDojo 奈良へようこそ」。上に小見出し「子どものためのプログラミングクラブ」(14px / weight 700 / letter-spacing 0.12em / `#1F3A5F`)。
  - 本文: 16px / line-height 2 / `#4A5A6A`。
  - CTAボタン: プライマリ=背景 `#1F3A5F` / 文字 `#fff` / padding 14px 36px / radius 8px。セカンダリ=`border: 2px solid #1F3A5F` / 文字 `#1F3A5F`。両方 `white-space: nowrap`。
  - **次回開催カード**（最重要）: 白地 / `border: 1px solid #DDE4EC` / radius 16px / `box-shadow: 0 12px 32px rgba(20,40,70,0.12)`。上部に `#E8A23D` の帯「次回の開催」(weight 900 / letter-spacing 0.08em)。本体に日付「7/18」(40px / weight 900 / `#1F3A5F`) +「（土）」+「13:00〜17:00」、会場、バッジ2つ（`参加費 無料`= 背景`#EFF4E6`文字`#567D2E`、`connpass受付`= 背景`#E9F0F8`文字`#1F3A5F`、13px/weight700/padding 4px 12px/radius 4px）、CTA「申し込みページへ」(→ connpass)。
  - 開催情報カード: 白地セルを `gap:1px; background:#DDE4EC` で罫線化、外枠 radius 12px。ラベルは 13px / weight 700 / `#8595A5` / letter-spacing 0.1em、本文 15px / weight 500。
  - 参加誘導バナー: 背景 `#1F3A5F` / 文字 `#fff` / radius 12px / padding 40px 48px。見出し24px、本文 `#C4D0DE`。ボタン「参加方法を見る」(amber) と「お問い合わせ」(白枠線)。
  - ブログ行: `grid 110px 1fr`、日付 13px `#8595A5`、タイトル weight 500。

### 2. About (About.dc.html)
- **Purpose**: CoderDojoとは何かの理解。最優先導線のゴール。
- **Layout**: ページヘッダー（グラデ背景・小見出し「ABOUT」amber）→ What Is CoderDojo（英/日 2カラム、`grid 1fr 1fr; gap 32px`。英語カードは白枠線、日本語カードは `#F4F6F9` 地）→ ガイダンス（`grid 1fr 420px`、右に画像スロット、`#F4F6F9`地）→ 動画セクション（`grid 480px 1fr`、YouTube 埋め込み 16:9）→ CTAバナー（ネイビー地）。
- ページ見出し `h1`: 38px / weight 900 / `#1F3A5F`。小見出しラベル: 13px / weight 900 / letter-spacing 0.16em / `#E8A23D`。
- 動画: `iframe src="https://www.youtube.com/embed/gLDue2xb1j8?rel=0"`、コンテナ radius 12px / shadow / `aspect-ratio: 16/9`。
- 本文コピーは英日対訳（現行サイト準拠）。

### 3. 参加する (Join.dc.html)
- **Purpose**: 参加の心構えと2種類の参加導線（ニンジャ / サポーター）の提示。
- **Layout**: ページヘッダー → 活動理念テキスト（`grid 1fr 420px`、右に写真）→ Be Cool!（`#F4F6F9`地）→ 参加方法2カード（`grid 1fr 1fr`、等高 flex カラム）→ CTA（ネイビー地・中央寄せ）。
- 参加カード左: ヘッダ帯 `#1F3A5F`「ニンジャとして参加したい」、本文＋注意ボックス（背景`#FDF4E3`/文字`#7A6230`/radius 8px）＋ CTA「connpassで申し込む」(amber)。
- 参加カード右: ヘッダ帯 `#E8A23D`「ボランティアスタッフ・サポーターとして参加したい」、本文＋写真＋CTA「スタッフ募集ページを見る」(ネイビー枠線)。
- ナビの「参加申し込み」CTA はこのページのみ connpass へ直接リンク。

### 4. Blog (Blog.dc.html)
- **Purpose**: 開催レポート・お知らせの記事一覧。
- **Layout**: ページヘッダー → 記事リスト（`max-width: 900px`、各行 `grid 130px 90px 1fr; gap 20px`：日付 / 著者 / タイトル、下罫線）→ ページネーション（現在ページ=ネイビー塗り38px角丸、他=枠線）。
- タイトル 16px / weight 700 / line-height 1.7、日付 13px `#8595A5`、著者 12px / weight 700 / `#E8A23D`。
- 記事データは `renderVals().posts`（`{date, author, title}`）配列。実装ではMarkdown等に置換。

### 5. お問い合わせ (Contact.dc.html)
- **Purpose**: 連絡手段の提示（フォーム / X / スタッフ紹介）。
- **Layout**: ページヘッダー → 3カラムカード（`grid 1fr 1fr 1fr; gap 28px`）。各カードは白枠線 / radius 12px / padding 36px / 等高 flex、上部にアイコンチップ48px、見出し19px、本文14px、下端にCTA。
  - カード1: アイコン地`#E9F0F8`文字`#1F3A5F`、「お問い合わせフォーム」→ Google フォーム（塗りネイビーCTA）。
  - カード2: アイコン地`#22303F`文字`#fff`、「X（旧Twitter）」→ `@CoderDojoNara`（ネイビー枠線CTA）。
  - カード3: アイコン地`#FDF4E3`文字`#E8A23D`、「どんな人がやってるの？」→ スタッフ紹介（amber枠線CTA）。

## Interactions & Behavior
- **ナビゲーション**: ページ間は相対リンク（`Home.dc.html` 等）。実装ではルーティングに置換。
- **外部リンク**（実データ、そのまま利用可）:
  - 参加申し込み / connpass: `https://coderdojo-nara-ikoma.connpass.com/`
  - お問い合わせフォーム: `https://forms.gle/tYBwSvrEiEYujNNa7`
  - X: `https://x.com/CoderDojoNara`
  - Aboutガイダンス: `https://coderdojo-nara.github.io/about/`
  - スタッフ募集: `https://coderdojo-nara.github.io/crew-wanted/`
  - スタッフ紹介: `https://coderdojo-nara.github.io/staff/`
- **ホバー**: 全リンク/ボタンは `opacity: 0.85`（`a:hover`）。実装で踏襲するか、より明示的なカラーホバーに置き換えてよい。
- **レスポンシブ**: PC/スマホ両対応前提。すべての `grid-template-columns` は狭幅で1カラムに落とすこと（現状は固定gridなので、実装時に `@media` かコンテナクエリでスタックさせる）。ナビは `flex-wrap: wrap` 済み。ヒーローの `1fr 400px` などは 768px 以下で縦積み推奨。
- **次回開催日**: ハードコード（7/18）。実装ではデータ駆動（次回イベント自動反映 or 手動更新）にすることを推奨。

## State Management
静的サイト想定のため基本的にクライアント状態は不要。
- Blog: 記事一覧はビルド時にMarkdown/データソースから生成。ページネーションはビルド時 or ルート分割。
- 次回開催日カード: 単一のデータオブジェクト（日付・時間・会場・申込URL）を1箇所で管理し、ホームで参照。

## Design Tokens

### Colors
| 用途 | Hex |
|---|---|
| プライマリ（ネイビー） | `#1F3A5F` |
| フッター濃ネイビー | `#16293F` |
| アクセント（アンバー） | `#E8A23D` |
| アンバー濃（文字用） | `#B07817` |
| 本文テキスト | `#22303F` |
| サブテキスト | `#4A5A6A` |
| 淡色テキスト/ラベル | `#8595A5` |
| ナビ非アクティブ文字 | `#C4D0DE` |
| フッター文字 | `#8FA3B8` |
| 背景（薄グレー） | `#F4F6F9` |
| 罫線/ボーダー | `#DDE4EC` / `#E4E9EF` |
| 成功バッジ地/文字 | `#EFF4E6` / `#567D2E` |
| 情報バッジ地 | `#E9F0F8` |
| 注意ボックス地/文字 | `#FDF4E3` / `#7A6230` |
| 白 | `#fff` |
| ヒーローグラデ | `linear-gradient(180deg,#F4F6F9 0%,#fff 100%)` |

### Typography
- フォント: **Noto Sans JP**（Google Fonts、weights 400/500/700/900）。`font-family: 'Noto Sans JP', sans-serif`。
- スケール: h1 = 38–42px/900、セクション見出し = 24px/900、カード見出し = 19–22px/900、本文 = 15–16px/line-height 2、ラベル = 13px/700/letter-spacing 0.1–0.16em、小 = 12–13px。
- 次回開催日の数字: 40px/900。

### Spacing
- コンテナ幅 1200px（Blogのみ 900px）、左右パディング 32px。
- セクション縦パディング 56–64px。カード内 padding 28–36px。要素間 gap 主に 16 / 24 / 28 / 32 / 48px。

### Radius
- ボタン 6–8px、カード 12–16px、バッジ 4px、アイコンチップ 10px。

### Shadows
- カード: `0 12px 32px rgba(20,40,70,0.12)`。
- 動画コンテナ: `0 12px 32px rgba(20,40,70,0.15)`。

## Assets
- **フォント**: Noto Sans JP（Google Fonts CDN）。
- **写真**: 未確定。デザイン内では画像プレースホルダ（ドラッグ&ドロップ枠）を使用。実装時に実際の活動写真を差し込む。配置箇所: ホームのヒーロー下バンド、About のガイダンスサムネイル、参加ページのDojo写真とサポーター写真。
- **動画**: YouTube 埋め込み（`gLDue2xb1j8`）。
- **アイコン**: 絵文字/記号（✉ 𝕏 👋 📍 等）を暫定使用。実装では適切なアイコンライブラリ（例: Lucide, Heroicons）への置換を推奨。
- ロゴ画像は未使用（テキストロゴ）。必要なら別途支給。

## Files
- `Home.dc.html` — ホーム
- `About.dc.html` — About（CoderDojoとは）
- `Join.dc.html` — 参加する
- `Blog.dc.html` — Blog 記事一覧（記事データは `renderVals().posts`）
- `Contact.dc.html` — お問い合わせ
- `image-slot.js` — デザイン参照用の画像プレースホルダ部品（**本番不要**。実際の `<img>` に置換すること）

> 注: `.dc.html` は独自ランタイム前提のため、`<head>`相当は `<helmet>`、本文は `<x-dc>` 相当のマークアップとして読み替えてください。スタイルはインラインで、上記トークンを参照して実装側で変数化することを推奨します。
