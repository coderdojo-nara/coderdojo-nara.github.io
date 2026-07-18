# 変数の定義
COMMAND=clasp
# デプロイID(初回デプロイ後に払い出される値を設定する)
DEPLOY_ID=AKfycbxmqio3iDQYH3E2LpgR0KilJOBvtYQaSafe4h3YR56QHMbGBnBn59q7qtxgbebmI0beDw

# 認証
login:
	$(COMMAND) login

# スクリプトをクラウドに反映
push:
	$(COMMAND) push

# クラウドのスクリプトをローカルに取り込み
pull:
	$(COMMAND) pull

# スクリプトを開く
open:
	$(COMMAND) open-script

# コンテナを開く
container:
	$(COMMAND) open-container

# webアプリを開く
app:
	$(COMMAND) open-web-app $(DEPLOY_ID)

# 新しいデプロイを作成
create-deploy:
	$(if $(d),,$(error "エラー: 引数 d が指定されていません。例: make create-deploy d=explanation"))
	$(COMMAND) deploy --description "$(d)"

# デプロイを更新
deploy:
	$(if $(d),,$(error "エラー: 引数 d が指定されていません。例: make deploy d=explanation"))
	$(COMMAND) deploy --deploymentId $(DEPLOY_ID) \
		--description "$(d)"

# 現在のバージョンを表示
version:
	@echo "現在のバージョン: $$(sed -n 's/.*const APP_VERSION = "\([^"]*\)".*/\1/p' main.js)"

# バージョン情報を書き換えてリリース
release:
	$(if $(v),,$(error "エラー: 引数 v が指定されていません。例: make release v=v1.01"))
	sed -i '' 's/const APP_VERSION = "[^"]*"/const APP_VERSION = "$(v)"/' main.js
	$(COMMAND) push
	$(COMMAND) deploy --deploymentId $(DEPLOY_ID) --description "$(v)"
