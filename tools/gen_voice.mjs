// LEGAL BREAK 自動録音：VOICEVOX でセリフを mp3 にして audio/ に入れる
// GitHub Actions から動かす（.github/workflows/voice.yml）。手元で動かすときは VOICEVOX を起動して node tools/gen_voice.mjs
// 宅建版（takken フォルダ）は GAME=takken node tools/gen_voice.mjs で、takken/audio/ に録音する
import fs from 'node:fs';import vm from 'node:vm';import {execFileSync} from 'node:child_process';
const REPO=new URL('..',import.meta.url).pathname,ENGINE=process.env.VOICEVOX_URL||'http://127.0.0.1:50021';
const GAME=process.env.GAME||'',ROOT=REPO+(GAME?GAME+'/':'');
const html=fs.readFileSync(ROOT+'index.html','utf8')+(fs.existsSync(ROOT+'extra.js')?fs.readFileSync(ROOT+'extra.js','utf8'):'')+(fs.existsSync(ROOT+'kijutsu.js')?fs.readFileSync(ROOT+'kijutsu.js','utf8'):'');

// キャラごとの声：[VOICEVOXのキャラ名, スタイル名, 話す速さ, 高さ, 抑揚]
const CAST={
 narr:['青山龍星','ノーマル',.9,-.03,1.15],narrf:['青山龍星','ノーマル',1.08,-.03,1.15],cm:['青山龍星','ノーマル',.92,-.06,1.2],hero:['玄野武宏','ノーマル',.98,-.03,1.1],
 boss:['麒ヶ島宗麟','ノーマル',.9,-.04,1.2],kuroda:['雀松朱司','ノーマル',.88,-.07,1.1],dogra:['剣崎雌雄','ノーマル',.92,-.09,1.1],
 thug:['白上虎太郎','おこ',1.12,.02,1.3],trick:['雀松朱司','ノーマル',1.1,.06,1.4],jin:['白上虎太郎','ふつう',1.02,0,1],
 old:['ちび式じい','ノーマル',.92,0,1],farmer:['玄野武宏','悲しみ',.95,-.04,1],sou:['白上虎太郎','ふつう',1,.03,1],
 haru:['剣崎雌雄','ノーマル',1.02,.05,1.1],inn:['雀松朱司','ノーマル',.92,.02,.9],
 oldwoman:['もち子さん','ノーマル',.88,-.06,1],mina:['冥鳴ひまり','ノーマル',1,0,1],girl:['ずんだもん','ノーマル',1.05,.02,1.2],
 rancher:['麒ヶ島宗麟','ノーマル',.98,.03,1],nephew:['白上虎太郎','わーい',1.1,.02,1.3],trader:['雀松朱司','ノーマル',1.02,.05,1.1],
 okami:['四国めたん','ノーマル',.98,-.03,1],clerk:['剣崎雌雄','ノーマル',1.05,.08,1.1],lumber:['青山龍星','熱血',1,.02,1.1],
 fisher:['玄野武宏','ノーマル',.95,-.06,1],shimizu:['白上虎太郎','おこ',1.12,.06,1.4],shipwright:['剣崎雌雄','ノーマル',.98,-.02,1],
 mayor:['ちび式じい','ノーマル',.95,.03,1],mori:['九州そら','ノーマル',1.02,0,1.1],
 bucho:['雀松朱司','ノーマル',.92,-.06,1.3],shinsa:['剣崎雌雄','ノーマル',.86,-.1,.8],ooya:['麒ヶ島宗麟','ノーマル',.92,.02,1.3],eisei:['雀松朱司','ノーマル',1.0,.02,1.2],junsa:['白上虎太郎','ふつう',1.04,.04,1.35], sawa:['雀松朱司','ノーマル',1.05,.04,1.3],nekota:['白上虎太郎','ふつう',1.12,.08,1.4],kanshucho:['麒ヶ島宗麟','ノーマル',.84,-.1,1.15],kurosaki:['麒ヶ島宗麟','ノーマル',.86,-.08,1.25],keiji:['青山龍星','熱血',1,-.04,1.15],
 // 宅建版
 minami:['ずんだもん','ノーマル',1.05,.02,1.2],kyaku:['白上虎太郎','ふつう',1.04,.03,1.1],haruka:['冥鳴ひまり','ノーマル',1.02,.04,1.1],kagi:['麒ヶ島宗麟','ノーマル',.86,-.07,1.25],aya:['四国めたん','ノーマル',1.05,.03,1.1],kito:['雀松朱司','ノーマル',.86,-.08,1.25]};

// ゲーム本体と同じ計算でファイル名を決める
// 読み方の直し（画面の文字はそのまま、声だけ読み方を変える）
const yomi=t=>t.replace(/宅建/g,'たっけん').replace(/黒鍵/g,'くろかぎ').replace(/取消(?!し)/g,'取り消し').replace(/荒野/g,'こうや').replace(/(?<![一-龯々])金(?![一-龯々])/g,'カネ');
const cleanTxt=t=>t.replace(/<br>/g,'').replace(/[「」―]/g,'').replace(/　/g,'');
function vHash(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return (h>>>0).toString(16).padStart(8,'0')}
const VPKEYS=new Set([...html.matchAll(/([a-zA-Z]+):\{p:/g)].map(m=>m[1]));
const norm=k=>VPKEYS.has(k)?k:'narr';

// 読み上げるセリフを集める
// 第11話からのナレーションは、少し速い声（narrf）で録る
let CURN=null;const lines=[];const add=(t,k)=>{if(t)lines.push([t,norm(k==='narr'&&CURN?CURN:k)])};
// 宣伝動画のナレーション（ゲームでは使わない）
if(!GAME)try{for(const L of JSON.parse(fs.readFileSync(REPO+'tools/promo_lines.json','utf8')))lines.push([L.t,L.k])}catch(e){}
const vt=html.match(/const VOICE_TEST=(\[.*?\]\]);/);if(vt)vm.runInNewContext(vt[1]).forEach(([t,k])=>add(t,k));
for(const m of html.matchAll(/\{name:'(独学[^']+)',need:/g))add(`お前は今日から「${m[1]}」だ。`,'hero');
const ctx={window:{},LB:{eps:[],episode(e){this.eps.push(e)}}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(ROOT+'episodes/list.js','utf8'),ctx);
for(const m of ctx.window.LB_LIST)vm.runInContext(fs.readFileSync(ROOT+'episodes/'+m.file,'utf8'),ctx);
const enemyKey=f=>VPKEYS.has(f)?f:'boss';
for(const ep of ctx.LB.eps){
  CURN=ep.no>=11?'narrf':null;
  (ep.op||[]).forEach(L=>add(L.v||L.t,L.c==='say'?'hero':'narr'));
  for(const L of ((ep.arrest||{}).lines||[]))add(L[0],L[1]);
  for(const st of (ep.steps||[]))for(const [t,k] of (st.after||[]))add(t,k);
  for(const t of (ep.yokoku||[]))add(t.replace(/<[^>]+>/g,''),'narr');if(ep.nextTitle)add('次回、リーガルブレイク。'+ep.nextTitle+'！','narr');
  for(const P of (ep.epi||[])){add(P.nar,'narr');if(P.say){const sp=(P.figs.find(f=>f[1]===P.say.side)||P.figs[0])[0];add(P.say.text,sp)}}
  // 記述の章（kijutsu:1）は、事件の物語とボスの物語を、ふつうの話と同じ形にして集める
  const parts=ep.kijutsu?[{panels:ep.panels||[],efig:ep.efig},Object.assign({type:'boss'},ep.boss,{panels:(ep.boss&&ep.boss.panels)||[]})]:ep.parts;
  for(const p of parts){
    if(p.probe){add(p.probe.intro&&p.probe.intro.replace(/<[^>]+>/g,''),'narr');for(const D of p.probe.docs||[])add(D.note,'narr')}
    for(const P of p.panels){add(P.nar,'narr');if(P.say){const sp=(P.figs.find(f=>f[1]===P.say.side)||P.figs[0])[0];add(P.say.text,sp)}}
    add(p.kime,'hero');add('わっはっはっはっ、あっはっはっはっ！',enemyKey(p.efig||'boss'));
    if(p.type==='boss'){const bk=p.efig||'boss';add('甘いわ、小僧！',bk);if(p.lawName)add(p.lawName+'！','hero');
      const FS=ep.fin||(ep.no>=10&&ep.no<=13?'hyaku':ep.no>=6?'slash':'hokuto');if(FS==='tekken'){const TKL=t=>t.replace(/――/g,'、');for(const L of (ep.tekken||[['鉄剣、抜刀。'],['覚悟しろ――','法は、お前を許さない。'],['これで終わりだ――','法の鉄剣！']]))for(const t of L)add(TKL(t),'hero');add('ぐわあああっ！',bk)}else if(FS==='hyaku'){const H=Object.assign({taunt:'へっ、そんな拳、効かねえなあ！',reply:'なら、まとめて叩き込んでやる！'},ep.hyaku||{});add('アタタタタタタタタタタタタタタッ！','hero');add(H.taunt,bk);add(H.reply,'hero');add('ほあたぁっ！','hero');add('ぶべらぁっ！',bk)}else if(FS==='slash'){add('しょうっ！','hero');add('な、何をしやがった？',bk);add('お前の主張は、すでに切り裂かれている。','hero');add('ぐわあああっ！',bk)}else{add('ん？なんともねえぞ？',bk);add('ひでぶっ！',bk);add('お前の主張は、もう死んでいる。','hero');}add('奥義、'+(p.ougi||p.lawName+'拳')+'！','hero');if(p.ougi2)add('奥義中の奥義、'+p.ougi2+'！','hero')}
  }
}

// VOICEVOX で録音
const speakers=await (await fetch(ENGINE+'/speakers')).json();
function styleOf(k){const c=CAST[k]||CAST.narr;const sp=speakers.find(s=>s.name===c[0])||speakers.find(s=>s.name===CAST.narr[0])||speakers[0];
  const st=sp.styles.find(s=>s.name===c[1])||sp.styles[0];return {id:st.id,name:sp.name,speed:c[2],pitch:c[3],into:c[4]}}
const outDir=ROOT+'audio/';fs.mkdirSync(outDir,{recursive:true});
const need=new Map();for(const [t,k] of lines)need.set(vHash(k+'|'+cleanTxt(t)),[cleanTxt(t),k]);
// 録音した時の声と読み方を覚えておき、変わったものだけ録り直す
const MAN=outDir+'manifest.json';let man={};try{man=JSON.parse(fs.readFileSync(MAN,'utf8'))}catch(e){}
const sig=(st,text)=>[st.name,st.id,st.speed,st.pitch,st.into,text].join('|');
const used=new Set();let made=0;
for(const [h,[text,k]] of need){
  const st=styleOf(k);used.add(st.name);const mp3=outDir+h+'.mp3',say=yomi(text),now=sig(st,say);
  if(!man[h]&&fs.existsSync(mp3))man[h]=sig(st,text);
  if(fs.existsSync(mp3)&&man[h]===now)continue;
  const q=await (await fetch(`${ENGINE}/audio_query?speaker=${st.id}&text=${encodeURIComponent(say)}`,{method:'POST'})).json();
  Object.assign(q,{speedScale:st.speed,pitchScale:st.pitch,intonationScale:st.into,prePhonemeLength:.08,postPhonemeLength:.12});
  const wav=Buffer.from(await (await fetch(`${ENGINE}/synthesis?speaker=${st.id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)})).arrayBuffer());
  fs.writeFileSync('/tmp/v.wav',wav);execFileSync('ffmpeg',['-y','-loglevel','error','-i','/tmp/v.wav','-ac','1','-ar','24000','-b:a','64k',mp3]);made++;
  man[h]=now;console.log('録音',h,k,say.slice(0,24));
}
fs.writeFileSync(MAN,JSON.stringify(man,null,0));
const map=Object.fromEntries([...need.keys()].filter(h=>fs.existsSync(outDir+h+'.mp3')).sort().map(h=>[h,1]));
fs.writeFileSync(outDir+'index.js',`/* 自動録音の目次（tools/gen_voice.mjs が作る。手で直さない） */\nwindow.LB_AUDIO=${JSON.stringify(map)};\nwindow.LB_VOICE_CREDIT=${JSON.stringify([...used].sort().map(n=>'VOICEVOX:'+n))};\n`);
console.log(`セリフ ${need.size} 行、新しく録音 ${made} 行`);
