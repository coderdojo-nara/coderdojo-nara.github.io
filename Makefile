# 変数の定義
JEKYLL = bundle exec jekyll

# サーバー起動
serve:
	$(JEKYLL) serve

# ビルドのみ実行
build:
	$(JEKYLL) build

# 依存関係のインストール
install:
	bundle install