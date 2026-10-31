/* LEGAL BREAK オンライン対戦：試合のルール（計算だけ。保存や通信はしない）。
   サーバー（index.js）が使う。動作確認用の練習ページ（tools/battle-test）でも同じものを使う。
   m＝試合の状態（2人に見せてよいもの）、s＝秘密の状態（正解・CPUの予定。スマホには送らない）、t＝サーバーの時刻（ミリ秒） */
(function (root) {
  const R = {
    HP: 1000,
    QTIME: 30000,          // 1問の制限時間
    MAXQ: 15,              // 1試合の最大問題数
    OTE: 5000,             // この時間内の不正解は「お手つき」
    DMG_FAST: 150, DMG_MID: 100, DMG_SLOW: 70,   // 正解までの時間 0-10秒 / 10-20秒 / 20-30秒
    MISS: 50, OTETSUKI: 100, STARE: 30,
    COUNTER: 2,
    VS_MS: 6500,           // 見つかった！→VS→3・2・1・FIGHT
    RV_MS: 9500,           // 解説を見る時間（最初の1.6秒は攻撃の演出）
    DISC: 15000,           // 切断を待つ時間
    QUEUE_FRESH: 25000,    // 相手探しの受付が有効な時間
    SD_MAX: 3,             // サドンデスの最大問題数
    STAMP_GAP: 3000,
    K: 32, INIT: 1500,
    // 記述バトル
    PANEL_MS: 6500,        // 紙芝居1枚の時間
    KJ_TIME: 120000,       // 答案づくりの制限時間
    KJ_DMG: 600,           // 部分点のダメージの合計（満点の最後の1つは必殺技で一撃K.O.）
    KJ_MISS: 50, KJ_LOCK: 2000
  };
  const STAMPS = ['よろしく！', 'ナイス！', '参った！', 'もう1戦！', 'ありがとう！', 'くっ…！'];
  const CHARAS = ['sato', 'bando', 'sasaki', 'tanaka', 'gonda', 'miura'];
  const cleanChara = c => CHARAS.includes(c) ? c : 'sato';
  const rankOf = r => r >= 1850 ? 'S' : r >= 1700 ? 'A' : r >= 1550 ? 'B' : r >= 1400 ? 'C' : 'D';

  function shuffle(a, rnd) { rnd = rnd || Math.random; a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function newPlayer(name, t) { return { name, rating: R.INIT, rank: rankOf(R.INIT), w: 0, l: 0, d: 0, games: 0, updated: t || 0 }; }
  function pub(p) { return { name: p.name, rating: p.rating, rank: p.rank, w: p.w || 0, l: p.l || 0, d: p.d || 0, chara: cleanChara(p.chara) }; }
  const other = (m, uid) => m.uids[0] === uid ? m.uids[1] : m.uids[0];
  const cpuUid = m => m.cpu ? m.uids[1] : null;

  // 試合を作る。a・b は {uid, p:選手の記録}
  function buildMatch(a, b, cpu, t, nQuestions, rnd) {
    const order = shuffle([...Array(nQuestions).keys()], rnd);
    const total = Math.min(R.MAXQ, order.length);
    const perms = order.map(() => shuffle([0, 1, 2, 3, 4], rnd).join('')); // Firestore は配列の中の配列を保存できないので、文字列（例 "30412"）で持つ
    const players = {};
    players[a.uid] = Object.assign(pub(a.p), { hp: R.HP, cpu: false });
    players[b.uid] = Object.assign(pub(b.p), { hp: R.HP, cpu: !!cpu });
    const m = {
      uids: [a.uid, b.uid], cpu: !!cpu, players,
      phase: 'vs', phaseAt: t, until: t + R.VS_MS,
      qi: -1, total, sd: 0,
      q: null, ans: {}, cpuAt: null, ev: { seq: 0, list: [] }, rv: null,
      paused: null, result: null, stamps: {}, created: t, v: 1
    };
    return { m, s: { order, perms, cpu: null, cur: null } };
  }

  function startQuestion(m, s, t, Q, rnd) {
    rnd = rnd || Math.random;
    m.qi += 1;
    const k = m.qi % s.order.length;
    const q = Q[s.order[k]], perm = String(s.perms[k]).split('').map(Number);
    m.q = { no: m.qi + 1, field: q.field, topic: q.topic, type: q.type, text: q.text, choices: perm.map(i => q.choices[i]) };
    m.ans = {}; m.rv = null; m.phase = 'q'; m.phaseAt = t; m.until = t + R.QTIME;
    m.ev = { seq: m.ev.seq + 1, list: [] };
    s.cur = { correct: perm.indexOf(q.a), exp: q.exp, type: q.type, topic: q.topic };
    if (m.cpu) {
      const ok = rnd() < 0.6;
      const at = Math.round(ok ? 9000 + rnd() * 15000 : 6000 + rnd() * 14000);
      s.cpu = { ok, at }; m.cpuAt = at; // 答える時刻だけは見せてよい（正しいかどうかは秘密）
    } else { s.cpu = null; m.cpuAt = null; }
  }

  // 1人分の回答。戻り値：その問題が終わったか
  function applyAnswer(m, uid, ok, elapsed) {
    const op = other(m, uid), opAns = m.ans[op];
    m.ans[uid] = { ok, at: elapsed };
    if (ok) {
      let dmg = elapsed < 10000 ? R.DMG_FAST : elapsed < 20000 ? R.DMG_MID : R.DMG_SLOW;
      const counter = !!(opAns && !opAns.ok);
      if (counter) dmg *= R.COUNTER;
      if (m.sd) dmg = m.players[op].hp; // サドンデスは先に正解した方の勝ち
      m.players[op].hp = Math.max(0, m.players[op].hp - dmg);
      m.ev.list.push({ t: counter ? 'counter' : 'hit', by: uid, to: op, dmg, at: elapsed });
      return true;
    }
    const oto = elapsed < R.OTE, dmg = oto ? R.OTETSUKI : R.MISS;
    m.players[uid].hp = Math.max(0, m.players[uid].hp - dmg);
    m.ev.list.push({ t: oto ? 'oto' : 'miss', by: uid, to: uid, dmg, at: elapsed });
    return !!opAns || m.players[uid].hp <= 0;
  }

  function finish(m, t, reason, winner) {
    m.phase = 'end'; m.phaseAt = t; m.until = t; m.cpuAt = null; m.paused = null;
    m.result = { reason, winner: winner || null, draw: !winner, delta: {}, after: {} };
    m.ev.seq += 1;
  }

  function endQuestion(m, s, t) {
    m.rv = { correct: s.cur.correct, exp: s.cur.exp, type: s.cur.type, topic: s.cur.topic };
    const [a, b] = m.uids, ha = m.players[a].hp, hb = m.players[b].hp;
    if (ha <= 0 && hb <= 0) return finish(m, t, 'ko', null);
    if (ha <= 0) return finish(m, t, 'ko', b);
    if (hb <= 0) return finish(m, t, 'ko', a);
    m.phase = 'rv'; m.phaseAt = t; m.until = t + R.RV_MS; m.cpuAt = null; m.ev.seq += 1;
  }

  function afterReview(m, s, t, Q, rnd) {
    if (m.qi + 1 < m.total) return startQuestion(m, s, t, Q, rnd);
    const [a, b] = m.uids, ha = m.players[a].hp, hb = m.players[b].hp;
    if (ha !== hb) return finish(m, t, 'judge', ha > hb ? a : b);
    if (m.sd >= R.SD_MAX) return finish(m, t, 'judge', null);
    m.sd += 1; m.total += 1; // サドンデス
    startQuestion(m, s, t, Q, rnd);
  }

  // ===================== 記述バトル =====================
  // K＝記述の問題（kijutsu.js）。1試合＝1論点。紙芝居 → FIGHT → キーワードの札で答案を組み立てる（20点満点）
  function buildKJ(a, b, cpu, t, K, rnd) {
    rnd = rnd || Math.random;
    const k = K[Math.floor(rnd() * K.length)];
    const n = k.slots.length;
    const pts = k.slots.map((_, i) => Math.floor(20 / n) + (i < 20 % n ? 1 : 0));
    const chips = shuffle(k.slots.map(x => x.a).concat(k.wrong), rnd);
    const ans = k.slots.map(x => chips.indexOf(x.a));
    const players = {};
    players[a.uid] = Object.assign(pub(a.p), { hp: R.HP, cpu: false });
    players[b.uid] = Object.assign(pub(b.p), { hp: R.HP, cpu: !!cpu });
    const prog = {}; [a.uid, b.uid].forEach(u => { prog[u] = { n: 0, pts: 0, lock: 0 }; });
    const m = {
      mode: 'kj', uids: [a.uid, b.uid], cpu: !!cpu, players,
      phase: 'vs', phaseAt: t, until: t + R.VS_MS,
      qi: 0, total: 1, sd: 0, q: null, ans: {}, cpuAt: null, ev: { seq: 0, list: [] }, rv: null,
      kj: { id: k.id, field: k.field, topic: k.topic, story: k.story, q: k.q, tpl: k.tpl, labels: k.slots.map(x => x.hint || ''), n, pts, chips, prog },
      paused: null, result: null, stamps: {}, created: t, v: 1
    };
    let cpuPlan = null;
    if (cpu) { // CPU：1つの空欄に8〜20秒、ときどき間違える
      cpuPlan = []; let at = 0;
      for (let i = 0; i < n; i++) { at += 8000 + Math.round(rnd() * 12000); if (rnd() < 0.3) { cpuPlan.push({ at, ok: false }); at += 3000 + Math.round(rnd() * 3000); } cpuPlan.push({ at, ok: true }); }
    }
    return { m, s: { kj: { ans, model: k.model, exp: k.exp, keys: k.keys || [], note: k.note || '' }, cpuPlan, cpuI: 0 } };
  }
  function kjEnd(m, s, t, reason, winner) {
    m.rv = { model: s.kj.model, exp: s.kj.exp, keys: s.kj.keys, note: s.kj.note, ans: s.kj.ans };
    finish(m, t, reason, winner);
  }
  // 札を1枚出す。slot＝何番目の空欄か、chip＝札の番号
  function kjPlay(m, s, uid, slot, chip, t) {
    const pg = m.kj.prog[uid], op = other(m, uid);
    if (pg.lock > t) return { accepted: false, why: 'lock' };
    if (slot !== pg.n || pg.n >= m.kj.n) return { accepted: false, why: 'slot' };
    const at = t - m.phaseAt;
    if (chip === s.kj.ans[slot]) {
      pg.n += 1; pg.pts += m.kj.pts[slot];
      if (pg.n >= m.kj.n) { // 満点の完成答案 → 必殺技で一撃
        const dmg = m.players[op].hp; m.players[op].hp = 0;
        m.ev.list.push({ t: 'kjfin', by: uid, to: op, dmg, at, slot });
        kjEnd(m, s, t, 'ko', uid);
        return { accepted: true, ok: true, done: true };
      }
      const dmg = Math.round(R.KJ_DMG / m.kj.n);
      m.players[op].hp = Math.max(0, m.players[op].hp - dmg);
      m.ev.list.push({ t: 'kjhit', by: uid, to: op, dmg, at, slot });
      return { accepted: true, ok: true };
    }
    pg.lock = t + R.KJ_LOCK;
    m.players[uid].hp = Math.max(0, m.players[uid].hp - R.KJ_MISS);
    m.ev.list.push({ t: 'kjmiss', by: uid, to: uid, dmg: R.KJ_MISS, at, slot });
    if (m.players[uid].hp <= 0) kjEnd(m, s, t, 'ko', op);
    return { accepted: true, ok: false };
  }
  function kjAnswer(m, s, uid, slot, chip, t) {
    advance(m, s, t);
    if (m.mode !== 'kj' || m.phase !== 'kj') return { accepted: false, why: 'closed' };
    if (m.paused) return { accepted: false, why: 'paused' };
    if (!Number.isInteger(chip) || chip < 0 || chip >= m.kj.chips.length) return { accepted: false, why: 'chip' };
    return kjPlay(m, s, uid, slot, chip, t);
  }
  function kjAdvance(m, s, t) {
    if (m.phase === 'vs' && t >= m.until) { m.phase = 'story'; m.phaseAt = m.until; m.until = m.phaseAt + m.kj.story.length * R.PANEL_MS; m.ev.seq += 1; }
    if (m.phase === 'story' && t >= m.until) { m.phase = 'kj'; m.phaseAt = m.until; m.until = m.phaseAt + R.KJ_TIME; m.ev = { seq: m.ev.seq + 1, list: [] }; }
    if (m.phase !== 'kj') return;
    if (m.cpu && s.cpuPlan) { // CPUの番
      const cu = m.uids[1];
      while (m.phase === 'kj' && s.cpuI < s.cpuPlan.length && t - m.phaseAt >= s.cpuPlan[s.cpuI].at) {
        const p = s.cpuPlan[s.cpuI++], pg = m.kj.prog[cu], tt = m.phaseAt + p.at;
        const right = s.kj.ans[pg.n], wrong = m.kj.chips.findIndex((c, i) => !s.kj.ans.includes(i));
        pg.lock = 0; kjPlay(m, s, cu, pg.n, p.ok ? right : wrong, tt);
      }
      m.cpuAt = s.cpuI < s.cpuPlan.length ? s.cpuPlan[s.cpuI].at : null;
    }
    if (m.phase === 'kj' && t >= m.until) { // 時間切れ：点の高い方、同点ならHPの多い方
      const [a, b] = m.uids, pa = m.kj.prog[a].pts, pb = m.kj.prog[b].pts, ha = m.players[a].hp, hb = m.players[b].hp;
      const w = pa !== pb ? (pa > pb ? a : b) : ha !== hb ? (ha > hb ? a : b) : null;
      kjEnd(m, s, t, 'judge', w);
    }
  }

  // 時間で進める（CPUの回答・時間切れ・解説の終わり）
  function advance(m, s, t, Q, rnd) {
    if (m.phase === 'end' || m.paused) return;
    if (m.mode === 'kj') return kjAdvance(m, s, t);
    if (m.phase === 'vs') { if (t >= m.until) startQuestion(m, s, t, Q, rnd); return; }
    if (m.phase === 'q') {
      const cu = cpuUid(m);
      if (cu && s.cpu && !m.ans[cu] && t - m.phaseAt >= s.cpu.at) {
        if (applyAnswer(m, cu, s.cpu.ok, s.cpu.at)) return endQuestion(m, s, t);
      }
      if (t >= m.until) {
        if (!Object.keys(m.ans).length) {
          m.uids.forEach(u => { m.players[u].hp = Math.max(0, m.players[u].hp - R.STARE); });
          m.ev.list.push({ t: 'stare', by: null, to: null, dmg: R.STARE, at: R.QTIME });
        } else m.ev.list.push({ t: 'timeup', by: null, to: null, dmg: 0, at: R.QTIME });
        endQuestion(m, s, t);
      }
      return;
    }
    if (m.phase === 'rv' && t >= m.until) afterReview(m, s, t, Q, rnd);
  }

  // 回答を受け付ける。戻り値 {accepted, why}
  function answer(m, s, uid, qi, choice, t, Q, rnd) {
    advance(m, s, t, Q, rnd); // 先にCPUの回答や時間切れを反映（順番を正しくするため）
    if (m.phase !== 'q' || m.qi !== qi) return { accepted: false, why: 'closed' };
    if (m.paused) return { accepted: false, why: 'paused' };
    if (m.ans[uid]) return { accepted: false, why: 'answered' };
    const elapsed = t - m.phaseAt;
    if (elapsed > R.QTIME) return { accepted: false, why: 'timeup' };
    const ok = choice === s.cur.correct;
    if (applyAnswer(m, uid, ok, elapsed)) endQuestion(m, s, t);
    return { accepted: true };
  }

  // 切断の確認。online＝{uid: true/false}（CPUは見ない）
  function presence(m, t, online) {
    if (m.phase === 'end') return;
    const humans = m.uids.filter(u => !m.players[u].cpu);
    const off = humans.filter(u => online[u] === false);
    if (off.length) {
      if (!m.paused) { m.paused = { uid: off[0], since: t }; m.ev.seq += 1; return; }
      if (t - m.paused.since >= R.DISC) finish(m, t, 'forfeit', off.length === 1 ? other(m, off[0]) : null);
      return;
    }
    if (m.paused) { const gap = t - m.paused.since; m.until += gap; m.phaseAt += gap; m.paused = null; m.ev.seq += 1; }
  }

  function stamp(m, uid, id, t) {
    if (!Number.isInteger(id) || id < 0 || id >= STAMPS.length) return { accepted: false };
    if (m.phase === 'q' || m.phase === 'kj') return { accepted: false };
    const last = m.stamps[uid];
    if (last && t - last.at < R.STAMP_GAP) return { accepted: false };
    m.stamps[uid] = { id, at: t, seq: (last ? last.seq : 0) + 1 };
    return { accepted: true };
  }

  function eloDelta(ra, rb, score) { const e = 1 / (1 + Math.pow(10, (rb - ra) / 400)); return Math.round(R.K * (score - e)); }

  // 試合が終わったときのレーティング。pa・pb は2人の記録（書き換える）。CPU戦は呼ばない
  function settle(m, pa, pb, t) {
    const [a, b] = m.uids;
    const sa = m.result.winner === a ? 1 : m.result.winner === b ? 0 : 0.5;
    const xa = eloDelta(pa.rating, pb.rating, sa), xb = eloDelta(pb.rating, pa.rating, 1 - sa);
    const up = (p, x, sc) => {
      p.rating = Math.max(100, p.rating + x); p.rank = rankOf(p.rating); p.games = (p.games || 0) + 1;
      if (sc === 1) p.w = (p.w || 0) + 1; else if (sc === 0) p.l = (p.l || 0) + 1; else p.d = (p.d || 0) + 1;
      p.updated = t;
    };
    up(pa, xa, sa); up(pb, xb, 1 - sa);
    m.result.delta = { [a]: xa, [b]: xb };
    m.result.after = { [a]: { rating: pa.rating, rank: pa.rank }, [b]: { rating: pb.rating, rank: pb.rank } };
  }

  function cleanName(n) {
    n = String(n == null ? '' : n).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
    return n && !/[@＠]/.test(n) ? n : null;
  }

  const api = { R, STAMPS, CHARAS, cleanChara, rankOf, shuffle, newPlayer, pub, other, buildMatch, buildKJ, kjAnswer, startQuestion, applyAnswer, advance, answer, presence, stamp, eloDelta, settle, cleanName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LBLogic = api;
})(typeof self !== 'undefined' ? self : this);
