// オンライン対戦のルール（functions/logic.js）の確認。 node tools/battle-test/logic-test.js
const L = require('../../functions/logic');
const Q = require('../../functions/questions');
const assert = require('assert');
let pass = 0; const ok = (c, msg) => { assert(c, msg); pass++; };
const P = n => L.newPlayer(n, 0);
function mk(cpu, rnd) {
  const { m, s } = L.buildMatch({ uid: 'A', p: P('あ') }, { uid: cpu ? 'cpuX' : 'B', p: cpu ? { name: 'CPU', rating: 0, rank: 'CPU' } : P('い') }, cpu, 0, Q.length, rnd);
  L.advance(m, s, L.R.VS_MS, Q); // FIGHT
  return { m, s, t0: L.R.VS_MS };
}
const right = s => s.cur.correct, wrong = s => (s.cur.correct + 1) % 5;
const B = 'B';

{ // 1 速い正解は150
  const { m, s, t0 } = mk(false);
  ok(m.phase === 'q' && m.qi === 0 && m.q.choices.length === 5, '問題が出る');
  ok(!('a' in m.q) && !JSON.stringify(m).includes('"correct"'), '正解が見える状態に入っていない');
  L.answer(m, s, 'A', 0, right(s), t0 + 3000, Q);
  ok(m.players.B.hp === 850 && m.phase === 'rv', '速い正解で150、解説へ');
  ok(m.rv && m.rv.correct === s.cur.correct, '解説で正解を見せる');
}
{ // 2 不正解→カウンター
  const { m, s, t0 } = mk(false);
  L.answer(m, s, 'A', 0, wrong(s), t0 + 6000, Q);
  ok(m.players.A.hp === 950 && m.phase === 'q', '不正解は自分に50、問題は続く');
  const r = L.answer(m, s, 'A', 0, right(s), t0 + 7000, Q);
  ok(!r.accepted, '2回目は答えられない');
  L.answer(m, s, B, 0, right(s), t0 + 12000, Q);
  ok(m.players.A.hp === 950 - 200 && m.ev.list.some(e => e.t === 'counter'), 'カウンターは2倍（100×2）');
}
{ // 3 お手つき
  const { m, s, t0 } = mk(false);
  L.answer(m, s, 'A', 0, wrong(s), t0 + 2000, Q);
  ok(m.players.A.hp === 900 && m.ev.list[0].t === 'oto', '5秒以内の不正解はお手つき100');
}
{ // 4 2人とも不正解
  const { m, s, t0 } = mk(false);
  L.answer(m, s, 'A', 0, wrong(s), t0 + 8000, Q); L.answer(m, s, B, 0, wrong(s), t0 + 9000, Q);
  ok(m.phase === 'rv' && m.players.A.hp === 950 && m.players.B.hp === 950, '2人とも不正解で次へ');
}
{ // 5 時間切れ（にらみ合い）・時間切れ後の回答
  const { m, s, t0 } = mk(false);
  L.advance(m, s, t0 + 29000, Q); ok(m.phase === 'q', '締め切り前は進まない');
  const r = L.answer(m, s, 'A', 0, right(s), t0 + 30500, Q);
  ok(!r.accepted && m.players.A.hp === 970 && m.players.B.hp === 970 && m.phase === 'rv', '時間切れで両者30、遅れた回答は無効');
}
{ // 6 K.O.とレーティング
  const { m, s, t0 } = mk(false); let t = t0;
  while (m.phase !== 'end') {
    if (m.phase === 'q') { L.answer(m, s, 'A', m.qi, right(s), t + 2000, Q); t += 2000; }
    else { t = m.until; L.advance(m, s, t, Q); }
  }
  ok(m.result.reason === 'ko' && m.result.winner === 'A' && m.players.B.hp === 0, '7問の速い正解でK.O.');
  const pa = P('あ'), pb = P('い'); L.settle(m, pa, pb, t);
  ok(pa.rating === 1516 && pb.rating === 1484 && pa.w === 1 && pb.l === 1, '同格の勝ち＋16・負け−16');
  const pc = Object.assign(P('強'), { rating: 1900 }), pd = Object.assign(P('弱'), { rating: 1400 });
  ok(L.eloDelta(1400, 1900, 1) > 28 && L.eloDelta(1900, 1400, 1) < 3, '格上に勝つと大きく、格下に勝つと小さく');
  ok(L.rankOf(1500) === 'C' && L.rankOf(1850) === 'S' && L.rankOf(1399) === 'D' && L.rankOf(1700) === 'A' && L.rankOf(1550) === 'B', 'ランクの区切り');
}
{ // 7 CPU：先にCPUが正解したら、人の回答は受け付けない
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const { m, s, t0 } = mk(true, rnd);
  s.cpu = { ok: true, at: 9000 }; m.cpuAt = 9000;
  const r = L.answer(m, s, 'A', 0, right(s), t0 + 12000, Q);
  ok(!r.accepted && m.players.A.hp === 850, 'CPUが9秒で正解→12秒の回答は間に合わない');
  const x = mk(true, rnd); x.s.cpu = { ok: false, at: 7000 }; x.m.cpuAt = 7000;
  L.advance(x.m, x.s, x.t0 + 7000, Q);
  ok(x.m.players.cpuX.hp === 950 && x.m.phase === 'q', 'CPUの不正解');
  L.answer(x.m, x.s, 'A', 0, right(x.s), x.t0 + 8000, Q);
  ok(x.m.players.cpuX.hp === 950 - 300, 'CPUの誤答にカウンター（150×2）');
}
{ // 8 切断：止まる→戻れば締め切りが延びる／15秒で不戦敗
  const { m, s, t0 } = mk(false);
  L.presence(m, t0 + 5000, { A: true, B: false });
  ok(m.paused && m.paused.uid === 'B', '切断で一時停止');
  ok(!L.answer(m, s, 'A', 0, right(s), t0 + 6000, Q).accepted, '止まっている間は答えられない');
  L.presence(m, t0 + 10000, { A: true, B: true });
  ok(!m.paused && m.until === t0 + 30000 + 5000, '戻ったら止めていた5秒を足す');
  L.presence(m, t0 + 12000, { A: true, B: false }); L.presence(m, t0 + 26999, { A: true, B: false });
  ok(m.phase === 'q', '15秒たつまでは待つ');
  L.presence(m, t0 + 27000, { A: true, B: false });
  ok(m.phase === 'end' && m.result.reason === 'forfeit' && m.result.winner === 'A', '15秒戻らなければ不戦敗');
}
{ // 9 全問終わって同点→サドンデス
  const { m, s, t0 } = mk(false); let t = t0;
  while (m.qi < m.total - 1 || m.phase === 'q') {
    if (m.phase === 'q') { t = m.until; L.advance(m, s, t, Q); } else { t = m.until; L.advance(m, s, t, Q); }
  }
  ok(m.phase === 'rv' && m.players.A.hp === m.players.B.hp, '全問にらみ合いで同点');
  t = m.until; L.advance(m, s, t, Q);
  ok(m.sd === 1 && m.phase === 'q', 'サドンデスに入る');
  L.answer(m, s, B, m.qi, right(s), t + 15000, Q);
  ok(m.phase === 'end' && m.result.winner === B, 'サドンデスは先に正解した方の勝ち');
}
{ // 10 スタンプ
  const { m, s, t0 } = mk(false);
  ok(!L.stamp(m, 'A', 0, t0 + 1).accepted, '問題中は送れない');
  L.answer(m, s, 'A', 0, right(s), t0 + 3000, Q);
  ok(L.stamp(m, 'A', 1, t0 + 3100).accepted && !L.stamp(m, 'A', 2, t0 + 4000).accepted && L.stamp(m, 'A', 2, t0 + 6200).accepted, '解説中は送れる・3秒に1回');
}
{ // 11 問題データ
  ok(Q.length >= 10 && Q.every(q => q.choices.length === 5 && q.a >= 0 && q.a < 5 && q.exp && ['消去法型', '冒頭判断型', 'キーワード型'].includes(q.type)), '問題データの形');
  ok(L.cleanName('  佐藤 ') === '佐藤' && L.cleanName('a@b') === null && L.cleanName('') === null && L.cleanName('1234567890123') === '123456789012', '名前のチェック');
}
console.log('OK', pass, '件');
