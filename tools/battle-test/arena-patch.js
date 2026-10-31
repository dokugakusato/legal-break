/* build-arena.sh から呼ぶ。画面（arena/index.html）を置き、追加の問題（ノートの論点・本試験の過去問。?all のときだけ出る）を作る。本番のファイルは変えない。 */
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || 'battle/lb';
// 画面（online/index.html）は、オンライン版を土台にこのブランチで作り込んでいる arena/index.html を使う。
// 本番の online/ からは、紙芝居（stories.js）・ひっかけ（decoys.js）・声の目次だけを読む。
fs.copyFileSync(path.resolve('arena/index.html'), path.join(OUT, 'online/index.html'));
// 追加の問題（オンライン版の問題の形に変える）
const conv = (k, i, tag, pn) => {
  const pt = Math.round(20 / k.slots.length);
  const panels = k.story.filter(p => !/^出題/.test(p.nar || '')).slice(0, pn).map(p => Object.assign({}, p));
  return { good: k.slots.map(x => ({ t: x.a, label: x.hint || x.a, pt })), pool: k.wrong.map(w => typeof w === 'string' ? { t: w, why: '' } : { t: w.t, why: w.why || '' }),
    no: 1000 + i, ep: { no: 1000 + i, title: k.topic }, title: k.topic, tag: tag, pn: panels.length, lawName: k.topic, q: k.q,
    keys: [], model: k.model, exp: k.exp, panels, efig: 'boss', narr: 'narr' };
};
const N = require(path.resolve('functions/kijutsu.js')), KK = require(path.resolve('functions/kakomon.js'));
const X = [];
N.forEach(k => X.push(conv(k, X.length, `${k.field}｜${k.topic}`, 4)));
KK.forEach(k => X.push(conv(k, X.length, `${k.field}｜${k.topic}`, 3)));
X.forEach(x => { x.keys = x.good.concat(x.pool).sort(() => Math.random() - .5); });
fs.writeFileSync(path.join(OUT, 'online/extra-q.js'), '/* 自動で作る（tools/battle-test/arena-patch.js）。記述バトルの問題：ノートの論点・本試験の過去問 */\nwindow.OL_EXTRA=' + JSON.stringify(X) + ';\n');
console.log('オンライン版の試作：ストーリーモードの問題＋追加', X.length, '問 →', OUT + '/online/');
