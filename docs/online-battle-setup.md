# オンライン対戦（試作）を試すための準備（かんたん版）

本番（今動いている行政書士版・宅建版、Firebase の legal-break-6882d）には一切触りません。
試作は**新しく作る試験用の Firebase プロジェクト**だけで動きます。やめるときは、このプロジェクトと `online-battle` ブランチを消せば元通りです。

あなたの作業は **A（Firebaseの画面で10分）** と **B（MacのClaude Codeに1回頼む）** だけです。

---

## A. Firebaseの画面での準備（約10分）

1. https://console.firebase.google.com →「プロジェクトを追加」
   - 名前：`legal-break-battle-test`（IDが少し変わってもよい。**決まったIDを控える**）
   - Google アナリティクスは「オフ」
2. 左下「アップグレード」→ **Blaze** → カード登録（この試験用プロジェクトだけ）
   - 予算を聞かれたら **3,000円**（通知が来るだけ。自動停止は後で）
3. 「Authentication」→ 始める →「匿名」を**有効**
4. 「Firestore Database」→ 作成 → 場所 **asia-northeast1（東京）** →「本番環境モード」
5. 「Realtime Database」→ 作成 → 場所 **シンガポール** →「ロックモード」
6. 歯車「プロジェクトの設定」→「マイアプリ」→ ウェブ（`</>`）→ 名前 `battle`（Hostingのチェックは不要）
   → 出てきた `firebaseConfig = { ... }` の中身を **Claude（このチャット）に貼る**
   → Claude が設定を組み込みます（公開してよい値です）

## B. MacのClaude Codeに、この1文を頼む

```
legal-break リポジトリの online-battle ブランチを取ってきて（まだ手元に無ければ clone）、
online-battle に切り替えてから bash tools/battle-test/deploy.sh 試験用プロジェクトID を実行して。
途中でブラウザが開いたら私がGoogleでログインする。本番（main・legal-break-6882d）には絶対に触らないで。
```
（「試験用プロジェクトID」はAで控えたIDに置き換える）

最後に `https://（ID）.web.app` と出たら完成。スマホで開いて「対戦相手をさがす」。
2台（スマホとパソコンでも可）で同時に押すと人間同士で対戦、1台なら20秒後にCPU戦。

直したときは、Bをもう一度頼めば更新されます。

---

## あとでよいもの
- **月3,000円で自動停止**：試し用URLを自分以外に教える前に、Claudeと一緒に設定する
- **ロボット対策（App Check）**：同上
- GitHubからの自動公開（`.github/workflows/battle-test.yml`）：鍵を入れない限り動かない。使わなくてよい

### 本番に入れると決めたら（今はやらない）
- 本番の `firebase.json` の公開しないファイルに `functions/**`・`battle-*`・`docs/**` を足す（問題の正解を公開しないため）
- 宅建版に入らないよう `tools/make_takken.py` を確認
- 本番プロジェクトを Blaze にするか、試験用プロジェクトを対戦専用として使い続けるかを決める
これらは改めて説明し、OKをもらってから行います。
