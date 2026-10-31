// 記述バトルのルールの確認。 node tools/battle-test/kj-test.js
const L = require('../../functions/logic'), K = require('../../functions/kijutsu'), assert = require('assert');
let pass = 0; const ok = (c, m) => { assert(c, m); pass++; };
const P = n => L.newPlayer(n, 0), R = L.R;
// データの形
K.forEach(k => {
  const blanks = (k.tpl.match(/\[\]/g) || []).length;
  ok(blanks === k.slots.length, k.id + ' 空欄と正解の数が合う');
  ok(k.story.length >= 3 && k.q && k.model && k.exp, k.id + ' 物語・問題・解答');
  const all = k.slots.map(x => x.a).concat(k.wrong);
  ok(new Set(all).size === all.length, k.id + ' 札が重複しない');
  let filled = k.tpl; k.slots.forEach(x => { filled = filled.replace('[]', x.a); });
  ok(filled.replace(/[（）()「」、。]/g, '').length > 10, k.id);
});
function mk(cpu) {
  const { m, s } = L.buildKJ({ uid: 'A', p: P('あ') }, { uid: cpu ? 'cpuX' : 'B', p: cpu ? { name: 'CPU', rating: 0, rank: 'CPU' } : P('い') }, cpu, 0, [K[0]]);
  return { m, s };
}
{ // 流れ：VS → 紙芝居 → 答案
  const { m, s } = mk(false);
  ok(!JSON.stringify(m).includes('"ans"') || !m.kj.ans, '正解の位置は公開側に無い');
  ok(m.kj.pts.reduce((a, b) => a + b, 0) === 20, '20点満点');
  L.advance(m, s, R.VS_MS); ok(m.phase === 'story', '紙芝居へ');
  ok(L.kjAnswer(m, s, 'A', 0, s.kj.ans[0], R.VS_MS + 100).accepted === false, '紙芝居中は答えられない');
  const t0 = R.VS_MS + K[0].story.length * R.PANEL_MS;
  L.advance(m, s, t0); ok(m.phase === 'kj', 'FIGHTで答案づくり');
  // 部分点
  let r = L.kjAnswer(m, s, 'A', 0, s.kj.ans[0], t0 + 3000);
  ok(r.ok && m.kj.prog.A.n === 1 && m.kj.prog.A.pts === 5 && m.players.B.hp === 1000 - 150, '1つ正解で5点・150ダメージ');
  ok(!L.kjAnswer(m, s, 'A', 0, s.kj.ans[0], t0 + 3100).accepted, '同じ空欄は2度出せない');
  // 間違い
  const wrong = m.kj.chips.findIndex((c, i) => !s.kj.ans.includes(i));
  r = L.kjAnswer(m, s, 'B', 0, wrong, t0 + 4000);
  ok(r.accepted && !r.ok && m.players.B.hp === 850 - 50 && m.kj.prog.B.lock === t0 + 4000 + R.KJ_LOCK, '間違いは自分に50・2秒動けない');
  ok(!L.kjAnswer(m, s, 'B', 0, s.kj.ans[0], t0 + 5000).accepted, '動けない間は出せない');
  ok(L.kjAnswer(m, s, 'B', 0, s.kj.ans[0], t0 + 6100).ok, '2秒たてば出せる');
  // 満点で一撃
  [1, 2, 3].forEach((i, k) => L.kjAnswer(m, s, 'A', i, s.kj.ans[i], t0 + 7000 + k * 1000));
  ok(m.phase === 'end' && m.result.winner === 'A' && m.players.B.hp === 0 && m.ev.list.some(e => e.t === 'kjfin'), '満点の完成答案で一撃K.O.');
  ok(m.rv && m.rv.model === K[0].model, '終わったら解答例を見せる');
}
{ // 時間切れは点の高い方
  const { m, s } = mk(false); const t0 = R.VS_MS + K[0].story.length * R.PANEL_MS;
  L.advance(m, s, t0); L.kjAnswer(m, s, 'B', 0, s.kj.ans[0], t0 + 1000);
  L.advance(m, s, t0 + R.KJ_TIME); ok(m.phase === 'end' && m.result.winner === 'B' && m.result.reason === 'judge', '時間切れ：点の高い方の勝ち');
}
{ // CPU
  const { m, s } = mk(true); const t0 = R.VS_MS + K[0].story.length * R.PANEL_MS;
  L.advance(m, s, t0); L.advance(m, s, t0 + R.KJ_TIME - 1);
  ok(m.phase === 'end' && m.result.winner === 'cpuX', 'CPUは時間内に完成させる');
}
// Firestore は配列の中の配列を保存できない
const nested = o => Array.isArray(o) ? o.some(x => Array.isArray(x) || nested(x)) : (o && typeof o === 'object' ? Object.values(o).some(nested) : false);
K.forEach(k => { const { m, s } = L.buildKJ({ uid: 'A', p: P('a') }, { uid: 'B', p: P('b') }, true, 0, [k]); ok(!nested(m) && !nested(s), k.id + ' データベースに保存できる形'); });
console.log('OK', pass, '件');
