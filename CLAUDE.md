# CoderDojo 奈良 公式サイト

Astro 6 製の静的サイト。`main` に push すると GitHub Actions（`.github/workflows/deploy.yml`）がビルドして GitHub Pages に公開する。

## コマンド

- `npm install` — 依存関係のインストール（Node 22。`.node-version` 参照）
- `npm run dev` — 開発サーバー
- `npm run build` — 本番ビルド（`dist/`）。変更後は必ず通ることを確認する
- `npm run check` — lint + prettier チェック（既存コードに未修正のエラーが残っているため、変更したファイルだけ確認すればよい）

## よくある更新

### 次回開催のお知らせ

`src/data/nextEvent.yml` を編集する（日付・曜日・時間・会場・connpass の申込 URL・バッジ）。トップページなどに表示される。

### ブログ記事

`src/content/blog/<年>/YYYY-MM-DD-<slug>.md`（MDX も可）を追加する。frontmatter のスキーマは `src/content.config.ts` の `blogPostSchema`。

```yaml
---
title: 記事タイトル
date: '2026-10-17 00:00:00+09:00'
author: kwaka1208
tags:
  - blog
draft: false # true にすると dev サーバーでのみ表示
images: # 任意。ギャラリー表示される
  - url: /images/2026/10/01.jpg
    alt: null
---
```

画像は `public/images/<年>/<月>/` に置き、`/images/...` で参照する。

### 固定ページ・その他のデータ

- 固定ページ: `src/content/pages/*.md`
- スタッフ・支援者・FAQ・ナビ・フッター・SEO: `src/data/*.yml`
- ページテンプレート: `src/pages/`、コンポーネント: `src/components/`

## その他

- `gas/` は申込フォーム用の Google Apps Script（サイトのビルドとは独立）
- `docs/` は設計資料、`_draft/` は下書き置き場
- コミットメッセージは日本語の短い要約で書く（例: 「次回開催を追加」）
