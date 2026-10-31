/* ONLINE BATTLE の音楽（オリジナル曲。ブラウザの中でその場で鳴らすので、音楽ファイルは不要）
   title … タイトル：力強いファンファーレ
   wait  … 相手待ち：鼓動のような緊張感
   battle… 対戦：速いベースと太鼓、途中から主旋律（HPが少なくなるとテンポが上がる）
   jingle('win'|'lose'|'found') … 短い効果曲 */
(function () {
  'use strict';
  const M = { ctx: null, master: null, on: true, cur: null, song: null, step: 0, next: 0, timer: null, tempoMul: 1, bus: null };
  try { M.on = localStorage.getItem('lbBattleMusic') !== '0'; } catch (e) {}
  const f = n => 440 * Math.pow(2, (n - 69) / 12);
  const _ = null;

  // ---------- 音色 ----------
  function env(g, t, a, peak, d, sus, rel, len) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * sus), t + a + d);
    g.gain.setValueAtTime(Math.max(0.0001, peak * sus), t + len);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + rel);
  }
  function osc(type, freq, t, len, vol, opt) {
    const c = M.ctx, o = c.createOscillator(), g = c.createGain(); opt = opt || {};
    o.type = type; o.frequency.setValueAtTime(freq, t); if (opt.detune) o.detune.value = opt.detune;
    let node = o;
    if (opt.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(opt.lp, t); if (opt.lpEnd) fl.frequency.exponentialRampToValueAtTime(opt.lpEnd, t + len); fl.Q.value = opt.q || 1; o.connect(fl); node = fl; }
    node.connect(g); g.connect(M.bus);
    env(g, t, opt.a || 0.005, vol, opt.d || 0.08, opt.s == null ? 0.6 : opt.s, opt.r || 0.06, len);
    o.start(t); o.stop(t + len + (opt.r || 0.06) + 0.05);
  }
  let NB = null;
  function noiseBuf() { if (NB) return NB; const c = M.ctx, n = c.sampleRate; NB = c.createBuffer(1, n, c.sampleRate); const d = NB.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return NB; }
  function noise(t, len, vol, hp, bp) {
    const c = M.ctx, s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter();
    s.buffer = noiseBuf(); fl.type = bp ? 'bandpass' : 'highpass'; fl.frequency.value = hp; s.connect(fl).connect(g).connect(M.bus);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len); s.start(t); s.stop(t + len + 0.02);
  }
  const INS = {
    kick(t, v) { const c = M.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(0.9 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28); o.connect(g).connect(M.bus); o.start(t); o.stop(t + 0.3); },
    snare(t, v) { noise(t, 0.16, 0.45 * v, 1800); osc('triangle', 190, t, 0.05, 0.25 * v, { s: 0.2, r: 0.05 }); },
    hat(t, v) { noise(t, 0.04, 0.16 * v, 7000); },
    ohat(t, v) { noise(t, 0.18, 0.12 * v, 6000); },
    taiko(t, v) { const c = M.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.35); g.gain.setValueAtTime(0.8 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); o.connect(g).connect(M.bus); o.start(t); o.stop(t + 0.65); noise(t, 0.08, 0.2 * v, 400, true); },
    bass(t, n, len, v) { osc('sawtooth', f(n), t, len, 0.22 * v, { lp: 900, lpEnd: 260, q: 6, s: 0.5 }); osc('square', f(n - 12), t, len, 0.1 * v, { lp: 400, s: 0.6 }); },
    lead(t, n, len, v) { osc('square', f(n), t, len, 0.075 * v, { a: 0.01, s: 0.75, r: 0.08, lp: 3200 }); osc('sawtooth', f(n), t, len, 0.05 * v, { detune: 9, a: 0.01, s: 0.7, r: 0.08, lp: 2600 }); },
    brass(t, n, len, v) { osc('sawtooth', f(n), t, len, 0.07 * v, { a: 0.04, s: 0.8, r: 0.15, lp: 600, lpEnd: 2400, q: 2 }); osc('sawtooth', f(n), t, len, 0.05 * v, { detune: -8, a: 0.04, s: 0.8, r: 0.15, lp: 2000 }); },
    pad(t, n, len, v) { osc('triangle', f(n), t, len, 0.05 * v, { a: 0.3, d: 0.3, s: 0.8, r: 0.5 }); },
    blip(t, n, len, v) { osc('sine', f(n), t, 0.05, 0.08 * v, { s: 0.2, r: 0.1 }); }
  };

  // ---------- 曲（16分音符で1小節16マス） ----------
  // 太鼓のパターン：x＝鳴らす、.＝休み
  const pat = s => s.replace(/\s/g, '').split('').map(c => c === 'x' ? 1 : c === 'o' ? 0.6 : 0);
  // ベース：小節ごとの根音と、16マスの形（数字は根音からの半音、. は休み）
  function bassLine(roots, shape) { const out = []; roots.forEach(r => shape.forEach(s => out.push(s == null ? _ : r + s))); return out; }
  const RIFF = [0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 12, 0, 12];
  const SONGS = {
    battle: {
      bpm: 158, loop: 128,
      kick: pat('x...x...x...x... x...x...x...x.x. x...x...x...x... x...x...x.x.x.x.'.repeat(2)),
      snare: pat('....x.......x... ....x.......x... ....x.......x... ....x.......x.xx'.repeat(2)),
      hat: pat('o.x.o.x.o.x.o.x.'.repeat(8)),
      bass: bassLine([40, 36, 38, 35, 40, 36, 38, 35], RIFF),
      lead: [].concat(Array(64).fill(_),
        [76, _, 79, _, 83, _, 81, 79, 78, _, 76, _, _, _, 74, 76],
        [72, _, 76, _, 79, _, 77, 76, 74, _, 72, _, _, _, 71, 72],
        [74, _, 78, _, 81, _, 79, 78, 76, _, 74, _, 78, _, 81, _],
        [83, _, _, _, 81, _, 79, _, 78, _, 75, _, 78, _, _, _]),
      brass: [].concat([64, _, _, _, _, _, _, _, 64, _, _, 67, _, _, _, _], [60, _, _, _, _, _, _, _, 60, _, _, 64, _, _, _, _], [62, _, _, _, _, _, _, _, 62, _, _, 66, _, _, _, _], [63, _, _, _, _, _, _, _, 66, _, _, _, 71, _, _, _], Array(64).fill(_)),
      leadLen: 1, brassLen: 3
    },
    title: {
      bpm: 120, loop: 64,
      taiko: pat('x.......x.x..... x.......x.x..... x.......x.x..... x...x...x.x.x.x.'),
      snare: pat('................ ............x... ................ ....x...x...xxxx'),
      hat: pat('..x...x...x...x.'.repeat(4)),
      bass: bassLine([45, 41, 43, 40], [0, _, _, _, 0, _, _, 0, 0, _, _, _, 7, _, 12, _]),
      pad: [].concat([57, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], [53, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], [55, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], [52, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]),
      padLen: 15,
      brass: [].concat(
        [69, _, _, _, _, _, 72, _, 76, _, _, _, 74, _, 72, _],
        [77, _, _, _, _, _, 76, _, 74, _, _, _, 72, _, _, _],
        [74, _, _, _, _, _, 76, _, 79, _, _, _, 77, _, 76, _],
        [76, _, _, _, 75, _, _, _, 76, _, _, _, _, _, _, _]),
      brassLen: 2
    },
    wait: {
      bpm: 100, loop: 64,
      kick: pat('x.......x.......'.repeat(4)),
      hat: pat('....x.......x...'.repeat(4)),
      bass: bassLine([38, 38, 34, 33], [0, _, 0, _, _, _, _, _, 0, _, 0, _, _, _, 12, _]),
      pad: [].concat([62, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], [65, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], [58, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], [61, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]),
      padLen: 15,
      blip: [].concat(Array(14).fill(_), [86, _], Array(30).fill(_), [86, _], Array(16).fill(_))
    }
  };
  const JINGLES = {
    found: { bpm: 180, notes: [[0, 76, 1, 'brass'], [1, 79, 1, 'brass'], [2, 83, 3, 'brass']], drums: [[0, 'taiko'], [2, 'taiko']] },
    win: { bpm: 150, notes: [[0, 72, 1, 'brass'], [1, 76, 1, 'brass'], [2, 79, 1, 'brass'], [3, 84, 6, 'brass'], [3, 76, 6, 'pad'], [3, 79, 6, 'pad']], drums: [[0, 'snare'], [1, 'snare'], [2, 'snare'], [3, 'taiko']] },
    lose: { bpm: 90, notes: [[0, 67, 2, 'lead'], [2, 66, 2, 'lead'], [4, 65, 2, 'lead'], [6, 64, 6, 'lead'], [6, 52, 6, 'bass']], drums: [[6, 'taiko']] }
  };

  // ---------- 再生のしくみ ----------
  function ensure(ac) {
    if (M.ctx) return true;
    M.ctx = ac || (function () { try { return new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } })();
    if (!M.ctx) return false;
    M.master = M.ctx.createGain(); M.master.gain.value = M.on ? 0.55 : 0; M.master.connect(M.ctx.destination);
    const comp = M.ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(M.master);
    M.bus = M.ctx.createGain(); M.bus.gain.value = 1; M.bus.connect(comp);
    return true;
  }
  function stepDur() { return 60 / (M.song.bpm * M.tempoMul) / 4; }
  function schedule() {
    if (!M.song || !M.ctx) return;
    const ahead = M.ctx.currentTime + 0.12;
    while (M.next < ahead) {
      const s = M.song, i = M.step % s.loop, t = M.next, d = stepDur();
      if (M.on) {
        ['kick', 'snare', 'hat', 'ohat', 'taiko'].forEach(k => { const v = s[k] && s[k][i % s[k].length]; if (v) INS[k](t, v); });
        if (s.bass) { const n = s.bass[i % s.bass.length]; if (n != null) INS.bass(t, n, d * 0.9, 1); }
        ['lead', 'brass', 'pad', 'blip'].forEach(k => { const arr = s[k]; if (!arr) return; const n = arr[i % arr.length]; if (n != null) INS[k](t, n, d * (s[k + 'Len'] || 1) * 0.95, 1); });
      }
      M.next += d; M.step++;
    }
  }
  function play(name) {
    if (!ensure()) return;
    if (M.cur === name) return;
    M.cur = name; M.song = SONGS[name] || null; M.step = 0; M.tempoMul = 1;
    if (M.ctx.state === 'suspended') M.ctx.resume();
    M.next = M.ctx.currentTime + 0.08;
    if (!M.timer) M.timer = setInterval(schedule, 25);
  }
  function stop() { M.cur = null; M.song = null; }
  function jingle(name) {
    if (!ensure() || !M.on) return; const j = JINGLES[name]; if (!j) return;
    const d = 60 / j.bpm / 2, t0 = M.ctx.currentTime + 0.05;
    j.notes.forEach(([s, n, l, ins]) => INS[ins](t0 + s * d, n, l * d, 1.2));
    (j.drums || []).forEach(([s, k]) => INS[k](t0 + s * d, 1));
  }
  function setTempo(mul) { M.tempoMul = mul; }
  function setOn(on) { M.on = !!on; try { localStorage.setItem('lbBattleMusic', on ? '1' : '0'); } catch (e) {} if (M.master) M.master.gain.setTargetAtTime(on ? 0.55 : 0, M.ctx.currentTime, 0.05); }
  // 画面を裏に回したら止め、戻ったら再開（電池と、iPhoneで音が壊れるのを防ぐ）
  document.addEventListener('visibilitychange', () => { if (!M.ctx) return; if (document.hidden) M.ctx.suspend(); else M.ctx.resume().then(() => { M.next = M.ctx.currentTime + 0.05; }); });
  window.LBMusic = { ensure, play, stop, jingle, setTempo, setOn, isOn: () => M.on, ctx: () => M.ctx, current: () => M.cur };
})();
