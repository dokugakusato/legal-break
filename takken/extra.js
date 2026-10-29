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
