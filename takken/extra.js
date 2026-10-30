/* TAKKEN HUNTER（宅建版）だけの部分。ゲーム本体（index.html）のあとに読み込まれる。
   夜の街の背景・宅建版の登場人物・曲・オープニングの街並みをここで足す。 */

/* ---------- 夜の街の背景 ---------- */
// 監獄の話（world:"prison"）以外は、ずっと夜の街
function drawCity(c){
  const r=rnd(23),hz=H*.7;
  let g=c.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#070a1a');g.addColorStop(.55,'#1b1940');g.addColorStop(.85,'#4a2350');g.addColorStop(1,'#8a3a4a');c.fillStyle=g;c.fillRect(0,0,W,hz);
  // 月
  g=c.createRadialGradient(W*.16,H*.36,0,W*.16,H*.36,H*.08);g.addColorStop(0,'rgba(255,244,214,.95)');g.addColorStop(.25,'rgba(255,236,190,.55)');g.addColorStop(1,'rgba(255,236,190,0)');c.fillStyle=g;c.fillRect(0,0,W,hz);
  c.fillStyle='#fff3d6';c.beginPath();c.arc(W*.16,H*.36,Math.max(10,H*.022),0,Math.PI*2);c.fill();
  // ビル（奥・手前の2列）
  const row=(base,hmin,hmax,col,win,lit)=>{let x=-10;while(x<W){const w=34+r()*70,h=hmin+r()*(hmax-hmin),top=base-h;c.fillStyle=col;c.fillRect(x,top,w,h+2);
    if(r()<.25){c.fillRect(x+w*.4,top-14,3,14)}
    const cw=6,ch=8,gx=5,gy=7;for(let yy=top+8;yy<base-10;yy+=ch+gy)for(let xx=x+6;xx<x+w-cw-4;xx+=cw+gx)if(r()<lit){c.fillStyle=r()<.8?win:'#9fe3ff';c.globalAlpha=.35+r()*.4;c.fillRect(xx,yy,cw,ch);c.globalAlpha=1}c.fillStyle=col;
    x+=w+2}};
  row(hz,H*.12,H*.34,'#141530','#e8b45a',.12);
  row(hz,H*.05,H*.2,'#0c0c1c','#f2c46a',.16);
  // ネオン看板
  const neon=(x,y,w,h,col,txt)=>{c.save();c.shadowColor=col;c.shadowBlur=14;c.strokeStyle=col;c.lineWidth=2.4;c.strokeRect(x,y,w,h);c.fillStyle=col;c.font=`900 ${Math.round(h*.62)}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,x+w/2,y+h/2+1);c.restore()};
  neon(W*.08,hz-H*.16,Math.max(54,W*.16),Math.max(20,H*.03),'#ff4d6a','不動産');
  neon(W*.6,hz-H*.11,Math.max(46,W*.12),Math.max(18,H*.026),'#4de1ff','売物件');
  // 道路
  g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,'#1c1a28');g.addColorStop(1,'#07060c');c.fillStyle=g;c.fillRect(0,hz,W,H-hz);
  c.fillStyle='rgba(255,77,106,.12)';c.fillRect(0,hz,W,H*.02);
  c.strokeStyle='rgba(240,220,170,.35)';c.lineWidth=3;c.setLineDash([24,22]);c.beginPath();c.moveTo(0,hz+(H-hz)*.55);c.lineTo(W,hz+(H-hz)*.55);c.stroke();c.setLineDash([]);
  // 街灯
  for(const x of [W*.22,W*.88]){c.fillStyle='#0a0a12';c.fillRect(x-2,hz-H*.12,4,H*.12+(H-hz)*.2);c.fillRect(x-2,hz-H*.12,18,4);
    g=c.createRadialGradient(x+14,hz-H*.11,0,x+14,hz-H*.11,H*.12);g.addColorStop(0,'rgba(255,214,140,.45)');g.addColorStop(1,'rgba(255,214,140,0)');c.fillStyle=g;c.fillRect(x-H*.12,hz-H*.24,H*.26,H*.3)}
  dust=Array.from({length:46},()=>({x:Math.random()*W,y:Math.random()*H,v:.12+Math.random()*.3,s:.6+Math.random()*1.2,ph:Math.random()*6}));
  weed=null;
}
(function(){
  const base=drawStatic;
  drawStatic=function(){
    if(WORLD&&WORLD!=='city')return base();
    const dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;
    stat=document.createElement('canvas');stat.width=W*dpr;stat.height=H*dpr;const c=stat.getContext('2d');c.scale(dpr,dpr);drawCity(c);
  };
  const sw=setWorld;
  setWorld=function(w){sw(w);document.body.classList.toggle('w-city',!w||w==='city')};
  document.body.classList.add('w-city');
  drawStatic();if(reduce)frame();
})();

/* ---------- 夜の街の見た目（コマ・戦いの舞台・タイトル） ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
body.w-city{--dust:#e8b45a}
body.w-city .panel{background:repeating-linear-gradient(90deg,transparent 0 22px,rgba(255,214,140,.07) 22px 28px,transparent 28px 46px),linear-gradient(180deg,#0b0f2a 0%,#272452 48%,#7a3450 72%,#1d1a26 73%,#0b0a10 100%)}
body.w-city .panel.bg-dark{background:linear-gradient(180deg,#05060f 0%,#141633 70%,#1d1a2a 73%,#07070c 74%)}
body.w-city .panel.bg-red{background:linear-gradient(180deg,#3a0613 0%,#9a1832 58%,#e0405a 72%,#2a0a12 73%,#10050a 100%)}
body.w-city .panel.bg-out{background:linear-gradient(180deg,#2a6aa8 0%,#8cc6e8 60%,#d8e6ee 72%,#5a5a64 73%,#2a2a30 100%)}
body.w-city .stage{background:repeating-linear-gradient(90deg,transparent 0 30px,rgba(255,214,140,.08) 30px 36px,transparent 36px 58px),linear-gradient(180deg,#090c22 0%,#2a2350 60%,#80344e 73%,#1c1a26 74%,#08070c 100%)}
body.w-city .kime{background:linear-gradient(180deg,#2a0a2a,#0c0a16)}
body.w-city .title-hero,body.w-city .op-hero{filter:drop-shadow(0 0 18px rgba(255,77,106,.45))}
.op-village .ct{display:none}body.w-city .op-village .vl{display:none}body.w-city .op-village .ct{display:block}
</style>`);
// オープニングの街並み（夜のビル街と、駅前の小さな不動産屋）
$('#op .op-village').insertAdjacentHTML('beforeend',`<svg class="ct" viewBox="0 0 300 120" preserveAspectRatio="xMaxYMax meet"><g fill="#0b0807"><path d="M0 120V52h26V30h22v90z"/><path d="M52 120V18h30v102z"/><path d="M86 120V60h20V44h24v76z"/><path d="M134 120V36h34v84z"/><path d="M226 120V64h70v56z"/><path d="M220 66l41-22 41 22z"/><path d="M0 120h300v-6H0z"/></g><g fill="#e8b45a" opacity=".85"><rect x="58" y="26" width="5" height="6"/><rect x="70" y="40" width="5" height="6"/><rect x="58" y="56" width="5" height="6"/><rect x="140" y="46" width="5" height="6"/><rect x="154" y="62" width="5" height="6"/><rect x="8" y="62" width="5" height="6"/><rect x="34" y="40" width="5" height="6"/></g><rect x="236" y="78" width="50" height="14" fill="none" stroke="#ff4d6a" stroke-width="2"/><text x="261" y="89" text-anchor="middle" font-size="9" font-weight="900" fill="#ff4d6a" font-family="sans-serif">ひだまり不動産</text><rect x="244" y="96" width="14" height="18" fill="#e0902f"/><rect x="266" y="96" width="14" height="18" fill="#e0902f" opacity=".7"/></svg>`);

/* ---------- 宅建版の登場人物 ---------- */
Object.assign(SIL,{
// 南（みなみ）：駅前の「ひだまり不動産」の受付。宅建士を目指して勉強中
minami:mk(`<path d="${B.slim}" fill="#f4f1ea"/>${SHD(B.slim)}<path d="M26 160C26 122 31 94 40 80L50 106L60 80C69 94 74 122 74 160Z" fill="#26324f"/><path d="M50 106v54" stroke="#1a2238" fill="none"/><circle cx="50" cy="120" r="1.6" fill="#d9a441" stroke="none"/><circle cx="50" cy="134" r="1.6" fill="#d9a441" stroke="none"/><path d="M43 76l7 6 7-6-7 3z" fill="#c22d22"/><rect x="60" y="100" width="24" height="30" rx="2" fill="#d9a441"/><path d="M63 104h18" stroke="#8a5a32" stroke-width="1.4"/><text x="72" y="122" text-anchor="middle" font-size="11" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">宅建</text>${NECK(52,12)}<path d="M35 36C31 44 31 56 36 60L41 57C37 51 37 44 38 38ZM65 36C69 44 69 56 64 60L59 57C63 51 63 44 62 38Z" fill="#3a2418"/><ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M35 38C33 22 42 17 50 17C58 17 67 22 65 38C61 30 56 27 50 29C45 27 39 30 35 38Z" fill="#3a2418"/><ellipse cx="44" cy="41" rx="2.4" ry="2.9" fill="${O}" stroke="none"/><ellipse cx="56" cy="41" rx="2.4" ry="2.9" fill="${O}" stroke="none"/><circle cx="45" cy="40" r=".9" fill="#fff" stroke="none"/><circle cx="57" cy="40" r=".9" fill="#fff" stroke="none"/><path d="M46 49q4 2 8 0" fill="none" stroke-width="1.6"/><ellipse cx="41" cy="46" rx="3" ry="1.6" fill="#e88a7a" opacity=".45" stroke="none"/><ellipse cx="59" cy="46" rx="3" ry="1.6" fill="#e88a7a" opacity=".45" stroke="none"/>`),
// 大樹：家を買いたい若い会社員
kyaku:mk(`<path d="${B.slim}" fill="#e8ecf2"/>${SHD(B.slim)}<path d="M26 160V130h48v30Z" fill="#2a2d38"/><path d="M42 72l8 7 8-7" fill="none"/><path d="M50 79l-3 4 2 28 1 3 1-3 2-28z" fill="#2f5aa8"/><path d="M30 100h8M62 100h8" stroke="#c8ccd4" stroke-width="1.4" fill="none"/>${NECK(52,12)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M36 36C35 21 43 17 51 17C60 17 66 23 64 36C60 28 55 26 50 27C44 27 39 30 36 36Z" fill="#241a16"/><path d="M41 36l6 1M59 36l-6 1" fill="none" stroke-width="1.8"/><ellipse cx="44" cy="41" rx="2.2" ry="2.6" fill="${O}" stroke="none"/><ellipse cx="56" cy="41" rx="2.2" ry="2.6" fill="${O}" stroke="none"/><path d="M45 50q5 2 10 0" fill="none" stroke-width="1.6"/>`),
// 春香：駅近のマンションを買おうとする会社員
haruka:mk(`<path d="M30 40C26 60 26 84 30 100L40 96C36 80 36 60 38 46Z" fill="#4a2a1e"/><path d="${B.mina}" fill="#c9a77a"/>${SHD(B.mina)}<path d="M36 160V92c8-6 20-6 28 0v68Z" fill="#f4f1ea"/><path d="M36 92L50 120L64 92" fill="none" stroke="#a8875a" stroke-width="2"/><path d="M24 124h52" stroke="#8a6a44" stroke-width="4" fill="none"/>${NECK(50,14)}<ellipse cx="50" cy="38" rx="14" ry="16" fill="${SK}"/><path d="M35 40C32 22 42 17 51 17C61 17 68 24 65 40C62 30 56 26 47 28C42 30 38 34 35 40Z" fill="#4a2a1e"/><path d="M64 34c5 10 5 26 2 40" stroke="#4a2a1e" stroke-width="7" fill="none"/><ellipse cx="44" cy="40" rx="2.3" ry="2.8" fill="${O}" stroke="none"/><ellipse cx="56" cy="40" rx="2.3" ry="2.8" fill="${O}" stroke="none"/><circle cx="45" cy="39" r=".9" fill="#fff" stroke="none"/><circle cx="57" cy="39" r=".9" fill="#fff" stroke="none"/><path d="M46 48q4 2 8 0" fill="none" stroke-width="1.6"/><circle cx="35" cy="46" r="2" fill="#d9a441" stroke="none"/>`),
// 鍵屋：悪徳不動産グループ「黒鍵商会」の幹部。金の鍵を首から下げている
kagi:mk(`<path d="${B.coat}" fill="#17151b"/>${SHD(B.coat)}<path d="M38 64L50 120L62 64" fill="#5a1414" stroke="#2c2a31" stroke-width="2.6"/><path d="M22 92l14 6M78 92l-14 6" stroke="#2c2a31" stroke-width="2" fill="none"/><path d="M30 76l6-4 4 6-6 3z" fill="#d9a441" stroke="none"/><path d="M44 66q6 30 6 40M56 66q-6 30-6 40" stroke="#d9a441" stroke-width="1.6" fill="none"/><circle cx="50" cy="111" r="5.5" fill="none" stroke="#d9a441" stroke-width="2.6"/><path d="M50 116v17M50 125h6M50 131h5" stroke="#d9a441" stroke-width="2.6" fill="none"/>${NECK(46,16)}<ellipse cx="50" cy="36" rx="15" ry="18" fill="${SK}"/><path d="M34 33C31 16 42 11 52 11C63 11 70 18 66 33C61 22 52 20 46 21C40 22 36 26 34 33Z" fill="#a4aab2"/><path d="M38 20q10-6 24-2" stroke="#cfd4da" stroke-width="1.4" fill="none"/><path d="M39 31l9 3M61 31l-9 3" stroke-width="2.6" fill="none"/><path d="M41 37h6M53 37h6" stroke-width="2.2" fill="none"/><path d="M42 48q8 4 15-3" fill="none" stroke-width="1.8"/><path d="M59 25l5 13" stroke="#a0302a" stroke-width="1.6" fill="none"/>`)
});
Object.assign(NAMES,{minami:'南',kyaku:'大樹',haruka:'春香',kagi:'鍵屋'});
// 声が録音されていないときの読み上げ（端末の声）の高さと速さ
Object.assign(VP,{minami:{p:2,r:1.22,g:'f',i:2},kyaku:{p:1.1,r:1.05,g:'m',i:1},haruka:{p:1.3,r:1.02,g:'f',i:0},kagi:{p:.15,r:.66,g:'m',i:0}});

/* ---------- 宅建版の小道具 ---------- */
Object.assign(PROPS,{
 tent:{vb:[160,110],s:.46,svg:PROP_S(`<path d="M10 50L80 8L150 50Z" fill="#c22d22"/><path d="M10 50h140" stroke-width="2.6"/><path d="M10 50q12 10 23 0q12 10 23 0q12 10 23 0q12 10 23 0q12 10 23 0q12 10 25 0" fill="#efe3cf"/><path d="M22 56v52M138 56v52" stroke="#4a3220" stroke-width="4"/><rect x="40" y="70" width="80" height="26" rx="2" fill="#f4ecdc"/><text x="80" y="88" text-anchor="middle" font-size="14" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">分譲会場</text>`)},
 flyer:{vb:[80,104],s:.32,svg:PROP_S(`<path d="M6 6h68v92H6z" fill="#fff6d8"/><rect x="12" y="12" width="56" height="20" fill="#c22d22"/><text x="40" y="27" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" stroke="none" font-family="sans-serif">全20区画</text><path d="M14 40h52v30H14z" fill="#cfe8c0"/><path d="M14 50h52M14 60h52M31 40v30M49 40v30" stroke-width="1.4"/><text x="40" y="88" text-anchor="middle" font-size="11" font-weight="900" fill="#c22d22" stroke="none" font-family="sans-serif">即売！</text>`)},
 juji:{vb:[80,100],s:.3,svg:PROP_S(`<path d="M8 6h64v88H8z" fill="#f4ecdc"/><text x="40" y="24" text-anchor="middle" font-size="10.5" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">重要事項</text><text x="40" y="37" text-anchor="middle" font-size="10.5" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">説明書</text><path d="M18 48h44M18 58h44M18 68h30" stroke-width="1.6"/><rect x="44" y="74" width="20" height="12" fill="none" stroke="#c22d22" stroke-width="2" stroke-dasharray="3 2"/>`)},
 house:{vb:[120,100],s:.5,svg:PROP_S(`<path d="M10 48L60 10L110 48Z" fill="#7a3a2a"/><path d="M20 46h80v50H20z" fill="#efe3cf"/><rect x="50" y="64" width="20" height="32" fill="#8a5a32"/><rect x="28" y="56" width="16" height="14" fill="#9fd0f0"/><rect x="76" y="56" width="16" height="14" fill="#9fd0f0"/><path d="M84 18v16h10V26" fill="#5a2a1e"/>`)},
 money:{vb:[100,70],s:.24,svg:PROP_S(`<rect x="6" y="18" width="70" height="44" rx="3" fill="#cfe0b0"/><rect x="18" y="8" width="70" height="44" rx="3" fill="#e2efc6"/><circle cx="53" cy="30" r="11" fill="none" stroke="#5a7a3a" stroke-width="2"/><text x="53" y="35" text-anchor="middle" font-size="12" font-weight="900" fill="#5a7a3a" stroke="none" font-family="sans-serif">万</text>`)}
});

/* ---------- 宅建版の曲（夜の街） ---------- */
Object.assign(TR,{
 // タイトル：夜の駅前。ゆったりしたピアノとベース
 title:{bpm:88,f(a,o,s,t,d){const bar=s>>3,ch=[[50,53,57,60],[46,50,53,57],[43,46,50,53],[45,49,52,55]][bar];
  if(s%8===0)I.pad(a,o,ch.map(n=>n+12),t,8*d,.02,900);if(s%2===0)I.bass(a,o,ch[0]-12+(s%8===6?7:0),t,d*1.7,.15);
  if(s%2===1)I.hat(a,o,t,.022);if(s%8===4)I.snare(a,o,t,.04);
  const m=[{0:74,3:72,6:69},{0:70,3:69,6:65},{0:67,2:69,4:70,6:74},{0:73,4:76}][bar][s%8];if(m)I.piano(a,o,m,t,.05)}},
 // オープニング：ネオンの街に低い鼓動。最後に鐘
 opening:{bpm:80,f(a,o,s,t,d){const r=[38,38,41,36][s>>3];if(s%4===0)I.kick(a,o,t,.35);if(s%2===0)I.bass(a,o,r,t,d*1.6,.14);if(s%8===0)I.pad(a,o,[r+12,r+19,r+24],t,8*d,.022,700);
  if(s%4===2)I.hat(a,o,t,.02);if(s===0)I.bell(a,o,74,t,.05,4);if(s===16)I.bell(a,o,69,t,.04,4);if(s%16===12)I.vib(a,o,r+24,t,.02)}}
});

/* ---------- 第2話の曲（昼と夜の街・現代の音） ---------- */
Object.assign(TR,{
 // ひだまり不動産の昼：エレピ風の和音と、はずむベース（明るいジャズっぽさ）
 t2office:{bpm:104,f(a,o,s,t,d){const bar=s>>3,ch=[[53,57,60,64],[50,53,57,60],[55,58,62,65],[48,52,55,58]][bar];
  if(s%4===0||s%8===3)ch.forEach(n=>I.vib(a,o,n,t,.012,1.2));const bl=[ch[0]-12,0,ch[0]-5,0,ch[0]-12,ch[0]-10,0,ch[0]-7][s%8];if(bl)I.bass(a,o,bl,t,d*.9,.14);
  if(s%2===1)I.hat(a,o,t,.02);if(s%4===2)I.snare(a,o,t,.05);if(s%8===0)I.kick(a,o,t,.35);
  const m={0:72,2:74,3:76,6:79,8:77,10:76,12:74,16:74,18:72,19:70,22:69,24:67,26:69,28:72}[s];if(m)I.piano(a,o,m+12,t,.04)}},
 // 猫田を追いつめる：シンセのファンク
 t2chase:{bpm:128,f(a,o,s,t,d){const r=[41,41,44,46][s>>3];const bl=[r,0,r+12,r,0,r+10,r+12,0][s%8];if(bl)I.bass(a,o,bl,t,d*.6,.17,1);
  I.kick(a,o,t,s%4===0?.6:.0001);if(s%4===2)I.snare(a,o,t,.2);I.hat(a,o,t,s%2?.03:.015);
  if(s%8===2||s%8===5)I.pluck(a,o,r+24+(s%8===5?3:0),t,.05);if(s%16===0)I.organ(a,o,[r+12,r+15,r+19],t,6*d,.02);if(s===31)I.whip(a,o,t,.25)}},
 // 電卓をたたく：ちょこまかした指はじき
 t2calc:{bpm:112,f(a,o,s,t,d){I.tick(a,o,t,s%4===0?2400:1800,.025);const ch=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]][s>>3];if(s%2===0)I.pluck(a,o,ch[(s>>1)%3]+12,t,.05);
  if(s%8===0)I.bass(a,o,ch[0]-12,t,d*3,.12);if(s%8===4)I.bass(a,o,ch[0]-5,t,d*3,.1);if(s===14||s===30)I.bell(a,o,84,t,.025,1)}},
 // 三上とのバトル：エレクトロ
 t2electro:{bpm:132,f(a,o,s,t,d){const ch=[[57,60,64],[53,57,60],[55,59,62],[52,56,59]][s>>3];I.pluck(a,o,ch[s%3]+12,t,.05);if(s%2===0)I.bass(a,o,ch[0]-12,t,d*.9,.17,1);
  if(s%4===0)I.kick(a,o,t,.6);if(s%4===2){I.snare(a,o,t,.18);I.hat(a,o,t,.04)}if(s%8===0)I.pad(a,o,ch.map(n=>n+12),t,8*d,.016,1800);if(s===31)I.whip(a,o,t,.3)}},
 // モデルルームのショールーム：きらびやかなシンセポップ
 t2showroom:{bpm:116,f(a,o,s,t,d){const ch=[[52,56,59,63],[49,52,56,59],[45,49,52,56],[47,51,54,57]][s>>3];
  if(s%8===0)I.pad(a,o,ch.map(n=>n+12),t,8*d,.02,2400);if(s%2===0)I.bass(a,o,ch[0]-12,t,d*.9,.13);if(s%4===0)I.kick(a,o,t,.4);if(s%4===2)I.snare(a,o,t,.08);I.hat(a,o,t,.015);
  const m={0:83,2:80,4:78,6:75,8:76,12:80,16:81,18:78,20:76,22:73,24:75,28:71}[s];if(m)I.bell(a,o,m,t,.03,1)}},
 // 沢井とのバトル：速いドラムンベース
 t2dnb:{bpm:172,f(a,o,s,t,d){const k=[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0][s%16],sn=s%8===4;if(k)I.kick(a,o,t,.6);if(sn)I.snare(a,o,t,.24);I.hat(a,o,t,.02);
  if(s%4===0)I.bass(a,o,[40,40,43,38][s>>3],t,d*3.6,.17,1);if(s%16===0)I.pad(a,o,[52,55,59,62],t,16*d,.018,1600);if(s%8===7)I.pluck(a,o,76,t,.04)}},
 // 黒須の本部：低いシンセのうなりと、時を刻む音
 t2bossin:{bpm:60,f(a,o,s,t,d){I.tick(a,o,t,s%2?1500:1900,.02);if(s%16===0){I.pad(a,o,[37,44],t,16*d,.04,380);I.organ(a,o,[49,52,56],t,16*d,.02)}if(s%8===0)I.kick(a,o,t,.45);if(s===12||s===28)I.bell(a,o,61,t,.05,4)}},
 // 黒須とのボス戦：重いシンセ・リフ
 t2boss:{bpm:150,f(a,o,s,t,d){const bar=s>>3,r=[37,37,33,35][bar],rf=[r,r,r+12,r,r+3,r,r+7,r+6][s%8];I.bass(a,o,rf,t,d*.9,.18,1);I.pluck(a,o,rf+24,t,.03);
  if(s%4===0)I.kick(a,o,t,.65);if(s%4===2)I.snare(a,o,t,.26);I.hat(a,o,t,.03);if(s%8===0)I.organ(a,o,[[61,64,68],[61,64,68],[57,61,64],[59,63,66]][bar],t,7*d,.025);
  const m={0:[73,3],3:[76,1],4:[78,4],8:[76,2],10:[73,2],12:[71,4],16:[69,3],19:[71,1],20:[73,4],24:[76,6]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.06);if(s===31)I.whip(a,o,t,.3)}}
});

/* ---------- 令和の都会デザイン（宅建版だけ）：紺とネオン、半透明のガラスのパネル、角の丸いボタン ---------- */
// 本体のスタイルは body の中にあるので、それより後ろ（body の最後）に足して上書きする
document.body.insertAdjacentHTML('beforeend',`<style>
:root{--ink:#0a0f1f;--panel:rgba(12,18,38,.8);--bone:#eef3ff;--dust:#6f80a8;--blood:#ff4f6d;--gold:#ffd166;--steel:#8fa3c8;--sil:#050814;--neo:#38d6ff;
 --display:"Zen Kaku Gothic New","Hiragino Sans","Yu Gothic",sans-serif}
body{background:var(--ink)}
.btn{border:0;border-radius:14px;background:linear-gradient(135deg,#ff4f6d,#ff8a5b);color:#fff;box-shadow:0 8px 22px rgba(255,79,109,.32);letter-spacing:.06em}
.btn:active{transform:translateY(2px);box-shadow:0 4px 12px rgba(255,79,109,.28)}
.btn.ghost{background:rgba(255,255,255,.06);border:1px solid rgba(190,210,255,.28);color:var(--bone);box-shadow:none;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.btn.mini{border-radius:10px}
/* タイトル */
#s-title .logo{font-family:var(--display);font-weight:900;transform:none;text-shadow:none;letter-spacing:.03em;line-height:1.02;
 background:linear-gradient(180deg,#ffffff 35%,#9fdcff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 16px rgba(56,214,255,.45))}
#s-title .logo .pre{-webkit-text-fill-color:#bff0ff;color:#bff0ff;background:rgba(56,214,255,.12);border:1px solid var(--neo);border-radius:999px;letter-spacing:.3em;padding:3px 10px 3px 16px;font-size:.26em;filter:none}
#s-title .logo small{-webkit-text-fill-color:var(--gold);color:var(--gold);text-shadow:none;font-size:.4em;letter-spacing:.5em;margin-top:12px}
#s-title .logo small::before,#s-title .logo small::after{content:"";display:inline-block;width:24px;height:1px;background:var(--gold);vertical-align:middle;margin:0 10px}
.tagline{color:#cfe0ff}
.title-hero{filter:drop-shadow(0 0 22px rgba(56,214,255,.55))!important}
.rankmini{border-radius:14px}
/* カード・問題・舞台 */
.card{border:1px solid rgba(190,210,255,.22);border-radius:16px;background:var(--panel);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.qtag{border-radius:999px;background:linear-gradient(135deg,#ff4f6d,#ff8a5b)}
.opt{border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(143,163,200,.45);padding:8px 12px!important;font-size:14px!important;line-height:1.45;color:var(--bone)}
.opts.ox .opt{padding:4px!important;font-size:28px!important}
.stage{border:1px solid rgba(190,210,255,.35);border-radius:14px}
.arena{background:linear-gradient(180deg,var(--ink) 80%,rgba(10,15,31,0))}
.panel{border:2px solid rgba(238,243,255,.85);border-radius:10px}
.chap{border-bottom:2px solid var(--neo);text-shadow:0 0 12px rgba(56,214,255,.35)}
.sheet-in{background:linear-gradient(180deg,#141c36,#0a0f1f);border:1px solid rgba(190,210,255,.3);border-bottom:none;border-radius:18px 18px 0 0}
.mute{border-radius:10px;border-color:rgba(190,210,255,.3)}
.btn{border:0!important}.btn.ghost{border:1px solid rgba(190,210,255,.28)!important}
#s-title .logo .pre{display:block;width:max-content;margin:0 auto 10px}
.tagline{background:rgba(12,18,38,.72);border-left:0;border-radius:14px;border:1px solid rgba(56,214,255,.35);text-align:center;color:#d8e8ff;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#koma .cap{background:rgba(8,12,28,.88);border:1px solid rgba(190,210,255,.35);border-left:4px solid var(--neo);border-radius:10px}
.hud{border:1px solid rgba(190,210,255,.3);border-radius:14px}
.chap{border-bottom:2px solid var(--neo)}
.share a{border:1px solid rgba(190,210,255,.35);border-radius:10px;background:rgba(255,255,255,.06)}
.share a.sl{background:#06c755;border-color:#06c755}
</style>`);

/* ---------- 第3話の曲（雨の街の民法ドラマ：ピアノ、チェロ、弦） ---------- */
Object.assign(TR,{
 // 喫茶店の昼：ボサノバ風のピアノ
 t3cafe:{bpm:96,f(a,o,s,t,d){const bar=s>>3,ch=[[57,60,64,67],[55,59,62,65],[53,57,60,64],[52,56,59,62]][bar];
  if([0,3,6].includes(s%8))ch.slice(1).forEach(n=>I.vib(a,o,n,t,.012,1));if(s%8===0||s%8===5)I.bass(a,o,ch[0]-12,t,d*2,.12);if(s%2===1)I.hat(a,o,t,.015);if(s%4===3)I.wood(a,o,t,1200,.05);
  const m={0:76,2:74,3:72,6:71,8:74,10:72,11:71,14:69,16:72,18:71,19:69,22:67,24:68,26:71,28:74}[s];if(m)I.piano(a,o,m,t,.045)}},
 // 沢井とのバトル：ピチカートで追いかける
 t3pizz:{bpm:140,f(a,o,s,t,d){const ch=[[57,60,64],[57,60,64],[53,57,60],[52,56,59]][s>>3];I.pluck(a,o,ch[s%3]+(s%4===3?12:0),t,.06);if(s%2===0)I.bass(a,o,ch[0]-12,t,d*.8,.15);
  if(s%4===0)I.kick(a,o,t,.5);if(s%4===2)I.snare(a,o,t,.15);if(s%8===0)I.cello(a,o,ch[0],t,d*3.6,.05);if(s===31)I.whip(a,o,t,.25)}},
 // 真夜中の訪問者：低いチェロのうなりと心音、不協和なピアノ
 t3threat:{bpm:64,f(a,o,s,t,d){if(s%16===0)I.cello(a,o,s?37:36,t,16*d*.95,.06);if(s%8===0)I.kick(a,o,t,.4);if(s%8===1)I.kick(a,o,t,.22);
  if(s===6||s===22)[61,62].forEach(n=>I.piano(a,o,n,t,.035));if(s===14)I.piano(a,o,67,t,.03);if(s===30)I.piano(a,o,66,t,.03);if(s===24)I.door(a,o,t,.04)}},
 // 猫田とのバトル：刻み続けるチェロとドラム
 t3drive:{bpm:136,f(a,o,s,t,d){const r=[38,38,36,37][s>>3];if(s%2===0)I.cello(a,o,r+(s%4===2?7:0),t,d*.9,.06);I.bass(a,o,r-12,t,d*.8,.14,1);
  if(s%4===0)I.kick(a,o,t,.6);if(s%4===2)I.snare(a,o,t,.22);I.hat(a,o,t,.02);if(s%8===0)I.brass(a,o,r+24,t,d*2,.035);if(s===31)I.whip(a,o,t,.3)}},
 // 雨の夜の部屋：ローファイなピアノと雨音
 t3rain:{bpm:80,f(a,o,s,t,d){if(s%4===0){const n=a.createBufferSource();n.buffer=nbuf(a,4*d);const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=3000;const g=a.createGain();g.gain.value=.012;n.connect(f).connect(g).connect(o);n.start(t)}
  const ch=[[50,53,57,60],[48,52,55,59],[46,50,53,57],[45,49,52,55]][s>>3];if(s%8===0)I.bass(a,o,ch[0]-12,t,d*7,.11);if([0,3,5].includes(s%8))I.piano(a,o,ch[(s%8)%4]+12,t,.04);
  if(s%8===4)I.snare(a,o,t,.04);if(s%8===0)I.kick(a,o,t,.3);const m={8:74,10:72,12:69,24:72,26:71,28:67}[s];if(m)I.vib(a,o,m,t,.02,1.6)}},
 // 三上とのバトル：重いビートのヒップホップ
 t3lofi:{bpm:122,f(a,o,s,t,d){const k=[1,0,0,1,0,0,1,0][s%8];if(k)I.kick(a,o,t,.6);if(s%8===4)I.snare(a,o,t,.24);I.hat(a,o,t,s%2?.03:.015);
  const ch=[[50,53,57],[46,50,53],[48,52,55],[45,49,52]][s>>3];if(s%2===0)I.bass(a,o,ch[0]-12,t,d*1.6,.16,1);if(s%4===1)I.piano(a,o,ch[(s>>2)%3]+12,t,.04);if(s===31)I.whip(a,o,t,.25)}},
 // 権藤の登場：法廷ドラマの緊張（時計と弦のトレモロ）
 t3bossin:{bpm:58,f(a,o,s,t,d){I.tick(a,o,t,s%2?1600:2000,.02);if(s%16===0){I.cello(a,o,s?38:39,t,16*d*.95,.055);I.pad(a,o,[50,53,57],t,16*d,.025,700)}
  if(s%8===4)I.piano(a,o,[62,63,62,61][s>>3],t,.04);if(s===0||s===16)I.taiko(a,o,t,.45)}},
 // 権藤とのボス戦：オーケストラ（チェロの刻み、ラッパ、合唱、太鼓）
 t3boss:{bpm:150,f(a,o,s,t,d){const bar=s>>3,r=[38,38,34,36][bar];if(s%2===0)I.cello(a,o,r+[0,7,12,7][(s>>1)%4],t,d*.9,.06);I.bass(a,o,r-12,t,d*.8,.15,1);
  if(s%4===0)I.kick(a,o,t,.6);if(s%4===2){I.snare(a,o,t,.24);I.taiko(a,o,t,.3)}if(s%8===0)I.choir(a,o,[[62,65,69],[62,65,69],[58,62,65],[60,64,67]][bar],t,8*d,.03);
  const m={0:[74,3],3:[77,1],4:[76,4],8:[74,2],10:[72,2],12:[69,4],16:[70,3],19:[72,1],20:[74,4],24:[76,3],27:[77,1],28:[79,4]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.07);if(s===31)I.whip(a,o,t,.3)}}
});

/* ---------- 調査パート（第4話から）：4コマのあと「資料を調べる → 論点を見つける」 ----------
   話データの事件（またはボス）に probe:{intro, docs:[{name,lines:[…],mark:[行番号],note}], issue:{text,opts,ans,exp}} を書くと出る。
   資料を全部開くと「論点を見つける」へ進める。論点をまちがえても命は減らず、ヒントを見て選び直す。 */
document.body.insertAdjacentHTML('beforeend',`<style>
.probe{display:flex;flex-direction:column;gap:10px}
.probe .lead{margin:0;color:#d8e8ff;font-size:14px;line-height:1.6}
.pdocs{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pdoc{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:12px;border-radius:12px;border:1px solid rgba(190,210,255,.35);background:rgba(255,255,255,.06);color:var(--bone);font:700 14px var(--body);cursor:pointer;min-height:64px}
.pdoc small{font-weight:500;font-size:11.5px;color:var(--steel)}
.pdoc.seen{border-color:var(--neo);background:rgba(56,214,255,.1)}
.pdoc.seen small{color:var(--neo)}
.paper{background:#f7f4ec;color:#1b1b22;border-radius:6px;padding:14px 14px 10px;font:500 13.5px/1.7 "Zen Kaku Gothic New",sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35)}
.paper h4{margin:0 0 6px;text-align:center;font-size:15px;letter-spacing:.2em}
.paper p{margin:0;padding:1px 0;border-bottom:1px dashed #cfc8b8}
.paper p.mk{background:linear-gradient(transparent 55%,rgba(255,79,109,.35) 55%);font-weight:700}
.pnote{margin:10px 0 0;color:#d8e8ff;font-size:14px;line-height:1.6;border-left:3px solid var(--neo);padding-left:10px}
.pfound{color:var(--gold);font-weight:700}
#komaBtn:disabled{opacity:.45;box-shadow:none}
</style>`);
function probeStart(c,done){
  const pr=c.probe;if(!pr){done();return}
  closeSheet();show('s-story');
  $('#chapTitle').innerHTML=`<span>${c.chapter[0]}｜調査</span>${c.chapter[1]}`;
  const seen={};const k=$('#koma'),b=$('#komaBtn');
  const draw=()=>{
    const n=pr.docs.filter((d,i)=>seen[i]).length,all=n===pr.docs.length;
    k.innerHTML=`<div class="card probe"><span class="qtag">調査 ― 資料を調べろ</span><p class="lead">${pr.intro}</p><div class="pdocs">${pr.docs.map((d,i)=>`<button class="pdoc${seen[i]?' seen':''}" type="button" data-i="${i}">${d.name}<small>${seen[i]?'調べた':'タップして見る'}</small></button>`).join('')}</div>${all?'<p class="lead pfound">資料はそろった。この事件は、何の問題だ？</p>':''}</div>`;
    $('#komaN').textContent=`資料 ${n} / ${pr.docs.length}`;
    b.textContent=all?'論点を見つける ▶':'資料を全部見よう';b.disabled=!all;
    k.querySelectorAll('.pdoc').forEach(x=>x.onclick=e=>{e.stopPropagation();ac();openDoc(+x.dataset.i)});
  };
  const openDoc=i=>{
    const d=pr.docs[i],f=openSheet();seen[i]=1;
    f.innerHTML=`<div class="paper"><h4>${d.name}</h4>${d.lines.map((t,j)=>`<p class="${(d.mark||[]).includes(j)?'mk':''}">${t}</p>`).join('')}</div>${d.note?`<p class="pnote">${d.note}</p>`:''}`;
    if(d.note)narrate(d.note);
    const x=document.createElement('button');x.className='btn';x.type='button';x.textContent='閉じる';x.onclick=()=>{stopSay();closeSheet();draw()};f.appendChild(x);
  };
  draw();narrate(pr.intro.replace(/<[^>]+>/g,''));
  k.onclick=null;
  b.onclick=()=>{ac();if(b.disabled)return;stopSay();probeIssue(c,done)};
}
function probeIssue(c,done){
  const q=c.probe.issue,k=$('#koma'),b=$('#komaBtn');
  $('#komaN').textContent='論点';b.disabled=true;b.textContent='論点を選べ';
  k.innerHTML=`<div class="card probe"><span class="qtag">論点を見つける</span><p class="qtext">${q.text}</p><div class="opts">${q.opts.map((t,i)=>`<button class="opt" type="button" data-i="${i}">${t}</button>`).join('')}</div></div>`;
  k.querySelectorAll('.opt').forEach(x=>x.onclick=e=>{e.stopPropagation();ac();const i=+x.dataset.i,ok=i===q.ans,f=openSheet();
    if(ok){x.classList.add('right');k.querySelectorAll('.opt').forEach(y=>y.disabled=true);
      f.innerHTML=`<div class="verdict ok">論点、発見！</div><p>${q.exp}</p>`;
      const n=document.createElement('button');n.className='btn';n.type='button';n.textContent=c.type==='boss'?'ボスに挑む ▶':'事件を裁く ▶';n.onclick=()=>{closeSheet();b.disabled=false;done()};f.appendChild(n)}
    else{x.classList.add('wrong');x.disabled=true;
      f.innerHTML=`<div class="verdict ng">ちがう。資料をもう一度思い出せ。</div><p>${q.hint||'印の付いた行に、手がかりがある。'}</p>`;
      const n=document.createElement('button');n.className='btn';n.type='button';n.textContent='選び直す';n.onclick=closeSheet;f.appendChild(n)}
  });
}
startCase=function(){const c=EP;BGM.play(c.bgm);story(c.chapter,c.panels,()=>c.probe?probeStart(c,()=>battle(c)):battle(c),c.wb)};
bossStart=function(){BGM.play(EP.bgm);story(EP.chapter,EP.panels,()=>EP.probe?probeStart(EP,bossBattle):bossBattle(),EP.wb)};
// 前の話の調査で「次へ」ボタンを止めたままにしない
(function(){const st=story;story=function(...a){const b=$('#komaBtn');if(b)b.disabled=false;return st.apply(this,a)}})();

/* ---------- 第4話の登場人物 ---------- */
Object.assign(SIL,{
// 綾：商店街で美容室を営む若い店主
aya:mk(`<path d="${B.slim}" fill="#d9a441"/>${SHD(B.slim)}<path d="M30 160V106h40v54Z" fill="#2a2d38"/><path d="M30 106h40" fill="none"/><path d="M40 74q10 8 20 0" fill="none" stroke="#8a6a2a" stroke-width="2"/><path d="M66 112l12-14M70 116l12-14" stroke="#9aa3ab" stroke-width="2.4" fill="none"/><circle cx="64" cy="116" r="3" fill="none" stroke="#9aa3ab" stroke-width="1.8"/><circle cx="68" cy="120" r="3" fill="none" stroke="#9aa3ab" stroke-width="1.8"/>${NECK(52,12)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M34 42C30 22 42 15 52 16C63 17 70 26 66 42C64 34 60 30 56 28C50 32 42 32 36 30C35 34 34 38 34 42Z" fill="#7a3a2a"/><path d="M63 24c8 2 10 10 6 16" fill="none" stroke="#7a3a2a" stroke-width="5"/><ellipse cx="44" cy="42" rx="2.3" ry="2.8" fill="${O}" stroke="none"/><ellipse cx="56" cy="42" rx="2.3" ry="2.8" fill="${O}" stroke="none"/><circle cx="45" cy="41" r=".9" fill="#fff" stroke="none"/><circle cx="57" cy="41" r=".9" fill="#fff" stroke="none"/><path d="M46 50q4 2 8 0" fill="none" stroke-width="1.6"/><circle cx="36" cy="47" r="1.8" fill="#38d6ff" stroke="none"/>`),
// 鬼頭：黒鍵商会の地上げ屋。紫のシャツに金の鎖、角刈り
kito:mk(`<path d="${B.coat}" fill="#2a1f2e"/>${SHD(B.coat)}<path d="M36 64L50 110L64 64Z" fill="#6a2a8a"/><path d="M38 66q12 18 24 0" fill="none" stroke="#d9a441" stroke-width="2.6"/><circle cx="50" cy="79" r="3" fill="#d9a441" stroke="none"/><path d="M30 112h14M56 112h14" stroke="#3a2f40" stroke-width="2" fill="none"/>${NECK(46,16)}<ellipse cx="50" cy="38" rx="17" ry="18" fill="${SK}"/><path d="M33 30V18h34v12C60 24 40 24 33 30Z" fill="#151216"/><path d="M38 33l9 3M62 33l-9 3" stroke-width="2.8" fill="none"/><path d="M40 39h7M53 39h7" stroke-width="2.4" fill="none"/><path d="M42 50q8 3 16-1" fill="none" stroke-width="2"/><path d="M60 42l4 10" stroke="#a0302a" stroke-width="1.6" fill="none"/><path d="M30 36q-4 4 0 8M70 36q4 4 0 8" fill="${SK}"/>`)
});
Object.assign(NAMES,{aya:'綾',kito:'鬼頭'});
Object.assign(VP,{aya:{p:1.35,r:1.08,g:'f',i:1},kito:{p:.05,r:.62,g:'m',i:2}});

/* ---------- 第4話の曲（下町の商店街と地上げ：アコーディオン風の和音、口笛、和太鼓、ブラス） ---------- */
Object.assign(TR,{
 // 商店街の昼：のんびりした口笛とアコーディオン風のオルガン、木の打楽器
 t4street:{bpm:104,f(a,o,s,t,d){const ch=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]][s>>3];if(s%4===0)I.organ(a,o,ch,t,d*1.6,.02);if(s%4===2)I.organ(a,o,ch.map(n=>n+12),t,d*.8,.012);
  if(s%4===0)I.bass(a,o,ch[0]-12,t,d*1.6,.12);if(s%4===2)I.bass(a,o,ch[2]-24,t,d*1.2,.1);if(s%2===1)I.wood(a,o,t,1400,.04);
  const m={0:[72,2],2:[74,2],4:[76,4],8:[74,2],10:[72,2],12:[69,4],16:[72,2],18:[71,2],20:[69,2],22:[67,2],24:[71,6]}[s];if(m)I.whistle(a,o,m[0],t,m[1]*d,.06)}},
 // 手下・赤井とのバトル：和太鼓とうなるベース
 t4clash:{bpm:142,f(a,o,s,t,d){const r=[40,40,43,38][s>>3];if(s%2===0)I.bass(a,o,r-12+(s%8===6?7:0),t,d*.8,.17,1);if([0,3,6].includes(s%8))I.taiko(a,o,t,.45);if(s%4===2)I.snare(a,o,t,.2);I.hat(a,o,t,.018);
  if(s%8===0)I.brass(a,o,r+24,t,d*1.5,.05);if(s%8===4)I.brass(a,o,r+27,t,d,.04);if(s===31)I.whip(a,o,t,.3)}},
 // 夕暮れの美容室：ハープの分散和音と、やさしいピアノ
 t4dusk:{bpm:84,f(a,o,s,t,d){const ch=[[57,60,64,69],[53,57,60,65],[55,59,62,67],[52,56,59,64]][s>>3];I.harp(a,o,ch[s%4]+(s%8>3?12:0),t,d*2,.03);if(s%8===0)I.bass(a,o,ch[0]-12,t,d*7,.1);
  const m={2:76,6:74,10:72,14:71,18:72,22:74,26:76,30:79}[s];if(m)I.piano(a,o,m,t,.04)}},
 // 顧問・堀とのバトル：はねるファンクのブラス
 t4funk:{bpm:118,f(a,o,s,t,d){const k=[1,0,0,1,0,1,0,0][s%8];if(k)I.kick(a,o,t,.55);if(s%8===4)I.snare(a,o,t,.24);I.hat(a,o,t,s%2?.03:.016);
  const r=[45,45,48,43][s>>3];if([0,3,5,7].includes(s%8))I.bass(a,o,r-12+(s%8===7?12:0),t,d*.7,.17,1);if(s%8===2)I.brass(a,o,r+24,t,d*.6,.05);if(s%8===6)I.brass(a,o,r+28,t,d*.6,.045)}},
 // 古い長屋の夜：すきま風と、ゆっくり鳴る琴
 t4nagaya:{bpm:66,f(a,o,s,t,d){if(s%16===0)I.pad(a,o,[45,52,57],t,16*d,.022,600);if(s%8===0)I.bass(a,o,33,t,d*7,.1);
  const m={0:69,3:72,6:71,8:69,16:67,19:69,22:64,24:62}[s];if(m)I.koto(a,o,m,t,.08);if(s===12||s===28)I.bell(a,o,81,t,.025,3)}},
 // 沢井とのバトル：速いスネアと口笛の追いかけっこ
 t4run:{bpm:156,f(a,o,s,t,d){const r=[50,50,48,45][s>>3];if(s%2===0)I.bass(a,o,r-12,t,d*.7,.16,1);if(s%4===0)I.kick(a,o,t,.6);I.snare(a,o,t,s%4===2?.22:.05);
  const m={0:74,2:77,4:79,6:77,8:74,10:72,12:69,16:72,18:74,20:77,24:81,28:79}[s];if(m)I.whistle(a,o,m,t,d*1.6,.05);if(s===31)I.whip(a,o,t,.3)}},
 // 鬼頭の登場：重い太鼓と、低い金管のうなり
 t4kitoin:{bpm:56,f(a,o,s,t,d){if(s%8===0)I.taiko(a,o,t,.6);if(s%8===3)I.taiko(a,o,t,.3);if(s%16===0)I.brass(a,o,[38,37][s>>4],t,14*d,.05);if(s%16===0)I.pad(a,o,[50,53,56],t,16*d,.02,600);if(s===24)I.clank(a,o,t,.08)}},
 // 鬼頭とのボス戦：和太鼓の連打、ブラス、合唱
 t4kito:{bpm:152,f(a,o,s,t,d){const bar=s>>3,r=[40,40,36,38][bar];if(s%2===0)I.bass(a,o,r-12+[0,0,7,12][(s>>1)%4],t,d*.8,.17,1);if(s%4===0)I.kick(a,o,t,.6);if(s%2===1)I.taiko(a,o,t,.22);if(s%4===2)I.snare(a,o,t,.24);
  if(s%8===0)I.choir(a,o,[[64,67,71],[64,67,71],[60,64,67],[62,66,69]][bar],t,8*d,.03);const m={0:[76,2],2:[79,2],4:[83,4],8:[81,2],10:[79,2],12:[76,4],16:[72,3],19:[74,1],20:[76,4],24:[78,4],28:[79,4]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.07);if(s===31)I.whip(a,o,t,.3)}}
});

/* ---------- 第5話・第6話の登場人物 ---------- */
Object.assign(SIL,{
// 源造：南の祖父。ひだまり不動産の創業者。白髪、作務衣に丸めがね
genzo:mk(`<path d="${B.wide}" fill="#3e4a5a"/>${SHD(B.wide)}<path d="M38 70L50 104L62 70" fill="none" stroke="#2a3340" stroke-width="2.4"/><path d="M28 116h44" stroke="#2a3340" stroke-width="3" fill="none"/>${NECK(50,14)}<ellipse cx="50" cy="40" rx="15" ry="17" fill="${SK}"/><path d="M35 34C34 22 42 18 50 18C58 18 66 22 65 34C60 28 40 28 35 34Z" fill="#e8e6e0"/><path d="M34 38q-3 8 2 12M66 38q3 8-2 12" fill="#e8e6e0"/><circle cx="44" cy="41" r="4.6" fill="none" stroke-width="1.6"/><circle cx="56" cy="41" r="4.6" fill="none" stroke-width="1.6"/><path d="M48.6 41h2.8" stroke-width="1.4"/><circle cx="44" cy="41" r="1.4" fill="${O}" stroke="none"/><circle cx="56" cy="41" r="1.4" fill="${O}" stroke="none"/><path d="M44 51q6 3 12 0" fill="none" stroke-width="1.6"/><path d="M40 50q10 8 20 0" fill="none" stroke="#e8e6e0" stroke-width="2.4"/>`),
// 蛇沼：黒鍵の土地転がし。白いスーツに蛇柄のネクタイ、細い目
janu:mk(`<path d="${B.slim}" fill="#e8e2d6"/>${SHD(B.slim)}<path d="M40 70l10 10 10-10" fill="none"/><path d="M50 80l-4 6 3 34 1 3 1-3 3-34z" fill="#3f7a3a"/><path d="M47 92h6M47 102h6M47 112h6" stroke="#1d3a1a" stroke-width="1.4"/><path d="M28 104h10M62 104h10" stroke="#b8b0a0" stroke-width="1.4" fill="none"/>${NECK(52,12)}<ellipse cx="50" cy="38" rx="13" ry="17" fill="${SK}"/><path d="M36 30C35 18 44 14 52 15C61 16 66 22 64 30C58 24 48 24 42 26C40 27 38 28 36 30Z" fill="#2a2a2a"/><path d="M40 39l8-1M60 39l-8-1" stroke-width="2.2" fill="none"/><path d="M42 48q8 5 17-2" fill="none" stroke-width="1.8"/><path d="M57 47l3-2" stroke-width="1.4"/>`),
// 金森：黒鍵の賃貸管理部長。金ぶちの眼鏡、ベストに懐中時計
kanamori:mk(`<path d="${B.wide}" fill="#4a3a5a"/>${SHD(B.wide)}<path d="M30 160V92h40v68Z" fill="#7a2a3a"/><path d="M50 92v68" stroke="#5a1a2a" fill="none"/><circle cx="50" cy="104" r="1.6" fill="#d9a441" stroke="none"/><circle cx="50" cy="120" r="1.6" fill="#d9a441" stroke="none"/><path d="M50 112q8 4 14 2" stroke="#d9a441" stroke-width="1.6" fill="none"/><circle cx="64" cy="114" r="3.4" fill="#d9a441" stroke="none"/>${NECK(50,14)}<ellipse cx="50" cy="38" rx="16" ry="17" fill="${SK}"/><path d="M34 34C33 20 42 16 50 16C58 16 67 20 66 34C62 28 56 26 50 26C44 26 38 28 34 34Z" fill="#3a2e24"/><rect x="38" y="35" width="10" height="7" rx="2" fill="none" stroke="#d9a441" stroke-width="1.6"/><rect x="52" y="35" width="10" height="7" rx="2" fill="none" stroke="#d9a441" stroke-width="1.6"/><path d="M48 38h4" stroke="#d9a441" stroke-width="1.4"/><circle cx="43" cy="39" r="1.3" fill="${O}" stroke="none"/><circle cx="57" cy="39" r="1.3" fill="${O}" stroke="none"/><path d="M42 49q8 4 16 0" fill="none" stroke-width="1.8"/><path d="M40 47q10-3 20 0" fill="none" stroke="#3a2e24" stroke-width="2.4"/>`)
});
Object.assign(NAMES,{genzo:'源造',janu:'蛇沼',kanamori:'金森'});
Object.assign(VP,{genzo:{p:.5,r:.7,g:'m',i:2},janu:{p:.9,r:1.12,g:'m',i:3},kanamori:{p:.3,r:.8,g:'m',i:1}});
Object.assign(PROPS,{
 keiji:{vb:[120,110],s:.46,svg:PROP_S(`<path d="M30 70v38M90 70v38" stroke="#4a3220" stroke-width="5"/><rect x="6" y="6" width="108" height="66" rx="3" fill="#f4ecdc"/><text x="60" y="24" text-anchor="middle" font-size="13" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">お知らせ</text><text x="60" y="42" text-anchor="middle" font-size="10" font-weight="700" fill="${O}" stroke="none" font-family="sans-serif">建物は火事で滅失</text><text x="60" y="58" text-anchor="middle" font-size="10" font-weight="700" fill="#c22d22" stroke="none" font-family="sans-serif">ここに建て直します</text>`)},
 fire:{vb:[120,110],s:.5,svg:PROP_S(`<path d="M18 108V58l42-30 42 30v50Z" fill="#2a1a14"/><path d="M60 6c18 22 34 30 30 58c-2 16-14 28-30 28s-28-12-30-28c-3-22 12-30 18-46c4 10 6 16 12 20c2-12-2-22 0-32z" fill="#ff7a2a" stroke="#c22d22"/><path d="M60 46c8 10 14 16 12 28c-2 8-6 12-12 12s-10-4-12-12c-1-8 4-12 6-18c2 4 4 6 6 8c1-6-1-12 0-18z" fill="#ffd166" stroke="none"/>`)},
 apart:{vb:[120,110],s:.52,svg:PROP_S(`<rect x="10" y="20" width="100" height="88" fill="#d8d2c4"/><path d="M6 20h108" stroke-width="3"/><path d="M10 50h100M10 80h100" stroke="#9a9284" stroke-width="2"/><g fill="#9fd0f0"><rect x="20" y="28" width="16" height="14"/><rect x="52" y="28" width="16" height="14"/><rect x="84" y="28" width="16" height="14"/><rect x="20" y="58" width="16" height="14"/><rect x="52" y="58" width="16" height="14"/><rect x="84" y="58" width="16" height="14"/></g><rect x="52" y="86" width="16" height="22" fill="#8a5a32"/><text x="60" y="15" text-anchor="middle" font-size="10" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">黒鍵ハイツ</text>`)}
});

/* ---------- 第5話の曲（借地と火事：琴と三味線風、和太鼓、炎のブラス） ---------- */
Object.assign(TR,{
 // 古い商店街の朝：琴の旋律と、ゆったりしたベース
 t5morning:{bpm:92,f(a,o,s,t,d){const ch=[[57,60,64],[55,59,62],[53,57,60],[52,57,59]][s>>3];if(s%8===0)I.pad(a,o,ch.map(n=>n+12),t,8*d,.018,800);if(s%4===0)I.bass(a,o,ch[0]-12,t,d*3,.11);
  const m={0:76,2:79,4:81,6:79,8:76,12:74,16:72,18:74,20:76,24:69,28:71}[s];if(m)I.koto(a,o,m,t,.08);if(s%8===6)I.wood(a,o,t,1100,.04)}},
 // 三上とのバトル：三味線風のはじきと速い太鼓
 t5shami:{bpm:146,f(a,o,s,t,d){const r=[45,45,43,40][s>>3];I.twang(a,o,r+[12,19,24,19][s%4],t,.07);if(s%2===0)I.bass(a,o,r-12,t,d*.8,.15,1);if([0,3,6].includes(s%8))I.taiko(a,o,t,.4);if(s%4===2)I.snare(a,o,t,.16);if(s===31)I.whip(a,o,t,.3)}},
 // 新居の土地：明るいギター風のはじきと口笛
 t5plot:{bpm:112,f(a,o,s,t,d){const ch=[[60,64,67],[65,69,72],[67,71,74],[60,64,67]][s>>3];I.pluck(a,o,ch[s%3]+(s%6===5?12:0),t,.05);if(s%4===0)I.bass(a,o,ch[0]-12,t,d*1.8,.12);if(s%4===2)I.hat(a,o,t,.02);
  const m={0:[72,2],2:[76,2],4:[79,4],8:[77,2],10:[76,2],12:[74,4],16:[76,2],18:[77,2],20:[79,4],24:[84,6]}[s];if(m)I.whistle(a,o,m[0],t,m[1]*d,.05)}},
 // 沢井とのバトル：跳ねるスネアとベース
 t5bounce:{bpm:150,f(a,o,s,t,d){const r=[48,48,53,55][s>>3];if(s%2===0)I.bass(a,o,r-12+(s%8===6?12:0),t,d*.7,.16,1);if(s%4===0)I.kick(a,o,t,.55);if(s%4===2)I.snare(a,o,t,.22);I.hat(a,o,t,.02);if(s%8===4)I.brass(a,o,r+24,t,d*.8,.045);if(s===31)I.whip(a,o,t,.3)}},
 // 地主の屋敷：静かなオルガンと時計の音
 t5estate:{bpm:70,f(a,o,s,t,d){I.tick(a,o,t,s%2?1500:1900,.018);if(s%16===0)I.organ(a,o,[50,57,62,65],t,16*d*.95,.022);if(s%8===4)I.bell(a,o,[74,72,69,67][s>>3],t,.03,2.5)}},
 // 猫田とのバトル：低いシンセのうなりと四つ打ち
 t5synth:{bpm:132,f(a,o,s,t,d){if(s%4===0)I.kick(a,o,t,.6);if(s%4===2)I.hat(a,o,t,.04);if(s%8===4)I.snare(a,o,t,.2);const r=[41,41,44,39][s>>3];I.bass(a,o,r-12+(s%2?12:0),t,d*.6,.15,1);if(s%8===0)I.pad(a,o,[r+12,r+15,r+19],t,8*d,.025,1200)}},
 // 火事の夜：鐘とサイレン、低いうなり
 t5fire:{bpm:60,f(a,o,s,t,d){if(s===0)I.siren(a,o,t,16*d,.02);if(s%8===0)I.bell(a,o,[62,61][s>>4],t,.05,3.5);if(s%16===0)I.cello(a,o,[38,37][s>>4],t,16*d*.95,.06);if(s%8===4)I.taiko(a,o,t,.3)}},
 // 蛇沼とのボス戦：和太鼓の連打、炎のブラス、合唱
 t5boss:{bpm:154,f(a,o,s,t,d){const bar=s>>3,r=[45,45,41,43][bar];if(s%2===0)I.bass(a,o,r-12+[0,7,12,7][(s>>1)%4],t,d*.8,.17,1);if(s%4===0)I.kick(a,o,t,.6);if(s%2===1)I.taiko(a,o,t,.22);if(s%4===2)I.snare(a,o,t,.24);
  if(s%8===0)I.choir(a,o,[[69,72,76],[69,72,76],[65,69,72],[67,71,74]][bar],t,8*d,.03);const m={0:[81,2],2:[79,2],4:[76,4],8:[77,2],10:[79,2],12:[81,4],16:[77,3],19:[76,1],20:[74,4],24:[76,4],28:[79,4]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.07);if(s===31)I.whip(a,o,t,.3)}}
});

/* ---------- 第6話の曲（アパートと敷金：ローファイ、ゲーム音楽風、管理会社の冷たいテクノ） ---------- */
Object.assign(TR,{
 // 引っ越しの日：ローファイのピアノと、ゆるいビート
 t6move:{bpm:86,f(a,o,s,t,d){const ch=[[52,55,59,62],[57,60,64,67],[50,53,57,60],[55,59,62,65]][s>>3];if(s%8===0||s%8===5)ch.slice(1).forEach(n=>I.vib(a,o,n,t,.011,1.2));if(s%8===0)I.kick(a,o,t,.35);if(s%8===4)I.snare(a,o,t,.05);if(s%2===1)I.hat(a,o,t,.014);
  if(s%4===0)I.bass(a,o,ch[0]-12,t,d*3,.11);const m={2:74,6:71,10:76,14:74,18:72,22:69,26:71,30:67}[s];if(m)I.piano(a,o,m,t,.04)}},
 // 赤井とのバトル：8ビット風の電子音
 t6chip:{bpm:150,f(a,o,s,t,d){const r=[57,57,53,55][s>>3];I.pluck(a,o,r+[0,12,7,12][s%4],t,.05);if(s%2===0)I.bass(a,o,r-24,t,d*.7,.15,1);if(s%4===0)I.kick(a,o,t,.5);if(s%4===2)I.snare(a,o,t,.15);if(s===31)I.whip(a,o,t,.25)}},
 // 雨漏りの部屋：水滴のような高い音と、ゆっくりしたハープ
 t6drip:{bpm:72,f(a,o,s,t,d){if([0,5,11].includes(s%16))I.pluck(a,o,[88,91,86][s%3],t,.03);const ch=[[53,57,60],[50,53,57],[48,52,55],[52,55,59]][s>>3];if(s%2===0)I.harp(a,o,ch[(s>>1)%3]+12,t,d*2,.025);if(s%8===0)I.bass(a,o,ch[0]-12,t,d*7,.09)}},
 // 三上とのバトル：はねるギター風とドラム
 t6rock:{bpm:144,f(a,o,s,t,d){const r=[40,40,43,45][s>>3];I.bass(a,o,r-12,t,d*.7,.16,1);if(s%2===0)I.twang(a,o,r+12+(s%4===2?7:0),t,.06);if(s%4===0)I.kick(a,o,t,.6);if(s%4===2)I.snare(a,o,t,.24);I.hat(a,o,t,.02);if(s===31)I.whip(a,o,t,.3)}},
 // 黒鍵ハイツ：管理会社の冷たいテクノ
 t6office:{bpm:120,f(a,o,s,t,d){if(s%4===0)I.kick(a,o,t,.4);if(s%2===1)I.tick(a,o,t,2400,.025);const r=[45,45,48,43][s>>3];if(s%2===0)I.bass(a,o,r-12,t,d*.9,.12);if(s%8===0)I.pad(a,o,[r+12,r+19,r+24],t,8*d,.02,1400);if(s%8===6)I.pluck(a,o,r+31,t,.03)}},
 // 猫田とのバトル：速いブレイクビーツ
 t6break:{bpm:164,f(a,o,s,t,d){const k=[1,0,0,1,0,0,1,0][s%8];if(k)I.kick(a,o,t,.6);if(s%8===4||s%8===7)I.snare(a,o,t,.22);I.hat(a,o,t,.025);const r=[38,38,41,36][s>>3];if(s%2===0)I.bass(a,o,r-12,t,d*.7,.16,1);if(s%8===0)I.brass(a,o,r+24,t,d*1.2,.04);if(s===31)I.whip(a,o,t,.3)}},
 // 金森の登場：時計の針と、冷たい鐘
 t6kanain:{bpm:58,f(a,o,s,t,d){I.tick(a,o,t,s%2?1700:2100,.02);if(s%16===0)I.pad(a,o,[45,48,52,55],t,16*d,.024,700);if(s%8===0)I.bell(a,o,[81,80,79,78][s>>3],t,.035,3);if(s===0||s===16)I.taiko(a,o,t,.4)}},
 // 金森とのボス戦：重いテクノとオーケストラ
 t6boss:{bpm:148,f(a,o,s,t,d){const bar=s>>3,r=[45,45,41,40][bar];if(s%4===0)I.kick(a,o,t,.65);if(s%4===2)I.snare(a,o,t,.24);I.hat(a,o,t,.025);I.bass(a,o,r-12+(s%2?12:0),t,d*.6,.16,1);
  if(s%8===0)I.choir(a,o,[[69,72,76],[69,72,76],[65,69,72],[64,68,71]][bar],t,8*d,.03);if(s%2===0)I.cello(a,o,r+12,t,d*.9,.04);const m={0:[76,3],3:[77,1],4:[81,4],8:[79,2],10:[77,2],12:[76,4],16:[72,3],19:[74,1],20:[77,4],24:[76,4],28:[80,4]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.07);if(s===31)I.whip(a,o,t,.3)}}
});
