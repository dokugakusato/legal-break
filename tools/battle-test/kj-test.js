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
const T0 = R.VS_MS + K[0].story.length * R.PANEL_MS;
function fight(cpu) { const x = mk(cpu); L.advance(x.m, x.s, T0); return x; }
{ // 流れ：VS → 紙芝居 → FIGHT
  const { m, s } = mk(false);
  ok(m.kj.pts.reduce((a, b) => a + b, 0) === 20 && m.kj.n === 4, '20点満点・4キーワード');
  L.advance(m, s, R.VS_MS); ok(m.phase === 'story', '紙芝居へ');
  ok(L.kjAnswer(m, s, 'A', [s.kj.ans[0]], R.VS_MS + 100).accepted === false, '紙芝居中は答えられない');
  L.advance(m, s, T0); ok(m.phase === 'kj', 'FIGHT');
  // 単発：5点×40＝200
  let r = L.kjAnswer(m, s, 'A', [s.kj.ans[2]], T0 + 3000);
  ok(r.ok && r.kind === 'single' && m.kj.prog.A.pts === 5 && m.players.B.hp === 800 && m.kj.prog.A.got === '2', '単発：5点＝200ダメージ（順番自由）');
  ok(!L.kjAnswer(m, s, 'A', [s.kj.ans[2]], T0 + 3100).accepted, '同じキーワードは2度出せない');
  ok(!L.kjAnswer(m, s, 'A', [s.kj.ans[2], s.kj.ans[2]], T0 + 3100).accepted, '同じ札を2枚は出せない');
  const wrong = m.kj.chips.findIndex((c, i) => !s.kj.ans.includes(i));
  // 1つでも間違いが混じると、点はもらえず自爆（枚数×60）
  r = L.kjAnswer(m, s, 'B', [s.kj.ans[0], s.kj.ans[1], wrong], T0 + 4000);
  ok(r.accepted && !r.ok && m.players.B.hp === 800 - 180 && m.kj.prog.B.pts === 0 && m.kj.prog.B.got === '' && m.kj.prog.B.lock === T0 + 4000 + R.KJ_LOCK, '間違いが1つでも混じると点なし・自爆180・2秒動けない');
  ok(!L.kjAnswer(m, s, 'B', [s.kj.ans[0]], T0 + 5000).accepted, '動けない間は出せない');
  // 中技：2つ同時（10点）×40×1.5＝600
  r = L.kjAnswer(m, s, 'B', [s.kj.ans[3], s.kj.ans[0]], T0 + 6100);
  ok(r.ok && r.kind === 'mid' && m.players.A.hp === 400 && m.kj.prog.B.pts === 10, '中技（2つ同時）：600ダメージ');
  // 残り3つを同時に＝大技 → 20点になったのでとどめ
  r = L.kjAnswer(m, s, 'A', [s.kj.ans[0], s.kj.ans[1], s.kj.ans[3]], T0 + 7000);
  ok(r.ok && r.done && r.kind === 'big' && m.phase === 'end' && m.result.winner === 'A' && m.result.fin === 'big' && m.players.B.hp === 0, '大技（3つ同時）で20点、とどめ');
  ok(m.rv && m.rv.model === K[0].model, '終わったら解答例');
}
{ // 天変地異：最初の一撃で全部
  const { m, s } = fight(false);
  const r = L.kjAnswer(m, s, 'A', s.kj.ans.slice().reverse(), T0 + 2000);
  ok(r.ok && r.kind === 'tenpen' && m.phase === 'end' && m.result.fin === 'tenpen' && m.ev.list.some(e => e.t === 'kjfin' && e.kind === 'tenpen'), '天変地異で一撃K.O.');
  const pa = P('a'), pb = P('b'); L.settle(m, pa, pb, 1);
  const base = L.eloDelta(1500, 1500, 1);
  ok(m.result.delta.A === Math.round(base * 2) && m.result.delta.B === -base, '天変地異の勝ちは経験値2倍（負けた側は普通）');
}
{ // 4つ以上同時は、途中からでも天変地異（キーワード5つの論点）
  const k5 = K.find(k => k.slots.length === 5);
  const { m, s } = L.buildKJ({ uid: 'A', p: P('あ') }, { uid: 'B', p: P('い') }, false, 0, [k5]);
  const t0 = R.VS_MS + k5.story.length * R.PANEL_MS; L.advance(m, s, t0);
  L.kjAnswer(m, s, 'A', [s.kj.ans[0]], t0 + 1000); ok(m.phase === 'kj', '5つの論点：1つ目は単発');
  const r = L.kjAnswer(m, s, 'A', s.kj.ans.slice(1), t0 + 2000);
  ok(r.kind === 'tenpen' && m.result.fin === 'tenpen' && m.players.B.hp === 0, '4つ同時で天変地異');
}
{ // キーワード3つの論点：最初の一撃で全部なら天変地異、途中からの3つは無い（2つ以下）
  const k3 = K.find(k => k.slots.length === 3);
  const { m, s } = L.buildKJ({ uid: 'A', p: P('あ') }, { uid: 'B', p: P('い') }, false, 0, [k3]);
  const t0 = R.VS_MS + k3.story.length * R.PANEL_MS; L.advance(m, s, t0);
  const r = L.kjAnswer(m, s, 'A', s.kj.ans.slice(), t0 + 1000);
  ok(r.kind === 'tenpen' && m.phase === 'end', '3つの論点：最初に全部で天変地異');
  const x = L.buildKJ({ uid: 'A', p: P('あ') }, { uid: 'B', p: P('い') }, false, 0, [k3]); L.advance(x.m, x.s, t0);
  L.kjAnswer(x.m, x.s, 'A', [x.s.kj.ans[0]], t0 + 1000);
  const r2 = L.kjAnswer(x.m, x.s, 'A', [x.s.kj.ans[1], x.s.kj.ans[2]], t0 + 2000);
  ok(r2.kind === 'mid' && x.m.result.fin === 'mid', '3つの論点：1つ→残り2つは中技でとどめ');
  const pa = P('a'), pb = P('b'); L.settle(x.m, pa, pb, 1);
  ok(x.m.result.delta.A === Math.round(L.eloDelta(1500, 1500, 1) * 1.2), '中技でとどめは経験値1.2倍');
}
{ // 全部まとめて出しても、1つ間違いが混じれば自爆
  const { m, s } = fight(false); const wrong = m.kj.chips.findIndex((c, i) => !s.kj.ans.includes(i));
  const r = L.kjAnswer(m, s, 'A', s.kj.ans.concat([wrong]), T0 + 2000);
  ok(!r.ok && m.players.A.hp === 1000 - 300 && m.phase === 'kj', '5枚で自爆300');
}
{ // 自爆で自分が倒れる
  const { m, s } = fight(false); const w = m.kj.chips.map((c, i) => i).filter(i => !s.kj.ans.includes(i));
  let t = T0; while (m.phase === 'kj') { t += 2100; L.kjAnswer(m, s, 'B', w, t); }
  ok(m.result.winner === 'A' && m.players.B.hp === 0, '自爆でHP0なら負け');
}
{ // 時間切れはない（20分の放置だけ安全装置）
  const { m, s } = fight(false); L.kjAnswer(m, s, 'B', [s.kj.ans[1]], T0 + 1000);
  L.advance(m, s, T0 + 10 * 60000); ok(m.phase === 'kj', '10分たっても続く');
  L.advance(m, s, T0 + R.KJ_TIME); ok(m.phase === 'end' && m.result.winner === 'B', '20分放置なら点の高い方');
}
{ // 古い形（札1枚の数字）も受け付ける
  const { m, s } = fight(false); ok(L.kjAnswer(m, s, 'A', s.kj.ans[0], T0 + 1000).ok, '数字1つでもOK');
  ok(!L.kjAnswer(m, s, 'A', [], T0 + 1100).accepted && !L.kjAnswer(m, s, 'A', [99], T0 + 1100).accepted && !L.kjAnswer(m, s, 'A', ['x'], T0 + 1100).accepted, 'おかしな札は受け付けない');
}
{ // CPU は放っておいても最後には倒しにくる
  let wins = 0;
  for (let i = 0; i < 30; i++) { const { m, s } = fight(true); L.advance(m, s, T0 + 5 * 60000); if (m.phase === 'end' && m.result.winner === 'cpuX') wins++; }
  ok(wins === 30, 'CPUは5分以内に倒しにくる（' + wins + '/30）');
}
// Firestore は配列の中の配列を保存できない
const nested = o => Array.isArray(o) ? o.some(x => Array.isArray(x) || nested(x)) : (o && typeof o === 'object' ? Object.values(o).some(nested) : false);
K.forEach(k => { const { m, s } = L.buildKJ({ uid: 'A', p: P('a') }, { uid: 'B', p: P('b') }, true, 0, [k]); ok(!nested(m) && !nested(s), k.id + ' データベースに保存できる形'); });
console.log('OK', pass, '件');
