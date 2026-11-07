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
// 第9話〜第12話：椅子・コブラツイスト・チョップ・タックル ／ 第13話〜第16話：海事代理士版だけの技（櫂・浮き輪・高波）とパイルドライバー
Object.assign(MOVES,{kdoar:{kiai:'櫂の一撃ッ！',k:1.05,hit:'ゴイーン！'},kdbuoy:{kiai:'浮き輪シュートッ！',k:.95,hit:'ポヨーン！'},kdwave:{kiai:'高波ッ！',k:1.1,hit:'ザッパーン！'}});
const KD_MOVES=[['punch','kick','grab','weapon','elbow'],['lariat','dropkick','headbutt','slam'],['chair','cobra','chop','tackle'],['pile','kdoar','kdbuoy','kdwave']];
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

/* ==================== 第二部の後半〜第四部（第6話〜第15話）の登場人物 ==================== */
Object.assign(SIL,{
// タコ八：鉄錨海賊団の買取屋。赤い丸頭にねじり鉢巻、手には「買取」の手紙
takohachi:mk(`<path d="${B.thug}" fill="#c4502e"/>${SHD(B.thug)}<path d="M26 100c6 4 10 4 14 0M60 100c6 4 10 4 14 0M30 130c6 4 10 4 14 0M56 130c6 4 10 4 14 0" stroke="#f2c2a0" stroke-width="3" fill="none"/><rect x="62" y="112" width="24" height="16" fill="#f4ecdc"/><path d="M62 112l12 9 12-9" fill="none" stroke-width="1.6"/>${NECK(50,14)}<ellipse cx="50" cy="36" rx="18" ry="20" fill="#d8644a"/><path d="M31 28c10-6 28-6 38 0" stroke="#f4f1ea" stroke-width="6" fill="none"/><path d="M66 26l10-6M68 30l10 2" stroke="#f4f1ea" stroke-width="3" fill="none"/><ellipse cx="43" cy="38" rx="3" ry="3.4" fill="${O}" stroke="none"/><ellipse cx="57" cy="38" rx="3" ry="3.4" fill="${O}" stroke="none"/><path d="M45 48q5 6 10 0" fill="#7a1a10" stroke-width="1.6"/><ellipse cx="50" cy="50" rx="4" ry="3" fill="#7a1a10" stroke-width="1.4"/>`),
// 大渦提督：鉄錨海賊団の頭。紺の提督服、金の肩章、二角帽に渦の紋、くるりと巻いた口ひげ
ouzu:mk(`<path d="${B.boss}" fill="#14243c"/>${SHD(B.boss)}<path d="M8 82h20l-2 10H6zM92 82H72l2 10h20z" fill="#d9a441"/><path d="M8 92l-2 10M14 92l-1 10M20 92v10M80 92v10M86 92l1 10M92 92l2 10" stroke="#d9a441" stroke-width="2"/><path d="M50 70v90" stroke="#d9a441" stroke-width="2"/><g fill="#d9a441" stroke="none"><circle cx="44" cy="90" r="2.4"/><circle cx="44" cy="106" r="2.4"/><circle cx="44" cy="122" r="2.4"/><circle cx="56" cy="90" r="2.4"/><circle cx="56" cy="106" r="2.4"/><circle cx="56" cy="122" r="2.4"/></g><path d="M68 112a8 8 0 1 1-8-8a5 5 0 1 1 5 5" stroke="#7ab8e0" stroke-width="2.4" fill="none"/>${NECK(46,16)}<ellipse cx="50" cy="38" rx="16" ry="18" fill="${SK}"/><path d="M12 24C24 8 76 8 88 24C78 20 66 22 50 22S22 20 12 24Z" fill="#0b0a0f"/><path d="M26 22C30 4 70 4 74 22Z" fill="#0b0a0f"/><path d="M56 13a5 5 0 1 1-5-5a3 3 0 1 1 3 3" stroke="#d9a441" stroke-width="1.8" fill="none"/><path d="M38 34l9 2M62 34l-9 2" stroke-width="2.6" fill="none"/><ellipse cx="44" cy="40" rx="2.2" ry="2.6" fill="${O}" stroke="none"/><ellipse cx="56" cy="40" rx="2.2" ry="2.6" fill="${O}" stroke="none"/><path d="M50 47c-6 0-12 2-16 6c-3 3-1 7 2 5c2-2 0-4-1-3M50 47c6 0 12 2 16 6c3 3 1 7-2 5c-2-2 0-4 1-3" fill="none" stroke="#2a1a12" stroke-width="3"/><path d="M45 55q5 3 10 0" fill="none" stroke-width="1.6"/>`),
// 塗り屋ベタ：船の名前を塗りつぶす海賊。ペンキだらけのつなぎ、ベレー帽、大きな刷毛
beta:mk(`<path d="${B.thug}" fill="#5a7a3a"/>${SHD(B.thug)}<path d="M34 76v84M66 76v84" stroke="#3a5a24" stroke-width="5"/><g stroke="none"><ellipse cx="30" cy="120" rx="6" ry="4" fill="#e04a8a"/><ellipse cx="64" cy="138" rx="7" ry="4" fill="#3aa0e0"/><ellipse cx="56" cy="100" rx="4" ry="3" fill="#f2d24a"/></g><path d="M74 140L92 92" stroke="#7a5236" stroke-width="4"/><path d="M86 88h14l-3 12h-9z" fill="#e04a8a"/>${NECK(50,14)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M32 30c2-12 34-14 38-2c-6 2-30 4-38 2z" fill="#c22d22"/><circle cx="58" cy="20" r="2.4" fill="#c22d22"/><path d="M40 38l7 1M60 38l-7 1" fill="none" stroke-width="2.2"/><ellipse cx="44" cy="42" rx="2" ry="2.4" fill="${O}" stroke="none"/><ellipse cx="56" cy="42" rx="2" ry="2.4" fill="${O}" stroke="none"/><path d="M42 50q8 6 16 0" fill="none" stroke-width="1.7"/><ellipse cx="38" cy="48" rx="3" ry="2" fill="#e04a8a" stroke="none"/>`),
// キリオ：黒霧商会の手下。灰色の頭巾、口元を覆う布
kirio:mk(`<path d="${B.thug}" fill="#6a6e78"/>${SHD(B.thug)}<path d="M30 92l40 0M28 112h44" stroke="#4a4e58" stroke-width="3"/><path d="M40 72l10 12 10-12" fill="#2a2c34"/>${NECK(50,14)}<ellipse cx="50" cy="40" rx="14" ry="16" fill="${SK}"/><path d="M32 42C30 18 70 18 68 42C66 30 60 26 50 26S34 30 32 42Z" fill="#4a4e58"/><path d="M36 44h28v12c-6 4-22 4-28 0z" fill="#4a4e58"/><path d="M40 38l7 2M60 38l-7 2" fill="none" stroke-width="2.2"/><ellipse cx="44" cy="41" rx="2" ry="2.2" fill="${O}" stroke="none"/><ellipse cx="56" cy="41" rx="2" ry="2.2" fill="${O}" stroke="none"/>`),
// 番頭ソロバン：黒霧商会の番頭。緑の羽織、ちょんまげ、細い口ひげ、大きなそろばん
soroban:mk(`<path d="${B.boss}" fill="#2a4a3a"/>${SHD(B.boss)}<path d="M34 64L50 120L66 64" fill="#e8e2d4"/><path d="M50 74v46" stroke="#2a4a3a" stroke-width="3"/><rect x="58" y="110" width="36" height="22" rx="2" fill="#7a5236"/><path d="M58 117h36M58 125h36" stroke-width="1.2"/><g fill="#2a1a12" stroke="none"><circle cx="64" cy="113.5" r="1.8"/><circle cx="72" cy="113.5" r="1.8"/><circle cx="84" cy="121" r="1.8"/><circle cx="68" cy="128.5" r="1.8"/><circle cx="80" cy="128.5" r="1.8"/><circle cx="88" cy="113.5" r="1.8"/></g>${NECK(46,16)}<ellipse cx="50" cy="38" rx="15" ry="17" fill="${SK}"/><path d="M36 30c2-10 26-12 28 0c-6-4-22-4-28 0z" fill="#1a1a1a"/><path d="M44 22h12v-6h-12z" fill="#1a1a1a"/><path d="M40 37l7 1M60 37l-7 1" fill="none" stroke-width="2"/><path d="M41 41h5M54 41h5" stroke-width="2.2"/><path d="M42 48c3-2 6-1 8 0c2-1 5-2 8 0" fill="none" stroke="#2a1a12" stroke-width="1.8"/><path d="M46 53q4 2 8 0" fill="none" stroke-width="1.4"/>`),
// 黒霧会長：黒霧商会の会長。黒い背広にシルクハット、白い手袋、片眼鏡
kurogiri:mk(`<path d="${B.boss}" fill="#121216"/>${SHD(B.boss)}<path d="M38 64L50 104L62 64" fill="#e8e2d4"/><path d="M44 66l6 8 6-8-6 4z" fill="#7a1420"/><path d="M84 100L92 160" stroke="#3a2a1a" stroke-width="4"/><circle cx="84" cy="98" r="5" fill="#f4f1ea"/><path d="M10 90c4 6 12 4 14 0" stroke="#3a3a42" stroke-width="2" fill="none"/>${NECK(46,16)}<ellipse cx="50" cy="40" rx="15" ry="17" fill="${SK}"/><rect x="34" y="4" width="32" height="24" fill="#0b0a0f"/><path d="M26 28h48" stroke="#0b0a0f" stroke-width="5"/><path d="M34 22h32" stroke="#7a1420" stroke-width="3"/><path d="M40 38l7 1M60 38l-7 1" fill="none" stroke-width="2"/><ellipse cx="44" cy="42" rx="2" ry="2.2" fill="${O}" stroke="none"/><circle cx="56" cy="42" r="4.6" fill="none" stroke="#d9a441" stroke-width="1.6"/><ellipse cx="56" cy="42" rx="2" ry="2.2" fill="${O}" stroke="none"/><path d="M60 46l2 10" stroke="#d9a441" stroke-width="1"/><path d="M43 51q7 3 14 0" fill="none" stroke-width="1.6"/>`),
// フネユーレイ：幽霊船長のふりをする男。白い布をかぶり、上に船長帽。足元から長靴がのぞく
yurei:mk(`<path d="M14 150C10 100 20 46 50 40C80 46 90 100 86 150C80 144 74 156 68 150C62 144 56 156 50 150C44 144 38 156 32 150C26 144 20 156 14 150Z" fill="#eef0f4"/><path d="M14 150C10 100 20 46 50 40C80 46 90 100 86 150" fill="url(#shd)" stroke="none"/><rect x="34" y="150" width="12" height="10" fill="#2a2a2a"/><rect x="54" y="150" width="12" height="10" fill="#2a2a2a"/><path d="M28 40C30 24 70 24 72 40Z" fill="#1a2a4a"/><path d="M24 40h52" stroke="#0b0a0f" stroke-width="4"/><path d="M46 30a4 4 0 1 0 8 0a4 4 0 1 0-8 0" fill="#d9a441"/><ellipse cx="42" cy="66" rx="5" ry="7" fill="${O}"/><ellipse cx="58" cy="66" rx="5" ry="7" fill="${O}"/><path d="M40 86q10 8 20 0" fill="${O}"/><path d="M8 100c-6-4-6-12 0-14M92 100c6-4 6-12 0-14" stroke="#eef0f4" stroke-width="6" fill="none"/>`)
});
Object.assign(NAMES,{takohachi:'タコ八',ouzu:'大渦',beta:'ベタ',kirio:'キリオ',soroban:'ソロバン',kurogiri:'黒霧',yurei:'フネユーレイ'});
Object.assign(VP,{takohachi:{p:1.05,r:1.05,g:'m',i:1},ouzu:{p:.82,r:.9,g:'m',i:1},beta:{p:1.08,r:1.1,g:'m',i:1},kirio:{p:1,r:1.05,g:'m',i:1},soroban:{p:.95,r:1,g:'m',i:1},kurogiri:{p:.85,r:.92,g:'m',i:1},yurei:{p:1.1,r:.95,g:'m',i:1}});
Object.assign(PROPS,{
 letter:{vb:[80,60],s:.28,svg:PROP_S(`<path d="M4 6h72v48H4z" fill="#f4ecdc"/><path d="M4 6l36 26 36-26" fill="none" stroke-width="2"/><text x="40" y="50" text-anchor="middle" font-size="12" font-weight="900" fill="#c22d22" stroke="none" font-family="sans-serif">買取</text>`)},
 paint:{vb:[80,90],s:.3,svg:PROP_S(`<path d="M14 24h52l-6 62H20z" fill="#9aa2ac"/><path d="M14 24c0-8 52-8 52 0c0 8-52 8-52 0z" fill="#e04a8a"/><path d="M22 30c0 20 4 30 2 44" stroke="#e04a8a" stroke-width="5" fill="none"/><path d="M16 22c4-16 44-16 48 0" fill="none" stroke-width="2"/>`)},
 ship:{vb:[120,80],s:.4,svg:PROP_S(`<path d="M8 50h104l-14 24H22z" fill="#7a5236"/><path d="M58 8v42" stroke-width="3"/><path d="M60 10l34 34H60z" fill="#f4ecdc"/><path d="M56 14L26 44h30z" fill="#e8e2d4"/><path d="M14 58h92" stroke="#f4ecdc" stroke-width="2"/>`)},
 doc:{vb:[80,100],s:.3,svg:PROP_S(`<path d="M8 6h64v88H8z" fill="#f4ecdc"/><text x="40" y="26" text-anchor="middle" font-size="10" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">登記事項</text><text x="40" y="40" text-anchor="middle" font-size="10" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">証明書</text><path d="M18 52h44M18 62h44M18 72h30" stroke-width="1.4"/><circle cx="58" cy="82" r="8" fill="none" stroke="#c22d22" stroke-width="2"/>`)},
 flagfake:{vb:[70,90],s:.3,svg:PROP_S(`<path d="M10 4v84" stroke-width="3"/><path d="M12 6h50v34H12z" fill="#2a2a2a"/><circle cx="37" cy="23" r="9" fill="#f4f1ea" stroke="none"/><path d="M30 18l14 10M44 18L30 28" stroke="#2a2a2a" stroke-width="2"/>`)},
 tonnage:{vb:[90,70],s:.32,svg:PROP_S(`<path d="M6 8h78v54H6z" fill="#f4ecdc"/><text x="45" y="26" text-anchor="middle" font-size="10" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">総トン数</text><text x="45" y="40" text-anchor="middle" font-size="10" font-weight="900" fill="${O}" stroke="none" font-family="sans-serif">計算書</text><path d="M16 50h58" stroke-width="1.4"/>`)}
});

/* ---------- 第三部の曲（第9話〜第12話：黒霧商会。霧の造船所と、帳簿のずる） ---------- */
Object.assign(TR,{
 // 造船所の朝（事件）：木づちのリズムと、明るめの口笛
 kd3port:{bpm:108,f(a,o,s,t,d){const ch=[[50,54,57],[47,50,54],[43,47,50],[45,49,52]][s>>3];
  if(s%4===0)I.tick(a,o,t,900,.03);if(s%8===6)I.tick(a,o,t,1300,.025);I.pluck(a,o,ch[s%3]+12,t,.02);if(s%8===0){I.pad(a,o,ch.map(n=>n+12),t,8*d,.015,1100);I.bass(a,o,ch[0]-12,t,d*3,.12,1)}
  const m={0:[74,2],2:[76,2],4:[78,4],8:[76,2],10:[74,2],12:[71,4],16:[67,2],18:[71,2],20:[74,4],24:[73,6]}[s];if(m)I.whistle(a,o,m[0],t,m[1]*d,.026)}},
 // 手下とのバトル：裏打ちの速い拍子と、はじく弦
 kd3battle:{bpm:172,f(a,o,s,t,d){const r=[50,48,46,45][s>>3];if(s%4===0)I.kick(a,o,t,.6);if(s%4===2)I.snare(a,o,t,.24);if(s%2)I.hat(a,o,t,.024);
  I.bass(a,o,r-12+(s%2?7:0),t,d*.7,.15,1);if(s%2===1)I.twang(a,o,r+[24,27,31,29][(s>>1)%4],t,.04);if(s%16===8)I.brass(a,o,r+24,t,d*3,.05);if(s===31)I.whip(a,o,t,.3)}},
 // 黒霧商会の登場：霧笛と低い弦、そろばんの玉の音
 kd3bossin:{bpm:70,f(a,o,s,t,d){if(s%2===0)I.tick(a,o,t,s%4?1500:1800,.02);if(s%16===0){I.cello(a,o,[38,37][s>>4],t,15*d,.06);I.pad(a,o,[[50,53,57],[49,52,56]][s>>4],t,16*d*.95,.018,700)}
  if(s===8||s===24)I.brass(a,o,38,t,d*5,.04);if(s%8===4)I.taiko(a,o,t,.3)}},
 // 黒霧商会とのボス戦：ブラスとオルガンの、跳ねる短調
 kd3boss:{bpm:160,f(a,o,s,t,d){const bar=s>>3,r=[38,41,43,36][bar];if(s%4===0)I.kick(a,o,t,.66);if(s%4===2)I.snare(a,o,t,.26);if(s%2)I.hat(a,o,t,.028);
  I.bass(a,o,r-12+[0,12,10,12][s%4],t,d*.75,.17,1);if(s%4===2)I.organ(a,o,[r+24,r+27,r+31],t,d*1.8,.012);
  const m={0:[74,1],1:[77,1],2:[81,2],4:[79,2],6:[77,2],8:[76,3],11:[74,1],12:[72,4],16:[74,1],17:[77,1],18:[81,2],20:[84,4],24:[82,2],26:[81,2],28:[79,4]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.06);if(s===31)I.whip(a,o,t,.35)}}
});
/* ---------- 第四部の曲（第13話〜第16話：幽霊船のうわさ。ちょっと不気味で、ちょっとおかしい） ---------- */
Object.assign(TR,{
 // 夜の港（事件）：3拍子の、ふしぎな鐘とチェロ
 kd4port:{bpm:96,f(a,o,s,t,d){const k=s%6,ch=[[45,48,52],[44,47,52],[41,45,48],[40,44,47]][Math.floor(s/8)%4];
  if(k===0){I.cello(a,o,ch[0]-12,t,5.6*d,.05);I.bell(a,o,ch[2]+24,t,.02,3)}else if(k===2||k===4)I.pluck(a,o,ch[(k>>1)%3]+12,t,.02);
  const m={0:[76,3],3:[77,3],6:[76,2],8:[72,4],12:[71,3],15:[72,3],18:[69,6],24:[68,6]}[s];if(m)I.whistle(a,o,m[0],t,m[1]*d,.024)}},
 // 手下とのバトル：3拍子の速い踊り
 kd4battle:{bpm:180,f(a,o,s,t,d){const k=s%6,r=[45,43,41,40][Math.floor(s/8)%4];if(k===0)I.kick(a,o,t,.6);if(k===3)I.snare(a,o,t,.22);if(k===2||k===5)I.hat(a,o,t,.02);
  I.bass(a,o,r-12+[0,7,12,7,12,7][k],t,d*.7,.14,1);I.bell(a,o,r+[24,31,36,31,27,31][k],t,.016,1);if(s===31)I.whip(a,o,t,.3)}},
 // 幽霊船長の登場：ゆらゆらするオルガンと、きしむ音
 kd4bossin:{bpm:60,f(a,o,s,t,d){if(s%16===0){I.organ(a,o,[[45,48,52],[44,48,51]][s>>4],t,16*d*.95,.024);I.choir(a,o,[[57,60,64],[56,60,63]][s>>4],t,16*d*.95,.018)}
  if(s%4===2)I.tick(a,o,t,s%8===2?500:420,.03);if(s===10||s===26)I.bell(a,o,88,t,.025,4)}},
 // 幽霊船長とのボス戦：オルガンとブラスの3拍子の決戦
 kd4boss:{bpm:168,f(a,o,s,t,d){const k=s%6,r=[45,41,43,40][Math.floor(s/8)%4];if(k===0)I.kick(a,o,t,.66);if(k===3)I.snare(a,o,t,.26);if(k!==0&&k!==3)I.hat(a,o,t,.026);
  I.bass(a,o,r-12+[0,12,7][k%3],t,d*.75,.17,1);if(k===0)I.organ(a,o,[r+24,r+27,r+31],t,d*5.5,.012);
  const m={0:[76,3],3:[79,3],6:[81,2],8:[79,4],12:[77,3],15:[76,3],18:[74,2],20:[76,6],26:[72,3],29:[74,3]}[s];if(m)I.brass(a,o,m[0],t,m[1]*d,.06);if(s===31)I.whip(a,o,t,.35)}}
});

/* ==================== 決め技（CH.fin='gag'）：毎話ちがう、海のおかしな決め技 ====================
   話データに gag:{type, taunt, reply, ask, name, react, bye} を書く。せりふは全部、声の自動録音で録る。
   type：net（漁網）・paint（ペンキ）・whirl（大渦）・anchor（錨）・wave（大波）・barrel（樽）・whale（鯨）・bubble（泡）・cannon（大砲）・sail（帆）
   けがや血は出さない。最後はいつも、相手が遠くへ飛んでいって「キラーン」。 */
document.head.insertAdjacentHTML('beforeend',`<style>
.kdgag{position:absolute;z-index:7;pointer-events:none}
.kdgag svg{width:100%;height:auto;display:block;overflow:visible}
.kdgag.back{z-index:1}
.kdspin{animation:kdSpin .7s linear infinite;transform-origin:50% 50%}
@keyframes kdSpin{to{transform:rotate(360deg)}}
.kdgust{position:absolute;z-index:6;height:3px;border-radius:2px;background:rgba(230,244,255,.85);pointer-events:none}
.kdspout{position:absolute;z-index:3;pointer-events:none;background:linear-gradient(#e8f6ff,rgba(122,184,224,.6));border-radius:40% 40% 0 0;transform-origin:50% 100%}
.kdball{position:absolute;z-index:7;pointer-events:none;border-radius:50%;background:#f4ecdc;border:3px solid #2a160a;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-weight:900;color:#c22d22}
.kdsplash{position:absolute;z-index:6;pointer-events:none}
</style>`);
const KD_GAG=(()=>{
  const A=(el,fr,ms,ease='ease',fill='forwards')=>el.animate(fr,{duration:(typeof reduce!=='undefined'&&reduce)?1:ms,easing:ease,fill}).finished.catch(()=>{});
  const put=(el,x,y,w)=>{el.style.left=x+'px';el.style.top=y+'px';el.style.width=w+'px'};
  const T=(x,y,r=0,s=1)=>`translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
  const S=(vb,body)=>`<svg viewBox="${vb}" stroke="#1a120c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
  return {
  net:{boom:'バサァッ！',bye:'釣れた～！',
    svg:S('0 0 120 130',`<path d="M60 4v14" fill="none"/><path d="M14 30c0-10 92-10 92 0l-8 90c-20 10-56 10-76 0z" fill="rgba(210,190,140,.35)"/>${[...Array(6)].map((_,i)=>`<path d="M${22+i*15} 26l${-2+i}  ${98}" fill="none" stroke-width="2"/>`).join('')}${[...Array(6)].map((_,i)=>`<path d="M16 ${42+i*15}h88" fill="none" stroke-width="2"/>`).join('')}<path d="M14 30c0-10 92-10 92 0" fill="none" stroke="#7a5236" stroke-width="5"/>`),
    place:g=>({w:g.bw*1.5,x:g.bcx-g.bw*.75,y:-g.bw*2.4}),
    enter:(p,b,g)=>A(p,[{transform:T(0,0)},{transform:T(0,g.bw*2.4+g.by-g.bw*1.1)}],1000,'ease-out'),
    hit:(p,b,g)=>{A(p,[{transform:T(0,g.bw*2.4+g.by-g.bw*1.1)},{transform:T(0,g.bw*2.4+g.by+g.bh-g.bw*1.62)}],220,'ease-in');return A(b,[{transform:'scale(1)'},{transform:'scale(.86)'}],220)},
    exit:(p,b,g)=>{const y0=g.bw*2.4+g.by+g.bh-g.bw*1.62;A(p,[{transform:T(0,y0)},{transform:T(-10,y0-40,-6)},{transform:T(10,y0-g.H*2.6,8)}],1800,'ease-in');return A(b,[{transform:T(0,0,0,.86)},{transform:T(-10,-40,-6,.86)},{transform:T(10,-g.H*2.6,8,.86)}],1800,'ease-in')}},
  paint:{boom:'ベチャーッ！',bye:'ツルーン！',
    svg:S('0 0 100 100',`<path d="M18 30h64l-8 64H26z" fill="#9aa2ac"/><path d="M18 30c0-10 64-10 64 0c0 10-64 10-64 0z" fill="#e04a8a"/><path d="M20 28c4-24 56-24 60 0" fill="none" stroke-width="3"/>`),
    place:g=>({w:g.bw*.9,x:g.bcx-g.bw*.1,y:-g.bw*2}),
    enter:(p,b,g)=>A(p,[{transform:T(0,0)},{transform:T(0,g.bw*2+g.by-g.bw*.85,0)}],900,'ease-out'),
    hit:(p,b,g,st)=>{const y=g.bw*2+g.by-g.bw*.85;A(p,[{transform:T(0,y,0)},{transform:T(-g.bw*.3,y,-150)}],260,'ease-in');
      const sp=document.createElement('div');sp.className='kdsplash';put(sp,g.bx-g.bw*.1,g.by-g.bw*.1,g.bw*1.2);sp.innerHTML=`<svg viewBox="0 0 100 160"><path d="M20 10c20-14 50-10 64 4c10 30-2 60 8 100c4 20-6 40-20 40c-8-20-6-50-14-60c-6 30-10 50-24 58c-10-10-6-40-10-60c-8 10-14 30-20 20c6-30-2-80 16-102z" fill="#e04a8a" opacity=".92"/></svg>`;st.appendChild(sp);
      A(sp,[{transform:'scaleY(0)',transformOrigin:'50% 0'},{transform:'scaleY(1)',transformOrigin:'50% 0'}],300,'ease-out');b._kd=sp;return A(b,[{filter:'none'},{filter:'sepia(1) saturate(5) hue-rotate(290deg)'}],300)},
    exit:(p,b,g)=>{if(b._kd)A(b._kd,[{transform:T(0,0)},{transform:T(g.W*1.1,g.bh*.3,400)}],1500,'ease-in');A(p,[{opacity:1},{opacity:0}],600);return A(b,[{transform:T(0,0)},{transform:T(-14,0,-10)},{transform:T(g.W*1.1,g.bh*.3,400)}],1500,'ease-in')}},
  whirl:{boom:'グルグルグル～！',bye:'目が回る～！',
    svg:`<svg viewBox="0 0 200 70"><ellipse cx="100" cy="35" rx="96" ry="30" fill="#1e5a8a"/><g transform="translate(100 35) scale(1 .3)"><g class="kdspin" style="transform-box:fill-box"><path d="M-84 0a84 84 0 1 0 168 0a72 72 0 1 0-144 0a58 58 0 1 0 116 0a42 42 0 1 0-84 0a24 24 0 1 0 48 0" fill="none" stroke="#e8f6ff" stroke-width="10"/></g></g></svg>`,
    place:g=>({w:g.bw*2.1,x:g.bcx-g.bw*1.05,y:g.by+g.bh-g.bw*.5}),
    enter:(p,b,g)=>A(p,[{transform:'scale(.1)',opacity:0},{transform:'scale(1)',opacity:1}],900,'ease-out'),
    hit:(p,b,g)=>A(b,[{transform:T(0,0,0,1)},{transform:T(0,g.bh*.1,720,.75)},{transform:T(0,g.bh*.2,1440,.55)}],1400,'ease-in'),
    exit:(p,b,g)=>{A(p,[{transform:'scale(1)',opacity:1},{transform:'scale(1.3)',opacity:0}],1600);return A(b,[{transform:T(0,g.bh*.2,1440,.55)},{transform:T(20,-g.H*2.8,2880,.25)}],1700,'ease-in')}},
  anchor:{boom:'ゴイーン！',bye:'スポーン！',
    svg:S('0 0 100 140',`<circle cx="50" cy="14" r="10" fill="none" stroke="#5a6470" stroke-width="7"/><path d="M50 24v96" stroke="#5a6470" stroke-width="12"/><path d="M28 40h44" stroke="#5a6470" stroke-width="10"/><path d="M10 92c6 30 30 42 40 42s34-12 40-42" fill="none" stroke="#5a6470" stroke-width="12"/><path d="M2 96l10-14 10 12zM98 96l-10-14-10 12z" fill="#5a6470"/>`),
    place:g=>({w:g.bw*.8,x:g.bcx-g.bw*.4,y:-g.bw*3}),
    enter:(p,b,g)=>A(p,[{transform:T(0,0)},{transform:T(0,g.bw*3+g.by-g.bw*1.45)}],1000,'ease-out'),
    hit:(p,b,g)=>{A(p,[{transform:T(0,g.bw*3+g.by-g.bw*1.45)},{transform:T(0,g.bw*3+g.by-g.bw*.95)}],200,'ease-in');return A(b,[{transform:'scaleY(1)',transformOrigin:'50% 100%'},{transform:'scaleY(.5) scaleX(1.15)',transformOrigin:'50% 100%'}],200,'ease-in')},
    exit:(p,b,g)=>{A(p,[{transform:T(0,g.bw*3+g.by-g.bw*.95)},{transform:T(0,-g.bw*1.5)}],500,'ease-in');return A(b,[{transform:'scaleY(.5) scaleX(1.15)',transformOrigin:'50% 100%'},{transform:'translateY(-30px) scaleY(1.3) scaleX(.9)',transformOrigin:'50% 100%'},{transform:`translateY(${-g.H*2.8}px) rotate(1080deg) scale(.4)`,transformOrigin:'50% 100%'}],1500,'ease-out')}},
  wave:{boom:'ザッパーン！',bye:'あ～れ～！',
    svg:`<svg viewBox="0 0 200 120"><path d="M0 120V70C20 30 60 4 104 6c40 2 64 26 60 50c-4 18-24 22-34 10c10-2 14-14 6-22c-14-12-44-6-56 22C68 88 60 110 70 120z" fill="#2a7ab8" stroke="#0e3a5a" stroke-width="3"/><path d="M110 12c30 4 50 22 48 42" fill="none" stroke="#e8f6ff" stroke-width="5"/><g fill="#e8f6ff"><circle cx="150" cy="18" r="4"/><circle cx="166" cy="30" r="3"/><circle cx="176" cy="44" r="2.4"/></g></svg>`,
    place:g=>({w:g.W*.8,x:-g.W*.9,y:g.H-g.W*.48}),
    enter:(p,b,g)=>{p.classList.add('back');return A(p,[{transform:T(0,0)},{transform:T(g.W*.55,0)}],1000,'ease-out')},
    hit:(p,b,g)=>{p.classList.remove('back');A(p,[{transform:T(g.W*.55,0)},{transform:T(g.W*2.2,0)}],1100,'ease-in');return A(b,[{transform:T(0,0)},{transform:T(g.W*.25,-g.bh*.4,-200)}],900,'ease-in')},
    exit:(p,b,g)=>A(b,[{transform:T(g.W*.25,-g.bh*.4,-200)},{transform:T(g.W*.9,-g.bh*1.2,-900,.2)}],1600,'ease-out')},
  barrel:{boom:'スッポーン！',bye:'ゴロゴロ～！',
    svg:S('0 0 100 120',`<path d="M14 10c-8 30-8 70 0 100h72c8-30 8-70 0-100z" fill="#9a6a3a"/><path d="M10 34h80M8 60h84M10 86h80" stroke="#3a2a1a" stroke-width="5"/><path d="M30 10c-4 30-4 70 0 100M70 10c4 30 4 70 0 100" fill="none" stroke-width="2"/>`),
    place:g=>({w:g.bw*1.05,x:g.bcx-g.bw*.525,y:-g.bw*3}),
    enter:(p,b,g)=>A(p,[{transform:T(0,0)},{transform:T(0,g.bw*3+g.by-g.bw*1.4)}],1000,'ease-out'),
    hit:(p,b,g)=>A(p,[{transform:T(0,g.bw*3+g.by-g.bw*1.4)},{transform:T(0,g.bw*3+g.by+g.bh*.02)}],220,'ease-in'),
    exit:(p,b,g)=>{const y=g.bw*3+g.by+g.bh*.02;A(p,[{transform:T(0,y,0)},{transform:T(0,y+g.bh*.35,90)},{transform:T(g.W*1.2,y+g.bh*.35,720)}],1700,'ease-in');return A(b,[{transform:T(0,0)},{transform:T(0,g.bh*.35,90)},{transform:T(g.W*1.2,g.bh*.35,720)}],1700,'ease-in')}},
  whale:{boom:'プシャーッ！',bye:'空まで～！',
    svg:S('0 0 200 90',`<path d="M10 60c10-40 120-56 160-30c14 10 18 22 8 30l18 -16c4 10 0 26-12 30c-10 26-150 30-174-14z" fill="#3a6a9a"/><path d="M30 70c40 10 100 10 140-4" fill="none" stroke="#e8f6ff" stroke-width="3"/><circle cx="56" cy="46" r="4" fill="#1a120c"/><path d="M50 58q8 6 18 0" fill="none" stroke-width="2.4"/>`),
    place:g=>({w:g.bw*2.3,x:g.bcx-g.bw*1.15,y:g.H+10}),
    enter:(p,b,g)=>A(p,[{transform:T(0,0)},{transform:T(0,-g.bw*2.3*.45-10)}],1000,'ease-out'),
    hit:(p,b,g,st)=>{const sp=document.createElement('div');sp.className='kdspout';sp.style.left=(g.bcx-g.bw*.3)+'px';sp.style.width=(g.bw*.6)+'px';sp.style.bottom='0px';sp.style.height=(g.H*.9)+'px';st.appendChild(sp);b._kd=sp;
      A(sp,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],500,'ease-out');return A(b,[{transform:T(0,0)},{transform:T(0,-g.H*.75)}],500,'ease-out')},
    exit:(p,b,g)=>{if(b._kd)A(b._kd,[{opacity:1},{opacity:0}],900);A(p,[{transform:T(0,-g.bw*2.3*.45-10),opacity:1},{transform:T(0,0),opacity:0}],1200,'ease-in');return A(b,[{transform:T(0,-g.H*.75)},{transform:T(30,-g.H*3,1080,.3)}],1600,'ease-in')}},
  bubble:{boom:'ポワワーン！',bye:'ふわふわ～',
    svg:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="rgba(170,220,255,.28)" stroke="rgba(230,248,255,.9)" stroke-width="3"/><path d="M24 34c6-12 18-18 30-18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="74" r="5" fill="rgba(255,255,255,.7)"/></svg>`,
    place:g=>({w:g.bh*.95,x:g.bcx-g.bh*.475,y:g.by+g.bh*.02}),
    enter:(p,b,g)=>A(p,[{transform:'scale(0)'},{transform:'scale(1.15)'},{transform:'scale(.95)'},{transform:'scale(1)'}],900,'ease-out'),
    hit:(p,b,g)=>{A(p,[{transform:T(0,0)},{transform:T(0,-g.bh*.25)}],600,'ease-out');return A(b,[{transform:T(0,0,0,1)},{transform:T(0,-g.bh*.25,-8,.9)}],600,'ease-out')},
    exit:(p,b,g)=>{const fr=k=>[{transform:T(0,-g.bh*.25,0,k)},{transform:T(-24,-g.H*.9,10,k)},{transform:T(20,-g.H*1.8,-10,k)},{transform:T(-10,-g.H*2.8,8,k)}];A(p,fr(1),2400,'ease-in');return A(b,fr(.9),2400,'ease-in')}},
  cannon:{boom:'ドッカーン！',bye:'ボヨヨーン！',
    svg:S('0 0 120 80',`<path d="M18 30l80-16 8 22-82 16z" fill="#3a3a42"/><circle cx="104" cy="25" r="10" fill="#3a3a42"/><circle cx="34" cy="58" r="16" fill="#7a5236"/><circle cx="34" cy="58" r="5" fill="#3a2a1a"/><path d="M4 74h60" stroke-width="5"/>`),
    place:g=>({w:g.hw*1.2,x:g.hx+g.hw*.2,y:g.H-g.hw*.8}),
    enter:(p,b,g)=>A(p,[{transform:T(-g.W*.5,0)},{transform:T(0,0)}],800,'ease-out'),
    hit:(p,b,g,st)=>{const ball=document.createElement('div');ball.className='kdball';const s=g.bw*.5;ball.style.width=ball.style.height=s+'px';ball.style.fontSize=(s*.5)+'px';ball.textContent='法';put(ball,g.hx+g.hw*1.3,g.H-g.hw*.8-s*.3,s);ball.style.height=s+'px';st.appendChild(ball);b._kd=ball;
      A(p,[{transform:T(0,0)},{transform:T(-16,0)},{transform:T(0,0)}],300);return A(ball,[{transform:T(0,0)},{transform:T(g.bcx-(g.hx+g.hw*1.3)-s/2,g.by+g.bh*.3-(g.H-g.hw*.8-s*.3))}],320,'ease-in')},
    exit:(p,b,g)=>{if(b._kd)A(b._kd,[{opacity:1},{opacity:0}],400);return A(b,[{transform:T(0,0)},{transform:T(g.W*.25,-g.H*.6,240,.8)},{transform:T(g.W*.6,-g.H*2.2,720,.3)}],1600,'ease-out')}},
  sail:{boom:'ビュオオオオッ！',bye:'飛ばされる～！',
    svg:S('0 0 120 160',`<path d="M20 4v152" stroke-width="5"/><path d="M24 10c60 10 84 60 70 130H24z" fill="#f4ecdc"/><path d="M24 50c40 4 60 20 66 44" fill="none" stroke="#c22d22" stroke-width="5"/><text x="56" y="120" text-anchor="middle" font-size="26" font-weight="900" fill="#14243c" stroke="none" font-family="sans-serif">法</text>`),
    place:g=>({w:g.hw*1.05,x:g.hx+g.hw*.3,y:g.H-g.hw*1.05*1.33}),
    enter:(p,b,g)=>{p.classList.add('back');return A(p,[{transform:'scaleY(0)',transformOrigin:'50% 100%'},{transform:'scaleY(1)',transformOrigin:'50% 100%'}],800,'ease-out')},
    hit:(p,b,g,st)=>{for(let i=0;i<6;i++){const l=document.createElement('div');l.className='kdgust';l.style.top=(g.H*(.15+i*.13))+'px';l.style.left=(g.hx)+'px';l.style.width=(g.W*.3)+'px';st.appendChild(l);A(l,[{transform:T(0,0),opacity:1},{transform:T(g.W*.9,0),opacity:0}],700+i*60,'ease-in').then(()=>l.remove())}
      return A(b,[{transform:T(0,0)},{transform:T(g.W*.06,-g.bh*.2,-25)}],600,'ease-out')},
    exit:(p,b,g)=>A(b,[{transform:T(g.W*.06,-g.bh*.2,-25)},{transform:T(g.W*.7,-g.H*1.6,-760,.3)}],1600,'ease-in')}
  }})();
function finisherGag(){
  BGM.stop();closeSheet();stopSay();
  const G=Object.assign({ask:'な、なんだ、これは！？',bye:'おぼえてろ～っ！'},CH.gag||{}),K=KD_GAG[G.type]||KD_GAG.net;
  const name=EP.lawName||EP.ougi,ov=$('#ov'),bk=VP[EP.efig]?EP.efig:'boss',who=EP.efigName||EP.enemy;ov.hidden=false;ov.classList.add('black');
  const wait=ms=>new Promise(r=>setTimeout(r,ms)),sayP=(t,k)=>new Promise(r=>say([[t,k]],r));
  const line=(t,w,cls='')=>{const l=$('#fline');if(l)l.innerHTML=t?`<div class="fl ${cls}"><b>${w}</b>${t}</div>`:''};
  const pop=(st,txt,top,left,big)=>{const v=document.createElement('div');v.className='kiai hyk'+(big?' big':'');v.textContent=txt;v.style.top=top;v.style.left=left;if(big)v.style.fontSize=Math.min(44,Math.floor(330/[...txt].length))+'px';st.appendChild(v);return v};
  ov.innerHTML=`<div class="finisher hk"><div class="stage fstage" id="fstage">${stageHTML(EP.efig||'boss',EP.enemy,1,EP.efigName)}</div><div class="fline" id="fline"></div></div>`;
  const st=$('#fstage'),boss=st.querySelector('.fig.r'),hero=st.querySelector('.fig.l');
  (async()=>{
    await wait(400);
    const sr=st.getBoundingClientRect(),br=boss.getBoundingClientRect(),hr=hero.getBoundingClientRect();
    const g={W:sr.width,H:sr.height,bx:br.left-sr.left,by:br.top-sr.top,bw:br.width,bh:br.height,bcx:br.left-sr.left+br.width/2,hx:hr.left-sr.left,hw:hr.width};
    const p=document.createElement('div');p.className='kdgag';p.innerHTML=K.svg;const pl=K.place(g);p.style.left=pl.x+'px';p.style.top=pl.y+'px';p.style.width=pl.w+'px';
    // 1. 強がりと、決めぜりふ
    line(G.taunt,who);await Promise.all([sayP(G.taunt,bk),wait(1700)]);
    line(G.reply,'佐藤','hero');await Promise.all([sayP(G.reply,'hero'),wait(1500)]);line('');
    // 2. 海の道具が現れる
    st.appendChild(p);hero.classList.add('leap');const a=ac();if(a){I.bell(a,a.destination,79,a.currentTime,.06,2);I.bell(a,a.destination,86,a.currentTime+.3,.05,2)}
    await K.enter(p,boss,g);hero.classList.remove('leap');
    line(G.ask,who);await Promise.all([sayP(G.ask,bk),wait(1200)]);
    // 3. 技の名前と、一撃
    const k=pop(st,G.name,'6%','4%',1);say([[G.name,'hero']]);await wait(500);
    const hp=K.hit(p,boss,g,st);await wait(180);const w=document.createElement('div');w.className='whiteout-mini';st.appendChild(w);setTimeout(()=>w.remove(),400);
    st.classList.remove('shake','impact');void st.offsetWidth;st.classList.add('shake','impact');punch(2.4);hit(2);const b=pop(st,K.boom,'58%','36%');
    await hp;await wait(700);k.remove();b.remove();
    // 4. 相手の、おかしな悲鳴
    line(G.react,who,'big');await Promise.all([sayP(G.react,bk),wait(1500)]);
    // 5. 遠くへ飛んでいく
    const v=pop(st,K.bye,'22%','40%');line(G.bye,who,'big');say([[G.bye,bk]]);
    await K.exit(p,boss,g);v.remove();
    const star=document.createElement('div');star.className='kiran top';star.textContent='キラーン';st.appendChild(star);
    const a3=ac();if(a3){I.bell(a3,a3.destination,88,a3.currentTime,.12);I.bell(a3,a3.destination,91,a3.currentTime+.12,.12)}
    await wait(1500);line('');p.remove();if(boss._kd)boss._kd.remove();
    await ougiTail(ov,name,sayP,wait);
  })();
}
{const _fin2=finisher;finisher=function(){if(hokuto()&&CH&&CH.fin==='gag')return finisherGag();return _fin2.apply(this,arguments)}}
