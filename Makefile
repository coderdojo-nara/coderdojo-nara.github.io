# Astroサーバー起動（開発）
serve:
	npm run dev

# Astroビルド
build:
	npm run build

# Astroプレビュー（ビルド後に起動）
preview: build
	npm run preview

# 依存関係のインストール
install:
	npm install

# ビルド後にサイトを同期
release: build
	rsync -avz --delete ./dist/ pote2@pote2.sakura.ne.jp:/home/pote2/www/crssrds.jp/dist/

# check.txt内のURLアクセステスト（make serveでサーバー起動後に実行）
check:
	@while IFS= read -r url; do \
		status=$$(curl -s -o /dev/null -w "%{http_code}" "$$url"); \
		if [ "$$status" = "200" ]; then \
			echo "OK  $$url"; \
		else \
			echo "NG  $$url ($$status)"; \
		fi; \
	done < check.txt > check_result.txt
	@echo "完了: check_result.txt に出力しました"

# check_result.txt の全URLをブラウザで開く
open-check:
	@open $$(awk '{print $$2}' check_result.txt | tr '\n' ' ')
