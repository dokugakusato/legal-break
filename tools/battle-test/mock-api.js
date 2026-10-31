/* 動作確認用の「にせサーバー」。本物の Firebase の代わりに、ブラウザの中で functions/logic.js を動かす。
   本番・試験用プロジェクトには使わない（tools/ は公開されない）。
   ?opp=human  … 3秒後に人間役（ボット）が来る
   ?opp=none   … 誰も来ない（20秒後にCPU戦）
   ?opp=drop   … 人間役が2問目で通信を切る（15秒で不戦勝になるか確認） */
(function () {
  const L = window.LBLogic, Q = window.LB_Q, K = window.LB_K, R = L.R;
  const opp = new URLSearchParams(location.search).get('opp') || 'human';
  const ME = 'me_' + Math.random().toString(36).slice(2, 8), BOT = 'bot_hito';
  const players = {}, tickets = {}, matches = {}, watchers = {}, ticketW = {}, status = {};
  let queue = null;
  const now = () => Date.now();
  const wait = v => new Promise(ok => setTimeout(() => ok(JSON.parse(JSON.stringify(v))), 30));
  const err = (code, message) => { const e = new Error(message); e.code = code; return e; };
  players.p1 = Object.assign(L.newPlayer('強い人', 0), { rating: 1910, rank: 'S', w: 40, l: 3, games: 43 });
  players.p2 = Object.assign(L.newPlayer('行政法の鬼', 0), { rating: 1720, rank: 'A', w: 20, l: 8, games: 28 });
  players[BOT] = Object.assign(L.newPlayer('独学ファイター', 0), { rating: 1560, rank: 'B', w: 6, l: 4, games: 10 });

  function emit(id) { const m = matches[id]; (watchers[id] || []).forEach(cb => setTimeout(() => cb(JSON.parse(JSON.stringify(m.m))), 20)); }
  function setTicket(u, v) { tickets[u] = v; (ticketW[u] || []).forEach(cb => setTimeout(() => cb(v), 20)); }
  function create(a, b, cpu, mode) {
    const id = 'mock' + Math.random().toString(36).slice(2, 12);
    const { m, s } = mode === 'kj' ? L.buildKJ(a, b, cpu, now(), K) : L.buildMatch(a, b, cpu, now(), Q.length);
    matches[id] = { m, s }; return id;
  }
  function mutate(id, u, fn) {
    const x = matches[id]; if (!x) throw err('not-found', '試合がない');
    const was = x.m.phase === 'end', before = JSON.stringify(x.m);
    const out = fn(x.m, x.s, now()) || {};
    if (JSON.stringify(x.m) !== before) x.m.v = (x.m.v || 0) + 1;
    if (!was && x.m.phase === 'end' && !x.m.cpu) {
      const [a, b] = x.m.uids; L.settle(x.m, players[a], players[b], now());
    }
    emit(id); if (x.m.uids.includes(BOT)) bot(id);
    return Object.assign({ now: now(), phase: x.m.phase, match: JSON.parse(JSON.stringify(x.m)) }, out);
  }

  // 人間役のボット
  const botState = {};
  function bot(id) {
    const x = matches[id], m = x.m, st = botState[id] = botState[id] || {};
    clearTimeout(st.t); clearTimeout(st.tt);
    if (m.phase === 'end') return;
    if (opp === 'drop' && m.phase === 'q' && m.qi === 1 && !st.dropped) { st.dropped = 1; status[BOT] = 'offline'; return; }
    if (status[BOT] === 'offline') return;
    st.tt = setTimeout(() => api.call('tick', { matchId: id }, BOT), Math.max(30, m.until - now() + 300));
    if (m.phase === 'vs' && !st.hello) { st.hello = 1; setTimeout(() => api.call('stamp', { matchId: id, id: 0 }, BOT).catch(() => {}), 1200); }
    if (m.mode === 'kj' && m.phase === 'kj') { // 記述：6〜12秒ごとに札を出す（3割まちがう）
      const pg = m.kj.prog[BOT]; if (pg.n < m.kj.n && !st.kjt) st.kjt = setTimeout(() => { st.kjt = null; const ok = Math.random() > 0.3, left = x.s.kj.ans.filter((c, i) => !String(pg.got || '').includes(String(i))), two = Math.random() < 0.4 ? 2 : 1; api.call('kj', { matchId: id, chips: ok ? left.slice(0, two) : left.slice(0, two - 1).concat([m.kj.chips.findIndex((c, i) => !x.s.kj.ans.includes(i))]) }, BOT).catch(() => {}); }, 6000 + Math.random() * 6000);
    }
    if (m.phase === 'q' && !m.ans[BOT] && st.q !== m.qi) {
      st.q = m.qi;
      const ok = Math.random() < 0.5, at = 4000 + Math.random() * 16000;
      st.t = setTimeout(() => api.call('answer', { matchId: id, qi: m.qi, choice: ok ? x.s.cur.correct : (x.s.cur.correct + 1) % 5 }, BOT).catch(() => {}), at);
    }
  }

  const api = {
    async init() { status[ME] = 'online'; return ME; },
    onReconnect() {},
    async call(name, d, as) {
      const u = as || ME; d = d || {};
      await new Promise(ok => setTimeout(ok, 40));
      if (name === 'me') {
        if (d.name) { const n = L.cleanName(d.name); if (!n) throw err('invalid-argument', '名前は1〜12文字'); players[u] = players[u] || L.newPlayer(n, now()); players[u].name = n; }
        if (d.chara && players[u]) players[u].chara = L.cleanChara(d.chara);
        const p = players[u]; return wait({ now: now(), player: p ? Object.assign(L.pub(p), { games: p.games || 0 }) : null });
      }
      if (name === 'find') {
        const n = L.cleanName(d.name); if (!n) throw err('invalid-argument', '名前は1〜12文字');
        players[u] = players[u] || L.newPlayer(n, now()); players[u].name = n; players[u].chara = L.cleanChara(d.chara);
        const t = now();
        if (queue && queue.uid !== u && queue.mode === (d.mode || 'choice') && t - queue.at < R.QUEUE_FRESH && status[queue.uid] !== 'offline') {
          const id = create({ uid: queue.uid, p: players[queue.uid] }, { uid: u, p: players[u] }, false, d.mode);
          setTicket(queue.uid, { matchId: id, at: t }); setTicket(u, { matchId: id, at: t }); queue = null;
          if (matches[id].m.uids.includes(BOT)) bot(id);
          return wait({ now: t, matchId: id });
        }
        queue = { uid: u, at: t, mode: d.mode || 'choice' };
        if (u === ME && (opp === 'human' || opp === 'drop')) { status[BOT] = 'online'; setTimeout(() => api.call('find', { name: players[BOT].name, chara: 'bando', mode: d.mode }, BOT), 3000); }
        return wait({ now: t, waiting: true, since: t });
      }
      if (name === 'cancel') { if (queue && queue.uid === u) queue = null; return wait({ now: now() }); }
      if (name === 'cpu') {
        const t = now();
        if (d.since && tickets[u] && tickets[u].at >= d.since) return wait({ now: t, matchId: tickets[u].matchId });
        if (queue && queue.uid === u) queue = null;
        const id = create({ uid: u, p: players[u] }, { uid: 'cpuX', p: { name: '修行相手（CPU）', rating: 0, rank: 'CPU', chara: L.CHARAS[Math.floor(Math.random() * 6)] } }, true, d.mode);
        setTicket(u, { matchId: id, at: t });
        return wait({ now: t, matchId: id });
      }
      if (name === 'answer') return wait(mutate(d.matchId, u, (m, s, t) => L.answer(m, s, u, d.qi, d.choice, t, Q)));
      if (name === 'tick') return wait(mutate(d.matchId, u, (m, s, t) => {
        const on = {}; m.uids.filter(x => !m.players[x].cpu).forEach(x => on[x] = status[x] !== 'offline');
        L.presence(m, t, on); L.advance(m, s, t, Q);
      }));
      if (name === 'kj') return wait(mutate(d.matchId, u, (m, s, t) => L.kjAnswer(m, s, u, d.chips || d.chip, t)));
      if (name === 'stamp') return wait(mutate(d.matchId, u, (m, s, t) => L.stamp(m, u, d.id, t)));
      throw err('not-found', name);
    },
    watchMatch(id, cb) { (watchers[id] = watchers[id] || []).push(cb); setTimeout(() => cb(JSON.parse(JSON.stringify(matches[id].m))), 20); return () => { watchers[id] = (watchers[id] || []).filter(f => f !== cb); }; },
    watchTicket(cb) { (ticketW[ME] = ticketW[ME] || []).push(cb); return () => { ticketW[ME] = ticketW[ME].filter(f => f !== cb); }; },
    watchStatus(u, cb) { let last = null; const iv = setInterval(() => { const v = status[u] || 'online'; if (v !== last) { last = v; cb({ state: v }); } }, 500); return () => clearInterval(iv); },
    async onlineCount() { return 3; },
    async ranking(myRating) {
      const top = Object.keys(players).map(k => Object.assign({ uid: k }, players[k])).filter(p => (p.games || 0) > 0).sort((a, b) => b.rating - a.rating);
      return { top, myPos: myRating == null ? null : top.filter(p => p.rating > myRating).length + 1 };
    }
  };
  window.LB_MOCK_API = api;
  window.LB_MOCK = { matches, players, status, ME };
})();
