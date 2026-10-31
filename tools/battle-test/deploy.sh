#!/bin/bash
# オンライン対戦（試作）を「試験用の Firebase プロジェクト」に、このパソコンから載せる。
# 使い方（legal-break フォルダで）：  bash tools/battle-test/deploy.sh 試験用プロジェクトID
# 本番（legal-break-6882d）には載せられないようにしてある。
set -e
PJ="$1"
if [ -z "$PJ" ]; then echo "試験用プロジェクトのIDを付けてください（例：bash tools/battle-test/deploy.sh legal-break-battle-test）"; exit 1; fi
if [ "$PJ" = "legal-break-6882d" ]; then echo "これは本番のプロジェクトです。試験用のIDを指定してください"; exit 1; fi
BR=$(git rev-parse --abbrev-ref HEAD)
if [ "$BR" != "online-battle" ]; then echo "online-battle ブランチで実行してください（今は $BR）"; exit 1; fi
cd "$(dirname "$0")/../.."
# ストーリーモード（本番 main）の章ボスの記述を、対戦の問題に取り込む（読むだけ。本番は変えない）
git fetch -q origin main:refs/remotes/origin/main 2>/dev/null || true
node tools/battle-test/import-story.js origin/main || echo "（ストーリーモードの取り込みはスキップ。前回の分を使う）"
node tools/battle-test/logic-test.js
node tools/battle-test/kj-test.js
# オンライン版（本番 main の online/）の画面に、全論点を足した試作を /lb/online/ に作る
bash tools/battle-test/build-arena.sh origin/main || echo "（オンライン版の試作づくりはスキップ）"
(cd functions && npm install --no-audit --no-fund --silent)
if [ "$CLOUD_SHELL" = "true" ] && command -v firebase >/dev/null; then
  # Google Cloud Shell：ログイン済みの Firebase CLI がそのまま使える
  FB="firebase"
else
  FB="npx -y firebase-tools@latest"
  # Googleにログイン（初回だけブラウザが開く）
  $FB login
fi
$FB deploy --config battle-firebase.json --project "$PJ" --force --non-interactive
echo ""
echo "公開しました： https://$PJ.web.app"
