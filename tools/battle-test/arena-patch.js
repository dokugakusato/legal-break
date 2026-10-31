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
// 8) 技の段階：同時に当てたキーワードの数で、中技・大技・超ウルトラ技（キャラごとに違う）
rep("const kind=dmg>=20?'super':dmg>=10?'sp':'a'+(1+Math.floor(Math.random()*2));", "const kind=good.length>=4?'ultra':good.length===3?'big':good.length===2?'mid':'a'+(1+Math.floor(Math.random()*2));");
rep("$('#atkBtn').textContent=n>=2?'まとめて攻撃！（必殺技のチャンス）':'攻撃！'", "$('#atkBtn').textContent=n>=4?'超ウルトラ技 発動！！':n===3?'大技 発動！':n===2?'中技 発動！':'攻撃！';$('#atkBtn').classList.toggle('ultraBtn',n>=4)");
rep("async function cutin(side,me){", "async function cutin(side,me,lab,nm,vk){");
rep("<small>${me.name}の必殺技</small>${me.sp}！</div></div>`;\n  await cv(me,'sp');", "<small>${me.name}の${lab||'必殺技'}</small>${nm||me.sp}！</div></div>`;\n  await cv(me,vk||'sp');");
rep("  }else{\n    if(kind==='super'){", `  }else if(kind==='mid'){
    const M=(window.MV||{})[me.id]||[];pop('中技！ '+(M[0]||''));cv(me,'mid');sfx('riser');
    const mv=me.spMove==='rush'?'rush':'dash';mf.classList.remove('lunge','dash','rush');void mf.offsetWidth;mf.classList.add(mv);
    for(let i=0;i<2;i++){await sleep(220);hitFx(dmg)}
  }else if(kind==='ultra'){
    await ultraFx(side,me,hitFx);
  }else{
    if(kind==='big'){BGM.bus&&(BGM.bus.gain.value=.15);await cutin(side,me,'大技',((window.MV||{})[me.id]||[])[1]);BGM.bus&&(BGM.bus.gain.value=.5);const mv=me.spMove;mf.classList.remove('upper','spin','rush','lunge','dash');void mf.offsetWidth;mf.classList.add(mv);for(let i=0;i<3;i++){await sleep(mv==='rush'?150:240);hitFx(dmg)}}
    else if(kind==='super'){`);
// big のときは下の「必殺技」部分をとばす
rep("    BGM.bus&&(BGM.bus.gain.value=.15);await cutin(side,me);BGM.bus&&(BGM.bus.gain.value=.5);\n    const mv=me.spMove;mf.classList.remove('upper','spin','rush','lunge','dash');void mf.offsetWidth;mf.classList.add(mv);\n    for(let i=0;i<(mv==='rush'?5:2);i++){await sleep(mv==='rush'?150:260);hitFx(dmg)}",
  "    if(kind!=='big'){BGM.bus&&(BGM.bus.gain.value=.15);await cutin(side,me);BGM.bus&&(BGM.bus.gain.value=.5);\n    const mv=me.spMove;mf.classList.remove('upper','spin','rush','lunge','dash');void mf.offsetWidth;mf.classList.add(mv);\n    for(let i=0;i<(mv==='rush'?5:2);i++){await sleep(mv==='rush'?150:260);hitFx(dmg)}}");
// 超ウルトラ技：画面ぜんぶを使うド派手な演出
rep("async function cutin(side,me,lab,nm,vk){", `window.MV=${J(AC.MOVES)};
async function ultraFx(side,me,hitFx){
  const ar=$('#arena'),mf=$('#F'+side),ff=$('#F'+(3-side)),M=(window.MV||{})[me.id]||['','',me.sp];
  BGM.bus&&(BGM.bus.gain.value=.1);
  const ov=document.createElement('div');ov.className='ultra'+(side===2?' p2':'');
  ov.innerHTML='<i class="b1"></i><i class="b2"></i><i class="b3"></i><div class="ufig">'+fig(me.id)+'</div><div class="ut"><small>'+me.name+'の</small><em>超ウルトラ技</em><b>'+M[2]+'</b></div>';
  document.body.appendChild(ov);document.body.classList.add('quake');sfx('riser');sfx('gong');flash();
  await cv(me,'ultra');await sleep(350);ov.classList.add('out');setTimeout(()=>ov.remove(),600);
  mf.classList.remove('idle','upper','spin','rush','lunge','dash');void mf.offsetWidth;mf.classList.add('rush');
  for(let i=0;i<10;i++){await sleep(90);hitFx(3)}
  mf.classList.remove('rush');void mf.offsetWidth;mf.classList.add(me.spMove);await sleep(260);
  const r=ff.getBoundingClientRect(),a=ar.getBoundingClientRect();
  for(let j=0;j<3;j++){const bm=document.createElement('div');bm.className='boom';bm.style.left=(r.left-a.left+r.width*(.3+.2*j))+'px';bm.style.top=(r.top-a.top+r.height*(.25+.15*j))+'px';bm.style.transform='scale('+(1.4+j*.4)+')';ar.appendChild(bm);setTimeout(()=>bm.remove(),900);flash();shake();sfx('big');await sleep(170)}
  const tx=document.createElement('div');tx.className='kiai boomtx ubig';tx.textContent='ドッカーーン！！';tx.style.left='8%';tx.style.top='26%';ar.appendChild(tx);setTimeout(()=>tx.remove(),1300);
  document.body.classList.remove('quake');BGM.bus&&(BGM.bus.gain.value=.5);
}
async function cutin(side,me,lab,nm,vk){`);
rep('</style>', `
.ultra{position:fixed;inset:0;z-index:80;pointer-events:none;overflow:hidden;background:radial-gradient(circle at 50% 45%,rgba(255,230,120,.25),rgba(60,0,90,.92) 70%);animation:uIn .25s ease-out}
.ultra.out{animation:uOut .5s forwards}
@keyframes uIn{0%{background-color:#fff;opacity:0}100%{opacity:1}}@keyframes uOut{to{opacity:0;transform:scale(1.15)}}
.ultra i{position:absolute;top:-10%;width:10%;height:75%;background:linear-gradient(#fff,#fff36a 40%,transparent);clip-path:polygon(55% 0,20% 48%,48% 48%,25% 100%,80% 40%,52% 40%,75% 0);filter:drop-shadow(0 0 14px #ffe000) drop-shadow(0 0 30px #c040ff);opacity:0;animation:bolt .45s steps(2) infinite}
.ultra .b1{left:6%}.ultra .b2{left:46%;animation-delay:.15s}.ultra .b3{left:82%;animation-delay:.3s}
@keyframes bolt{0%,100%{opacity:0}50%{opacity:1}}
.ultra .ufig{position:absolute;bottom:-4%;left:50%;width:62%;transform:translateX(-50%);opacity:.9;filter:drop-shadow(0 0 24px #ffb000);animation:uFig 1.4s ease-out}
.ultra .ufig svg{width:100%;height:auto}
@keyframes uFig{0%{transform:translateX(-50%) scale(.4);opacity:0}30%{transform:translateX(-50%) scale(1.1);opacity:1}100%{transform:translateX(-50%) scale(1)}}
.ultra .ut{position:absolute;left:0;right:0;top:16%;text-align:center;padding:0 10px}
.ultra .ut small{display:block;color:#fff;font-weight:900;font-size:15px;text-shadow:0 2px 0 #000}
.ultra .ut em{display:block;font-style:normal;font-family:var(--display);color:#ffe55a;font-size:26px;-webkit-text-stroke:1.5px #6a1a08;text-shadow:0 0 18px #ff8a00;animation:uTx .5s cubic-bezier(.2,1.6,.4,1)}
.ultra .ut b{display:block;font-family:var(--display);font-weight:400;color:#fff;font-size:clamp(26px,8.6vw,46px);line-height:1.2;-webkit-text-stroke:2px #8a0a0a;text-shadow:0 4px 0 #000,0 0 26px #ffb000,0 0 50px #c040ff;animation:uTx .6s .15s cubic-bezier(.2,1.6,.4,1) both}
@keyframes uTx{0%{transform:scale(3);opacity:0}100%{transform:none;opacity:1}}
body.quake .screen{animation:quake .1s linear infinite}
@keyframes quake{0%{transform:translate(0,0)}25%{transform:translate(-8px,5px)}50%{transform:translate(7px,-6px)}75%{transform:translate(-5px,-4px)}}
.kiai.ubig{font-size:40px}
#atkBtn.ultraBtn{background:linear-gradient(#b84aff,#3a0a8a 60%,#ff3a1a);box-shadow:0 0 18px #ffb000;animation:goP .5s infinite}
@keyframes goP{50%{transform:scale(1.04)}}
</style>`);
// 9) 試作の表示
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
