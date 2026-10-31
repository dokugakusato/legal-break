/* オンライン対戦（記述ファイト・オンライン版）のルール（計算だけ）。保存・通信は index.js。
   3ラウンド制（2本先取）。1ラウンド＝1問（ストーリー版の章ボスの記述）。HP20、正解キーワード1つ＝(20÷正解の数)点のダメージ。
   ひっかけが1つでも混じると自爆（4ダメージ）。同時に当てた数で 中技(2)・大技(3)・超ウルトラ技(4以上)。
   m＝試合（2人に見せてよい）、s＝秘密（正解の番号）、t＝サーバーの時刻 */
(function (root) {
  const A = { HP: 20, SELF: 4, FIGHT_MS: 90000, INTRO_MS: 5000, STORY_MS: 75000, INTER_MS: 45000, KO_MS: 6000, GONE_MS: 40000, QUEUE_FRESH: 25000 };
  const RANKS = [['D', 0], ['C', 100], ['B', 250], ['A', 450], ['S', 700]];
  const CHARS = ['hero', 'old', 'oldwoman', 'mina', 'girl', 'thug', 'trick', 'dogra', 'nekota', 'boss', 'kurosaki', 'kanshucho', 'keiji'];
  const cleanChar = c => CHARS.includes(c) ? c : 'hero';
  const rankOf = rp => { let r = 'D'; for (const [n, need] of RANKS) if (rp >= need) r = n; return r; };
  const rIdx = r => RANKS.findIndex(x => x[0] === r);
  const shuffle = (a, rnd) => { rnd = rnd || Math.random; a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const other = (m, uid) => m.uids[0] === uid ? m.uids[1] : m.uids[0];
  // オンラインに出すのは民法・行政法だけ（憲法などは出さない）
  const usable = k => k.src === 'story' && !/憲法|31条|人権|一般知識/.test(k.topic + k.q) && k.slots.length >= 3 && k.wrong.length >= 4;

  // ポイント：強い相手を倒すほど多く、強い人が弱い人を倒しても少し。Dランクのうちは負けても減らない
  function points(winRp, loseRp) {
    const d = rIdx(rankOf(loseRp)) - rIdx(rankOf(winRp)); // ＋なら相手（負けた側）の方が上のランク
    const gain = d >= 1 ? 20 + 15 * d : d === 0 ? 20 : d === -1 ? 5 : 1;
    const loss = rankOf(loseRp) === 'D' ? 0 : d >= 1 ? 10 + 5 * d : d === 0 ? 10 : 5;
    return { gain, loss };
  }

  function round(k, rnd) {
    const W = shuffle(k.wrong, rnd).slice(0, 4).map(w => w.t || w);
    const keys = shuffle(k.slots.map(x => x.a).concat(W), rnd);
    const good = k.slots.map(x => keys.indexOf(x.a));
    return { pub: { no: parseInt(k.id.replace(/\D/g, ''), 10), keys }, good };
  }
  // 試合を作る。a・b＝{uid, p:{name,char,rp}}
  function build(a, b, t, K, rnd) {
    rnd = rnd || Math.random;
    const pool = shuffle(K.filter(usable), rnd).slice(0, 3);
    const rs = pool.map(k => round(k, rnd));
    const players = {};
    [a, b].forEach(x => { players[x.uid] = { name: x.p.name, char: cleanChar(x.p.char), rp: x.p.rp || 0, rank: rankOf(x.p.rp || 0), hp: A.HP, wins: 0, ready: false, seen: t }; });
    const used = {}; used[a.uid] = ''; used[b.uid] = '';
    const m = { kind: 'arena', uids: [a.uid, b.uid], players, round: 1, rounds: rs.map(r => r.pub), phase: 'story', phaseAt: t, until: t + A.STORY_MS,
      used, ev: [], log: [], stamps: {}, result: null, created: t, v: 1 };
    const s = { good: rs.map(r => r.good.join(',')) };
    return { m, s };
  }
  const goodOf = (s, m) => String(s.good[m.round - 1] || '').split(',').filter(x => x !== '').map(Number);
  const usedOf = (m, uid) => String(m.used[uid] || '').split(',').filter(x => x !== '').map(Number);

  function startFight(m, t) {
    m.phase = 'fight'; m.phaseAt = t; m.until = t + A.INTRO_MS + A.FIGHT_MS; m.ev = [];
    m.uids.forEach(u => { m.players[u].hp = A.HP; m.players[u].ready = false; m.used[u] = ''; });
  }
  function end(m, t, winner, reason) { m.phase = 'end'; m.phaseAt = t; m.until = t; m.result = { winner: winner || null, reason, delta: {}, after: {} }; }
  function roundOver(m, t, winner, reason) {
    m.log.push({ no: m.rounds[m.round - 1].no, win: winner || null, reason });
    if (winner) m.players[winner].wins += 1;
    const [a, b] = m.uids, wa = m.players[a].wins, wb = m.players[b].wins;
    if (wa >= 2 || wb >= 2) return end(m, t, wa > wb ? a : b, 'ko');
    if (m.round >= 3) return end(m, t, wa > wb ? a : wb > wa ? b : null, 'judge');
    m.round += 1; m.phase = 'inter'; m.phaseAt = t + A.KO_MS; m.until = t + A.KO_MS + A.INTER_MS;
    m.uids.forEach(u => { m.players[u].ready = false; });
  }

  // 準備OK（紙芝居を読んだ）。2人そろえば FIGHT
  function ready(m, uid, t) {
    if (m.phase !== 'story' && m.phase !== 'inter') return { accepted: false };
    m.players[uid].ready = true;
    if (m.uids.every(u => m.players[u].ready)) startFight(m, Math.max(t, m.phaseAt));
    return { accepted: true };
  }
  // 攻撃。picks＝キーワードの番号
  function attack(m, s, uid, picks, t) {
    if (m.phase !== 'fight') return { accepted: false, why: 'closed' };
    if (!Array.isArray(picks) || !picks.length || picks.length > 8) return { accepted: false, why: 'picks' };
    const n = m.rounds[m.round - 1].keys.length;
    if (picks.some(i => !Number.isInteger(i) || i < 0 || i >= n) || new Set(picks).size !== picks.length) return { accepted: false, why: 'picks' };
    const good = goodOf(s, m), used = usedOf(m, uid), op = other(m, uid);
    const bad = picks.filter(i => !good.includes(i));
    if (bad.length) {
      m.players[uid].hp -= A.SELF;
      m.ev.push({ by: uid, picks, bad: 1, dmg: A.SELF, at: t });
      if (m.players[uid].hp <= 0) roundOver(m, t, op, 'self');
      return { accepted: true, ok: false };
    }
    const fresh = picks.filter(i => !used.includes(i));
    if (!fresh.length) return { accepted: false, why: 'used' };
    const pt = Math.round(A.HP / good.length), dmg = pt * fresh.length;
    m.used[uid] = used.concat(fresh).join(',');
    m.players[op].hp -= dmg;
    m.ev.push({ by: uid, picks: fresh, bad: 0, dmg, at: t });
    if (m.players[op].hp <= 0) roundOver(m, t, uid, 'ko');
    return { accepted: true, ok: true, dmg };
  }
  // 時間で進める・いなくなった人の確認。uid＝呼んだ人（いることの合図）
  function tick(m, uid, t) {
    if (m.phase === 'end') return;
    if (uid) m.players[uid].seen = t;
    const gone = m.uids.filter(u => t - (m.players[u].seen || 0) > A.GONE_MS);
    if (gone.length === 1) return end(m, t, other(m, gone[0]), 'forfeit');
    if (gone.length === 2) return end(m, t, null, 'forfeit');
    if ((m.phase === 'story' || m.phase === 'inter') && t >= m.until) return startFight(m, t);
    if (m.phase === 'fight' && t >= m.until) {
      const [a, b] = m.uids, ha = m.players[a].hp, hb = m.players[b].hp;
      return roundOver(m, t, ha > hb ? a : hb > ha ? b : null, 'time');
    }
  }
  // ひとこと
  const STAMP_KINDS = { pre: 4, win: 4, lose: 4, any: 2 };
  function stamp(m, uid, k, i, t) {
    if (!(k in STAMP_KINDS) || !Number.isInteger(i) || i < 0 || i >= STAMP_KINDS[k]) return { accepted: false };
    const last = m.stamps[uid];
    if (last && t - last.at < 2500) return { accepted: false };
    m.stamps[uid] = { k, i, at: t, seq: (last ? last.seq : 0) + 1 };
    return { accepted: true };
  }
  // 試合が終わったときのポイント。pa・pb＝2人の記録（書き換える）
  function settle(m, pa, pb, t) {
    const [a, b] = m.uids, w = m.result.winner;
    const up = (p, x, win) => { p.rp = Math.max(0, (p.rp || 0) + x); p.rank = rankOf(p.rp); p.games = (p.games || 0) + 1; if (win === true) p.w = (p.w || 0) + 1; else if (win === false) p.l = (p.l || 0) + 1; else p.d = (p.d || 0) + 1; p.updated = t; };
    let da = 0, db = 0;
    if (w) { const W = w === a ? pa : pb, Lp = w === a ? pb : pa, pt = points(W.rp || 0, Lp.rp || 0); if (w === a) { da = pt.gain; db = -pt.loss; } else { db = pt.gain; da = -pt.loss; } }
    up(pa, da, w ? w === a : null); up(pb, db, w ? w === b : null);
    m.result.delta = { [a]: da, [b]: db };
    m.result.after = { [a]: { rp: pa.rp, rank: pa.rank }, [b]: { rp: pb.rp, rank: pb.rank } };
  }
  // CPUを倒したときのポイント（少しずつ）。1勝＋3、1日30ポイントまで。始めてから40秒たっていない勝ちは数えない
  const CPU = { GAIN: 3, DAY_MAX: 30, MIN_MS: 40000 };
  const jstDay = t => new Date(t + 9 * 3600000).toISOString().slice(0, 10);
  function cpuWin(p, t) {
    if (!p.cpuAt || t - p.cpuAt < CPU.MIN_MS) return { gain: 0, why: 'early' };
    p.cpuAt = 0;
    const day = jstDay(t); if (p.cpuDay !== day) { p.cpuDay = day; p.cpuPts = 0; }
    const gain = Math.max(0, Math.min(CPU.GAIN, CPU.DAY_MAX - (p.cpuPts || 0)));
    p.cpuPts = (p.cpuPts || 0) + gain; p.cw = (p.cw || 0) + 1;
    p.rp = (p.rp || 0) + gain; p.rank = rankOf(p.rp); p.updated = t;
    return { gain, why: gain ? 'ok' : 'max', left: CPU.DAY_MAX - p.cpuPts };
  }
  const api = { A, CPU, RANKS, CHARS, cleanChar, rankOf, points, usable, build, ready, attack, tick, stamp, settle, other, cpuWin };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LBArena = api;
})(typeof self !== 'undefined' ? self : this);
