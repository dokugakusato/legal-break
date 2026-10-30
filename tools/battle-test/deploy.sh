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
node tools/battle-test/logic-test.js
(cd functions && npm install --no-audit --no-fund --silent)
# Googleにログイン（初回だけブラウザが開く）
npx -y firebase-tools@latest login
npx -y firebase-tools@latest deploy --config battle-firebase.json --project "$PJ" --force
echo ""
echo "公開しました： https://$PJ.web.app"
