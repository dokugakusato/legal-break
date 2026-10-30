# オンライン対戦（試作）を試すための準備

本番（今動いている行政書士版・宅建版、Firebase の legal-break-6882d）には一切触りません。
試作は**新しく作る試験用の Firebase プロジェクト**だけで動きます。やめるときは、このプロジェクトと `online-battle` ブランチを消せば元通りです。

所要時間の目安：30〜40分。わからない画面が出たら、スクリーンショットを Claude に見せてください。

---

## 1. 試験用プロジェクトを作る
1. https://console.firebase.google.com を開き「プロジェクトを追加」
2. 名前：`legal-break-battle-test`（IDが少し変わってもよい。**決まったIDを控える**）
3. Google アナリティクスは「オフ」でよい

## 2. 有料プラン（Blaze）にする ※この試験用プロジェクトだけ
1. 左下の「アップグレード」→ Blaze → カードを登録
2. 予算の設定画面が出たら **3,000円** にする（後からでも可：手順 7）

## 3. ログイン・データベースを用意する
1. 「Authentication」→ 始める →「匿名」を**有効**にする
2. 「Firestore Database」→ データベースを作成 → 場所 **asia-northeast1（東京）** → 「本番環境モード」
3. 「Realtime Database」→ データベースを作成 → 場所 **シンガポール（asia-southeast1）** → 「ロックモード」

## 4. ウェブアプリを登録して、設定の値を Claude に渡す
1. プロジェクトの設定（歯車）→「マイアプリ」→ ウェブ（`</>`）→ 名前は `battle` でよい（Hosting のチェックは不要）
2. 出てきた `const firebaseConfig = { ... }` の中身をコピーして Claude に貼る
   → Claude が `battle/config.js` に入れます（公開してよい値です）

## 5. GitHub から公開するための鍵を作る
1. https://console.cloud.google.com を開き、上でプロジェクトを `legal-break-battle-test` に切り替える（**本番を選ばないよう注意**）
2. 「IAM と管理」→「サービス アカウント」→「サービス アカウントを作成」→ 名前 `github-deploy`
3. 役割（ロール）を追加：
   - 編集者
   - Cloud Functions 管理者
   - Cloud Run 管理者
   - サービス アカウント ユーザー
   - Firebase 管理者
4. 作ったアカウントを開き「鍵」→「鍵を追加」→「JSON」→ ファイルがダウンロードされる
5. GitHub のリポジトリ `legal-break` →「Settings」→「Secrets and variables」→「Actions」
   - 「Secrets」タブ → New repository secret → 名前 `BATTLE_TEST_SERVICE_ACCOUNT`、値にダウンロードしたファイルの中身を全部貼る
   - 「Variables」タブ → New repository variable → 名前 `BATTLE_TEST_PROJECT`、値に試験用プロジェクトのID
6. ダウンロードした鍵のファイルは、貼り付けたらパソコンから削除する

※本番用の鍵（`FIREBASE_SERVICE_ACCOUNT`）とは別物です。本番の鍵には触りません。

## 6. 公開する
`online-battle` ブランチが更新されると、GitHub が自動で試験用プロジェクトに載せます（「Actions」タブの「対戦の試作を試験用に公開」）。
緑のチェックになったら、スマホで次を開きます：

`https://（試験用プロジェクトID）.web.app`

2台のスマホ（またはスマホとパソコン）で同時に「対戦相手をさがす」を押すと、人間同士で対戦できます。1台だけなら20秒後にCPU戦になります。

## 7. 月3,000円を超えたら自動で止める
1. Google Cloud（試験用プロジェクト）→「お支払い」→「予算とアラート」→ 予算を作成
   - 対象：試験用プロジェクトだけ ／ 金額：3,000円
   - 「Pub/Sub トピックに接続」→ 新しいトピック `budget-stop` を作って選ぶ
2. 「APIとサービス」→「Cloud Billing API」を有効にする
3. 「お支払い」→ 請求先アカウントの「アカウント管理」→ 権限 → 追加：
   - プリンシパル：`（プロジェクト番号）-compute@developer.gserviceaccount.com`
   - 役割：請求先アカウント管理者
   （プロジェクト番号は Firebase の「プロジェクトの設定」に出ています）

これで、予算を超えると課金が外れ、オンライン対戦が止まります（試験用だけ。本番は無関係）。再開は自分でカードをつなぎ直したときだけです。

## 8. ロボット対策（App Check）※試作で遊べるのを確かめてからでよい
後で Claude と一緒に設定します。

---

### 本番に入れると決めたら（今はやらない）
- 本番の `firebase.json` の公開しないファイルに `functions/**`・`battle-*`・`docs/**` を足す（**問題の正解を公開しないため**）
- 宅建版に入らないよう `tools/make_takken.py` を確認
- 本番プロジェクトを Blaze にするか、試験用プロジェクトをそのまま対戦専用として使い続けるかを決める
これらは改めて説明し、OKをもらってから行います。
