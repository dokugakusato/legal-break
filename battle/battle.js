/* LEGAL BREAK ONLINE BATTLE（試作）：画面の動き。
   勝ち負けの計算はしない（すべてサーバー）。ここは「押した番号を送る」「届いた状態を描く」だけ。 */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const STAMPS = ['よろしく！', 'ナイス！', '参った！', 'もう1戦！', 'ありがとう！', 'くっ…！'];
  const WAZA = ['取消訴訟！', '執行停止！', '国家賠償請求！', '詐害行為取消権！', '無権代理の追認拒絶！', '背信的悪意者排除！'];
  const QTIME = 30000, SEARCH_MS = 20000, DISC = 15000;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NUM = ['①', '②', '③', '④', '⑤'];
  const rk = r => `<b class="rk r${esc(r)}">${esc(r)}</b>`;

  let API = null, uid = null, player = null;
  let offset = 0, bestRtt = 1e9;
  const sNow = () => Date.now() + offset;
  function syncClock(t0, t1, serverNow) {
    if (!serverNow) return; const rtt = t1 - t0;
    if (rtt <= bestRtt * 1.5) { bestRtt = Math.min(bestRtt, rtt); offset = serverNow - (t0 + t1) / 2; }
  }
  async function call(name, data) { const t0 = Date.now(); const r = await API.call(name, data || {}); syncClock(t0, Date.now(), r && r.now); return r; }

  // ---------- 音（最初のタップで鳴らせるようにする） ----------
  let AC = null;
  function unlock() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} }
  function tone(f1, f2, dur, type, vol) {
    if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
    g.gain.setValueAtTime(vol || .16, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, vol) {
    if (!AC) return; const n = AC.sampleRate * dur, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = AC.createBufferSource(), g = AC.createGain(); s.buffer = b; g.gain.value = vol || .3; s.connect(g).connect(AC.destination); s.start();
  }
  const SND = {
    hit() { noise(.18, .35); tone(180, 60, .2, 'square', .2); },
    counter() { noise(.3, .45); tone(90, 40, .5, 'sawtooth', .25); tone(880, 1760, .25, 'square', .08); },
    miss() { tone(220, 70, .35, 'square', .18); },
    tick() { tone(1200, 1200, .05, 'square', .05); },
    go() { tone(660, 1320, .25, 'square', .12); },
    found() { tone(523, 1046, .18, 'square', .1); setTimeout(() => tone(784, 1568, .3, 'square', .1), 140); },
    ko() { noise(.6, .5); tone(120, 30, 1, 'sawtooth', .3); }
  };

  // ---------- 画面の切り替え ----------
  function show(id) { document.querySelectorAll('.scr').forEach(s => s.hidden = s.id !== id); }
  function msg(t) { $('#homeMsg').textContent = t || ''; }

  // ---------- メニュー ----------
  function renderMe() {
    const p = player || { rank: 'C', rating: 1500, w: 0, l: 0, d: 0 };
    const r = $('#meRank'); r.textContent = p.rank; r.className = 'rankbig r' + p.rank;
    $('#meStat').textContent = `レート ${p.rating} ・ ${p.w}勝${p.l}敗${p.d ? p.d + '分' : ''}`;
  }
  async function refreshOnline() {
    try { const n = await API.onlineCount(); $('#onlineN').textContent = n > 0 ? `いまオンライン ${n}人` : ''; } catch (e) {}
  }
  function savedName() { try { return localStorage.getItem('lbBattleName') || ''; } catch (e) { return ''; } }
  function saveName(n) { try { localStorage.setItem('lbBattleName', n); } catch (e) {} }
  function readName() {
    const n = $('#nameIn').value.replace(/[<>]/g, '').trim().slice(0, 12);
    if (!n) { msg('名前を入れてください'); $('#nameIn').focus(); return null; }
    if (/[@＠]/.test(n)) { msg('名前に @ は使えません（メールアドレスは載せないで）'); return null; }
    return n;
  }
  async function goHome() {
    leaveMatch(); show('s-home'); msg('');
    try { const r = await call('battleMe'); if (r.player) { player = r.player; renderMe(); } } catch (e) {}
    refreshOnline();
  }

  // ---------- 相手探し ----------
  let search = null;
  async function find() {
    unlock(); msg('');
    const name = readName(); if (!name) return;
    saveName(name);
    leaveMatch();
    const my = { id: Math.random() }; search = my;
    show('s-search'); $('#found').hidden = true; $('#cancelBtn').hidden = false;
    $('#searchTxt').textContent = '対戦相手を待っています…'; $('#searchLeft').textContent = '';
    let r;
    try { r = await call('battleFind', { name }); }
    catch (e) { if (search === my) { search = null; show('s-home'); msg(errText(e)); } return; }
    if (search !== my) return;
    if (r.matchId) return matched(r.matchId, false);
    const since = r.since, endAt = Date.now() + SEARCH_MS;
    my.unTicket = API.watchTicket(t => { if (search === my && t && t.at >= since) matched(t.matchId, false); });
    my.timer = setInterval(async () => {
      if (search !== my) return;
      const left = Math.ceil((endAt - Date.now()) / 1000);
      $('#searchLeft').textContent = left > 0 ? `あと ${left} 秒で修行相手（CPU）と戦う` : '修行相手を呼んでいます…';
      if (left <= 0 && !my.cpuAsked) {
        my.cpuAsked = true;
        try { const c = await call('battleCpu', { since }); if (search === my) matched(c.matchId, true); }
        catch (e) { if (search === my) { stopSearch(); show('s-home'); msg(errText(e)); } }
      }
    }, 250);
  }
  function stopSearch() { if (!search) return; clearInterval(search.timer); search.unTicket && search.unTicket(); search = null; }
  async function cancel() { stopSearch(); show('s-home'); try { await call('battleCancel'); } catch (e) {} }
  function matched(id, viaCpu) {
    stopSearch();
    $('#cancelBtn').hidden = true;
    const f = $('#found'); f.textContent = viaCpu ? '修行相手、参上！' : '見つかった！'; f.hidden = false; SND.found();
    setTimeout(() => enterMatch(id), 900);
  }

  // ---------- 対戦 ----------
  let rvTimer = null, MID = null, M = null, unM = null, unOp = null, seen = {}, lastQi = -2, tickTimer = null, loopTimer = null, stampSeen = {}, endShown = false, opOffline = false;
  const opUid = () => M && (M.uids[0] === uid ? M.uids[1] : M.uids[0]);

  function enterMatch(id) {
    MID = id; M = null; seen = {}; lastQi = -2; stampSeen = {}; endShown = false; opOffline = false;
    show('s-battle');
    ['#vs', '#review', '#endL', '#pauseB'].forEach(s => $(s).hidden = true);
    $('#qText').textContent = ''; $('#choices').innerHTML = ''; $('#qMeta').textContent = ''; $('#qNo').textContent = 'VS';
    $('#figMe').className = 'fig me hero'; $('#figOp').className = 'fig op hero';
    $('#figMe').innerHTML = window.SATO_SVG + window.EMO_SVG; $('#figOp').innerHTML = window.SATO_SVG + window.EMO_SVG;
    unM = API.watchMatch(id, m => { if (MID === id && m) render(m); }, () => {});
    clearInterval(loopTimer); loopTimer = setInterval(loop, 100);
  }
  function leaveMatch() {
    stopSearch();
    unM && unM(); unM = null; unOp && unOp(); unOp = null;
    clearTimeout(tickTimer); clearInterval(loopTimer); MID = null; M = null;
  }
  function tick() { if (MID) call('battleTick', { matchId: MID }).catch(() => {}); }
  function scheduleTick() {
    clearTimeout(tickTimer); if (!M || M.phase === 'end') return;
    let at = M.until + 250;
    if (M.paused) at = M.paused.since + DISC + 400;
    else if (M.phase === 'q' && M.cpuAt != null) { const cu = M.uids[1]; if (!M.ans[cu]) at = Math.min(at, M.phaseAt + M.cpuAt + 150); }
    tickTimer = setTimeout(() => { tick(); tickTimer = setTimeout(tick, 2500); }, Math.max(50, at - sNow()));
  }

  function render(m) {
    const prev = M; M = m;
    const me = m.players[uid], op = m.players[opUid()];
    if (!me || !op) return;
    // 上の帯
    $('#hMeName').textContent = me.name; $('#hOpName').textContent = op.name;
    $('#hMeRank').outerHTML = `<b class="rk r${esc(me.rank)}" id="hMeRank">${esc(me.rank)}</b>`;
    $('#hOpRank').outerHTML = `<b class="rk r${esc(op.rank)}" id="hOpRank">${esc(op.rank)}</b>`;
    hpBar('#hMeBar', '#hMeHp', me.hp); hpBar('#hOpBar', '#hOpHp', op.hp);
    hurt('#figMe', me.hp); hurt('#figOp', op.hp);
    if (!unOp && !op.cpu && API.watchStatus) unOp = API.watchStatus(opUid(), st => {
      opOffline = !!(st && st.state === 'offline');
      if (opOffline && M && M.phase !== 'end') { tick(); }
    });

    // 場面ごと
    $('#vs').hidden = m.phase !== 'vs';
    if (m.phase === 'vs' && (!prev || prev.phase !== 'vs')) drawVS(m);
    if (m.phase === 'q' && m.qi !== lastQi) { lastQi = m.qi; drawQuestion(m); }
    if (m.phase === 'q') lockChoices(m);
    events(m);
    if (m.phase !== 'rv') { clearTimeout(rvTimer); $('#review').hidden = true; }
    if (m.phase === 'rv' && (!prev || prev.phase !== 'rv' || prev.qi !== m.qi)) {
      drawReview(m); showAnswerMarks(m);
      // 攻撃の演出と正解の色を少し見せてから、解説を重ねる
      clearTimeout(rvTimer); rvTimer = setTimeout(() => { if (M && M.phase === 'rv') $('#review').hidden = false; }, 1600);
    }
    if (m.phase === 'end' && !endShown) { endShown = true; showAnswerMarks(m); setTimeout(() => drawEnd(m), m.result && m.result.reason === 'ko' ? 1700 : 600); }
    stamps(m);
    const pb = $('#pauseB');
    if (m.paused && m.phase !== 'end') { pb.hidden = false; pb.textContent = m.paused.uid === uid ? '通信が切れました。つなぎ直しています…' : '相手の接続を待っています…（15秒で不戦勝）'; }
    else pb.hidden = true;
    $('#qNo').textContent = m.phase === 'vs' ? 'VS' : m.sd ? '延長' : `${Math.min(m.qi + 1, m.total)}/${m.total}`;
    scheduleTick();
  }
  function hpBar(bar, num, hp) { const b = $(bar); b.style.width = Math.max(0, hp / 10) + '%'; b.classList.toggle('low', hp <= 300); $(num).textContent = hp; }
  function hurt(sel, hp) { const f = $(sel); f.classList.toggle('hurt1', hp <= 600 && hp > 300); f.classList.toggle('hurt2', hp <= 300); }

  function drawVS(m) {
    const me = m.players[uid], op = m.players[opUid()];
    const card = p => `<div class="vscard"><div class="rb r${esc(p.rank)}">${esc(p.rank)}</div><div class="nm">${esc(p.name)}</div><div class="wl">${p.cpu ? '練習相手' : `${p.w}勝${p.l}敗 ・ レート${p.rating}`}</div></div>`;
    $('#vs').innerHTML = `<div class="vsrow">${card(me)}<div class="vsx">VS</div>${card(op)}</div><div class="count" id="count"></div>${m.cpu ? '<p class="cpunote">CPU戦：ランクは変わりません</p>' : ''}${stampBar()}`;
    bindStamps($('#vs'));
  }
  function stampBar() { return `<div class="stamps">${STAMPS.map((s, i) => `<button type="button" data-st="${i}">${s}</button>`).join('')}</div>`; }
  function bindStamps(root) {
    root.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
      if (!MID) return; const id = +b.dataset.st;
      root.querySelectorAll('[data-st]').forEach(x => x.disabled = true); setTimeout(() => root.querySelectorAll('[data-st]').forEach(x => x.disabled = false), 3000);
      call('battleStamp', { matchId: MID, id }).catch(() => {});
    });
  }
  function stamps(m) {
    Object.keys(m.stamps || {}).forEach(u => {
      const s = m.stamps[u]; if (stampSeen[u] === s.seq) return; stampSeen[u] = s.seq;
      if (sNow() - s.at > 6000) return;
      const el = u === uid ? $('#bubMe') : $('#bubOp');
      el.textContent = STAMPS[s.id] || ''; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
      clearTimeout(el._t); el._t = setTimeout(() => el.hidden = true, 2600);
    });
  }

  function drawQuestion(m) {
    SND.go(); pop(m.qi === 0 ? 'FIGHT!' : m.sd ? 'サドンデス！' : `第${m.qi + 1}問`, m.sd ? '' : 'gold');
    $('#qMeta').textContent = `${m.q.field}｜${m.q.topic}`;
    $('#qText').textContent = m.q.text;
    $('#choices').className = 'choices';
    $('#choices').innerHTML = m.q.choices.map((c, i) => `<button type="button" class="ch" data-i="${i}"><span class="n">${NUM[i]}</span><span>${esc(c)}</span></button>`).join('');
    $('#choices').querySelectorAll('.ch').forEach(b => b.onclick = () => answer(+b.dataset.i, b));
    fit();
  }
  function answer(i, btn) {
    if (!M || M.phase !== 'q' || M.ans[uid] || M.paused) return;
    unlock();
    btn.classList.add('mine'); $('#choices').classList.add('locked');
    $('#choices').querySelectorAll('.ch').forEach(b => b.disabled = true);
    const qi = M.qi;
    call('battleAnswer', { matchId: MID, qi, choice: i }).then(r => {
      if (r && !r.accepted && M && M.phase === 'q' && M.qi === qi && !M.ans[uid] && !M.paused) {
        btn.classList.remove('mine'); $('#choices').classList.remove('locked'); $('#choices').querySelectorAll('.ch').forEach(b => b.disabled = false);
      }
    }).catch(() => {
      if (M && M.phase === 'q' && M.qi === qi && !M.ans[uid]) { btn.classList.remove('mine'); $('#choices').classList.remove('locked'); $('#choices').querySelectorAll('.ch').forEach(b => b.disabled = false); }
    });
  }
  function lockChoices(m) {
    const done = !!m.ans[uid] || !!m.paused;
    $('#choices').querySelectorAll('.ch').forEach(b => { if (done) b.disabled = true; else if (!$('#choices').classList.contains('locked')) b.disabled = false; });
    if (m.ans[uid]) $('#choices').classList.add('locked');
  }
  // 問題文と選択肢がスクロールなしで収まるまで、文字を小さくする
  function fit() {
    const qa = $('#qarea'); let fs = 14.5;
    qa.style.setProperty('--fs', fs + 'px');
    for (let k = 0; k < 14 && qa.scrollHeight > qa.clientHeight + 1 && fs > 10.5; k++) { fs -= .3; qa.style.setProperty('--fs', fs.toFixed(1) + 'px'); }
  }
  window.addEventListener('resize', () => { if (M && M.phase === 'q') fit(); });

  function showAnswerMarks(m) {
    if (!m.rv) return;
    $('#choices').querySelectorAll('.ch').forEach((b, i) => { b.disabled = true; if (i === m.rv.correct) b.classList.add('right'); else if (b.classList.contains('mine')) b.classList.add('wrong'); });
  }
  function drawReview(m) {
    const evs = m.ev.list, me = uid;
    const hit = evs.find(e => e.t === 'hit' || e.t === 'counter');
    let title = '両者ミス', cls = 'ng';
    if (hit) { title = hit.by === me ? (hit.t === 'counter' ? 'カウンター成功！' : 'あなたの攻撃！') : '相手の攻撃…'; cls = hit.by === me ? 'ok' : 'ng'; }
    else if (evs.some(e => e.t === 'stare')) title = 'にらみ合い（両者30ダメージ）';
    else if (evs.some(e => e.t === 'timeup')) title = '時間切れ';
    const r = m.rv;
    $('#review').innerHTML = `<p class="vtitle ${cls}">${esc(title)}</p>
      <div class="rvans">正解 ${NUM[r.correct]} ${esc(m.q.choices[r.correct])}</div>
      <span class="rvtype">この問題は「${esc(r.type)}」</span> <span style="font-size:12px;color:#b9aa93">${esc(r.topic)}</span>
      <p class="rvexp">${esc(r.exp)}</p>
      ${stampBar()}<p class="nextin" id="nextIn"></p>`;
    bindStamps($('#review'));
  }
  function drawEnd(m) {
    if (!M || M !== m && M.phase !== 'end') return;
    m = M;
    const res = m.result || {}, win = res.winner === uid, draw = !res.winner;
    if (!draw) { const loser = win ? '#figOp' : '#figMe', winner = win ? '#figMe' : '#figOp'; emo(winner, 'happy'); emo(loser, 'sad'); if (res.reason === 'ko') $(loser).classList.add('down'); }
    let big = draw ? 'DRAW' : win ? (res.reason === 'ko' ? 'K.O.!' : 'WIN!') : 'LOSE…';
    let sub = draw ? '引き分け' : win ? (res.reason === 'forfeit' ? '相手が戻らなかった（不戦勝）' : res.reason === 'judge' ? '判定勝ち' : 'あなたの勝ち') : (res.reason === 'forfeit' ? '接続が切れて不戦敗' : res.reason === 'judge' ? '判定負け' : 'K.O.された…');
    let rate = '';
    if (m.cpu) rate = '<p class="cpunote">CPU戦なので、ランクは変わりません</p>';
    else if (res.delta && res.delta[uid] != null) {
      const d = res.delta[uid], a = res.after[uid];
      rate = `<p class="rchange">レート ${a.rating - d} → <b class="${d >= 0 ? 'up' : 'dn'}">${a.rating}（${d >= 0 ? '+' : ''}${d}）</b></p><div class="newrank r${esc(a.rank)}">${esc(a.rank)}</div><p class="cpunote">ランク</p>`;
      player = Object.assign({}, player || {}, { rating: a.rating, rank: a.rank });
    }
    $('#endL').innerHTML = `<div class="ko ${win || draw ? '' : 'lose'}">${big}</div><p class="endsub">${esc(sub)}</p>${rate}${stampBar()}
      <button class="btn" type="button" id="againBtn">もう一度さがす</button><button class="btn ghost" type="button" id="menuBtn">メニューへ</button>`;
    $('#endL').hidden = false; $('#review').hidden = true;
    bindStamps($('#endL'));
    $('#againBtn').onclick = () => { leaveMatch(); find(); };
    $('#menuBtn').onclick = goHome;
  }

  // 攻撃・ミスなどの演出
  function events(m) {
    (m.ev.list || []).forEach((e, i) => {
      const key = m.qi + ':' + i; if (seen[key]) return; seen[key] = 1;
      if (sNow() - (m.phaseAt + e.at) > 8000 && m.phase !== 'q') return; // 古いものは演出しない
      const mine = e.by === uid, fBy = mine ? '#figMe' : '#figOp', fTo = e.to === uid ? '#figMe' : '#figOp';
      if (e.t === 'hit' || e.t === 'counter') {
        if (e.t === 'counter') { pop('COUNTER!', 'gold'); setTimeout(() => pop(WAZA[Math.floor(Math.random() * WAZA.length)], 'small gold'), 650); SND.counter(); }
        else SND.hit();
        anim(fBy, 'lunge', 260); setTimeout(() => { anim(fTo, 'hit', 450); anim(fTo, 'knock', 500); emo(fTo, 'shock', 1000); emo(fBy, 'angry', 900); shake(); dmgNum(e.to === uid ? 'me' : 'op', e.dmg); }, 180);
        if (m.phase === 'end') SND.ko();
      } else if (e.t === 'oto' || e.t === 'miss') {
        pop(e.t === 'oto' ? 'お手つき！' : 'ミス！', e.t === 'oto' ? '' : 'small'); SND.miss();
        anim(fTo, 'hit', 450); emo(fTo, 'sad', 1200); dmgNum(e.to === uid ? 'me' : 'op', e.dmg);
        if (!mine && m.phase === 'q' && !m.ans[uid]) setTimeout(() => pop('COUNTER CHANCE!', 'gold'), 700);
      } else if (e.t === 'stare') { pop('にらみ合い…', 'small'); dmgNum('me', e.dmg); dmgNum('op', e.dmg); }
      else if (e.t === 'timeup') pop('時間切れ', 'small');
    });
  }
  function emo(sel, e, ms) { const f = $(sel); f.classList.remove('emo-shock', 'emo-happy', 'emo-sad', 'emo-angry'); if (e) f.classList.add('emo-' + e); clearTimeout(f._emo); if (ms) f._emo = setTimeout(() => f.classList.remove('emo-' + e), ms); }
  function anim(sel, cls, ms) { const f = $(sel); f.classList.remove(cls); void f.offsetWidth; f.classList.add(cls); setTimeout(() => f.classList.remove(cls), ms); }
  function shake() { const s = $('#stage'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); }
  function pop(t, cls) { const p = $('#pop'); p.innerHTML = `<b class="${cls || ''}">${esc(t)}</b>`; }
  function dmgNum(side, n) { const d = document.createElement('div'); d.className = 'dmgnum ' + side; d.textContent = '-' + n; $('#stage').appendChild(d); setTimeout(() => d.remove(), 1200); }

  // 毎0.1秒：残り時間・カウントダウン
  let lastSec = -1;
  function loop() {
    if (!M) return;
    const t = sNow();
    if (M.phase === 'vs') {
      const left = M.until - t, c = $('#count');
      if (c) { const v = left > 3000 ? '' : left > 0 ? String(Math.ceil(left / 1000)) : 'FIGHT!'; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v ? `<b>${v}</b>` : ''; if (v) SND.tick(); } }
    }
    const bar = $('#timerBar');
    if (M.phase === 'q') {
      const left = M.paused ? M.until - M.paused.since : M.until - t;
      bar.style.transform = `scaleX(${Math.max(0, Math.min(1, left / QTIME))})`; bar.classList.toggle('hurry', left < 10000);
      const sec = Math.ceil(left / 1000); if (sec !== lastSec && sec <= 5 && sec > 0 && !M.paused) SND.tick(); lastSec = sec;
    } else bar.style.transform = 'scaleX(0)';
    if (M.phase === 'rv') { const n = $('#nextIn'); if (n) { const s = Math.max(0, Math.ceil((M.until - t) / 1000)); n.textContent = M.qi + 1 >= M.total ? `${s}秒後に結果` : `${s}秒後に次の問題`; } }
  }

  // ---------- ランキング ----------
  async function ranking() {
    const sh = $('#sheet'), inn = $('#sheetIn'); sh.hidden = false;
    inn.innerHTML = '<h2>全国ランキング</h2><p class="myrank">読み込み中…</p>';
    try {
      const r = await API.ranking(player ? player.rating : null);
      const rows = r.top.map((p, i) => `<div class="rkrow${p.uid === uid ? ' me' : ''}"><span class="no">${i + 1}</span>${rk(p.rank)}<span class="nm">${esc(p.name)}</span><span class="wl">${p.w}勝${p.l}敗 ${p.rating}</span></div>`).join('');
      const mine = player && player.games !== 0 && r.myPos ? `<p class="myrank">あなたは <b>${r.myPos}位</b>（${rk(player.rank)} レート${player.rating}）</p>` : '<p class="myrank">対戦すると順位がつきます</p>';
      inn.innerHTML = `<h2>全国ランキング</h2>${mine}${rows || '<p class="myrank">まだ誰もいません</p>'}<button class="btn ghost" type="button" id="closeSheet">閉じる</button>`;
    } catch (e) { inn.innerHTML = `<h2>全国ランキング</h2><p class="myrank">読み込めませんでした</p><button class="btn ghost" type="button" id="closeSheet">閉じる</button>`; }
    $('#closeSheet').onclick = () => sh.hidden = true;
  }
  $('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') $('#sheet').hidden = true; });

  // ---------- アプリ内ブラウザ（X・LINEなど）の案内 ----------
  function inAppGuide() {
    const ua = navigator.userAgent || '';
    const isLine = /\bLine\//i.test(ua), isX = /Twitter/i.test(ua), isFb = /FBAN|FBAV|Instagram/i.test(ua);
    if (isLine && !/openExternalBrowser=1/.test(location.search)) {
      const u = new URL(location.href); u.searchParams.set('openExternalBrowser', '1'); location.replace(u.toString()); return;
    }
    if (!(isX || isFb || isLine)) return;
    const android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
    const box = $('#inapp');
    box.innerHTML = `<b>アプリの中のブラウザで開いています。</b>止まったり音が出なかったりすることがあるので、ふつうのブラウザ（${ios ? 'Safari' : 'Chrome'}）で開くのがおすすめ。${ios ? '<br>開けないときは、右上か右下の「…」→「ブラウザで開く」。' : ''}
      <div class="row"><button type="button" id="openExt">ブラウザで開く</button><button type="button" class="x" id="closeInapp">このまま遊ぶ</button></div>`;
    box.hidden = false;
    $('#closeInapp').onclick = () => box.hidden = true;
    $('#openExt').onclick = () => {
      const url = location.href;
      if (android) location.href = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
      else if (ios) location.href = 'x-safari-' + url;
      else window.open(url, '_blank');
    };
  }

  function errText(e) {
    const c = e && (e.code || ''), m = e && e.message || '';
    if (/resource-exhausted|unavailable|internal/.test(c)) return '今はオンライン対戦をお休みしています（メンテナンス中）。ストーリーモードは遊べます。';
    if (/invalid-argument/.test(c)) return m;
    return '通信できませんでした。電波の良いところで、もう一度。';
  }

  // ---------- 起動 ----------
  async function boot() {
    inAppGuide();
    $('#nameIn').value = savedName();
    $('#findBtn').onclick = find; $('#cancelBtn').onclick = cancel; $('#rankBtn').onclick = ranking;
    document.addEventListener('pointerdown', unlock, { once: true });
    renderMe();
    API = window.LB_MOCK_API || (window.LB_BATTLE_FIREBASE ? firebaseAPI(window.LB_BATTLE_FIREBASE) : null);
    if (!API) { $('#findBtn').disabled = true; msg('準備中です（試験用の設定がまだ入っていません）'); return; }
    $('#findBtn').disabled = true; msg('接続中…');
    try {
      uid = await API.init();
      API.onReconnect && API.onReconnect(() => { if (M && M.paused && M.phase !== 'end') tick(); });
      $('#findBtn').disabled = false; msg('');
      const r = await call('battleMe');
      if (r.player) { player = r.player; renderMe(); if (!$('#nameIn').value) $('#nameIn').value = player.name; }
      refreshOnline();
    } catch (e) { $('#findBtn').disabled = true; msg(errText(e)); }
  }

  // ---------- Firebase（試験用プロジェクト）とのやり取り ----------
  function firebaseAPI(cfg) {
    const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
    const load = f => new Promise((ok, ng) => { const s = document.createElement('script'); s.src = base + f; s.onload = ok; s.onerror = ng; document.head.appendChild(s); });
    let fns, db, rt, auth, reconnectCb = null;
    return {
      async init() {
        await load('firebase-app-compat.js');
        await Promise.all(['firebase-auth-compat.js', 'firebase-firestore-compat.js', 'firebase-functions-compat.js', 'firebase-database-compat.js'].concat(cfg.appCheckKey ? ['firebase-app-check-compat.js'] : []).map(load));
        firebase.initializeApp(cfg);
        if (cfg.appCheckKey) firebase.appCheck().activate(new firebase.appCheck.ReCaptchaV3Provider(cfg.appCheckKey), true);
        auth = firebase.auth(); db = firebase.firestore(); rt = firebase.database(); fns = firebase.app().functions('asia-northeast1');
        const user = await new Promise((ok, ng) => { const un = auth.onAuthStateChanged(u => { if (u) { un(); ok(u); } }); if (!auth.currentUser) auth.signInAnonymously().catch(ng); });
        const me = user.uid;
        // つながっているかを知らせる（切れたら自動で offline になる）
        let was = null;
        rt.ref('.info/connected').on('value', s => {
          if (!s.val()) { was = false; return; }
          const st = rt.ref('status/' + me), on = rt.ref('online/' + me);
          st.onDisconnect().set({ state: 'offline', at: firebase.database.ServerValue.TIMESTAMP })
            .then(() => st.set({ state: 'online', at: firebase.database.ServerValue.TIMESTAMP }));
          on.onDisconnect().remove().then(() => on.set(firebase.database.ServerValue.TIMESTAMP));
          if (was === false && reconnectCb) reconnectCb();
          was = true;
        });
        return me;
      },
      onReconnect(cb) { reconnectCb = cb; },
      call(name, data) { return fns.httpsCallable(name)(data).then(r => r.data); },
      watchMatch(id, cb, err) { return db.collection('battleMatches').doc(id).onSnapshot(d => cb(d.data()), err || (() => {})); },
      watchTicket(cb) { return db.collection('battleTickets').doc(auth.currentUser.uid).onSnapshot(d => cb(d.exists ? d.data() : null), () => {}); },
      watchStatus(u, cb) { const r = rt.ref('status/' + u), f = r.on('value', s => cb(s.val())); return () => r.off('value', f); },
      async onlineCount() { const s = await rt.ref('online').once('value'); return s.numChildren(); },
      async ranking(myRating) {
        const col = db.collection('battlePlayers');
        const top = (await col.orderBy('rating', 'desc').limit(50).get()).docs.map(d => Object.assign({ uid: d.id }, d.data())).filter(p => (p.games || 0) > 0);
        let myPos = null;
        if (myRating != null) { try { const c = await col.where('rating', '>', myRating).count().get(); myPos = c.data().count + 1; } catch (e) { const i = top.findIndex(p => p.uid === auth.currentUser.uid); myPos = i >= 0 ? i + 1 : null; } }
        return { top, myPos };
      }
    };
  }

  boot();
})();
