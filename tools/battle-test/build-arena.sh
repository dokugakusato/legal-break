#!/bin/bash
# オンライン版（本番 main の online/）の画面・演出をそのまま使い、問題を「記述バトルの全論点」に広げた試作を作る。
# 本番のファイルは読むだけ（git archive）。できたものは battle/lb/ に置き、試験用サイトの /lb/online/ で動く。
set -e
cd "$(dirname "$0")/../.."
REF="${1:-origin/main}"
OUT=battle/lb
rm -rf "$OUT"; mkdir -p "$OUT"
# 声のファイル（mp3）は本番のサイトから直接読む（ここにはコピーしない）。目次の index.js だけ持ってくる
git archive "$REF" online episodes icons faces kijutsu.js audio/index.js | tar -x -C "$OUT" --exclude='online/audio/*.mp3'

git show "$REF":index.html > "$OUT/main-index.txt"   # 登場人物の絵を借りるためだけに読む（ページとしては置かない）
node tools/battle-test/arena-patch.js "$OUT"
# 試作で録音した声（arena/audio）。まだなければ空の目次
mkdir -p "$OUT/online/audio-x"
if [ -d arena/audio ]; then cp arena/audio/*.mp3 arena/audio/index.js "$OUT/online/audio-x/" 2>/dev/null || true; fi
[ -f "$OUT/online/audio-x/index.js" ] || echo "window.OL_AUDIO2=[];" > "$OUT/online/audio-x/index.js"
