/* LEGAL BREAK　BONUS STAGE（CM）「肩書き警察 VS 街の法律家・佐藤」
   第22話のクリア画面から第23話へ進むときだけ流れる、試験とは関係のないギャグ。
   本編の話・問題・採点・セーブには、何もさわらない（P も S.stats も変えない）。
   行政書士版だけで動く（宅建版・海事代理士版では何もしない）。 */
(function(){
if(typeof SAVE_KEY==='undefined'||SAVE_KEY!=='legalbreak.v2')return;

/* せりふ（声の自動録音は tools/gen_voice.mjs がこの一覧を読む） */
const BONUS_LINES=[["ここでCMです。","narrf"],["肩書き警察、襲来。","narrf"],["行政書士は法律家じゃない！","katagaki"],["では、法律家の法的定義を示せ。","hero"],["書類を書くだけの仕事だろ！","katagaki"],["権利義務の書類、契約書の代理作成、相談。行政書士法に書いてある。","hero"],["行政書士に使命なんかない！","katagaki"],["改正で、第1条は使命になった。","hero"],["待てー！！お前は法律家ではない！！","katagaki"],["ここだけ急に何の取り締まりなんだよ。","hero"],["街の法律家、百烈拳！","hero"],["アッパーカット！","hero"],["ぎゃあああ〜っ！","katagaki"],["肩書き警察は去っていった。","narrf"],["なお、何の試験対策にもならなかった。","narrf"]];
window.BONUS_LINES=BONUS_LINES;

/* 肩書き警察：法律の勉強をこじらせ、他人の肩書きを取り締まることだけが生きがいになった男たち。
   ぶあつい丸めがね、手作りの腕章、すり切れた六法、よれよれの帽子 */
SIL.katagaki=mk(`<path d="${B.slim}" fill="#4a4e5a"/>${SHD(B.slim)}<path d="M40 72L50 96L60 72Z" fill="#d8d0bc"/><path d="M48 76h4l-1 16h-2z" fill="#6a6a2a"/><rect x="18" y="96" width="16" height="9" fill="#c22d22" stroke-width="1.2" transform="rotate(-8 26 100)"/><text x="26" y="103" text-anchor="middle" font-size="5.6" font-weight="900" fill="#fff" stroke="none" font-family="sans-serif" transform="rotate(-8 26 100)">肩書</text><rect x="62" y="104" width="20" height="26" rx="2" fill="#2f6a3a" stroke-width="1.4" transform="rotate(10 72 117)"/><text x="72" y="120" text-anchor="middle" font-size="7" font-weight="900" fill="#f2e6c8" stroke="none" font-family="serif" transform="rotate(10 72 117)">六法</text><path d="M30 150l4-6 4 6M64 150l4-6 4 6" stroke="#6a6e7a" stroke-width="1.2" fill="none"/>${NECK(50,14)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M34 32c-2-6 4-10 8-8c2-6 12-6 16 0c4-2 10 2 8 8z" fill="#3a3326"/><path d="M33 28h34l-3-10c-6-4-22-4-28 0z" fill="#2a3448"/><path d="M30 29h40" stroke="#141a26" stroke-width="4" fill="none"/><rect x="45" y="17" width="10" height="7" rx="1" fill="#d9a441" stroke-width="1"/><text x="50" y="23" text-anchor="middle" font-size="5" font-weight="900" fill="#5a2a0a" stroke="none" font-family="sans-serif">肩</text><circle cx="43" cy="40" r="6" fill="#eef4f8" stroke-width="2"/><circle cx="57" cy="40" r="6" fill="#eef4f8" stroke-width="2"/><path d="M49 40h2" stroke-width="2" fill="none"/><path d="M41 40a2 2 0 1 0 4 0a3.5 3.5 0 1 0 -7 0" stroke-width="1" fill="none"/><path d="M55 40a2 2 0 1 0 4 0a3.5 3.5 0 1 0 -7 0" stroke-width="1" fill="none"/><path d="M44 51q6-4 12 0" fill="none" stroke-width="1.8"/><path d="M66 30q3 5 0 8q-3-3 0-8z" fill="#9fd4ff" stroke-width="1"/>`);
NAMES.katagaki='肩書き警察';
VP.katagaki={p:1.35,r:1.15,g:'m',i:3};

document.body.insertAdjacentHTML('beforeend',`<style>
#ov.bcm{background:#000;align-items:flex-start;overflow-y:auto}
.bcm-wrap{width:100%;max-width:460px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 12px 20px;position:relative}
.bcm-skip{position:fixed;right:10px;top:max(10px,env(safe-area-inset-top));z-index:70;background:rgba(0,0,0,.6);color:#f2e6d0;border:1px solid rgba(242,230,208,.5);padding:6px 10px;font-weight:900;font-size:13px}
.bcm-title{min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center}
.bcm-cm{font-family:var(--display);font-size:clamp(34px,11vw,56px);color:#fff;letter-spacing:.08em;animation:bcmIn .4s cubic-bezier(.2,1.6,.4,1) both}
.bcm-bonus{font-family:var(--display);font-size:clamp(30px,10vw,48px);color:#ffd84a;text-shadow:3px 3px 0 #c22d22,0 0 22px rgba(255,216,74,.7);animation:bcmIn .4s cubic-bezier(.2,1.6,.4,1) both}
.bcm-sub{font-weight:900;font-size:clamp(20px,6vw,28px);color:#fff;border-top:3px solid #c22d22;border-bottom:3px solid #c22d22;padding:6px 14px;animation:bcmIn .4s .2s cubic-bezier(.2,1.6,.4,1) both}
.bcm-note{font-size:13px;line-height:1.7;color:#c9b89a;max-width:340px;animation:bcmIn .4s .4s both}
@keyframes bcmIn{0%{opacity:0;transform:scale(2)}100%{opacity:1;transform:none}}
.bstage{position:relative;width:100%;height:clamp(230px,42vh,330px);overflow:visible;border:3px solid #f2e6d0;background:linear-gradient(180deg,#2a1a3a,#7a3a2a 60%,#2a1a14)}
.bstage .fig{height:70%;bottom:-2px}
.bstage .fig.hero{left:50%;right:auto;transform:translateX(-50%);height:82%;z-index:4}
.bstage .fig.katagaki{z-index:3}
.bstage .fig.k1{left:-2%;right:auto}.bstage .fig.k2{right:-2%;left:auto}.bstage .fig.k3{left:24%;right:auto;height:56%;bottom:18%;z-index:2;filter:brightness(.8)}
.bstage .fig.k4{right:24%;left:auto;height:56%;bottom:18%;z-index:2;filter:brightness(.8)}
.bstage .fig.down{filter:grayscale(.8) brightness(.6);transform-origin:50% 100%;transform:rotate(-16deg) scaleY(.72);transition:transform .4s,filter .4s}
.bstage .fig.k2.down,.bstage .fig.k4.down{transform:rotate(16deg) scaleY(.72)}
.bstage.bshake{animation:bshake .25s}
@keyframes bshake{0%,100%{transform:none}25%{transform:translate(-8px,4px)}50%{transform:translate(7px,-5px)}75%{transform:translate(-4px,2px)}}
.bcrit{position:absolute;z-index:9;left:0;right:0;top:6%;text-align:center;pointer-events:none;animation:bcrit 1.6s ease-out forwards}
.bcrit b{display:block;font-family:var(--display);font-weight:400;font-size:clamp(34px,11vw,54px);color:#ffd84a;-webkit-text-stroke:2px #c22d22;text-shadow:4px 4px 0 #000}
.bcrit span{display:inline-block;margin-top:4px;background:#c22d22;color:#fff;font-weight:900;font-size:clamp(14px,4.4vw,18px);padding:4px 10px;transform:rotate(-3deg)}
@keyframes bcrit{0%{opacity:0;transform:scale(2.4)}12%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0}}
.bdmg{position:absolute;z-index:9;font-family:var(--display);font-size:30px;color:#fff;-webkit-text-stroke:1.5px #c22d22;text-shadow:3px 3px 0 #000;pointer-events:none;animation:bdmg 1.1s ease-out forwards}
.bdmg.big{font-size:clamp(40px,13vw,64px);color:#ffd84a}
@keyframes bdmg{0%{transform:translateY(0) scale(.6);opacity:0}20%{transform:translateY(-10px) scale(1.2);opacity:1}100%{transform:translateY(-60px) scale(1);opacity:0}}
.bline{min-height:4.4em;width:100%;display:flex;justify-content:center}
.bline .fl{font-size:17px}
.bboard{display:grid;gap:8px;width:100%}
.bboard div{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fbf6ec;color:#120c0a;border:3px solid #120c0a;padding:8px 12px;font-weight:900;font-size:17px;animation:bcmIn .3s both}
.bboard div b{font-family:var(--display);font-weight:400;font-size:24px;color:#c22d22}
.bboard div.ng{background:#2a3448;color:#fff;border-color:#ffd84a}
.bboard div.ng b{color:#ffd84a}
.bboard i{font-style:normal;font-size:20px;color:#5fae6a}
.bbig{position:absolute;z-index:9;left:0;right:0;top:12%;text-align:center;white-space:nowrap;font-family:var(--display);font-size:clamp(32px,10.5vw,56px);color:#fff;-webkit-text-stroke:2px #c22d22;text-shadow:0 0 22px rgba(255,120,40,.9),4px 4px 0 #000;pointer-events:none;animation:bcmIn .3s cubic-bezier(.2,1.6,.4,1) both;letter-spacing:.06em}
.bbig.low{top:58%}
.bbig small{display:block;font-size:.42em;color:#ffd84a;-webkit-text-stroke:0;letter-spacing:.3em}
.bwave{position:absolute;z-index:8;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:6px solid #fff;box-shadow:0 0 30px #ffd84a;pointer-events:none;animation:bwave .7s ease-out forwards}
@keyframes bwave{0%{transform:scale(.3);opacity:1}100%{transform:scale(14);opacity:0}}
.bstage .fig.hero.bup{animation:bup .6s cubic-bezier(.3,.1,.3,1) forwards}
@keyframes bup{0%{transform:translateX(-50%)}35%{transform:translateX(-50%) translateY(10%) scaleY(.85)}100%{transform:translateX(-50%) translateY(-38%) rotate(-5deg)}}
.bstage .fig.fly{animation:bfly 1.1s cubic-bezier(.2,.6,.4,1) forwards}
@keyframes bfly{0%{transform:none;opacity:1}100%{transform:translateY(-420%) rotate(720deg) scale(.15);opacity:.9}}
.bres{width:100%;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center;padding-top:6vh}
.bres h2{margin:0;font-family:var(--display);font-weight:400;font-size:clamp(28px,9vw,42px);color:#ffd84a;text-shadow:3px 3px 0 #c22d22}
.bres table{border-collapse:collapse;font-weight:900;font-size:18px;color:#f2e6d0}
.bres td{padding:6px 14px;border-bottom:1px dashed rgba(242,230,208,.35)}.bres td+td{text-align:right;font-family:var(--display);font-weight:400;font-size:24px;color:#fff}
.bres p{margin:0;font-weight:900;font-size:16px;line-height:1.7;color:#f2e6d0;animation:bcmIn .4s both}
.bres p.dry{color:#c9b89a;font-size:15px}
</style>`);

const wait=ms=>new Promise(r=>setTimeout(r,ms));
const sayP=(t,k)=>new Promise(r=>say([[t,k]],r));
const BG={on:false};

/* 安っぽいCMのジングル（その場で鳴らす） */
function jingle(){const a=ac();if(!a)return;const t=a.currentTime;[[72,0],[76,.12],[79,.24],[84,.36],[79,.6],[84,.72]].forEach(([n,dt])=>I.bell(a,a.destination,n,t+dt,.08,1.5))}
function siren(){const a=ac();if(!a)return;try{I.siren(a,a.destination,a.currentTime,1.6,.04)}catch(e){}}

function bonusCM(done){
  BGM.stop();closeSheet();stopSay();
  const ov=$('#ov');ov.hidden=false;ov.className='bcm';ov.style.cssText='';
  let end=false;
  const finish=()=>{if(end)return;end=true;stopSay();ov.hidden=true;ov.innerHTML='';ov.className='';ov.style.cssText='';done()};
  const skip='<button class="bcm-skip" type="button" id="bcmSkip">スキップ ▶▶</button>';
  const bindSkip=()=>{const b=$('#bcmSkip');if(b)b.onclick=finish};
  const alive=()=>!end;
  (async()=>{
    // 1. 画面暗転 → 「ここでCMです」
    ov.innerHTML=skip+`<div class="bcm-wrap"><div class="bcm-title" id="bcmT"></div></div>`;bindSkip();
    await wait(600);if(!alive())return;
    $('#bcmT').innerHTML='<div class="bcm-cm">ここでCMです</div>';jingle();await Promise.all([sayP('ここでCMです。','narrf'),wait(1700)]);if(!alive())return;
    $('#bcmT').innerHTML='<div class="bcm-bonus">BONUS STAGE</div><div class="bcm-sub">肩書き警察、襲来。</div><div class="bcm-note">法律の勉強をこじらせた末、<br>他人の肩書きを取り締まることだけが<br>生きがいになった男たち。</div>';
    siren();await Promise.all([sayP('肩書き警察、襲来。','narrf'),wait(3000)]);if(!alive())return;
    // 2. 佐藤を取り囲む
    BGM.play('k21battle');
    ov.innerHTML=skip+`<div class="bcm-wrap"><div class="bstage" id="bst"><div class="fig katagaki k3">${SIL.katagaki}</div><div class="fig katagaki k4">${SIL.katagaki}</div><div class="fig katagaki k1">${SIL.katagaki}</div><div class="fig katagaki k2">${SIL.katagaki}</div><div class="fig hero">${SIL.hero}<span class="ntag">佐藤</span></div></div><div class="bline" id="bl"></div><div id="bbd" class="bboard"></div></div>`;bindSkip();
    const st=$('#bst'),hero=st.querySelector('.hero'),cops=[...st.querySelectorAll('.katagaki')];
    const line=(t,who,cls='')=>{const l=$('#bl');if(l)l.innerHTML=`<div class="fl ${cls}"><b>${who}</b>${t}</div>`};
    const crit=(sub)=>{const c=document.createElement('div');c.className='bcrit';c.innerHTML=`<b>CRITICAL!!</b>${sub?`<span>${sub}</span>`:''}`;st.appendChild(c);setTimeout(()=>c.remove(),1700)};
    const dmg=(fig,n,big)=>{const r=fig.getBoundingClientRect(),sr=st.getBoundingClientRect(),d=document.createElement('div');d.className='bdmg'+(big?' big':'');d.textContent=n;d.style.left=(r.left-sr.left+r.width*.2)+'px';d.style.top=(r.top-sr.top+r.height*.1)+'px';st.appendChild(d);setTimeout(()=>d.remove(),1200)};
    const flash=()=>{const w=document.createElement('div');w.className='whiteout-mini';st.appendChild(w);setTimeout(()=>w.remove(),400)};
    await wait(500);if(!alive())return;
    // 3. 三人を、ひと言ずつで撃破
    const R=[
      [cops[2],'行政書士は法律家じゃない！','では、法律家の法的定義を示せ。','法律家認定権など、存在しない！','-9999'],
      [cops[3],'書類を書くだけの仕事だろ！','権利義務の書類、契約書の代理作成、相談。行政書士法に書いてある。','行政書士法1条の3・1条の4','-8888'],
      [cops[0],'行政書士に使命なんかない！','改正で、第1条は使命になった。','令和8年1月1日施行・行政書士法1条','-7777']
    ];
    for(const [c,t1,t2,sub,n] of R){
      line(t1,'肩書き警察');await Promise.all([sayP(t1,'katagaki'),wait(1300)]);if(!alive())return;
      line(t2,'佐藤','hero');await Promise.all([sayP(t2,'hero'),wait(1300)]);if(!alive())return;
      flash();punch(1.8);hit(1.2);crit(sub);dmg(c,n);c.classList.add('down');await wait(1500);if(!alive())return;
    }
    // 4. 〇〇家ボード
    $('#bl').innerHTML='';const bd=$('#bbd');
    const rows=[['料理をする','料理家'],['格闘技をする','格闘家'],['妻を愛する','愛妻家']];
    for(const [a,b] of rows){bd.insertAdjacentHTML('beforeend',`<div><span>${a}</span><i>→</i><b>${b}</b></div>`);const x=ac();if(x)I.bell(x,x.destination,79,x.currentTime,.07,1);await wait(800);if(!alive())return}
    bd.insertAdjacentHTML('beforeend',`<div class="ng"><span>法律を専門業務として扱う行政書士</span><i>→</i><b>？</b></div>`);await wait(700);if(!alive())return;
    siren();const last=cops[1];last.classList.remove('down');
    line('待てー！！お前は法律家ではない！！','肩書き警察','big');await Promise.all([sayP('待てー！！お前は法律家ではない！！','katagaki'),wait(1800)]);if(!alive())return;
    line('ここだけ急に何の取り締まりなんだよ。','佐藤','hero');await Promise.all([sayP('ここだけ急に何の取り締まりなんだよ。','hero'),wait(1600)]);if(!alive())return;
    bd.innerHTML='';cops.forEach(c=>c.classList.remove('down'));
    // 5. 必殺技：街の法律家・百烈拳 → アッパーカット
    BGM.stop();$('#bl').innerHTML='';
    const sp=document.createElement('div');sp.className='speedfx';st.appendChild(sp);
    let bg=document.createElement('div');bg.className='bbig';bg.innerHTML='<small>街の法律家</small>百 烈 拳！！';st.appendChild(bg);say([['街の法律家、百烈拳！','hero']]);rapidKiai(24);
    for(let i=0;i<34;i++){const c=cops[i%4],r=c.getBoundingClientRect(),sr=st.getBoundingClientRect(),d=document.createElement('div');d.className='hiko';d.style.left=(r.left-sr.left+r.width*(.3+Math.random()*.4))+'px';d.style.top=(r.top-sr.top+r.height*(.15+Math.random()*.5))+'px';st.appendChild(d);setTimeout(()=>d.remove(),500);
      if(i%2)punch(.6);else hit(.35);await wait(60);if(!alive())return}
    bg.remove();await wait(200);if(!alive())return;
    bg=document.createElement('div');bg.className='bbig low';bg.innerHTML='アッパーカット！！';st.appendChild(bg);say([['アッパーカット！','hero']]);
    hero.classList.add('bup');await wait(330);if(!alive())return;
    flash();const r=hero.getBoundingClientRect(),sr=st.getBoundingClientRect(),wv=document.createElement('div');wv.className='bwave';wv.style.left=(r.left-sr.left+r.width/2)+'px';wv.style.top=(r.top-sr.top+r.height*.2)+'px';st.appendChild(wv);setTimeout(()=>wv.remove(),800);
    st.classList.add('bshake');setTimeout(()=>st.classList.remove('bshake'),300);punch(2.8);hit(2.6);const a=ac();if(a){I.taiko(a,a.destination,a.currentTime+.02,1);I.whip(a,a.destination,a.currentTime,.7)}
    crit();cops.forEach((c,i)=>{dmg(c,i===1?'-999999':'-99999',i===1);setTimeout(()=>c.classList.add('fly'),i*90)});
    say([['ぎゃあああ〜っ！','katagaki']]);
    await wait(1600);if(!alive())return;bg.remove();
    // 6. リザルト
    ov.innerHTML=skip+`<div class="bcm-wrap"><div class="bres"><h2>BONUS STAGE CLEAR!!</h2><table><tr><td>獲得経験値</td><td>0</td></tr><tr><td>獲得法律知識</td><td>0</td></tr><tr><td>失った時間</td><td>5分</td></tr></table><div id="bres2"></div></div></div>`;bindSkip();
    if(typeof fanfare==='function')fanfare();await wait(1400);if(!alive())return;
    $('#bres2').insertAdjacentHTML('beforeend','<p>肩書き警察は去っていった。</p>');await Promise.all([sayP('肩書き警察は去っていった。','narrf'),wait(1800)]);if(!alive())return;
    $('#bres2').insertAdjacentHTML('beforeend','<p class="dry">なお、何の試験対策にもならなかった。</p>');await Promise.all([sayP('なお、何の試験対策にもならなかった。','narrf'),wait(1800)]);if(!alive())return;
    const go=document.createElement('button');go.className='btn';go.type='button';go.textContent='第23話へ';go.onclick=finish;$('#bres2').appendChild(go);
    const sk=$('#bcmSkip');if(sk)sk.remove();
  })();
}
window.bonusCM=bonusCM;

/* 第22話のクリア画面の「第23話へ」を押したときだけ、CMをはさむ */
{const _ec=epClear;epClear=function(){const r=_ec.apply(this,arguments);
  if(CH&&CH.no===22){const b=$('#goNext');if(b&&!b.dataset.bcm){b.dataset.bcm='1';const go=b.onclick;b.onclick=()=>bonusCM(()=>go?go():playEp(23))}}
  return r}}
})();
