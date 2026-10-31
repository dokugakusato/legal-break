// オンライン対戦（記述ファイト）のルールの確認。 node tools/battle-test/arena-test.js
const A = require('../../functions/arena-logic'), K = require('../../functions/story-kj'), assert = require('assert');
let pass = 0; const ok = (c, m) => { assert(c, m); pass++; };
const mk = (ra, rb) => A.build({ uid: 'a', p: { name: 'あ', char: 'old', rp: ra || 0 } }, { uid: 'b', p: { name: 'い', char: 'boss', rp: rb || 0 } }, 0, K);
ok(K.filter(A.usable).length >= 8 && !K.filter(A.usable).some(k => /31条/.test(k.topic)), '民法・行政法の問題だけ（31条などは出さない）');
let { m, s } = mk();
ok(m.rounds.length === 3 && new Set(m.rounds.map(r => r.no)).size === 3, '3ラウンドとも別の問題');
ok(m.rounds.every(r => r.keys.length >= 7) && !JSON.stringify(m).includes('good'), 'キーワードは見せるが、正解の番号は見せない');
const nest = o => Array.isArray(o) ? o.some(x => Array.isArray(x) || nest(x)) : o && typeof o === 'object' ? Object.values(o).some(nest) : false;
ok(!nest(m) && !nest(s), 'データベースに保存できる形');
ok(A.ready(m, 'a', 10).accepted && m.phase === 'story', '1人だけ準備OKではまだ');
A.ready(m, 'b', 20); ok(m.phase === 'fight' && m.players.a.hp === 20, '2人そろってFIGHT');
const good = s.good[0].split(',').map(Number), bad = m.rounds[0].keys.map((_, i) => i).filter(i => !good.includes(i));
let r = A.attack(m, s, 'a', [good[0], bad[0]], 30);
ok(!r.ok && m.players.a.hp === 16 && m.players.b.hp === 20, 'ひっかけが混じれば自爆4（何枚でも）');
r = A.attack(m, s, 'a', [good[0], good[1]], 40);
const pt = Math.round(20 / good.length);
ok(r.ok && m.players.b.hp === 20 - 2 * pt && m.ev.length === 2, '2つ同時＝' + 2 * pt + 'ダメージ');
ok(!A.attack(m, s, 'a', [good[0]], 50).accepted, '同じキーワードは2度使えない');
r = A.attack(m, s, 'a', good.slice(2), 60);
ok(m.phase === 'inter' && m.players.a.wins === 1 && m.round === 2 && m.log[0].win === 'a', '倒したら1本、次のラウンドへ');
A.tick(m, 'a', 100); ok(m.phase === 'inter', 'ラウンドの間は、待つ');
m.players.b.seen = 100 + A.A.KO_MS + A.A.INTER_MS; A.tick(m, 'a', 100 + A.A.KO_MS + A.A.INTER_MS); ok(m.phase === 'fight', '時間が来たら（片方が押さなくても）FIGHT');
const g2 = s.good[1].split(',').map(Number);
A.attack(m, s, 'a', g2, 200000 - 1); // 時間内
ok(m.phase === 'end' && m.result.winner === 'a' && m.result.reason === 'ko', '2本先取で勝ち');
// ポイント
const P = A.points;
ok(P(0, 0).gain === 20 && P(0, 0).loss === 0, '同じランク：+20、Dランクは負けても減らない');
ok(P(100, 700).gain === 65 && P(700, 100).gain === 1, '強い相手を倒すほど多い（CがSを倒すと+65）、SがCを倒しても+1');
ok(P(700, 450).gain === 5 && P(450, 700).loss === 15, '1つ下を倒して+5、1つ下に負けたら-15');
({ m, s } = mk(260, 120)); m.result = null; A.ready(m, 'a', 1); A.ready(m, 'b', 1);
const pa = { rp: 260, name: 'あ' }, pb = { rp: 120, name: 'い' };
m.phase = 'end'; m.result = { winner: 'b', reason: 'ko', delta: {}, after: {} }; A.settle(m, pa, pb, 9);
ok(pb.rp === 120 + 35 && pa.rp === 260 - 15 && pa.rank === 'C' && pb.l === undefined && pb.w === 1, 'Cの人がBの人を倒す：+35／-15');
// いなくなった
({ m, s } = mk()); A.tick(m, 'a', A.A.GONE_MS + 10); ok(m.phase === 'end' && m.result.winner === 'a' && m.result.reason === 'forfeit', '相手がいなくなったら不戦勝');
// 時間切れ
({ m, s } = mk()); A.ready(m, 'a', 0); A.ready(m, 'b', 0); const g = s.good[0].split(',').map(Number); A.attack(m, s, 'b', [g[0]], 10);
m.players.a.seen = m.players.b.seen = 90000; A.tick(m, 'a', A.A.INTRO_MS + A.A.FIGHT_MS + 5);
ok(m.phase === 'inter' && m.log[0].win === 'b' && m.log[0].reason === 'time', '時間切れはHPの多い方が1本');
ok(A.stamp(m, 'a', 'win', 2, 100).accepted && !A.stamp(m, 'a', 'win', 9, 5000).accepted && !A.stamp(m, 'a', 'pre', 0, 200).accepted, 'ひとこと（連打はだめ）');
{ const p = { rp: 98 }; ok(A.cpuWin(p, 50000).gain === 0, 'CPU戦：始めていないと0');
  p.cpuAt = 1000; ok(A.cpuWin(p, 20000).gain === 0, 'CPU戦：40秒たたない勝ちは0');
  let t = Date.UTC(2026, 9, 31, 3), tot = 0; for (let i = 0; i < 12; i++) { p.cpuAt = t; t += 60000; tot += A.cpuWin(p, t).gain; }
  ok(tot === 30 && p.rp === 128 && p.rank === 'C' && p.cw === 12, 'CPU戦：1勝+3、1日30まで（ランクも上がる）');
  p.cpuAt = t; ok(A.cpuWin(p, t + 86400000).gain === 3, 'CPU戦：次の日はまたもらえる'); }
console.log('OK', pass, '件');
