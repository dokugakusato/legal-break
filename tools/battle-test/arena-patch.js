/* build-arena.sh から呼ぶ。コピーしたオンライン版（battle/lb/online/index.html）に、
   記述バトルの問題（ノートの論点・本試験の過去問）を足す小さな差し込みをする。本番のファイルは変えない。 */
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || 'battle/lb';
const F = path.join(OUT, 'online/index.html');
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('差し込み場所が見つからない（オンライン版が変わった？）: ' + a.slice(0, 60)); s = s.replace(a, b); };
// 1) 追加の問題を読む
rep('<script src="decoys.js"></script>', '<script src="decoys.js"></script>\n<script src="extra-q.js"></script>');
// 2) ストーリーモードの問題を作ったあとに、追加の問題を足す
rep('/* ---------- 声 ---------- */', "{const _bq=buildQuestions;buildQuestions=function(){_bq();(window.OL_EXTRA||[]).forEach(x=>QS.push(x))}}\n/* ---------- 声 ---------- */");
// 3) 紙芝居の見出し（話の番号がない問題は、出典を出す）・コマ数
rep('`記述ファイト｜第${Q.no}話 ${Q.title}`', '`記述ファイト｜${Q.tag||(\'第\'+Q.no+\'話 \'+Q.title)}`');
rep('Q.panels.slice(0,3)', 'Q.panels.slice(0,Q.pn||3)');
// 4) 通常版の index.html はページとして置かず、絵を借りるための文字として読む
rep("fetch('../index.html')", "fetch('../main-index.txt')");
// 5) 声は本番のサイトのファイルをそのまま使う
rep("'../audio/'+h+'.mp3'", "'https://legal-break.5ukaku.com/audio/'+h+'.mp3'");
rep("'audio/'+id+'.mp3'", "'https://legal-break.5ukaku.com/online/audio/'+id+'.mp3'");
// 6) 「通常版へ」は本番のサイトへ
rep('<a href="../"', '<a href="https://legal-break.5ukaku.com/"');
// 7) キャラを増やす（通常版の登場人物の絵を使う）・勝ったときの笑い声
const AC = require(path.resolve('tools/battle-test/arena-chars.js'));
const J = JSON.stringify;
rep('\n];\n\n/* ---------- 通常版のファイルから', '\n];\nCHARS.push(...' + J(AC.NEW.map(c => ({ id: c.id, name: c.name, sp: c.sp, spMove: c.spMove, cap: c.cap }))) + ');\n\n/* ---------- 通常版のファイルから');
const lines = {}; ['a1', 'a2', 'rush', 'lose', 'groan', 'counter'].forEach(k => { lines[k] = {}; AC.NEW.forEach(c => { lines[k][c.id] = c[k]; }); });
lines.laugh = AC.LAUGH;
rep('const ANN={', 'Object.assign(TAUNT,' + J(Object.fromEntries(AC.NEW.map(c => [c.id, c.taunt]))) + ');\n' +
  'Object.assign(WINL,' + J(Object.fromEntries(AC.NEW.map(c => [c.id, c.win]))) + ');\n' +
  'Object.entries(' + J(lines) + ').forEach(([k,v])=>{CHAR_LINES[k]=Object.assign(CHAR_LINES[k]||{},v)});\nconst ANN={');
rep('/^(mina)/.test(id)', '/^(mina|girl|oldwoman|okami)/.test(id)');
// 声：試作で録音した声（arena/audio）を先に探し、なければ本番の声
rep("function olVoice(id){return (window.OL_AUDIO||[]).includes(id)?", "function olVoice(id){if((window.OL_AUDIO2||[]).includes(id))return 'https://cdn.jsdelivr.net/gh/dokugakusato/legal-break@online-battle/arena/audio/'+id+'.mp3';return (window.OL_AUDIO||[]).includes(id)?");
rep('<script src="extra-q.js"></script>', '<script src="extra-q.js"></script>\n<script src="audio-x/index.js" onerror=""></script>');
// やっつけたら、勝った方が笑う（キャラごとの笑い方）。そのあと勝ちゼリフ
rep("await sleep(300);await cv(W,'win');result(winSide===1);", "await sleep(200);{const wf=$('#F'+winSide);const b=document.createElement('div');b.className='kiai';b.style.fontSize='22px';b.style.whiteSpace='normal';b.style.maxWidth='75%';b.textContent=CHAR_LINES.laugh[W.id]||'ワハハハハ！';b.style.top='8%';b.style[winSide===1?'left':'right']='4%';ar.appendChild(b);setTimeout(()=>b.remove(),2600)}\n  await cv(W,'laugh');await sleep(150);await cv(W,'win');result(winSide===1);");
// 8) 試作の表示
s = s.replace('試作版・CPUと練習', '試作版・CPUと練習（全論点）');
fs.writeFileSync(F, s);
// 追加の問題（オンライン版の問題の形に変える）
const conv = (k, i, tag, pn) => {
  const pt = Math.round(20 / k.slots.length);
  const panels = k.story.filter(p => !/^出題/.test(p.nar || '')).slice(0, pn).map(p => Object.assign({}, p));
  return { good: k.slots.map(x => ({ t: x.a, label: x.hint || x.a, pt })), pool: k.wrong.map(w => typeof w === 'string' ? { t: w, why: '' } : { t: w.t, why: w.why || '' }),
    no: 1000 + i, ep: { no: 1000 + i, title: k.topic }, title: k.topic, tag: tag, pn: panels.length, lawName: k.topic, q: k.q,
    keys: [], model: k.model, exp: k.exp, panels, efig: 'boss', narr: 'narr' };
};
const N = require(path.resolve('functions/kijutsu.js')), KK = require(path.resolve('functions/kakomon.js'));
const X = [];
N.forEach(k => X.push(conv(k, X.length, `${k.field}｜${k.topic}`, 4)));
KK.forEach(k => X.push(conv(k, X.length, `${k.field}｜${k.topic}`, 3)));
X.forEach(x => { x.keys = x.good.concat(x.pool).sort(() => Math.random() - .5); });
fs.writeFileSync(path.join(OUT, 'online/extra-q.js'), '/* 自動で作る（tools/battle-test/arena-patch.js）。記述バトルの問題：ノートの論点・本試験の過去問 */\nwindow.OL_EXTRA=' + JSON.stringify(X) + ';\n');
console.log('オンライン版の試作：ストーリーモードの問題＋追加', X.length, '問 →', OUT + '/online/');
