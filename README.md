# LEGAL BREAK ―法の拳―

行政書士試験を、荒野の事件を「法の拳」で解決しながら学ぶブラウザゲーム。毎日1話ずつ更新。

## ファイルの構成

- `index.html` … ゲーム本体（画面・バトル・音・ランク）
- `episodes/list.js` … 話の目次。新しい話を作ったら1行足す
- `episodes/epNNN.js` … 1話分のデータ（事件3つ＋章ボス）

※登場人物・事件はすべて架空です。

## 声（自動録音）

- `tools/gen_voice.mjs` … VOICEVOX でナレーションとセリフを録音し、`audio/` に mp3 で入れる
- `.github/workflows/voice.yml` … 話を追加・変更すると GitHub が自動で録音する
- キャラごとの声は `tools/gen_voice.mjs` の `CAST` で決める
