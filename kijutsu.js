/* LEGAL BREAK 記述の章（第9話〜）のエンジン
   1話＝1つの記述論点。流れ：物語 → 論点を見抜く → 要件 → 似た制度との区別（3〜4択・複数選択）
   → 記述ボス（40字前後。ことばを並べる／自分で書く。キーワードで部分点）→ 決め技 → 結果
   話データは episodes/epNNN.js に kijutsu:1 として書く（steps と boss を持つ）。第1話〜第8話の仕組みは変えない。 */

/* ---------- 第9話〜の新しい技（4話ごとに足していく） ---------- */
Object.assign(MOVES,{
 lariat:{kiai:'ラリアットォッ！',k:1.15,hit:'ドガァッ！'},
 dropkick:{kiai:'ドロップキック！',k:1.05,hit:'ズバァン！'}
});
const MOVE9=['lariat','dropkick'];
{const _ok=moveOK;moveOK=k=>MOVE9.includes(k)?!!(CH&&CH.no>=9):_ok(k)}
{const _atk=attack;attack=function(then,style){
  if(style!=='lariat'&&style!=='dropkick')return _atk(then,style);
  const M=MOVES[style];kiai(M.k);const h=$('#stage .fig.l'),st=$('#stage'),e=$('#stage .fig.r');
  const v=document.createElement('div');v.className='kiai';v.textContent=M.kiai;st.appendChild(v);setTimeout(()=>v.remove(),1000);
  h.classList.remove('lunge','kickmove','dkick');void h.offsetWidth;h.classList.add(style==='dropkick'?'dkick':'lunge');
  setTimeout(()=>{const sr=st.getBoundingClientRect(),er=e.getBoundingClientRect(),hr=h.getBoundingClientRect(),fx=er.left-sr.left+er.width*.5,fy=er.top-sr.top+er.height*(style==='lariat'?.22:.45);
    if(style==='lariat'){const a=document.createElement('div');a.className='elbow';a.innerHTML=ELBOW;st.appendChild(a);
      a.animate([{transform:`translate(${hr.right-sr.left-30}px,${hr.top-sr.top+hr.height*.3}px) rotate(20deg) scale(1)`},{transform:`translate(${fx-70}px,${fy-26}px) rotate(-8deg) scale(1.5)`}],{duration:reduce?1:200,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'});setTimeout(()=>a.remove(),460)}
    else{const l=document.createElement('div');l.className='leg';l.innerHTML=LEG+LEG;l.style.width='110px';st.appendChild(l);
      l.animate([{transform:`translate(${hr.right-sr.left-60}px,${hr.top-sr.top+hr.height*.25}px) rotate(-10deg)`},{transform:`translate(${fx-100}px,${fy-20}px) rotate(4deg) scale(1.25)`}],{duration:reduce?1:220,easing:'ease-out',fill:'forwards'});setTimeout(()=>l.remove(),480)}
    setTimeout(()=>{const b=document.createElement('div');b.className='boom';b.style.left=fx+'px';b.style.top=fy+'px';b.innerHTML=BOOM+`<span>${M.hit}</span>`;st.appendChild(b);setTimeout(()=>b.remove(),700);
      e.classList.remove('knock','knockkick','pinned','hit');void e.offsetWidth;e.classList.add(style==='dropkick'?'knockkick':'knock');setTimeout(()=>e.classList.remove('knock','knockkick'),1100);
      st.classList.remove('shake','impact');void st.offsetWidth;st.classList.add('shake','impact');punch(1.4);then()},210);
  },300);
}}

/* ---------- 第9話〜の曲（4話ごとに入れかえる）：砂の都・新章 ---------- */
Object.assign(TR,{
 // 物語：乾いたスライドギターと、ゆったりした足取り（砂漠のブルース）
 k9case:{bpm:88,f(a,o,s,t,d){const bar=s>>3,ch=[[40,47,52],[40,47,52],[45,52,57],[47,54,59]][bar];
  if(s%8===0)I.bass(a,o,ch[0]-12,t,d*3,.13);if(s%8===4)I.bass(a,o,ch[1]-12,t,d*3,.1);if(s%2===0)I.pluck(a,o,ch[(s>>1)%3]+12,t,.035);
  if(s%4===2)I.snare(a,o,t,.04);if(s%8===0)I.kick(a,o,t,.3);
  const m={0:[64,3],3:[67,1],4:[69,4],8:[67,2],10:[64,2],12:[62,4],16:[69,3],19:[71,1],20:[72,2],22:[71,2],24:[69,6]}[s];
  if(m){const x=a.createOscillator();x.type='sawtooth';x.frequency.setValueAtTime(NF(m[0]-1),t);x.frequency.exponentialRampToValueAtTime(NF(m[0]),t+.12);const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=1500;const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+m[1]*d);x.connect(f).connect(g).connect(o);x.start(t);x.stop(t+m[1]*d+.05)}}},
 // 対戦：トレモロの効いたサーフ・ウエスタン
 k9battle:{bpm:168,f(a,o,s,t,d){const r=[40,40,43,38][s>>3];const rf=[r,r+12,r+7,r+12,r+10,r+7,r+5,r+3][s%8];I.twang(a,o,rf+12,t,.05);I.bass(a,o,r,t,d*.85,.15,1);
  if(s%4===0)I.kick(a,o,t,.6);if(s%4===2)I.snare(a,o,t,.22);I.hat(a,o,t,.025);if(s>=28)I.tom(a,o,[120,100,85,70][s-28],t,.45);if(s%16===0)I.organ(a,o,[r+12,r+19,r+24],t,4*d,.02)}},
 // ボス登場：鼓動と鐘、低い合唱
 k9bossin:{bpm:54,f(a,o,s,t,d){if(s%8===0)I.kick(a,o,t,.55);if(s%8===1)I.kick(a,o,t,.3);if(s===0||s===16)I.choir(a,o,[40,47],t,16*d,.04);if(s%16===8)I.bell(a,o,52,t,.06,4);if(s===24)I.taiko(a,o,t,.6)}},
 // ボス戦：荒野のハードロックと金管
 k9boss:{bpm:152,f(a,o,s,t,d){const bar=s>>3,r=[40,40,36,38][bar];I.bass(a,o,[r,r,r+12,r,r+3,r,r+10,r+7][s%8],t,d*.9,.18,1);I.twang(a,o,r+24,t,.03);
  if(s%4===0)I.kick(a,o,t,.65);if(s%4===2)I.snare(a,o,t,.28);if(s%2===1)I.hat(a,o,t,.03);if(s%8===0)I.choir(a,o,[[64,67,71],[64,67,71],[60,64,67],[62,66,69]][bar],t,8*d,.03);
  const m={0:[76,3],3:[79,1],4:[78,4],8:[76,2],10:[74,2],12:[71,4],16:[72,3],19:[74,1],20:[76,4],24:[79,6]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.075);if(s===31)I.whip(a,o,t,.35)}}
});
if(!I.tom)I.tom=(a,o,f,t,v=.5)=>{const x=a.createOscillator();x.frequency.setValueAtTime(f*1.5,t);x.frequency.exponentialRampToValueAtTime(f,t+.08);const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.4);x.connect(g).connect(o);x.start(t);x.stop(t+.42)};

/* ---------- 記述の章の流れ ---------- */
const KJ={};
{const _bp=beginPart;beginPart=function(){const sb=$('#s-battle');if(sb)sb.classList.remove('kj','kjboss');if(CH&&CH.kijutsu)return kjStart();return _bp()}}
{const _np=nextPart;nextPart=function(){if(CH&&CH.kijutsu&&KJ.done&&!KJ.shown){KJ.shown=1;return kjResult(_np)}return _np()}}
function kjStart(){
  Object.assign(KJ,{step:0,miss:{},cards:[],score:0,best:0,tries:0,done:0,shown:0});
  CH.parts=[...CH.steps.map(s=>({topic:s.topic})),{topic:CH.boss.topic,type:'boss'}];S.part=CH.parts.length-1;
  EP={chapter:[`第${CH.no}話 ${CH.title}｜事件`,CH.caseTitle||CH.title],wb:CH.wb};
  BGM.play(CH.bgm);story(EP.chapter,CH.panels,kjBattle,CH.wb);
}
function kjBattle(){
  closeSheet();show('s-battle');$('#s-battle').classList.remove('bossmode','kjboss');$('#s-battle').classList.add('kj');BGM.play(CH.bbgm);S.ehp=100;
  $('#eName').textContent=CH.enemy;$('#stage').innerHTML=stageHTML(CH.efig,CH.enemy,0,CH.efigName);bars();kjAsk(KJ.step);
}
const kjShuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
function kjCardGet(c){
  const st=$('#stage');if(!st||!c)return;const d=document.createElement('div');d.className='kjget';
  d.innerHTML=`<small>ARTICLE GET</small><b>${c.name}</b><span>${c.law||''}</span>`;st.appendChild(d);setTimeout(()=>d.remove(),2400);
  if(!KJ.cards.find(x=>x.name===c.name))KJ.cards.push(c);
}
function kjAsk(i){
  closeSheet();const q=CH.steps[i],n=CH.steps.length,multi=Array.isArray(q.ans),miss=KJ.miss[i]||0;
  const order=miss?kjShuffle(q.opts.map((_,k)=>k)):q.opts.map((_,k)=>k);
  $('#qcard').innerHTML=`<div class="qhead"><span class="qtag">${miss?'再挑戦 ― ':''}STEP ${i+1}/${n} ― ${q.tag}</span>${CH.wb?'<button class="btn ghost mini" type="button" id="wbBtn">関係図</button>':''}</div>
  <p class="qtext">${q.q}${multi?'<small class="kjmulti">（正しいものを すべて 選ぶ）</small>':''}</p>
  <div class="opts">${order.map(k=>`<button class="opt" type="button" data-i="${k}">${q.opts[k]}</button>`).join('')}</div>
  ${multi?'<button class="btn" type="button" id="kjDecide" disabled>これで決める</button>':''}`;
  wbButton(CH.wb);
  const opts=[...$('#qcard').querySelectorAll('.opt')];
  if(multi){const sel=new Set();opts.forEach(b=>b.onclick=()=>{ac();const k=+b.dataset.i;sel.has(k)?sel.delete(k):sel.add(k);b.classList.toggle('picked',sel.has(k));$('#kjDecide').disabled=!sel.size});
    $('#kjDecide').onclick=()=>{const ok=sel.size===q.ans.length&&q.ans.every(k=>sel.has(k));kjJudge(i,ok,[...sel])}}
  else opts.forEach(b=>b.onclick=()=>kjJudge(i,+b.dataset.i===q.ans,[+b.dataset.i]));
}
function kjJudge(i,ok,picked){
  ac();const q=CH.steps[i],n=CH.steps.length,right=Array.isArray(q.ans)?q.ans:[q.ans];
  const opts=[...$('#qcard').querySelectorAll('.opt')];opts.forEach(x=>x.disabled=true);const dc=$('#kjDecide');if(dc)dc.disabled=true;
  rec(q.topic,ok);
  if(!ok){KJ.miss[i]=(KJ.miss[i]||0)+1;picked.forEach(k=>{const b=opts.find(x=>+x.dataset.i===k);if(b&&!right.includes(k))b.classList.add('wrong')});hurt();
    if(S.life<=0){death(()=>{S.life=3;kjBattle()});return}
    const fb=openSheet(950);
    if(KJ.miss[i]===1){
      fb.innerHTML=`<div class="verdict ng">見切られた…（残りの命 ${S.life}）</div><span class="law">ヒント</span><p>${q.hint||'事件の中の言葉をよく読もう。'}</p>`;
      const b=document.createElement('button');b.className='btn';b.type='button';b.textContent='もう一度考える';b.onclick=()=>kjAsk(i);fb.appendChild(b);return}
    opts.forEach(x=>{if(right.includes(+x.dataset.i))x.classList.add('right')});
    if(q.after)setTimeout(()=>say(q.after.map(([t,k])=>[t,k])),600);
    fb.innerHTML=`<div class="verdict ng">正解は、これだ。</div>${kjAfter(q)}<span class="law">${q.law||''}</span><p>${q.exp}</p>${q.card?kjCardHTML(q.card):''}`;
    if(q.card&&!KJ.cards.find(x=>x.name===q.card.name))KJ.cards.push(q.card);
    return kjNextBtn(fb,i,false);
  }
  opts.forEach(x=>{if(right.includes(+x.dataset.i))x.classList.add('right')});
  const last=i===n-1,dmg=last?S.ehp:Math.min(S.ehp-1,Math.round(100/n));
  attack(()=>{damage(dmg,last?'とどめ！':(q.tech||'命中！')+'');kjCardGet(q.card)},randMove());
  const fb=openSheet(last?2400:1700);
  fb.innerHTML=`<div class="verdict ok">${['見抜いた！','命中！','見切った！','決まった！'][i%4]}</div>${kjAfter(q)}<span class="law">${q.law||''}</span><p>${q.exp}</p>${q.card?kjCardHTML(q.card):''}`;
  if(q.after)setTimeout(()=>say(q.after.map(([t,k])=>[t,k])),900);
  kjNextBtn(fb,i,true);
}
// 正解のあとの、短いやりとり（step.after：[[せりふ, 話す人], …]）
function kjAfter(q){return q.after?`<div class="kjafter">${q.after.map(([t,k])=>`<div class="${k==='hero'?'h':''}"><b>${k==='hero'?'佐藤':(NAMES[k]||'')}</b>${t}</div>`).join('')}</div>`:''}
function kjCardHTML(c){return `<div class="kjcard"><small>法律カード</small><b>${c.name}</b><span class="law">${c.law||''}</span><p>${c.text||''}</p></div>`}
function kjNextBtn(fb,i,ok){
  const n=CH.steps.length,last=i===n-1,b=document.createElement('button');b.className='btn';b.type='button';
  if(!ok&&!last){const dmg=Math.min(S.ehp-1,Math.round(100/n));if(dmg>0){S.ehp-=dmg;bars()}}
  if(last){b.textContent=(CH.boss.enemy||'ボス')+'のもとへ';
    setTimeout(()=>{const e=$('#stage .fig.r');if(e){e.classList.remove('knock','knockkick','pinned');e.classList.add('ko')}S.ehp=0;bars();BGM.stop();setTimeout(fanfare,400)},ok?1300:200);
    b.onclick=()=>kjBossIntro()}
  else{b.textContent='次へ';b.onclick=()=>{KJ.step=i+1;kjAsk(i+1);scrollToCard()}}
  fb.appendChild(b);scrollToCard();
}

/* ---------- 記述ボス ---------- */
// ボス戦の前に大きな文字（boss.banner）を出す
function kjBanner(t,then){const d=document.createElement('div');d.className='kjbanner';d.innerHTML=`<span>${t}</span>`;document.body.appendChild(d);
  const a=ac();if(a){I.taiko(a,a.destination,a.currentTime+.02,1);I.bell(a,a.destination,81,a.currentTime+.05,.1)}
  let gone=false;const go=()=>{if(gone)return;gone=true;d.remove();then()};d.onclick=go;setTimeout(go,2200)}
function kjBossIntro(){const B=CH.boss;if(B.banner&&!KJ.bannered){KJ.bannered=1;return kjBanner(B.banner,kjBossIntro)}EP={kjBoss:1,chapter:[`第${CH.no}話 ${CH.title}｜記述ボス戦`,B.enemy],wb:B.wb||CH.wb};
  if(B.panels&&B.panels.length){BGM.play(B.bgm||'k9bossin');story(EP.chapter,B.panels,kjBoss,null,'記述で倒す ▶')}else kjBoss()}
// 書き方の揺れをそろえる（取り消し→取消し など）
const kjNorm=t=>String(t||'').normalize('NFKC').replace(/[\s、。，．,.・「」『』（）()]/g,'')
  .replace(/取り消/g,'取消').replace(/申し立/g,'申立').replace(/引き渡/g,'引渡').replace(/受け取/g,'受取').replace(/差し止/g,'差止').replace(/言い渡/g,'言渡');
function kjScore(text){
  const B=CH.boss,t=kjNorm(text),hits=[],miss=[],ngs=[];let total=0;
  const has=w=>t.includes(kjNorm(w));
  for(const p of B.points){if(p.sense)continue;const ok=(!p.any||p.any.some(has))&&(!p.all||p.all.every(has));(ok?hits:miss).push(p);if(ok)total+=p.pt}
  for(const g of (B.ng||[]))if(g.any.some(has))ngs.push(g);
  const sense=B.points.find(p=>p.sense);
  if(sense){const len=[...t].length,ok=!miss.length&&!ngs.length&&len>=(B.minLen||25)&&len<=(B.maxLen||60);(ok?hits:miss).push(sense);if(ok)total+=sense.pt}
  total=Math.max(0,total-ngs.length*3);return {total,hits,miss,ngs,len:[...t].length,max:B.points.reduce((s,p)=>s+p.pt,0)};
}
function kjBoss(){
  const B=CH.boss;closeSheet();show('s-battle');$('#s-battle').classList.add('bossmode','kj','kjboss');BGM.play(B.bbgm||'k9boss');S.ehp=100;
  $('#eName').textContent=B.enemy;$('#stage').innerHTML=stageHTML(B.efig,B.enemy,1,B.efigName);bars();
  EP=Object.assign({},B,{kjBoss:1,topic:B.topic,efig:B.efig,enemy:B.enemy,efigName:B.efigName,wb:B.wb||CH.wb});
  const tiles=kjShuffle([...B.tiles,...(B.decoys||[])]);let built=[],mode=KJ.mode||'tile';
  $('#qcard').innerHTML=`<div class="qhead"><span class="qtag">記述ボス戦 ― 40字前後で書いて倒せ</span>${EP.wb?'<button class="btn ghost mini" type="button" id="wbBtn">関係図</button>':''}</div>
  <p class="qtext kjq">${B.q}</p>
  <div class="kjtabs"><button type="button" data-m="tile">ことばを並べる</button><button type="button" data-m="free">自分で書く</button><span id="kjLen">0字</span></div>
  <div class="kjans" id="kjAns" aria-live="polite"></div>
  <textarea id="kjFree" class="kjfree" rows="3" maxlength="90" placeholder="ここに答案を書く（40字前後）"></textarea>
  <div class="kjtiles" id="kjTiles">${tiles.map((x,k)=>`<button class="key" type="button" data-k="${k}">${x}</button>`).join('')}</div>
  <div class="kjbtns"><button class="btn ghost" type="button" id="kjBack">1つ戻す</button><button class="btn" type="button" id="kjSubmit">答案を出す</button></div>`;
  wbButton(EP.wb);
  const draw=()=>{const txt=mode==='tile'?built.map(k=>tiles[k]).join(''):$('#kjFree').value;$('#kjAns').textContent=mode==='tile'?(txt||'下のことばを、順番にタップして答案を組み立てる'):'';$('#kjAns').classList.toggle('empty',!txt);
    $('#kjLen').textContent=[...kjNorm(txt)].length+'字';$('#qcard').querySelectorAll('#kjTiles .key').forEach(b=>b.disabled=built.includes(+b.dataset.k));return txt};
  const setMode=m=>{mode=KJ.mode=m;$('#qcard').querySelectorAll('.kjtabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
    $('#kjFree').hidden=m!=='free';$('#kjTiles').hidden=m!=='tile';$('#kjAns').hidden=m!=='tile';$('#kjBack').style.visibility=m==='tile'?'':'hidden';draw()};
  $('#qcard').querySelectorAll('.kjtabs button').forEach(b=>b.onclick=()=>{ac();setMode(b.dataset.m)});
  $('#qcard').querySelectorAll('#kjTiles .key').forEach(b=>b.onclick=()=>{ac();built.push(+b.dataset.k);draw()});
  $('#kjBack').onclick=()=>{built.pop();draw()};$('#kjFree').oninput=draw;
  $('#kjSubmit').onclick=()=>{const txt=draw();if(!kjNorm(txt)){$('#kjLen').textContent='まだ何も書いていない';return}kjSubmit(txt)};
  setMode(mode);
}
function kjSubmit(text){
  ac();const B=CH.boss,r=kjScore(text);KJ.tries++;KJ.best=Math.max(KJ.best,r.total);KJ.last=text;
  rec(B.topic,r.total>=B.pass);
  const pct=r.total/r.max;
  if(r.total>=B.pass){KJ.score=r.total;KJ.text=text;KJ.done=1;$('#kjSubmit').disabled=true;
    attack(()=>damage(S.ehp,'とどめ！'),randMove());
    const fb=openSheet(1400);fb.innerHTML=`<div class="verdict ok">記述 ${r.total}／${r.max}点 ― 撃破！</div>${kjScoreHTML(r)}`;
    const b=document.createElement('button');b.className='btn';b.type='button';b.textContent='決める';b.onclick=()=>{closeSheet();finisher()};fb.appendChild(b);return}
  if(r.total>0)attack(()=>damage(Math.min(S.ehp-5,Math.round(pct*70)),'部分点！'),randMove());
  hurt();if(S.life<=0){death(()=>{S.life=3;kjBoss()});return}
  const fb=openSheet(r.total>0?1500:900);
  fb.innerHTML=`<div class="verdict ng">記述 ${r.total}／${r.max}点 ― まだ倒れない（合格ライン ${B.pass}点）</div>${kjScoreHTML(r,true)}${KJ.tries>=2?`<span class="law">模範解答</span><p class="kjmodel">${kjMark(B.model)}</p>`:''}`;
  const b=document.createElement('button');b.className='btn';b.type='button';b.textContent='答案を書き直す';b.onclick=()=>{closeSheet()};fb.appendChild(b);scrollToCard();
}
function kjScoreHTML(r,hint){
  return `<div class="kjpts">${r.hits.map(p=>`<div class="ok"><b>○ ${p.label}</b><span>+${p.pt}</span></div>`).join('')}${r.miss.map(p=>`<div class="ng"><b>× ${p.label}</b><span>${hint?(p.hint||''):'0'}</span></div>`).join('')}${r.ngs.map(g=>`<div class="ng"><b>減点 −3</b><span>${g.why}</span></div>`).join('')}</div>`;
}
function kjMark(s){let h=s;for(const p of CH.boss.points)for(const w of (p.mark||[]))h=h.split(w).join(`<mark>${w}</mark>`);return h}
// 決め技のあと：今回の結果（正答例・キーワード・条文・理由・まちがえやすい点・覚えること・カード）
function kjResult(done){
  const B=CH.boss,ov=$('#ov');P.kj=P.kj||{};P.kj[CH.no]=Math.max(P.kj[CH.no]||0,KJ.score);saveP();
  ov.hidden=false;ov.className='';ov.style.cssText='overflow-y:auto;align-items:flex-start';
  ov.innerHTML=`<div class="finisher kjres">
   <div class="doka">事件解決</div>
   <div class="card"><span class="qtag">記述の得点</span><div class="kjscore"><b>${KJ.score}</b><small>／${B.points.reduce((s,p)=>s+p.pt,0)}点</small></div><p class="note">あなたの答案：${KJ.text?String(KJ.text).replace(/</g,'&lt;'):''}</p></div>
   <div class="card"><span class="qtag">正答例</span><p class="kjmodel">${kjMark(B.model)}</p>
    <span class="law">点になるキーワード</span><div class="kjpts">${B.points.map(p=>`<div class="ok"><b>${p.label}</b><span>${p.pt}点</span></div>`).join('')}</div>
    <span class="law">条文・判例</span><p>${B.lawRef}</p></div>
   <div class="card"><span class="qtag">なぜ、その答えになるのか</span><p>${B.why}</p></div>
   <div class="card"><span class="qtag">まちがえやすいポイント</span><ul class="kjlist">${B.traps.map(x=>`<li>${x}</li>`).join('')}</ul></div>
   <div class="card"><span class="qtag">この事件で覚えること</span><ol class="kjlist">${B.memo.map(x=>`<li>${x}</li>`).join('')}</ol></div>
   <div class="card"><span class="qtag">手に入れた法律カード（${KJ.cards.length}枚）</span><div class="kjcards">${KJ.cards.map(c=>`<div class="kjcard"><b>${c.name}</b><span class="law">${c.law||''}</span></div>`).join('')}</div></div>
   <button class="btn" type="button" id="kjOk">戦いの記録へ</button></div>`;
  $('#kjOk').onclick=()=>{ov.hidden=true;ov.innerHTML='';ov.style.cssText='';done()};
}
// 雲の記録の合体に、記述の得点も入れる
{const _m=mergeP;mergeP=function(a,b){const o=_m(a,b);o.kj=Object.assign({},b.kj||{},a.kj||{});for(const k in (b.kj||{}))o.kj[k]=Math.max(o.kj[k]||0,b.kj[k]);return o}}

document.body.insertAdjacentHTML('beforeend',`<style>
#s-battle.kj .stage{height:clamp(110px,19vh,160px)!important}
#s-battle.kj .opt{padding:7px 10px;font-size:13.5px;line-height:1.42}
#s-battle.kj .qtext{font-size:14.5px;line-height:1.55;margin:2px 0}
#s-battle.kjboss .stage{height:clamp(62px,10vh,96px)!important}
#s-battle.kjboss .qtag{font-size:10.5px}
#s-battle.kjboss #qcard{gap:6px;padding:10px 12px}
#s-battle.kjboss .kjq{font-size:13px!important;line-height:1.5}
.kjtabs span{flex:none;align-self:center;font-size:12px;color:var(--dust);min-width:3.2em;text-align:right}
.kj #kjDecide{padding:8px;font-size:15px}
.kjbtns{display:grid;grid-template-columns:1fr 2fr;gap:8px}.kjbtns .btn{padding:9px 8px;font-size:15px}
.fig.l.dkick{animation:dkick .8s}
@keyframes dkick{0%{transform:none}35%{transform:translate(90px,-40px) rotate(-70deg)}60%{transform:translate(100px,-20px) rotate(-80deg)}100%{transform:none}}
.kjget{position:absolute;z-index:9;left:50%;top:8px;transform:translateX(-50%);background:linear-gradient(180deg,#2a1a0e,#120c0a);border:2px solid var(--gold);padding:5px 14px;text-align:center;box-shadow:0 0 18px rgba(217,164,65,.6);animation:kjget 2.4s ease-out forwards;pointer-events:none;white-space:nowrap}
.kjget small{display:block;font-size:10px;letter-spacing:.3em;color:var(--gold);font-weight:900}
.kjget b{display:block;font-family:var(--display);font-size:18px;color:var(--bone)}
.kjget span{font-size:11px;color:var(--dust)}
@keyframes kjget{0%{opacity:0;transform:translate(-50%,-10px) scale(1.3)}12%{opacity:1;transform:translate(-50%,0) scale(1)}80%{opacity:1}100%{opacity:0}}
.kjmulti{display:block;font-size:12px;color:var(--gold);font-weight:900;margin-top:2px}
.opt.picked{border-color:var(--gold);background:#3a2410;box-shadow:inset 0 0 0 2px var(--gold)}
.kjcard{border:2px solid var(--gold);background:#1c130c;padding:8px 10px;margin:6px 0}
.kjcard small{display:block;font-size:10px;letter-spacing:.25em;color:var(--gold);font-weight:900}
.kjcard b{font-family:var(--display);font-size:17px}
.kjcard p{margin:4px 0 0;font-size:13px}
.kjcards{display:grid;grid-template-columns:1fr 1fr;gap:6px}.kjcards .kjcard{margin:0}
.kjq{font-size:14px!important}
.kjtabs{display:flex;gap:6px}.kjtabs button{flex:1;background:#1a120e;color:var(--dust);border:1.5px solid var(--dust);font-weight:900;font-size:12.5px;padding:5px}
.kjtabs button.on{color:var(--bone);border-color:var(--gold);background:#3a2410}
.kjans{min-height:2.4em;background:#f4ecdc;color:#120c0a;font-weight:700;font-size:14px;line-height:1.6;padding:6px 10px;border:2px solid var(--bone)}
.kjans.empty{color:#8a7a6a;font-size:12px;font-weight:500}
.kjfree{width:100%;box-sizing:border-box;font-size:16px;line-height:1.5;padding:8px;background:#f4ecdc;color:#120c0a;border:2px solid var(--bone);font-family:inherit}
.kjmeta{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--dust)}
.kjtiles{display:flex;flex-wrap:wrap;gap:5px}
.kjtiles .key{min-height:0;padding:4px 8px;font-size:12px;line-height:1.3;flex:0 1 auto}
.kjtiles .key:disabled{opacity:.25}
.kjpts{display:grid;gap:3px;margin:6px 0}.kjpts>div{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:3px 8px;border-left:4px solid}
.kjpts .ok{border-color:var(--ok);background:rgba(95,174,106,.12)}.kjpts .ng{border-color:var(--blood);background:rgba(194,45,34,.12)}
.kjpts span{color:var(--dust);text-align:right}
.kjmodel{font-weight:900;font-size:15px;line-height:1.7}.kjmodel mark{background:rgba(217,164,65,.35);color:inherit;padding:0 2px}
.kjres{gap:10px}.kjres .card{text-align:left;width:100%}
.kjscore b{font-family:var(--display);font-size:48px;color:var(--gold)}.kjscore small{font-size:16px}
.kjbanner{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.86)}
.kjbanner span{font-family:var(--display);white-space:nowrap;font-size:clamp(28px,9.5vw,54px);color:#fff;border-top:4px solid var(--gold);border-bottom:4px solid var(--gold);padding:8px 16px;text-shadow:0 0 18px #9fd4ff,4px 4px 0 var(--blood);animation:kjBan .5s cubic-bezier(.2,1.5,.4,1) both}
@keyframes kjBan{0%{opacity:0;transform:scale(2.6)}100%{opacity:1;transform:scale(1)}}
.kjafter{display:grid;gap:5px;margin:4px 0 8px}.kjafter>div{background:#fbf6ec;color:#120c0a;border:2px solid #120c0a;border-radius:12px;padding:6px 10px;font-weight:800;font-size:14px;line-height:1.5}
.kjafter>div.h{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold)}.kjafter b{display:block;font-size:10px;color:var(--blood)}
.kjlist{margin:4px 0 0;padding-left:1.3em;font-size:13.5px;line-height:1.6}
</style>`);

/* ---------- 第9話〜の登場人物 ---------- */
Object.assign(SIL,{
// 審査課長・鉄面：表情を変えない役人。鉄のような灰色の顔、大きな「却下」の判
shinsa:mk(`<path d="${B.boss}" fill="#2c3240"/>${SHD(B.boss)}<path d="M36 64L50 108L64 64Z" fill="#e8e2d6"/><path d="M46 68h8l-2 34h-4z" fill="#5a1a1a"/><rect x="62" y="96" width="24" height="18" rx="2" fill="#7a2a1a" transform="rotate(-12 74 105)"/><text x="74" y="109" text-anchor="middle" font-size="9" font-weight="900" fill="#efe3cf" stroke="none" font-family="sans-serif" transform="rotate(-12 74 105)">却下</text>${NECK(46,16)}<path d="M33 22h34v30c0 10-8 16-17 16s-17-6-17-16z" fill="#8a929a"/><path d="M33 22c0-10 8-14 17-14s17 4 17 14z" fill="#2b2b2b"/><path d="M38 36h10M52 36h10" stroke="#1a1a1a" stroke-width="3.2" fill="none"/><circle cx="43" cy="36" r="1.8" fill="#e0402a" stroke="none"/><circle cx="57" cy="36" r="1.8" fill="#e0402a" stroke="none"/><path d="M42 54h16" stroke-width="2.4" fill="none"/><path d="M36 44h3M61 44h3M36 50h3M61 50h3" stroke="#5a6068" fill="none"/>`),
// 大家・馬場：太った強欲な地主。葉巻、金の指輪、羽織
ooya:mk(`<path d="M0 160C0 100 14 66 50 58C86 66 100 100 100 160Z" fill="#3a2a4a"/>${SHD('M0 160C0 100 14 66 50 58C86 66 100 100 100 160Z')}<path d="M30 66L50 160L70 66" fill="#1d1a1c"/><path d="M38 70L50 120L62 70" fill="#efe3cf"/><circle cx="24" cy="128" r="6" fill="${SK}"/><circle cx="76" cy="128" r="6" fill="${SK}"/><circle cx="26" cy="124" r="2.4" fill="#d9a441"/><circle cx="74" cy="124" r="2.4" fill="#d9a441"/>${NECK(46,12)}<ellipse cx="50" cy="38" rx="20" ry="19" fill="${SK}"/><path d="M30 34C30 18 40 14 50 14S70 18 70 34C64 26 58 24 50 24S36 26 30 34Z" fill="#2b2b2b"/><path d="M38 34l8 2M62 34l-8 2" stroke-width="2.6" fill="none"/><circle cx="43" cy="38" r="1.9" fill="${O}" stroke="none"/><circle cx="57" cy="38" r="1.9" fill="${O}" stroke="none"/><path d="M40 48q10 6 20 0" fill="none" stroke-width="2"/><path d="M58 50l18 4" stroke="#8a5a32" stroke-width="4" fill="none"/><circle cx="77" cy="54" r="2.4" fill="#ff7a2a" stroke="none"/><path d="M78 50q4-6 0-12" stroke="#bbb" stroke-width="1.2" fill="none"/><ellipse cx="34" cy="44" rx="4" ry="2.5" fill="#e0866a" stroke="none" opacity=".6"/><ellipse cx="66" cy="44" rx="4" ry="2.5" fill="#e0866a" stroke="none" opacity=".6"/>`)
});
Object.assign(SIL,{
// 衛生課長・灰原：白衣にマスク、銀ぶち眼鏡、手にはクリップボード
eisei:mk(`<path d="${B.boss}" fill="#e9e6df"/>${SHD(B.boss)}<path d="M50 62v98" stroke="#b9b4aa" fill="none"/><path d="M36 64l14 26 14-26" fill="#3a4250"/><circle cx="56" cy="104" r="2" fill="#b9b4aa"/><circle cx="56" cy="122" r="2" fill="#b9b4aa"/><rect x="60" y="94" width="26" height="32" rx="2" fill="#8a6a3a" transform="rotate(-10 73 110)"/><rect x="63" y="99" width="20" height="24" fill="#f4efe4" transform="rotate(-10 73 110)" stroke-width="1"/><path d="M66 106h14M66 111h14M66 116h10" stroke="#888" stroke-width="1" fill="none" transform="rotate(-10 73 110)"/>${NECK(46,16)}<ellipse cx="50" cy="38" rx="16" ry="18" fill="${SK}"/><path d="M33 32c0-14 8-20 17-20s17 6 17 20c-4-8-10-10-17-10s-13 2-17 10z" fill="#9a9a9a"/><circle cx="43" cy="36" r="5" fill="#dfe8ee" stroke="#c0c6cc" stroke-width="1.6"/><circle cx="57" cy="36" r="5" fill="#dfe8ee" stroke="#c0c6cc" stroke-width="1.6"/><path d="M48 36h4" stroke="#c0c6cc" stroke-width="1.6" fill="none"/><circle cx="43" cy="37" r="1.5" fill="${O}" stroke="none"/><circle cx="57" cy="37" r="1.5" fill="${O}" stroke="none"/><path d="M38 31l9 2M62 31l-9 2" stroke-width="2.2" fill="none"/><path d="M36 43h28v8c0 6-6 9-14 9s-14-3-14-9z" fill="#f4f6f8" stroke="#9aa4ae" stroke-width="1.4"/><path d="M40 47h20M41 52h18" stroke="#c4ccd4" stroke-width="1" fill="none"/>`),
// 巡査部長・矢吹（架空の荒野西署）：制帽、紺の制服、細い口ひげ、薄笑い
junsa:mk(`<path d="${B.slim}" fill="#1e2a44"/>${SHD(B.slim)}<path d="M50 70v90" stroke="#121a2c" fill="none"/><circle cx="50" cy="92" r="2.2" fill="#c9cdd4"/><circle cx="50" cy="110" r="2.2" fill="#c9cdd4"/><circle cx="50" cy="128" r="2.2" fill="#c9cdd4"/><path d="M30 120h40" stroke="#0e1422" stroke-width="5" fill="none"/><path d="M34 82h10v8H34z" fill="#c9cdd4" stroke-width="1"/><path d="M60 80l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#d9a441" stroke-width="1"/>${NECK(50,14)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M33 30h34l-3-12c-6-4-22-4-28 0z" fill="#1e2a44"/><path d="M30 31h40" stroke="#0e1422" stroke-width="5" fill="none"/><path d="M33 28h34" stroke="#d9a441" stroke-width="1.6" fill="none"/><path d="M46 21l4-4 4 4-4 4z" fill="#d9a441" stroke-width="1"/><path d="M40 37l7 2M60 37l-7 2" stroke-width="2.4" fill="none"/><circle cx="44" cy="41" r="1.7" fill="${O}" stroke="none"/><circle cx="56" cy="41" r="1.7" fill="${O}" stroke="none"/><path d="M42 47q4-2 8 0q4-2 8 0" stroke-width="1.8" fill="none"/><path d="M44 51q7 4 13-1" fill="none" stroke-width="1.8"/>`)
});
Object.assign(NAMES,{shinsa:'鉄面',ooya:'馬場',eisei:'灰原',junsa:'矢吹'});
Object.assign(VP,{narrf:{p:0,r:.82,g:'m',i:0},eisei:{p:.9,r:.85,g:'m',i:1},junsa:{p:1.2,r:1.05,g:'m',i:3}});
Object.assign(VP,{shinsa:{p:.3,r:.72,g:'m',i:2},ooya:{p:.2,r:.75,g:'m',i:0}});
document.body.insertAdjacentHTML('beforeend','<style>.fig.shinsa,.fig.ooya,.fig.eisei{height:100%}#koma .fig.shinsa,#koma .fig.ooya,#koma .fig.eisei{--k:1}</style>');
