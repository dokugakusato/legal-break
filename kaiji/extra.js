/* KAIJI HUNTER（海事代理士版）だけの部分。ゲーム本体（index.html）のあとに読み込まれる。
   夕暮れの海と港の背景・海事代理士版の登場人物・小道具・曲・タイトル画面のデザインをここで足す。
   人物・海賊団・船・役所の名前はすべて架空。 */

/* ---------- 夕暮れの海の背景（灯台・海賊船・桟橋） ---------- */
function drawSea(c){
  const r=rnd(31),hz=H*.62;
  // 空
  let g=c.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#061226');g.addColorStop(.45,'#1d2a55');g.addColorStop(.78,'#7a3a52');g.addColorStop(1,'#f08a4b');c.fillStyle=g;c.fillRect(0,0,W,hz);
  // 星
  c.fillStyle='rgba(255,246,220,.7)';for(let i=0;i<40;i++){const x=r()*W,y=r()*hz*.45,s=r()*1.3+.3;c.fillRect(x,y,s,s)}
  // 沈む夕日
  g=c.createRadialGradient(W*.58,hz,0,W*.58,hz,H*.26);g.addColorStop(0,'rgba(255,214,130,.95)');g.addColorStop(.3,'rgba(250,150,80,.55)');g.addColorStop(1,'rgba(250,150,80,0)');c.fillStyle=g;c.fillRect(0,0,W,hz);
  c.fillStyle='#ffd27a';c.beginPath();c.arc(W*.58,hz,Math.max(16,H*.05),Math.PI,0);c.fill();
  // 海
  g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,'#2a3a66');g.addColorStop(.35,'#122348');g.addColorStop(1,'#040a18');c.fillStyle=g;c.fillRect(0,hz,W,H-hz);
  // 夕日の光の道
  for(let i=0;i<26;i++){const y=hz+4+i*i*.5,w=(10+i*5)*(.5+r());c.fillStyle=`rgba(255,200,120,${.42-i*.014})`;c.fillRect(W*.58-w/2+(r()-.5)*i*3,y,w,1.6)}
  // 波の線
  c.strokeStyle='rgba(160,200,255,.18)';c.lineWidth=1.2;for(let i=0;i<30;i++){const x=r()*W,y=hz+12+r()*(H-hz)*.8,w=14+r()*40;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+w/2,y-3,x+w,y);c.stroke()}
  // 遠くの島と港町
  c.fillStyle='#160f22';c.beginPath();c.moveTo(W*.68,hz);c.quadraticCurveTo(W*.8,hz-H*.05,W*.95,hz-H*.02);c.lineTo(W,hz-H*.015);c.lineTo(W,hz);c.fill();
  // 灯台の岬（左）
  const lx=W*.13,lb=hz+H*.02,lh=H*.2;
  c.fillStyle='#0a0710';c.beginPath();c.moveTo(0,hz+H*.05);c.lineTo(0,hz-H*.03);c.quadraticCurveTo(W*.1,hz-H*.05,W*.24,hz+H*.02);c.lineTo(W*.3,hz+H*.06);c.fill();
  c.fillStyle='#d8d2c4';c.beginPath();c.moveTo(lx-10,lb-H*.04);c.lineTo(lx-6,lb-lh);c.lineTo(lx+6,lb-lh);c.lineTo(lx+10,lb-H*.04);c.fill();
  c.fillStyle='#b8302a';c.fillRect(lx-8.4,lb-lh*.62,16.8,lh*.1);c.fillRect(lx-7.2,lb-lh*.86,14.4,lh*.08);
  c.fillStyle='#1a1420';c.fillRect(lx-9,lb-lh-12,18,12);c.beginPath();c.moveTo(lx-10,lb-lh-12);c.lineTo(lx,lb-lh-22);c.lineTo(lx+10,lb-lh-12);c.fill();
  c.save();c.globalCompositeOperation='lighter';g=c.createLinearGradient(lx,0,W*.6,0);g.addColorStop(0,'rgba(255,240,180,.35)');g.addColorStop(1,'rgba(255,240,180,0)');c.fillStyle=g;
  c.beginPath();c.moveTo(lx,lb-lh-6);c.lineTo(W*.62,lb-lh-H*.09);c.lineTo(W*.62,lb-lh+H*.05);c.fill();c.restore();
  c.fillStyle='#fff3c0';c.beginPath();c.arc(lx,lb-lh-6,4,0,Math.PI*2);c.fill();
  // 海賊船（右の沖）
  const sx=W*.8,sy=hz+H*.03,sc=Math.max(.7,Math.min(1.3,H/700));
  c.save();c.translate(sx,sy);c.scale(sc,sc);c.fillStyle='#07050b';
  c.beginPath();c.moveTo(-70,-6);c.lineTo(70,-10);c.lineTo(56,10);c.lineTo(-58,10);c.fill();c.fillRect(-72,-16,20,10);
  c.fillRect(-2,-96,4,88);c.fillRect(-40,-78,3,70);c.fillRect(34,-70,3,62);
  for(const [x,y,w,hh] of [[-34,-86,64,34],[-34,-48,64,30],[-62,-70,46,26],[18,-62,42,26]]){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+w/2,y+6,x+w,y);c.lineTo(x+w-3,y+hh);c.quadraticCurveTo(x+w/2,y+hh+8,x+3,y+hh);c.fill()}
  c.fillRect(2,-104,18,10);c.restore();
  // 手前の桟橋
  const pl=H*.86;g=c.createLinearGradient(0,pl,0,H);g.addColorStop(0,'#3a2618');g.addColorStop(1,'#140c08');c.fillStyle=g;c.fillRect(0,pl,W,H-pl);
  c.strokeStyle='rgba(10,6,4,.7)';c.lineWidth=1.4;for(let x=0;x<W;x+=Math.max(36,W/14)){c.beginPath();c.moveTo(x,pl);c.lineTo(x-10,H);c.stroke()}
  c.fillStyle='#24170e';for(const x of [W*.06,W*.94]){c.fillRect(x-7,pl-H*.07,14,H*.07+4);c.fillStyle='#120a06';c.fillRect(x-9,pl-H*.075,18,6);c.fillStyle='#24170e'}
  // しぶき
  dust=Array.from({length:44},()=>({x:Math.random()*W,y:hz+Math.random()*(H-hz),v:.15+Math.random()*.4,s:.6+Math.random()*1.4,ph:Math.random()*6}));
  weed=null;
}
(function(){
  const base=drawStatic;
  drawStatic=function(){
    if(WORLD&&WORLD!=='sea')return base();
    const dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;
    stat=document.createElement('canvas');stat.width=W*dpr;stat.height=H*dpr;const c=stat.getContext('2d');c.scale(dpr,dpr);drawSea(c);
  };
  const sw=setWorld;
  setWorld=function(w){sw(w);document.body.classList.toggle('w-sea',!w||w==='sea')};
  document.body.classList.add('w-sea');
  drawStatic();if(reduce)frame();
})();

/* ---------- 海の見た目（コマ・戦いの舞台） ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
body.w-sea{--dust:#bfe6ff}
body.w-sea .panel{background:linear-gradient(180deg,#0d1a3a 0%,#3a3460 42%,#d9784a 63%,#2a3a66 64%,#0e1c3c 82%,#3a2618 83%,#140c08 100%)}
body.w-sea .panel.bg-dark{background:linear-gradient(180deg,#03060f 0%,#0d1730 62%,#14243f 64%,#060c1a 82%,#24170e 83%,#0a0604 100%)}
body.w-sea .panel.bg-red{background:linear-gradient(180deg,#2a0610 0%,#8a1a2a 52%,#e0504a 64%,#3a0c14 65%,#14050a 100%)}
body.w-sea .panel.bg-out{background:linear-gradient(180deg,#2f7ab8 0%,#9fd6f2 58%,#e8f4fa 63%,#2f6a9a 64%,#164a72 82%,#6a4a2e 83%,#3a2618 100%)}
body.w-sea .stage{background:repeating-linear-gradient(180deg,transparent 0 9px,rgba(160,200,255,.05) 9px 10px),linear-gradient(180deg,#0a1530 0%,#3a3460 50%,#e08050 66%,#22325c 67%,#0a1530 84%,#3a2618 85%,#140c08 100%)}
body.w-sea .kime{background:linear-gradient(180deg,#06203a,#030a14)}
body.w-sea .title-hero,body.w-sea .op-hero{filter:drop-shadow(0 0 18px rgba(255,190,110,.45))}
.op-village .sea{display:none}body.w-sea .op-village .vl{display:none}body.w-sea .op-village .sea{display:block}
</style>`);
// オープニングの港町（灯台・帆船・桟橋の小屋）
$('#op .op-village').insertAdjacentHTML('beforeend',`<svg class="sea" viewBox="0 0 300 120" preserveAspectRatio="xMaxYMax meet"><g fill="#0b0807"><path d="M0 120V96h40v24z"/><path d="M14 96l12-10 12 10z"/><path d="M44 120V88h30v32z"/><path d="M220 120l8-78h10l8 78z"/><path d="M214 42h40v-8l-20-10-20 10z"/><path d="M150 108h66l-8 10h-50z"/><path d="M182 108V58M168 104h28l-14-40z"/><path d="M0 120h300v-4H0z"/></g><path d="M224 70h18v6h-18zM222 92h22v6h-22z" fill="#b8302a"/><circle cx="234" cy="36" r="3" fill="#fff3c0"/><path d="M236 36L300 20v30z" fill="#fff3c0" opacity=".22"/><rect x="50" y="98" width="6" height="7" fill="#e8b45a"/><rect x="62" y="98" width="6" height="7" fill="#e8b45a" opacity=".7"/></svg>`);

/* ---------- 海事代理士版の登場人物 ---------- */
Object.assign(SIL,{
// 汐見（しおみ）：港町で一人だけの海事代理士。白いひげの老人。白い制帽と、書類を入れたカバン
shiomi:mk(`<path d="${B.old}" fill="#1f2c4a"/>${SHD(B.old)}<path d="M36 80L46 104L52 80" fill="#f4f1ea"/><path d="M30 92h10M30 100h10" stroke="#d9a441" stroke-width="2" fill="none"/><circle cx="48" cy="112" r="1.8" fill="#d9a441" stroke="none"/><circle cx="48" cy="126" r="1.8" fill="#d9a441" stroke="none"/><rect x="56" y="104" width="22" height="18" rx="2" fill="#7a5236"/><path d="M60 104q7-7 14 0" fill="none" stroke-width="1.8"/>${NECK(50,14)}<ellipse cx="48" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M34 46c2 14 10 20 14 20s12-6 14-20c-4 4-9 5-14 5s-10-1-14-5z" fill="#f2efe8"/><path d="M40 47q8 3 16 0" fill="none" stroke="#c8c2b8" stroke-width="1.4"/><path d="M30 30c0-10 8-16 18-16s18 6 18 16z" fill="#f4f1ea"/><path d="M28 30h40l-4 5H32z" fill="#14182a"/><path d="M42 22h12" stroke="#d9a441" stroke-width="2.4" fill="none"/><path d="M38 38l7 1M58 38l-7 1" fill="none" stroke="#f2efe8" stroke-width="2.4"/><path d="M41 42h5M51 42h5" stroke-width="2" fill="none"/>`),
// 凪（なぎ）：港の船宿の娘。父の漁船を守りたい
nagi:mk(`<path d="${B.girl}" fill="#f4f1ea"/>${SHD(B.girl)}<path d="M26 160V108h48v52Z" fill="#2c5a8a"/><path d="M30 118h40M30 128h40M30 138h40M30 148h40" stroke="#f4f1ea" stroke-width="3" fill="none"/><path d="M42 80l8 8 8-8" fill="none" stroke="#2c5a8a" stroke-width="3"/>${NECK(54,12)}<ellipse cx="50" cy="42" rx="14" ry="16" fill="${SK}"/><path d="M35 42C33 24 42 19 51 19C61 19 68 26 65 42C62 33 56 29 48 30C42 31 38 36 35 42Z" fill="#2a1a14"/><path d="M36 30c-6 4-8 14-6 22l6-2z" fill="#2a1a14"/><path d="M33 28q17-12 34 0" stroke="#c22d22" stroke-width="4" fill="none"/><ellipse cx="44" cy="44" rx="2.3" ry="2.8" fill="${O}" stroke="none"/><ellipse cx="56" cy="44" rx="2.3" ry="2.8" fill="${O}" stroke="none"/><circle cx="45" cy="43" r=".9" fill="#fff" stroke="none"/><circle cx="57" cy="43" r=".9" fill="#fff" stroke="none"/><path d="M46 52q4 2 8 0" fill="none" stroke-width="1.6"/><ellipse cx="40" cy="49" rx="3" ry="1.6" fill="#e88a7a" opacity=".45" stroke="none"/><ellipse cx="60" cy="49" rx="3" ry="1.6" fill="#e88a7a" opacity=".45" stroke="none"/>`),
// ドクロ丸：鉄錨（てついかり）海賊団の船長。三角帽と眼帯、黒い外套
dokuro:mk(`<path d="${B.boss}" fill="#14121a"/>${SHD(B.boss)}<path d="M34 64L50 112L66 64" fill="#7a1420" stroke="#2c2a31" stroke-width="2.4"/><path d="M14 96l20 6M86 96l-20 6" stroke="#d9a441" stroke-width="2.4" fill="none"/><circle cx="50" cy="122" r="3" fill="#d9a441" stroke="none"/><circle cx="50" cy="138" r="3" fill="#d9a441" stroke="none"/><path d="M50 84v18M42 92h16M44 102q6 6 12 0" stroke="#d9a441" stroke-width="2.2" fill="none"/>${NECK(46,16)}<ellipse cx="50" cy="38" rx="16" ry="18" fill="${SK}"/><path d="M36 48c0 12 6 18 14 18s14-6 14-18c-4 6-9 8-14 8s-10-2-14-8z" fill="#2a1a12"/><path d="M18 26c10-12 54-12 64 0c-6-2-10 2-14 2c-10-12-26-12-36 0c-4 0-8-4-14-2z" fill="#0b0a0f"/><path d="M30 26c4-14 36-14 40 0z" fill="#0b0a0f"/><path d="M44 18h12" stroke="#e8e2d4" stroke-width="2" fill="none"/><path d="M38 32l20 8" stroke="#0b0a0f" stroke-width="2" fill="none"/><ellipse cx="43" cy="38" rx="5" ry="4.4" fill="#0b0a0f"/><path d="M53 35l8 2" stroke-width="2.6" fill="none"/><ellipse cx="57" cy="40" rx="2.2" ry="2.6" fill="${O}" stroke="none"/><path d="M43 52q8 5 15-2" fill="none" stroke-width="1.8"/><path d="M60 44l4 9" stroke="#a0302a" stroke-width="1.6" fill="none"/>`),
// カモメ：鉄錨海賊団の手下。しま模様のシャツと、頭のバンダナ
kamome:mk(`<path d="${B.thug}" fill="#f4f1ea"/>${SHD(B.thug)}<path d="M24 98h52M22 112h56M22 126h56M22 140h56M22 154h56" stroke="#2c4a7a" stroke-width="5" fill="none"/><path d="M40 72l10 10 10-10" fill="#c22d22"/>${NECK(50,14)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M35 34C34 22 42 18 50 18C59 18 66 22 65 34Z" fill="#c22d22"/><path d="M64 30l10 4-8 4" fill="#c22d22"/><circle cx="42" cy="26" r="1.6" fill="#f4f1ea" stroke="none"/><circle cx="54" cy="24" r="1.6" fill="#f4f1ea" stroke="none"/><path d="M40 37l6 2M60 37l-6 2" fill="none" stroke-width="2.2"/><ellipse cx="44" cy="42" rx="2" ry="2.4" fill="${O}" stroke="none"/><ellipse cx="56" cy="42" rx="2" ry="2.4" fill="${O}" stroke="none"/><path d="M43 51q7 4 14-1" fill="none" stroke-width="1.7"/><path d="M47 54h6v3h-6z" fill="#f4f1ea" stroke-width="1"/>`)
});
Object.assign(NAMES,{shiomi:'汐見',nagi:'凪',dokuro:'ドクロ丸',kamome:'カモメ'});
/* ---------- 第2話・第3話の登場人物 ---------- */
Object.assign(SIL,{
// ウツボ：鉄錨海賊団の副船長。細長い体、緑のまだら模様の外套、ぎょろ目
utsubo:mk(`<path d="${B.trick}" fill="#2a4a2a"/>${SHD(B.trick)}<g fill="#1a301a" stroke="none"><ellipse cx="34" cy="120" rx="5" ry="3"/><ellipse cx="60" cy="104" rx="4" ry="3"/><ellipse cx="66" cy="138" rx="5" ry="3"/><ellipse cx="44" cy="146" rx="4" ry="2.6"/></g><path d="M42 70L50 100L58 70" fill="#d9c27a"/>${NECK(50,16)}<ellipse cx="50" cy="38" rx="12" ry="20" fill="#9aa86a"/><path d="M38 30c4-12 20-12 24 0" fill="#2a4a2a"/><circle cx="43" cy="36" r="4.2" fill="#f4f1ea"/><circle cx="57" cy="36" r="4.2" fill="#f4f1ea"/><circle cx="44" cy="37" r="1.8" fill="${O}" stroke="none"/><circle cx="56" cy="37" r="1.8" fill="${O}" stroke="none"/><path d="M42 50q8 6 16 0" fill="#7a1a1a"/><path d="M44 50l2 3 2-3 2 3 2-3 2 3 2-3" fill="#f4f1ea" stroke-width="1"/>`),
// トビウオ：鉄錨海賊団の会計係。羽のような青い袖、丸めがね、そろばん
tobiuo:mk(`<path d="M10 92L30 74L36 120ZM90 92L70 74L64 120Z" fill="#7ab8e0"/><path d="${B.thug}" fill="#2a5a8a"/>${SHD(B.thug)}<path d="M42 72L50 96L58 72" fill="#f4f1ea"/><path d="M50 82v18" stroke="#c22d22" stroke-width="3"/><rect x="30" y="112" width="40" height="18" rx="2" fill="#7a5236"/><path d="M30 121h40" stroke-width="1.4"/><g fill="#f2d28a" stroke="none"><circle cx="36" cy="116" r="2"/><circle cx="44" cy="126" r="2"/><circle cx="52" cy="116" r="2"/><circle cx="60" cy="126" r="2"/><circle cx="66" cy="116" r="2"/></g>${NECK(50,14)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M36 34C35 20 43 16 50 16C58 16 66 20 64 34C60 28 55 26 50 27C45 26 40 28 36 34Z" fill="#1a2a3a"/><circle cx="44" cy="41" r="5" fill="none" stroke-width="1.8"/><circle cx="56" cy="41" r="5" fill="none" stroke-width="1.8"/><path d="M49 41h2" stroke-width="1.6"/><circle cx="44" cy="41" r="1.6" fill="${O}" stroke="none"/><circle cx="56" cy="41" r="1.6" fill="${O}" stroke="none"/><path d="M44 51q6 3 12-1" fill="none" stroke-width="1.6"/><path d="M58 50l3 4" stroke-width="1.2"/>`)
});
Object.assign(NAMES,{utsubo:'ウツボ',tobiuo:'トビウオ'});
Object.assign(VP,{utsubo:{p:1.4,r:.9,g:'m',i:3},tobiuo:{p:1.2,r:1.08,g:'m',i:1}});

// 声が録音されていないときの読み上げ（端末の声）の高さと速さ
Object.assign(VP,{shiomi:{p:.7,r:.86,g:'m',i:1},nagi:{p:1.6,r:1.12,g:'f',i:2},dokuro:{p:.2,r:.74,g:'m',i:0},kamome:{p:1.25,r:1.18,g:'m',i:2}});

/* ---------- 海事代理士版の小道具 ---------- */
Object.assign(PROPS,{
 // 日本の国旗をかかげた旗ざお
 flag:{vb:[90,120],s:.42,svg:PROP_S(`<path d="M14 6v110" stroke="#4a3220" stroke-width="4"/><circle cx="14" cy="6" r="4" fill="#d9a441"/><path d="M16 12h66v44H16z" fill="#f8f6f0"/><circle cx="49" cy="34" r="13" fill="#c22d22" stroke="none"/>`)},
 // 船舶国籍証書（架空の書面）
 cert:{vb:[80,100],s:.32,svg:PROP_S(`<path d="M6 6h68v88H6z" fill="#f4ecdc"/><path d="M10 10h60v80H10z" fill="none" stroke="#d9a441" stroke-width="1.6"/><text x="40" y="27" text-anchor="middle" font-size="11" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">船舶</text><text x="40" y="41" text-anchor="middle" font-size="11" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">国籍証書</text><path d="M18 52h44M18 61h44M18 70h28" stroke-width="1.4"/><circle cx="56" cy="78" r="7" fill="none" stroke="#c22d22" stroke-width="2"/>`)},
 // 海賊船
 pship:{vb:[170,120],s:.5,svg:PROP_S(`<path d="M80 6v84M40 26v64M122 32v58" stroke-width="3"/><path d="M50 14q30 8 60 0v28q-30 8-60 0z" fill="#2a2630"/><path d="M50 50q30 8 60 0v26q-30 8-60 0z" fill="#2a2630"/><path d="M20 34q20 6 40 0v24q-20 6-40 0z" fill="#3a3440"/><path d="M104 40q18 6 36 0v24q-18 6-36 0z" fill="#3a3440"/><path d="M82 4h22v14H82z" fill="#f8f6f0"/><circle cx="93" cy="11" r="4" fill="#c22d22" stroke="none"/><path d="M6 88h158l-18 26H24z" fill="#4a2e1c"/><path d="M14 96h146" stroke="#d9a441" stroke-width="1.6"/>`)},
 // 錨
 anchor:{vb:[80,100],s:.28,svg:PROP_S(`<circle cx="40" cy="12" r="7" fill="none" stroke-width="4"/><path d="M40 19v66M24 34h32" stroke-width="5"/><path d="M10 64q4 24 30 24t30-24" fill="none" stroke-width="5"/><path d="M4 66l8-8 6 10zM76 66l-8-8-6 10z" fill="${O}"/>`)},
 // 漁船（父の船）
 fboat:{vb:[160,90],s:.46,svg:PROP_S(`<path d="M8 50h144l-20 30H28z" fill="#e8e2d4"/><path d="M16 60h128" stroke="#2c5a8a" stroke-width="4"/><path d="M60 50V26h40v24z" fill="#f4f1ea"/><path d="M66 32h12v10H66zM84 32h12v10H84z" fill="#9fd0f0"/><path d="M80 26V8M80 12l16 6-16 4" fill="#c22d22"/>`)}
});

/* ---------- 海事代理士版の曲（第1話〜第4話：海賊の港町） ---------- */
Object.assign(TR,{
 // タイトル：ゆったり揺れる船乗りのワルツ（3拍子をまねた付点のリズム）
 title:{bpm:96,f(a,o,s,t,d){const bar=s>>3,ch=[[50,54,57],[43,47,50],[45,49,52],[50,54,57]][bar];
  if(s%8===0){I.organ(a,o,ch.map(n=>n+12),t,7*d,.018);I.bass(a,o,ch[0]-12,t,d*3,.14)}if(s%8===3||s%8===6)ch.forEach(n=>I.pluck(a,o,n+12,t,.025));
  const m=[{0:74,3:73,6:71},{0:71,3:74,6:79},{0:76,3:74,6:73},{0:74,6:69}][bar][s%8];if(m)I.whistle(a,o,m,t,d*2.4,.035);if(s===0)I.bell(a,o,86,t,.03,3)}},
 // オープニング：波の低い鼓動と、霧笛のような低いホルン、遠くの鐘
 opening:{bpm:72,f(a,o,s,t,d){const r=[38,38,36,41][s>>3];if(s%8===0){I.taiko(a,o,t,.38);I.pad(a,o,[r+12,r+19,r+24],t,8*d,.024,600)}if(s%4===2)I.hat(a,o,t,.012);
  if(s===4||s===20)I.brass(a,o,r,t,d*3,.05);if(s===0)I.bell(a,o,74,t,.05,4);if(s===16)I.bell(a,o,69,t,.04,4)}},
 // 港の朝（事件）：アコーディオン風の和音と、はずむベース
 kd1port:{bpm:112,f(a,o,s,t,d){const ch=[[55,59,62],[60,64,67],[62,66,69],[55,59,62]][s>>3];
  if(s%2===1)I.organ(a,o,ch.map(n=>n+12),t,d*.8,.014);if(s%2===0)I.bass(a,o,ch[0]-12+(s%4?7:0),t,d*.9,.13);if(s%4===0)I.kick(a,o,t,.32);
  const m={0:[74,2],2:[71,2],4:[67,2],6:[71,2],8:[72,2],10:[76,2],12:[79,4],16:[78,2],18:[76,2],20:[74,4],24:[71,2],26:[74,2],28:[79,4]}[s];if(m)I.whistle(a,o,m[0],t,m[1]*d,.03)}},
 // 手下とのバトル：速い船乗りの踊り（フィドル風のはじき＋太鼓）
 kd1battle:{bpm:156,f(a,o,s,t,d){const r=[45,45,43,40][s>>3];I.twang(a,o,r+[24,28,31,28][s%4],t,.05);if(s%2===0)I.bass(a,o,r-12,t,d*.8,.16,1);
  if(s%4===0)I.kick(a,o,t,.6);if(s%4===2)I.snare(a,o,t,.22);I.hat(a,o,t,.02);if([0,3,6].includes(s%8))I.taiko(a,o,t,.2);if(s===31)I.whip(a,o,t,.3)}},
 // 船長・ドクロ丸の登場：重い太鼓と、低い弦の不協和音、鎖の音のような鐘
 kd1bossin:{bpm:58,f(a,o,s,t,d){if(s%8===0)I.taiko(a,o,t,.55);if(s%16===0){I.cello(a,o,[38,37][s>>4],t,16*d*.95,.05);I.organ(a,o,[[50,53,56],[49,52,55]][s>>4],t,16*d*.95,.02)}
  if(s%4===2)I.tick(a,o,t,900,.03);if(s===12||s===28)I.bell(a,o,62,t,.05,4)}},
 // ドクロ丸とのボス戦：ブラスと合唱の海賊の決戦
 kd1boss:{bpm:150,f(a,o,s,t,d){const bar=s>>3,r=[38,38,41,36][bar];if(s%4===0)I.kick(a,o,t,.65);if(s%4===2)I.snare(a,o,t,.24);I.hat(a,o,t,.025);if(s%2===1)I.taiko(a,o,t,.18);
  I.bass(a,o,r-12+[0,7,12,7][(s>>1)%4],t,d*.7,.16,1);if(s%2===0)I.cello(a,o,r+12+[0,3,7,3][(s>>1)%4],t,d*.9,.04);
  if(s%8===0)I.choir(a,o,[[62,65,69],[62,65,69],[65,69,72],[60,64,67]][bar],t,8*d,.03);
  const m={0:[74,3],3:[77,1],4:[81,4],8:[79,2],10:[77,2],12:[74,4],16:[77,3],19:[79,1],20:[81,4],24:[84,4],28:[81,4]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.065);if(s===31)I.whip(a,o,t,.3)}}
});

/* ---------- 海のデザイン（海事代理士版だけ）：深い紺、金の縄、羅針盤 ---------- */
// 本体のスタイルは body の中にあるので、それより後ろ（body の最後）に足して上書きする
document.body.insertAdjacentHTML('beforeend',`<style>
:root{--ink:#06121c;--panel:rgba(8,22,38,.86);--bone:#f2ead8;--dust:#8fb3c8;--blood:#e8503a;--gold:#e8c06a;--steel:#9fb8c8;--sil:#030a12;--sea:#38b6c8}
body{background:var(--ink)}
.btn{border:2px solid var(--gold);border-radius:6px;background:linear-gradient(180deg,#b8302a,#7a1a16);color:#fff6e0;box-shadow:0 4px 0 #3a0a08,0 8px 18px rgba(0,0,0,.45);letter-spacing:.08em}
.btn:active{transform:translateY(3px);box-shadow:0 1px 0 #3a0a08}
.btn.ghost{background:rgba(8,22,38,.7);border:1px solid rgba(232,192,106,.55);color:var(--bone);box-shadow:none}
.btn.mini{border-radius:6px}
#s-title .logo{font-size:clamp(38px,11.2vw,72px)!important;white-space:nowrap;font-weight:900;letter-spacing:.02em;line-height:1.02;color:#f6e3b0;text-shadow:0 3px 0 #6a3a10,0 0 18px rgba(232,192,106,.35);transform:none}
#s-title .logo .pre{display:table;margin:0 auto 10px;white-space:nowrap;color:#bfeef6;background:rgba(56,182,200,.14);border:1px solid var(--sea);border-radius:4px;letter-spacing:.24em;padding:3px 10px 3px 14px;font-size:.26em;text-shadow:none}
#s-title .logo small{color:var(--gold);text-shadow:none;font-size:.4em;letter-spacing:.5em;margin-top:12px}
#s-title .logo small::before,#s-title .logo small::after{content:"⚓";font-size:.8em;margin:0 10px;color:var(--sea)}
.tagline{color:#e6f3f6}
.title-hero{filter:drop-shadow(0 0 22px rgba(255,180,100,.5))!important}
#s-title::before{content:"";position:absolute;left:50%;top:6%;width:min(70vw,340px);aspect-ratio:1;transform:translateX(-50%);pointer-events:none;opacity:.1;
 background:radial-gradient(circle,transparent 46%,var(--gold) 46.5% 47.5%,transparent 48% 62%,var(--gold) 62.5% 63%,transparent 63.5%),
 conic-gradient(from 0deg,transparent 0 43deg,var(--gold) 43deg 47deg,transparent 47deg 133deg,var(--gold) 133deg 137deg,transparent 137deg 223deg,var(--gold) 223deg 227deg,transparent 227deg 313deg,var(--gold) 313deg 317deg,transparent 317deg);
 -webkit-mask:radial-gradient(circle,#000 64%,transparent 65%);mask:radial-gradient(circle,#000 64%,transparent 65%)}
.card{border:1px solid rgba(232,192,106,.35);border-radius:8px;background:var(--panel)}
.qtag{border-radius:4px;background:linear-gradient(180deg,#1f6a7a,#0e3a48);border:1px solid var(--sea)}
.opt{border-radius:8px;background:rgba(242,234,216,.05);border:1px solid rgba(159,184,200,.5);color:var(--bone)}
.stage{border:2px solid rgba(232,192,106,.5);border-radius:8px}
.panel{border:3px solid #f2ead8;border-radius:4px}
.chap{border-bottom:2px solid var(--gold)}
.sheet-in{background:linear-gradient(180deg,#0c2236,#06121c);border:1px solid rgba(232,192,106,.4);border-bottom:none;border-radius:14px 14px 0 0}
.kjcard{border-color:var(--sea)!important}
/* オープニングの「スキップ」：下の黒い帯の中に、大きく目立つボタンで置く（タイトル画面のボタンと重ならない） */
.op-skip{z-index:7;bottom:calc(6.5% - 22px + env(safe-area-inset-bottom,0px));right:calc(14px + env(safe-area-inset-right,0px));min-height:44px;padding:10px 22px;font-size:15px;font-weight:900;letter-spacing:.1em;color:var(--gold);background:rgba(8,22,38,.95);border:2px solid var(--gold);border-radius:6px;box-shadow:0 0 14px rgba(232,192,106,.35)}
</style>`);

/* ==================== 第二部（第5話〜第8話） ==================== */
/* ---------- 第二部の登場人物 ---------- */
Object.assign(SIL,{
// イカスミ：鉄錨海賊団の書記。イカの頭のような白い三角帽、墨のしみた黒い外套、大きな羽ペン
ikasumi:mk(`<path d="${B.thug}" fill="#1c1a26"/>${SHD(B.thug)}<g fill="#05050a" stroke="none"><ellipse cx="32" cy="128" rx="5" ry="3.4"/><ellipse cx="62" cy="146" rx="6" ry="3"/><ellipse cx="66" cy="112" rx="3.4" ry="2.4"/></g><path d="M40 72L50 92L60 72" fill="#f4f1ea"/><path d="M50 78v14" stroke="#05050a" stroke-width="2.4"/><path d="M70 136L90 70" stroke-width="2"/><path d="M90 70c6-10 6-22 2-30c-6 8-12 20-10 34z" fill="#f4f1ea"/><path d="M90 46l-4 22" stroke-width="1"/><circle cx="70" cy="138" r="2.4" fill="#05050a" stroke="none"/>${NECK(50,14)}<ellipse cx="50" cy="42" rx="13" ry="16" fill="${SK}"/><path d="M34 34L50 0L66 34c-5-3-10-4-16-4s-11 1-16 4z" fill="#f4f1ea"/><path d="M36 26l-10 8 10 1zM64 26l10 8-10 1z" fill="#f4f1ea"/><circle cx="50" cy="16" r="3" fill="#c22d22" stroke="none"/><path d="M39 40l8 2M61 40l-8 2" fill="none" stroke-width="2.2"/><path d="M42 44h5M53 44h5" stroke-width="2.2" fill="none"/><path d="M42 51c3 2 5-1 8-1s5 3 8 1" fill="none" stroke="#05050a" stroke-width="2"/><path d="M46 56q4 2 8 0" fill="none" stroke-width="1.4"/>`)
});
Object.assign(NAMES,{ikasumi:'イカスミ'});
Object.assign(VP,{ikasumi:{p:.9,r:.94,g:'m',i:1}});
// 墨で汚された証書
Object.assign(PROPS,{
 inkcert:{vb:[80,100],s:.32,svg:PROP_S(`<path d="M6 6h68v88H6z" fill="#f4ecdc"/><path d="M10 10h60v80H10z" fill="none" stroke="#d9a441" stroke-width="1.6"/><text x="40" y="27" text-anchor="middle" font-size="11" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">船舶</text><text x="40" y="41" text-anchor="middle" font-size="11" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">国籍証書</text><path d="M18 52h44M18 61h44M18 70h28" stroke-width="1.4"/><path d="M30 46c10-6 30-2 34 10c4 12-6 22-18 20c-6 6-18 4-20-4c-8-2-10-14 4-26z" fill="#0a0a12" stroke="none"/><circle cx="20" cy="84" r="3" fill="#0a0a12" stroke="none"/><circle cx="66" cy="40" r="2.2" fill="#0a0a12" stroke="none"/>`)}
});

/* ---------- 攻撃の技：4話ごとに入れかえる ---------- */
// 第1話〜第4話：パンチ・キック・つかみ・六法・エルボー ／ 第5話〜第8話：ラリアット・ドロップキック・頭突き・ボディスラム
const KD_MOVES=[['punch','kick','grab','weapon','elbow'],['lariat','dropkick','headbutt','slam']];
moveOK=k=>{const n=CH&&CH.no||1;const p=KD_MOVES[Math.min(KD_MOVES.length-1,Math.floor((n-1)/4))];return p.includes(k)};

/* ---------- 第二部の曲（第5話〜第8話：霧の海と墨の書記） ---------- */
Object.assign(TR,{
 // 霧の港（事件）：短調のはじく和音と、低いチェロ、ときどき霧笛
 kd2port:{bpm:100,f(a,o,s,t,d){const bar=s>>3,ch=[[52,55,59],[48,52,55],[50,53,57],[47,50,54]][bar];
  I.pluck(a,o,ch[s%3]+12+(s%8>5?12:0),t,.022);if(s%8===0){I.cello(a,o,ch[0]-12,t,7.6*d,.05);I.pad(a,o,ch.map(n=>n+12),t,8*d,.016,900)}if(s%4===2)I.hat(a,o,t,.01);
  const m={0:[76,3],4:[74,2],6:[71,2],8:[72,4],12:[71,2],14:[67,2],16:[69,4],20:[72,2],22:[74,2],24:[71,6]}[s];if(m)I.whistle(a,o,m[0],t,m[1]*d,.028);if(s===28)I.brass(a,o,40,t,d*4,.035)}},
 // 手下とのバトル：6拍子の速い舟歌（鐘と太鼓、はじく弦）
 kd2battle:{bpm:168,f(a,o,s,t,d){const r=[45,43,41,40][s>>3];const k=s%6;if(k===0)I.kick(a,o,t,.62);if(k===3)I.snare(a,o,t,.22);if(k!==0)I.hat(a,o,t,.018);
  I.bass(a,o,r-12+[0,7,12][k%3],t,d*.7,.15,1);I.twang(a,o,r+[24,27,31,27,24,22][k],t,.045);if(s%8===0)I.bell(a,o,r+36,t,.025,2);if(s%12===6)I.taiko(a,o,t,.3);if(s===31)I.whip(a,o,t,.3)}},
 // 書記イカスミの登場：時を刻む音、低いオルガンと合唱、墨のしずくのような鐘
 kd2bossin:{bpm:64,f(a,o,s,t,d){I.tick(a,o,t,s%2?700:1100,.025);if(s%16===0){I.organ(a,o,[[40,43,47],[41,44,47]][s>>4],t,16*d*.95,.024);I.choir(a,o,[[52,55,59],[53,56,59]][s>>4],t,16*d*.95,.02)}
  if(s%8===4)I.taiko(a,o,t,.4);if(s===6||s===22)I.bell(a,o,83,t,.03,3);if(s===14||s===30)I.bell(a,o,76,t,.025,3)}},
 // イカスミとのボス戦：オルガンとブラスの、速い短調の決戦
 kd2boss:{bpm:156,f(a,o,s,t,d){const bar=s>>3,r=[40,36,38,35][bar];if(s%4===0)I.kick(a,o,t,.66);if(s%4===2)I.snare(a,o,t,.26);if(s%2===1)I.hat(a,o,t,.028);if(s%8===7)I.taiko(a,o,t,.3);
  I.bass(a,o,r-12+[0,12,7,12][s%4],t,d*.75,.17,1);if(s%2===0)I.organ(a,o,[r+24,r+27,r+31],t,d*.9,.012);
  if(s%8===0)I.choir(a,o,[[64,67,71],[60,64,67],[62,66,69],[59,63,66]][bar],t,8*d,.028);
  const m={0:[76,2],2:[79,2],4:[83,4],8:[81,2],10:[79,2],12:[76,4],16:[78,2],18:[79,2],20:[81,4],24:[83,3],27:[84,1],28:[83,4]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.065);if(s===31)I.whip(a,o,t,.35)}}
});

/* ---------- 決め技「大印ドッスン」（CH.fin='stamp'）：空から大きな印が落ちて、相手をぺったんこにし、紙のようにひらひら飛ばす ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.kdstamp{position:absolute;z-index:7;pointer-events:none}
.kdstamp svg{width:100%;height:auto;display:block;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6))}
.kdstamp svg.wob{animation:kdWob .5s ease-in-out infinite}
@keyframes kdWob{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
.kdshadow{position:absolute;z-index:1;bottom:0;height:10px;border-radius:50%;background:rgba(0,0,0,.55);transform:scale(.3);transition:transform 1s;pointer-events:none}
.kdshadow.on{transform:scale(1)}
.fig.r.kdflat{transition:transform .12s;transform:scaleY(.16) scaleX(1.35);transform-origin:50% 100%}
.fig.r.kdpop{transition:transform .35s cubic-bezier(.2,1.6,.4,1);transform:scaleY(.06) scaleX(1.5);transform-origin:50% 100%}
.fig.r.kdpeel{transform-origin:50% 100%;animation:kdPeel 2s ease-in forwards}
@keyframes kdPeel{0%{transform:scaleY(.06) scaleX(1.5)}15%{transform:translate(-6%,-30%) scaleY(.06) scaleX(1.5) rotate(-12deg)}35%{transform:translate(10%,-90%) scaleY(.1) scaleX(1.3) rotate(18deg)}55%{transform:translate(-4%,-150%) scaleY(.08) scaleX(1.2) rotate(-20deg)}80%{transform:translate(20%,-230%) scaleY(.07) scaleX(.8) rotate(30deg);opacity:1}100%{transform:translate(40%,-320%) scaleY(.05) scaleX(.4) rotate(60deg);opacity:0}}
.kdimprint{position:absolute;z-index:6;left:56%;bottom:2%;width:36%;text-align:center;font-family:var(--display);font-weight:900;font-size:clamp(16px,5vw,24px);color:#e0302a;border:3px solid #e0302a;border-radius:6px;padding:2px 0;transform:rotate(-8deg) scale(0);transition:transform .25s cubic-bezier(.2,1.6,.4,1);pointer-events:none;background:rgba(255,255,255,.08)}
.kdimprint.on{transform:rotate(-8deg) scale(1)}
.kdimprint.fly{transition:transform 1.6s ease-in,opacity 1.6s;transform:translate(40%,-260%) rotate(40deg) scale(.4);opacity:0}
</style>`);
const STAMP_DEF={taunt:'へっ、そんな理屈で、おれが倒れるかよ！',reply:'なら、法の印を押してやる！',name:'大印ドッスン！',mark:'書換',imprint:'書換済'};
function finisherStamp(){
  BGM.stop();closeSheet();stopSay();
  const name=EP.lawName||EP.ougi,ov=$('#ov'),bk=VP[EP.efig]?EP.efig:'boss',H=Object.assign({},STAMP_DEF,CH.stamp||{});ov.hidden=false;ov.classList.add('black');
  const wait=ms=>new Promise(r=>setTimeout(r,ms)),sayP=(t,k)=>new Promise(r=>say([[t,k]],r));
  const line=(t,who,cls='')=>{const l=$('#fline');if(l)l.innerHTML=`<div class="fl ${cls}"><b>${who}</b>${t}</div>`};
  ov.innerHTML=`<div class="finisher hk"><div class="stage fstage" id="fstage">${stageHTML(EP.efig||'boss',EP.enemy,1,EP.efigName)}</div><div class="fline" id="fline"></div></div>`;
  const st=$('#fstage'),boss=st.querySelector('.fig.r'),hero=st.querySelector('.fig.l');
  const mk1=[...H.mark];
  const stamp=document.createElement('div');stamp.className='kdstamp';
  stamp.innerHTML=`<svg viewBox="0 0 120 150"><rect x="44" y="4" width="32" height="40" rx="14" fill="#7a4a26" stroke="#2a160a" stroke-width="3"/><rect x="38" y="40" width="44" height="26" rx="6" fill="#5a3418" stroke="#2a160a" stroke-width="3"/><rect x="8" y="64" width="104" height="58" rx="8" fill="#3a2414" stroke="#2a160a" stroke-width="3"/><rect x="6" y="118" width="108" height="26" rx="5" fill="#d8302a" stroke="#6a0a0a" stroke-width="3"/><text x="60" y="100" text-anchor="middle" font-size="${mk1.length>2?24:30}" font-weight="900" fill="#e8c06a" font-family="sans-serif">${H.mark}</text></svg>`;
  const sh=document.createElement('div');sh.className='kdshadow';st.appendChild(sh);st.appendChild(stamp);
  // 印の大きさと位置は、相手の立ち位置に合わせて決める（真上から、地面まで落とす）
  const sr=st.getBoundingClientRect(),br=boss.getBoundingClientRect(),sw=Math.min(br.width*1.3,sr.width*.46),shh=sw*150/120,cx=br.left-sr.left+br.width/2;
  stamp.style.width=sw+'px';stamp.style.left=(cx-sw/2)+'px';stamp.style.top=(-shh*2)+'px';sh.style.width=sw+'px';sh.style.left=(cx-sw/2)+'px';
  const HOV=-shh*.55,GND=sr.height-shh+6,svg=stamp.querySelector('svg');
  const mv=(from,to,ms,ease)=>stamp.animate([{top:from+'px'},{top:to+'px'}],{duration:reduce?1:ms,easing:ease,fill:'forwards'});
  (async()=>{
    // 1. 強がりと、決めぜりふ
    await wait(400);line(H.taunt,EP.efigName||EP.enemy);await Promise.all([sayP(H.taunt,bk),wait(1700)]);
    line(H.reply,'佐藤','hero');await Promise.all([sayP(H.reply,'hero'),wait(1500)]);$('#fline').innerHTML='';
    // 2. 空から大きな印が下りてくる
    hero.classList.add('leap');mv(-shh*2,HOV,1000,'ease-out');sh.classList.add('on');
    const a=ac();if(a){I.bell(a,a.destination,79,a.currentTime,.06,2);I.bell(a,a.destination,86,a.currentTime+.3,.05,2)}
    await wait(1000);svg.classList.add('wob');hero.classList.remove('leap');
    line('な、なんだ、あの影は……！？',EP.efigName||EP.enemy);await Promise.all([sayP('な、なんだ、あの影は！',bk),wait(1300)]);
    // 3. ドッスン！ ぺったんこ
    const k=document.createElement('div');k.className='kiai hyk big';k.textContent=H.name;k.style.fontSize=Math.min(44,Math.floor(330/[...H.name].length))+'px';k.style.left='4%';st.appendChild(k);say([[H.name,'hero']]);
    svg.classList.remove('wob');mv(HOV,GND,220,'cubic-bezier(.6,0,.9,.5)');await wait(200);
    boss.classList.add('kdflat');const w=document.createElement('div');w.className='whiteout-mini';st.appendChild(w);setTimeout(()=>w.remove(),400);
    st.classList.remove('shake','impact');void st.offsetWidth;st.classList.add('shake','impact');punch(2.6);hit(2);
    const b=document.createElement('div');b.className='kiai hyk';b.textContent='ドッスーン！！';b.style.top='60%';b.style.left='40%';st.appendChild(b);
    await wait(1300);k.remove();b.remove();
    // 4. 印を持ち上げると、相手は紙のようにぺらぺら
    mv(GND,-shh*2.4,700,'ease-in');sh.classList.remove('on');
    boss.classList.remove('kdflat');boss.classList.add('kdpop');
    const im=document.createElement('div');im.className='kdimprint';im.textContent=H.imprint;st.appendChild(im);im.style.left=(cx/sr.width*100-18)+'%';await wait(60);im.classList.add('on');
    const a2=ac();if(a2)I.tick(a2,a2.destination,a2.currentTime,1400,.08);
    line('ぺ、ぺらぺらに……なっちまった……',EP.efigName||EP.enemy,'big');await Promise.all([sayP('ぺらぺらに、なっちまった！',bk),wait(1600)]);
    // 5. 海風に飛ばされていく
    boss.classList.remove('kdpop');void boss.offsetWidth;boss.classList.add('kdpeel');im.classList.add('fly');
    const v=document.createElement('div');v.className='kiai hyk';v.textContent='ひらひら～';v.style.top='20%';v.style.left='46%';st.appendChild(v);
    line('おぼえてろ～っ！',EP.efigName||EP.enemy,'big');say([['おぼえてろ～っ！',bk]]);
    await wait(1900);v.remove();
    const star=document.createElement('div');star.className='kiran top';star.textContent='キラーン';st.appendChild(star);
    const a3=ac();if(a3){I.bell(a3,a3.destination,88,a3.currentTime,.12);I.bell(a3,a3.destination,91,a3.currentTime+.12,.12)}
    await wait(1500);$('#fline').innerHTML='';stamp.remove();sh.remove();im.remove();
    await ougiTail(ov,name,sayP,wait);
  })();
}
{const _fin=finisher;finisher=function(){if(hokuto()&&CH&&CH.fin==='stamp')return finisherStamp();return _fin.apply(this,arguments)}}
