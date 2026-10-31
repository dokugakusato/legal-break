/* LEGAL BREAK ONLINE BATTLE（試作）：画面の動き。
   勝ち負けの計算はしない（すべてサーバー）。ここは「押した番号を送る」「届いた状態を描く」だけ。 */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const STAMPS = ['よろしく！', 'ナイス！', '参った！', 'もう1戦！', 'ありがとう！', 'くっ…！'];
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
  async function call(op, data) {
    let t0 = Date.now(), r;
    try { r = await API.call(op, data || {}); }
    catch (e) { if (!/internal|unavailable|deadline/.test(e && e.code || '')) throw e; await new Promise(ok => setTimeout(ok, 1500)); t0 = Date.now(); r = await API.call(op, data || {}); } // サーバーの起き上がり直後の失敗は1回だけやり直す
    syncClock(t0, Date.now(), r && r.now);
    if (r && r.match && MID && r.match.uids && r.match.uids.includes(uid)) applyMatch(r.match); // 通知を待たずに描く（軽くするため）
    return r;
  }

  // ---------- 音（最初のタップで鳴らせるようにする） ----------
  let AC = null;
  let SOUND = true; try { SOUND = localStorage.getItem('lbBattleSound') !== '0'; } catch (e) {}
  function unlock() {
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {}
    if (AC && window.LBMusic) { LBMusic.ensure(AC); LBMusic.setOn(SOUND); if (!LBMusic.current() && !$('#s-home').hidden) LBMusic.play('title'); }
  }
  function music(name) { if (window.LBMusic && AC) { name ? LBMusic.play(name) : LBMusic.stop(); } }
  // 声（ブラウザの読み上げ）。相手のことばは低め、自分は高め
  function speak(text, who) {
    if (!SOUND || !('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = 1.1; u.pitch = who === 'op' ? 0.75 : who === 'waza' ? 0.6 : who === 'nar' ? 0.85 : 1.15; if (who === 'nar') u.rate = 1.15; u.volume = 1;
      const v = speechSynthesis.getVoices().filter(v => /ja/i.test(v.lang)); if (v.length) u.voice = who === 'op' && v[1] ? v[1] : v[0];
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  }
  // 続けて読む（ナレーション → セリフ）
  function speakSeq(list) {
    if (!SOUND || !('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); list.forEach(([text, who]) => { const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.rate = who === 'nar' ? 1.2 : 1.1; u.pitch = who === 'nar' ? 0.85 : who === 'waza' ? 0.65 : 1.15; const v = speechSynthesis.getVoices().filter(v => /ja/i.test(v.lang)); if (v.length) u.voice = v[0]; speechSynthesis.speak(u); }); } catch (e) {}
  }
  function setSound(on) {
    SOUND = on; try { localStorage.setItem('lbBattleSound', on ? '1' : '0'); } catch (e) {}
    $('#soundBtn').textContent = on ? '♪ 音 ON' : '♪ 音 OFF'; $('#soundBtn').classList.toggle('off', !on);
    if (window.LBMusic) LBMusic.setOn(on);
    if (!on) try { speechSynthesis.cancel(); } catch (e) {}
    unlock();
  }
  function tone(f1, f2, dur, type, vol) {
    if (!AC || !SOUND) return; const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
    g.gain.setValueAtTime(vol || .16, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, vol) {
    if (!AC || !SOUND) return; const n = AC.sampleRate * dur, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
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
  function show(id) { document.querySelectorAll('.scr').forEach(s => s.hidden = s.id !== id); document.body.classList.toggle('inbattle', id === 's-battle'); }
  function msg(t) { $('#homeMsg').textContent = t || ''; }

  // ---------- キャラクター ----------
  const FIG = id => (window.FIGHTERS || []).find(f => f.id === id) || window.FIGHTERS[0];
  function myChara() { try { return FIG(localStorage.getItem('lbBattleChara')).id; } catch (e) { return 'sato'; } }
  function drawCharas() {
    const cur = myChara(), box = $('#charas'); if (!box) return;
    box.innerHTML = window.FIGHTERS.map(f => `<button type="button" class="cc${f.id === cur ? ' on' : ''}" data-c="${f.id}"><span class="art">${f.svg}</span><b>${esc(f.name)}</b><small>${esc(f.type)}</small></button>`).join('');
    const F = FIG(cur); $('#charaInfo').innerHTML = `<b>${esc(F.name)}</b>（${esc(F.type)}）　必殺技：<em>${esc(F.waza)}</em>`;
    box.querySelectorAll('.cc').forEach(b => b.onclick = () => {
      unlock(); try { localStorage.setItem('lbBattleChara', b.dataset.c); } catch (e) {}
      const F = FIG(b.dataset.c); drawCharas(); SND.go(); speak(F.line, 'me');
      if (API && uid && player) call('me', { chara: F.id }).catch(() => {});
    });
  }
  // 戦う2人の絵。佐藤は本体と同じボロボロ演出、ほかのキャラは傷の重ね絵
  const EDMG = '<svg class="edmg" viewBox="0 0 100 160" aria-hidden="true"><g class="e1"><ellipse cx="57" cy="44" rx="5" ry="4" fill="#5a2a6a" opacity=".55"/><path d="M34 98l10 6M60 112l9-5M44 128l7 4" stroke="#efe3cf" stroke-width="1.6" fill="none" opacity=".9"/></g><g class="e2"><path d="M45 22c-1.5 7 1 10-1 17c-1 4 2.6 4.4 2.6.4c.5-6-.6-10-1.6-17.4z" fill="#c22d22"/><path d="M26 108l7-10 5 10 5-7 1 12zM60 96l9-4 2 10 6 2-7 8z" fill="#2a1a14" stroke="#efe3cf" stroke-width=".8"/></g><g class="e3"><path d="M32 100l20 18M52 100l-20 18" stroke="#c22d22" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="40" r="4" fill="#3a1a2a" opacity=".8"/><path d="M64 120l6-8 4 8 5-6 2 11z" fill="#2a1a14" stroke="#efe3cf" stroke-width=".8"/></g></svg>';
  function figHTML(id) { const F = FIG(id); return (id === 'sato' ? window.SATO_SVG : F.svg) + window.EMO_SVG + (id === 'sato' ? '' : EDMG); }
  let figsFor = '';
  function drawFigs(me, op) {
    const key = me.chara + '|' + op.chara; if (figsFor === key) return; figsFor = key;
    $('#figMe').className = 'fig me c-' + me.chara + (me.chara === 'sato' ? ' hero' : '');
    $('#figOp').className = 'fig op c-' + op.chara + (op.chara === 'sato' ? ' hero' : '') + (me.chara === op.chara ? ' alt' : '');
    $('#figMe').innerHTML = figHTML(me.chara); $('#figOp').innerHTML = figHTML(op.chara);
  }

  // ---------- ひとこと（大きく出して、声で読む） ----------
  function toast(t, cls) {
    const box = $('#toasts'), d = document.createElement('div'); d.className = 'toast ' + (cls || ''); d.innerHTML = t; box.appendChild(d);
    setTimeout(() => d.classList.add('out'), 2600); setTimeout(() => d.remove(), 3100);
  }
  function showSaying(who, id, mine) {
    const p = M && M.players[who]; const name = mine ? 'あなた' : (p ? p.name : '相手');
    toast(`<span class="who">${esc(name)}</span>「${esc(STAMPS[id] || '')}」${mine ? '<span class="sent">✓ 送った</span>' : ''}`, mine ? 'me' : 'op');
    speak(STAMPS[id] || '', mine ? 'me' : 'op');
    const el = mine ? $('#bubMe') : $('#bubOp');
    el.textContent = STAMPS[id] || ''; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(el._t); el._t = setTimeout(() => el.hidden = true, 2600);
  }

  // ---------- 必殺技（カットイン → 技名を読み上げ → キャラごとの動き） ----------
  function special(byUid, toUid, o) {
    o = o || {};
    const p = M.players[byUid], F = FIG(p.chara), mine = byUid === uid;
    const fBy = mine ? '#figMe' : '#figOp', fTo = toUid === uid ? '#figMe' : '#figOp';
    const ci = $('#cutin'); ci.className = 'cutin ' + (mine ? 'me' : 'op');
    ci.innerHTML = `<div class="band"><span class="art${(!mine && M.players[uid].chara === p.chara) ? ' alt' : ''}">${F.svg}</span><div class="wz"><small>${esc(o.sub || p.name + 'の必殺技')}</small><b>${esc(o.w || F.waza + '！')}</b></div></div>`;
    ci.hidden = false; void ci.offsetWidth; ci.classList.add('go');
    speak(o.say || F.waza, 'waza'); SND.counter();
    setTimeout(() => { ci.hidden = true; ci.classList.remove('go'); anim(fBy, 'sp-' + F.move, 1100); }, 1100);
    setTimeout(() => { anim(fTo, 'hit', 450); anim(fTo, F.move === 'upper' || F.move === 'throw' ? 'launch' : 'blown', 1000); emo(fTo, 'shock', 1400); shake(); SND.hit(); }, 1100 + 380);
  }

  // ---------- 天変地異（全部のキーワードを一撃で） ----------
  function tenpen(byUid, toUid) {
    const mine = byUid === uid, fTo = toUid === uid ? '#figMe' : '#figOp', fBy = mine ? '#figMe' : '#figOp';
    let d = document.getElementById('tenpen');
    if (!d) { d = document.createElement('div'); d.id = 'tenpen'; document.body.appendChild(d); }
    const bolt = x => `<svg class="bolt" style="left:${x}%" viewBox="0 0 40 200"><path d="M24 0 6 92h14L8 200 36 78H21L32 0z"/></svg>`;
    d.className = 'tenpen ' + (mine ? 'me' : 'op');
    d.innerHTML = `${bolt(8)}${bolt(46)}${bolt(80)}<div class="tp-t"><small>${mine ? 'あなた' : esc(M.players[byUid].name)}の完成答案</small><b>天変地異</b><em>全キーワード 一撃！</em></div><div class="rocks"><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
    d.hidden = false; void d.offsetWidth; d.classList.add('go');
    document.body.classList.remove('quake'); void document.body.offsetWidth; document.body.classList.add('quake');
    speak('天変地異！', 'waza'); SND.counter(); setTimeout(() => SND.counter(), 350); setTimeout(() => SND.ko(), 900);
    setTimeout(() => { anim(fBy, 'sp-' + FIG(M.players[byUid].chara).move, 1100); }, 1400);
    setTimeout(() => { anim(fTo, 'hit', 450); anim(fTo, 'launch', 1000); emo(fTo, 'shock', 2000); shake(); SND.hit(); }, 1700);
    setTimeout(() => { d.hidden = true; d.classList.remove('go'); document.body.classList.remove('quake'); }, 2600);
  }

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
    leaveMatch(); show('s-home'); msg(''); music('title'); drawCharas();
    try { const r = await call('me'); if (r.player) { player = r.player; renderMe(); } } catch (e) {}
    refreshOnline();
  }

  // ---------- 相手探し ----------
  let search = null, MODE = 'kj';
  async function find(mode) {
    if (mode === 'kj' || mode === 'choice') MODE = mode;
    unlock(); msg('');
    const name = readName(); if (!name) return;
    saveName(name);
    leaveMatch();
    const my = { id: Math.random() }; search = my;
    show('s-search'); $('#found').hidden = true; $('#cancelBtn').hidden = false; music('wait');
    $('#searchTxt').textContent = '対戦相手を待っています…'; $('#searchLeft').textContent = '';
    let r;
    try { r = await call('find', { name, chara: myChara(), mode: MODE }); }
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
        try { const c = await call('cpu', { since, mode: MODE }); if (search === my) matched(c.matchId, true); }
        catch (e) { if (search === my) { stopSearch(); show('s-home'); msg(errText(e)); } }
      }
    }, 250);
  }
  function stopSearch() { if (!search) return; clearInterval(search.timer); search.unTicket && search.unTicket(); search = null; }
  async function cancel() { stopSearch(); show('s-home'); music('title'); try { await call('cancel', { mode: MODE }); } catch (e) {} }
  function matched(id, viaCpu) {
    stopSearch();
    $('#cancelBtn').hidden = true;
    const f = $('#found'); f.textContent = viaCpu ? '修行相手、参上！' : '見つかった！'; f.hidden = false; SND.found(); if (window.LBMusic) { LBMusic.stop(); LBMusic.jingle('found'); }
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
    figsFor = ''; $('#figMe').innerHTML = ''; $('#figOp').innerHTML = '';
    kjMine = {}; kjSel = []; kjDrawn = false; storyShown = -1; $('#story').hidden = true; $('#kjarea').hidden = true; $('#qarea').hidden = false;
    unM = API.watchMatch(id, m => { if (MID === id && m) applyMatch(m); }, () => {});
    clearInterval(loopTimer); loopTimer = setInterval(loop, 100);
  }
  function leaveMatch() {
    stopSearch();
    unM && unM(); unM = null; unOp && unOp(); unOp = null;
    clearTimeout(tickTimer); clearInterval(loopTimer); MID = null; M = null;
  }
  function tick() { if (MID) call('tick', { matchId: MID }).catch(() => {}); }
  function scheduleTick() {
    clearTimeout(tickTimer); if (!M || M.phase === 'end') return;
    let at = M.until + 250;
    if (M.paused) at = M.paused.since + DISC + 400;
    else if (M.phase === 'q' && M.cpuAt != null) { const cu = M.uids[1]; if (!M.ans[cu]) at = Math.min(at, M.phaseAt + M.cpuAt + 150); }
    tickTimer = setTimeout(() => { tick(); tickTimer = setTimeout(tick, 2500); }, Math.max(50, at - sNow()));
  }

  // 新しい状態だけを描く（通知と返事の両方から届くので、古い方は捨てる）
  function applyMatch(m) { if (M && (m.v || 0) <= (M.v || 0)) return; render(m); }
  function render(m) {
    const prev = M; M = m;
    const me = m.players[uid], op = m.players[opUid()];
    if (!me || !op) return;
    // 上の帯
    $('#hMeName').textContent = me.name; $('#hOpName').textContent = op.name;
    $('#hMeRank').outerHTML = `<b class="rk r${esc(me.rank)}" id="hMeRank">${esc(me.rank)}</b>`;
    $('#hOpRank').outerHTML = `<b class="rk r${esc(op.rank)}" id="hOpRank">${esc(op.rank)}</b>`;
    hpBar('#hMeBar', '#hMeHp', me.hp); hpBar('#hOpBar', '#hOpHp', op.hp);
    drawFigs(me, op);
    hurt('#figMe', me.hp); hurt('#figOp', op.hp);
    if (m.phase === 'vs' && (!prev || prev.phase !== 'vs')) music('battle');
    if (window.LBMusic && m.phase !== 'end') LBMusic.setTempo(Math.min(me.hp, op.hp) <= 300 ? 1.15 : 1);
    if (!unOp && !op.cpu && API.watchStatus) unOp = API.watchStatus(opUid(), st => {
      opOffline = !!(st && st.state === 'offline');
      if (opOffline && M && M.phase !== 'end') { tick(); }
    });

    // 場面ごと
    $('#vs').hidden = m.phase !== 'vs';
    if (m.phase === 'vs' && (!prev || prev.phase !== 'vs')) drawVS(m);
    if (m.mode === 'kj') { $('#qarea').hidden = true; $('#kjarea').hidden = m.phase === 'vs' || m.phase === 'story'; }
    $('#story').hidden = m.phase !== 'story';
    if (m.phase === 'kj') { if (!kjDrawn) { kjDrawn = true; SND.go(); pop('FIGHT!', 'gold'); speak('ファイト！', 'waza'); } drawKJ(m); }
    if (m.phase === 'q' && m.qi !== lastQi) { lastQi = m.qi; drawQuestion(m); }
    if (m.phase === 'q') lockChoices(m);
    events(m);
    if (m.phase !== 'rv') { clearTimeout(rvTimer); $('#review').hidden = true; }
    if (m.phase === 'rv' && (!prev || prev.phase !== 'rv' || prev.qi !== m.qi)) {
      drawReview(m); showAnswerMarks(m);
      // 攻撃の演出と正解の色を少し見せてから、解説を重ねる
      clearTimeout(rvTimer); rvTimer = setTimeout(() => { if (M && M.phase === 'rv') $('#review').hidden = false; }, 1600);
    }
    if (m.phase === 'end' && !endShown) { endShown = true; showAnswerMarks(m); setTimeout(() => drawEnd(m), m.result && m.result.reason === 'ko' ? 3300 : 600); }
    stamps(m);
    const pb = $('#pauseB');
    if (m.paused && m.phase !== 'end') { pb.hidden = false; pb.textContent = m.paused.uid === uid ? '通信が切れました。つなぎ直しています…' : '相手の接続を待っています…（15秒で不戦勝）'; }
    else pb.hidden = true;
    $('#qNo').textContent = m.mode === 'kj' ? (m.phase === 'vs' ? 'VS' : m.phase === 'story' ? '事件' : '記述') : m.phase === 'vs' ? 'VS' : m.sd ? '延長' : `${Math.min(m.qi + 1, m.total)}/${m.total}`;
    scheduleTick();
  }
  function hpBar(bar, num, hp) { const b = $(bar); b.style.width = Math.max(0, hp / 10) + '%'; b.classList.toggle('low', hp <= 300); $(num).textContent = hp; }
  function hurt(sel, hp) { const f = $(sel); f.classList.toggle('hurt1', hp <= 600 && hp > 300); f.classList.toggle('hurt2', hp <= 300); f.classList.toggle('ed1', hp < 1000); f.classList.toggle('ed2', hp <= 600); f.classList.toggle('ed3', hp <= 300); }

  function drawVS(m) {
    const me = m.players[uid], op = m.players[opUid()];
    const card = (p, alt) => { const F = FIG(p.chara); return `<div class="vscard"><span class="art${alt ? ' alt' : ''}">${F.svg}</span><div class="rb r${esc(p.rank)}">${esc(p.rank)}</div><div class="nm">${esc(p.name)}</div><div class="wl">${esc(F.name)}・${esc(F.type)}</div><div class="wl">${p.cpu ? '練習相手' : `${p.w}勝${p.l}敗 ・ レート${p.rating}`}</div></div>`; };
    $('#vs').innerHTML = `<div class="vsrow">${card(me)}<div class="vsx">VS</div>${card(op, me.chara === op.chara)}</div><div class="count" id="count"></div>${m.cpu ? '<p class="cpunote">CPU戦：ランクは変わりません</p>' : ''}${stampBar()}`;
    bindStamps($('#vs'));
  }
  function stampBar() { return `<div class="stamps"><p class="stlab">ひとこと（相手に声で届く）</p>${STAMPS.map((s, i) => `<button type="button" data-st="${i}">${s}</button>`).join('')}</div>`; }
  function bindStamps(root) {
    root.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
      if (!MID) return; const id = +b.dataset.st;
      root.querySelectorAll('[data-st]').forEach(x => x.disabled = true); setTimeout(() => root.querySelectorAll('[data-st]').forEach(x => x.disabled = false), 3000);
      showSaying(uid, id, true); call('stamp', { matchId: MID, id }).then(r => { if (r && r.accepted === false) toast('送れませんでした（問題中は送れません）'); }).catch(() => toast('送れませんでした'));
    });
  }
  function stamps(m) {
    Object.keys(m.stamps || {}).forEach(u => {
      const s = m.stamps[u]; if (stampSeen[u] === s.seq) return; stampSeen[u] = s.seq;
      if (u === uid || sNow() - s.at > 6000) return; // 自分のは押した瞬間に出している
      showSaying(u, s.id, false);
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
    call('answer', { matchId: MID, qi, choice: i }).then(r => {
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
    music(null); if (window.LBMusic) LBMusic.jingle(win || draw ? 'win' : 'lose'); speak(draw ? '引き分け' : win ? 'あなたの勝ち！' : '負けてしまった…', 'me');
    let big = draw ? 'DRAW' : win ? (res.reason === 'ko' ? 'K.O.!' : 'WIN!') : 'LOSE…';
    let sub = draw ? '引き分け' : win ? (res.reason === 'forfeit' ? '相手が戻らなかった（不戦勝）' : res.reason === 'judge' ? '判定勝ち' : m.mode === 'kj' ? (res.fin === 'tenpen' ? '天変地異！ 全キーワード一撃でK.O.！' : res.fin === 'combo' ? '大技で完成答案、K.O.！' : '完成答案でK.O.！') : 'あなたの勝ち') : (res.reason === 'forfeit' ? '接続が切れて不戦敗' : res.reason === 'judge' ? '判定負け' : res.fin === 'self' ? '自爆でK.O.…' : res.fin === 'tenpen' ? '天変地異をくらった…' : 'K.O.された…');
    let rate = '';
    if (m.cpu) rate = '<p class="cpunote">CPU戦なので、ランクは変わりません</p>';
    else if (res.delta && res.delta[uid] != null) {
      const d = res.delta[uid], a = res.after[uid];
      if (win && res.fin === 'tenpen') rate = '<p class="expbonus">天変地異ボーナス：経験値2倍！</p>';
      else if (win && res.fin === 'combo') rate = '<p class="expbonus">大技ボーナス：経験値1.3倍</p>';
      rate += `<p class="rchange">レート ${a.rating - d} → <b class="${d >= 0 ? 'up' : 'dn'}">${a.rating}（${d >= 0 ? '+' : ''}${d}）</b></p><div class="newrank r${esc(a.rank)}">${esc(a.rank)}</div><p class="cpunote">ランク</p>`;
      player = Object.assign({}, player || {}, { rating: a.rating, rank: a.rank });
    }
    let model = '';
    if (m.mode === 'kj' && m.rv) {
      const k = m.kj, my = k.prog[uid], opp = k.prog[opUid()];
      model = `<p class="rchange">答案 あなた <b class="up">${my.pts}点</b> ／ 相手 ${opp.pts}点</p>
        <div class="modelans"><span class="lb">解答例（${esc(k.topic)}）</span>${esc(m.rv.model)}</div>
        <div class="keys">${(m.rv.keys || []).map(x => `<span>${esc(x)}</span>`).join('')}</div>
        <p class="modelexp">${esc(m.rv.exp)}</p>${m.rv.note ? `<p class="cpunote">出典：行政書士独学応援チャンネルのノート（${esc(m.rv.note)}）</p>` : ''}`;
    }
    $('#endL').innerHTML = `<div class="ko ${win || draw ? '' : 'lose'}">${big}</div><p class="endsub">${esc(sub)}</p>${rate}${model}${stampBar()}
      <button class="btn" type="button" id="againBtn">もう一度さがす</button><button class="btn ghost" type="button" id="menuBtn">メニューへ</button>`;
    $('#endL').hidden = false; $('#review').hidden = true;
    bindStamps($('#endL'));
    $('#againBtn').onclick = () => { leaveMatch(); find(MODE); };
    $('#menuBtn').onclick = goHome;
  }

  // 攻撃・ミスなどの演出
  function events(m) {
    (m.ev.list || []).forEach((e, i) => {
      const key = m.qi + ':' + i; if (seen[key]) return; seen[key] = 1;
      if (sNow() - (m.phaseAt + e.at) > 8000 && m.phase !== 'q') return; // 古いものは演出しない
      const mine = e.by === uid, fBy = mine ? '#figMe' : '#figOp', fTo = e.to === uid ? '#figMe' : '#figOp';
      if (e.t === 'kjfin' && e.kind === 'tenpen') { pop('天変地異！！', 'gold'); tenpen(e.by, e.to); setTimeout(() => dmgNum(e.to === uid ? 'me' : 'op', e.dmg), 1800); return; }
      if (e.t === 'kjfin') e.t = 'hit';
      if (e.t === 'kjhit' && e.kind === 'combo') { pop(mine ? `大技！ ${e.k}連 +${e.pts}点` : `相手の大技 ${e.k}連`, 'gold');
        special(e.by, e.to, { sub: '大技', w: `${e.k}連コンボ！`, say: `${e.k}連コンボ！` }); setTimeout(() => dmgNum(e.to === uid ? 'me' : 'op', e.dmg), 1500); return; }
      if (e.t === 'kjhit') { SND.hit(); pop(mine ? `キーワード！ +${e.pts}点` : `相手 +${e.pts}点`, mine ? 'gold small' : 'small');
        anim(fBy, 'lunge', 260); setTimeout(() => { anim(fTo, 'hit', 450); anim(fTo, 'knock', 500); emo(fTo, 'shock', 900); shake(); dmgNum(e.to === uid ? 'me' : 'op', e.dmg); }, 180); return; }
      if (e.t === 'kjmiss') { SND.miss(); SND.hit(); pop(mine ? `自爆！ 間違いが混じってた` : '相手が自爆！', mine ? '' : 'gold small'); anim(fTo, 'hit', 450); anim(fTo, 'knock', 500); emo(fTo, 'sad', 1200); shake(); dmgNum(e.to === uid ? 'me' : 'op', e.dmg); return; }
      if (e.t === 'hit' || e.t === 'counter') {
        const finish = m.phase === 'end' && m.players[e.to].hp <= 0;
        if (e.t === 'counter' || finish) {
          pop(e.t === 'counter' ? 'COUNTER!' : m.mode === 'kj' ? (e.kind === 'combo' ? `大技${e.k}連で完成答案！` : '20点！完成答案！') : 'とどめ！', 'gold'); special(e.by, e.to);
          setTimeout(() => dmgNum(e.to === uid ? 'me' : 'op', e.dmg), 1500);
          if (finish) setTimeout(() => SND.ko(), 1600);
        } else {
          SND.hit();
          anim(fBy, 'lunge', 260); setTimeout(() => { anim(fTo, 'hit', 450); anim(fTo, 'knock', 500); emo(fTo, 'shock', 1000); emo(fBy, 'angry', 900); shake(); dmgNum(e.to === uid ? 'me' : 'op', e.dmg); }, 180);
        }
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

  // ---------- 記述バトル ----------
  let kjMine = {}, kjDrawn = false, storyShown = -1, kjBusy = false, kjLockTo = 0, kjSel = [];
  // 紙芝居：ストーリーモードの4コマと同じ見た目（登場人物・吹き出し・背景・小道具）
  function komaFig(t) { const S = window.KOMA_SIL || {}; return S[t] || S.hero || ''; }
  function komaProp([k, pos]) { const P = (window.KOMA_PROPS || {})[k]; if (!P) return ''; return `<div class="prop ${pos}" style="--s:${P.s};aspect-ratio:${P.vb[0]}/${P.vb[1]}"><svg viewBox="0 0 ${P.vb[0]} ${P.vb[1]}" aria-hidden="true">${P.svg}</svg></div>`; }
  function komaHTML(p, i, n) {
    const N = window.KOMA_NAMES || {};
    const spf = p.say ? (p.figs.find(f => f[1] === p.say.side) || p.figs[0]) : null, sp = spf ? spf[0] : null;
    const emo = p.say ? (p.say.emo || (p.say.evil ? 'evil' : /！/.test(p.say.text) ? 'angry' : /…/.test(p.say.text) ? 'sad' : '')) : '';
    const figs = p.figs.map(([t, pos, nm]) => { const e = t === sp ? emo : (p.react || ''); return `<div class="fig ${pos} ${t}${e ? ' emo-' + e : ''}">${komaFig(t)}${window.EMO_SVG}<span class="ntag">${esc(nm || N[t] || '')}</span></div>`; }).join('');
    const say = p.say ? `<div class="say ${p.say.side}${p.say.evil ? ' evil' : ''}"><b class="who">${esc((spf && spf[2]) || N[sp] || '')}</b>${esc(p.say.text)}</div>` : '';
    return `<div class="kw"><div class="cap">${esc(p.nar)}</div><div class="panel ${p.bg ? 'bg-' + p.bg : ''}${p.lines ? ' lines' : ''}${p.say ? ' talk' : ''}"><div class="tone"></div>${(p.props || []).map(komaProp).join('')}${figs}${say}<span class="pno">${i + 1}</span></div></div>`;
  }
  function storyOf(k) { if (k.story) return k.story; try { return k._st || (k._st = JSON.parse(k.storyJson)); } catch (e) { return []; } }
  function drawStory(m, i) {
    const k = m.kj, st = storyOf(k), p = st[i]; if (!p) return;
    $('#story').innerHTML = `<p class="topic">${esc(k.field)}｜${esc(k.topic)}</p>
      <div class="komaroot"><div class="koma">${p.figs ? komaHTML(p, i, st.length) : `<div class="kami"><p class="nar">${esc(p.nar || p.say || '')}</p></div>`}</div></div>
      <div class="dots">${st.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>
      <p class="soon">${i + 1 >= st.length ? 'まもなく FIGHT！ 答案づくり開始' : ''}</p>`;
    speakSeq([[p.nar, 'nar'], p.say ? [typeof p.say === 'string' ? p.say : p.say.text, (p.figs && p.figs.find(f => f[1] === p.say.side) || [])[0] === 'hero' ? 'waza' : 'me'] : null].filter(Boolean));
  }
  function drawKJ(m) {
    const k = m.kj, pg = k.prog[uid], op = k.prog[opUid()], got = String(pg.got || '');
    // 当てたキーワード（空欄の番号→札の文字）。読み込み直したときは（済）
    for (const ch of got) if (!(ch in kjMine)) kjMine[ch] = kjBusy ? '…' : '（済）';
    $('#kjMeta').textContent = `${k.field}｜${k.topic}`;
    $('#kjQ').textContent = k.q;
    const hits = got.split('').map(i => `<span class="kw-hit">${esc(kjMine[i])}<i>+${k.pts[i]}</i></span>`).join('');
    $('#kjAns').innerHTML = `<span class="kjlab">答案のキーワード（${pg.n}/${k.n}）</span>${hits || '<span class="kjempty">札を選んで攻撃発動！ つなげるほど大技、全部一発で天変地異</span>'}`;
    $('#kjMyPts').textContent = pg.pts; $('#kjOpPts').textContent = `${op.pts}`;
    const left = k.labels.map((l, i) => got.includes(String(i)) ? '' : `<b>${esc(l)}</b><i class="pt">${k.pts[i]}点</i>`).filter(Boolean);
    $('#kjHint').innerHTML = left.length ? `残りのキーワード：${left.join('・')}` : '20点！';
    const box = $('#chips');
    if (box.dataset.for !== MID) {
      box.dataset.for = MID; kjSel = [];
      box.innerHTML = k.chips.map((c, i) => `<button type="button" class="chip" data-c="${i}">${esc(c)}</button>`).join('');
      box.querySelectorAll('.chip').forEach(b => b.onclick = () => pickChip(+b.dataset.c));
      $('#kjGo').onclick = fireKJ; $('#kjClr').onclick = () => { kjSel = []; drawSel(); };
    }
    const used = Object.values(kjMine);
    box.querySelectorAll('.chip').forEach(b => { const u = used.includes(b.textContent); b.classList.toggle('used', u); b.disabled = u; if (u) kjSel = kjSel.filter(x => x !== +b.dataset.c); });
    if (pg.lock > sNow()) lockChips(pg.lock);
    drawSel();
    fitKJ();
  }
  // 選んだ札と「攻撃発動」ボタン（何枚つなげたかで技の名前が変わる）
  function moveName(n) {
    const pg = M && M.kj.prog[uid]; if (!n) return '';
    if (pg && pg.n === 0 && n === M.kj.n && n >= 2) return '天変地異';
    return n >= 2 ? `大技 ${n}連` : '単発攻撃';
  }
  function drawSel() {
    const box = $('#chips'), n = kjSel.length;
    box.querySelectorAll('.chip').forEach(b => { const i = kjSel.indexOf(+b.dataset.c); b.classList.toggle('sel', i >= 0); b.dataset.no = i >= 0 ? i + 1 : ''; });
    const nm = moveName(n), go = $('#kjGo');
    $('#kjSel').innerHTML = n ? `${n}枚選択 → <b class="${nm === '天変地異' ? 'tp' : ''}">${nm}</b>` : '札を選んで「攻撃発動」';
    go.disabled = !n || kjBusy; go.textContent = nm === '天変地異' ? '天変地異 発動！！' : n >= 2 ? '大技 発動！' : '攻撃発動！';
    go.classList.toggle('big', n >= 2); go.classList.toggle('tp', nm === '天変地異');
    $('#kjClr').hidden = !n;
  }
  function pickChip(i) {
    if (!M || M.phase !== 'kj' || kjBusy) return;
    unlock(); SND.tick();
    kjSel = kjSel.includes(i) ? kjSel.filter(x => x !== i) : kjSel.concat([i]);
    drawSel();
  }
  function fireKJ() {
    if (!M || M.mode !== 'kj' || M.phase !== 'kj' || kjBusy || M.paused || !kjSel.length) return;
    if (sNow() < kjLockTo) { toast('まだ動けない！'); return; }
    unlock(); kjBusy = true;
    const pick = kjSel.slice(), texts = pick.map(i => M.kj.chips[i]), box = $('#chips');
    pick.forEach(i => box.querySelector(`[data-c="${i}"]`).classList.add('mine'));
    drawSel();
    call('kj', { matchId: MID, chips: pick }).then(r => {
      kjBusy = false; box.querySelectorAll('.chip').forEach(b => b.classList.remove('mine'));
      if (r && r.accepted && r.ok) { (r.slots || []).forEach((sl, j) => kjMine[sl] = texts[j]); kjSel = []; if (M) drawKJ(M); }
      else if (r && r.accepted && !r.ok) {
        pick.forEach(i => { const b = box.querySelector(`[data-c="${i}"]`); b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 700); });
        kjSel = []; lockChips(sNow() + 2000); toast(`自爆！ 答案に入らない札が混じってた（-${r.dmg || ''}）2秒動けない`, 'op'); drawSel();
      } else drawSel();
    }).catch(() => { kjBusy = false; box.querySelectorAll('.chip').forEach(b => b.classList.remove('mine')); drawSel(); });
  }
  // 答案と札がスクロールなしで収まるまで、文字を小さくする
  function fitKJ() {
    const a = $('#kjarea'), sc = $('#s-battle'); let k = 1; a.style.setProperty('--kf', 1);
    for (let i = 0; i < 10 && (a.scrollHeight > a.clientHeight + 1 || sc.scrollHeight > sc.clientHeight + 1) && k > 0.72; i++) { k -= 0.03; a.style.setProperty('--kf', k.toFixed(2)); }
  }
  function lockChips(until) {
    kjLockTo = until; const box = $('#chips'); box.classList.add('locked');
    clearTimeout(box._t); box._t = setTimeout(() => { if (sNow() >= kjLockTo) box.classList.remove('locked'); }, Math.max(0, until - sNow()) + 30);
  }
  // 毎0.1秒：残り時間・カウントダウン
  let lastSec = -1;
  function loop() {
    if (!M) return;
    const t = sNow();
    if (M.phase === 'vs') {
      const left = M.until - t, c = $('#count');
      if (c) { const v = left > 3000 ? '' : left > 0 ? String(Math.ceil(left / 1000)) : 'FIGHT!'; if (c.dataset.v !== v) { c.dataset.v = v; c.innerHTML = v ? `<b>${v}</b>` : ''; if (v) SND.tick(); } }
    }
    if (M.phase === 'story') { const i = Math.min(storyOf(M.kj).length - 1, Math.floor((t - M.phaseAt) / 8000)); if (i !== storyShown && i >= 0) { storyShown = i; drawStory(M, i); } }
    const bar = $('#timerBar');
    if (M.phase === 'q') {
      const left = M.paused ? M.until - M.paused.since : M.until - t, tot = QTIME;
      bar.style.transform = `scaleX(${Math.max(0, Math.min(1, left / tot))})`; bar.classList.toggle('hurry', left < 10000);
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
    $('#findBtn').onclick = () => find('choice'); $('#findKjBtn').onclick = () => find('kj'); $('#cancelBtn').onclick = cancel; $('#rankBtn').onclick = ranking;
    $('#soundBtn').onclick = () => setSound(!SOUND); setSound(SOUND);
    drawCharas();
    if ('speechSynthesis' in window) try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; } catch (e) {}
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    renderMe();
    API = window.LB_MOCK_API || (window.LB_BATTLE_FIREBASE ? firebaseAPI(window.LB_BATTLE_FIREBASE) : null);
    if (!API) { $('#findBtn').disabled = true; $('#findKjBtn').disabled = true; msg('準備中です（試験用の設定がまだ入っていません）'); return; }
    $('#findBtn').disabled = true; $('#findKjBtn').disabled = true; msg('接続中…');
    try {
      uid = await API.init();
      API.onReconnect && API.onReconnect(() => { if (M && M.paused && M.phase !== 'end') tick(); });
      $('#findBtn').disabled = false; $('#findKjBtn').disabled = false; msg('');
      const r = await call('me');
      if (r.player) { player = r.player; renderMe(); if (!$('#nameIn').value) $('#nameIn').value = player.name; if (player.chara && !localStorage.getItem('lbBattleChara')) { try { localStorage.setItem('lbBattleChara', player.chara); } catch (e) {} drawCharas(); } }
      refreshOnline();
    } catch (e) { $('#findBtn').disabled = true; $('#findKjBtn').disabled = true; msg(errText(e)); }
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
      call(op, data) { return fns.httpsCallable('battle')(Object.assign({ op }, data)).then(r => r.data); },
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

  window.LBDrawStory = drawStory; // 動作確認用
  boot();
})();
