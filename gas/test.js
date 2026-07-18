/**
 * test.gs — GAS エディタ上で手動実行する動作確認用。
 *
 * デプロイ前でも、エディタで関数を選んで実行すれば
 * 「シート追記 → 通知メール → 状態列書き戻し」を実地に確認できる。
 * 実行前に SPREADSHEET_ID（コンテナバインドでない場合）と
 * NOTIFY_EMAIL をスクリプトプロパティ／_config に設定しておくこと。
 */

/**
 * contact の送信を1件シミュレートする（実際に記録・メール送信が走る）。
 * 実行後、対象シートに1行追記され、NOTIFY_EMAIL 宛にメールが届けば成功。
 */
function runLocalTest() {
  const payload = {
    type: 'contact',
    name: 'テスト太郎',
    email: 'test@example.com',
    message: 'これは runLocalTest による動作確認送信です。\n改行も含みます。',
  };
  const def = FORM_DEFINITIONS[payload.type];
  const result = handleSubmission_(def, def && payload);
  console.log('runLocalTest result: ' + JSON.stringify(result));
  return result;
}

/**
 * doPost を JSON 文字列レベルで検証する（HTTP を介さずに）。
 */
function runDoPostTest() {
  const e = {
    postData: {
      contents: JSON.stringify({
        type: 'contact',
        name: 'テスト花子',
        email: 'hanako@example.com',
        message: 'doPost 経由の確認送信。',
      }),
    },
  };
  const output = doPost(e);
  console.log('runDoPostTest output: ' + output.getContent());
  return output.getContent();
}
