// オンライン版の声：VOICEVOX で online/voices.json のセリフを mp3 にして online/audio/ に入れる
// GitHub Actions（.github/workflows/voice-online.yml）から動かす。通常版の声（audio/）には一切さわらない
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const ROOT=new URL('../',import.meta.url).pathname,ENGINE=process.env.VOICEVOX_URL||'http://127.0.0.1:50021';
// 話す人：[VOICEVOXのキャラ名, スタイル名, 速さ, 高さ, 抑揚]
const CAST={ann:['青山龍星','熱血',1,-.02,1.4],hero:['玄野武宏','ノーマル',1,-.03,1.25],mina:['冥鳴ひまり','ノーマル',1.05,.02,1.3],dogra:['剣崎雌雄','ノーマル',.95,-.08,1.25],boss:['麒ヶ島宗麟','ノーマル',.92,-.04,1.3]};
const yomi=t=>t.replace(/荒野/g,'こうや').replace(/土倉/g,'どくら').replace(/権田/g,'ごんだ').replace(/鉄鎖/g,'てっさ').replace(/法竜/g,'ほうりゅう').replace(/百裂/g,'ひゃくれつ').replace(/行商/g,'ぎょうしょう').replace(/地上げ/g,'じあげ').replace(/大車輪/g,'だいしゃりん').replace(/大旋風/g,'だいせんぷう').replace(/独学/g,'どくがく');
const {lines}=JSON.parse(fs.readFileSync(ROOT+'voices.json','utf8'));
const speakers=await (await fetch(ENGINE+'/speakers')).json();
const style=k=>{const c=CAST[k];const sp=speakers.find(s=>s.name===c[0])||speakers[0];const st=sp.styles.find(s=>s.name===c[1])||sp.styles[0];return {id:st.id,sig:[sp.name,st.name,c[2],c[3],c[4]].join('|'),c}};
const dir=ROOT+'audio/';fs.mkdirSync(dir,{recursive:true});
const MAN=dir+'manifest.json';let man={};try{man=JSON.parse(fs.readFileSync(MAN,'utf8'))}catch(e){}
let made=0;const ok={};
for(const [id,k,text] of lines){
  const st=style(k),say=yomi(text),sig=st.sig+'|'+say,mp3=dir+id+'.mp3';ok[id]=1;
  if(fs.existsSync(mp3)&&man[id]===sig)continue;
  const q=await (await fetch(`${ENGINE}/audio_query?speaker=${st.id}&text=${encodeURIComponent(say)}`,{method:'POST'})).json();
  Object.assign(q,{speedScale:st.c[2],pitchScale:st.c[3],intonationScale:st.c[4],volumeScale:1.25,prePhonemeLength:.05,postPhonemeLength:.1});
  const wav=Buffer.from(await (await fetch(`${ENGINE}/synthesis?speaker=${st.id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)})).arrayBuffer());
  fs.writeFileSync('/tmp/ov.wav',wav);execFileSync('ffmpeg',['-y','-loglevel','error','-i','/tmp/ov.wav','-ac','1','-ar','24000','-b:a','64k',mp3]);
  man[id]=sig;made++;console.log('録音',id,say);
}
fs.writeFileSync(MAN,JSON.stringify(man));
fs.writeFileSync(dir+'index.js',`/* オンライン版の声の目次（tools/gen_voice.mjs が作る） */\nwindow.OL_AUDIO=${JSON.stringify(Object.keys(ok).filter(id=>fs.existsSync(dir+id+'.mp3')))};\n`);
console.log(`セリフ ${lines.length} 行、新しく録音 ${made} 行`);
