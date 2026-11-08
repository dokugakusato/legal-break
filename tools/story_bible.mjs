// LEGAL BREAK の物語を、アニメ化などに使えるように読みやすい文書へ書き出す。
// 使い方：node tools/story_bible.mjs
// 出力：story/STORY.md（全話の台本）、story/CHARACTERS.md（登場人物）
// ゲームの各話のファイル（episodes/*.js）から作るので、話を足したらもう一度実行すれば最新になる。
import fs from 'node:fs';import vm from 'node:vm';
const ROOT=new URL('..',import.meta.url).pathname,OUT=ROOT+'story/';
fs.mkdirSync(OUT,{recursive:true});
const ctx={window:{},LB:{eps:[],episode(e){this.eps.push(e)}}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(ROOT+'episodes/list.js','utf8'),ctx);
for(const m of ctx.window.LB_LIST)vm.runInContext(fs.readFileSync(ROOT+'episodes/'+m.file,'utf8'),ctx);
const hon=fs.readdirSync(ROOT+'episodes').filter(f=>/^hon\d+\.js$/.test(f)).sort();
for(const f of hon)vm.runInContext(fs.readFileSync(ROOT+'episodes/'+f,'utf8'),ctx);

// 人物の名前（ゲームの既定の名前）と、絵の説明（ソースのコメント）
const src=fs.readFileSync(ROOT+'index.html','utf8')+'\n'+fs.readFileSync(ROOT+'kijutsu.js','utf8');
const NAMES={};
for(const m of src.matchAll(/(?:const NAMES=|Object\.assign\(NAMES,)(\{[^}]*\})/g))Object.assign(NAMES,vm.runInNewContext('('+m[1]+')'));
const DESC={};
{const L=src.split('\n');L.forEach((l,i)=>{const m=l.match(/^\s*([a-z]+):mk\(/);if(m&&i>0){const c=L[i-1].match(/^\s*\/\/\s*(.+)/);if(c)DESC[m[1]]=c[1].trim()}})}

const clean=t=>String(t??'').replace(/<br\s*\/?>/g,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const who=(figs,side,fallback)=>{const f=(figs||[]).find(x=>x[1]===side)||(figs||[])[0];if(!f)return fallback||'？';return f[2]||(f[0]==='hero'?'佐藤':NAMES[f[0]]||f[0])};
const appear={};
function panel(p,ep,lines){
  if(p.nar)lines.push(`（ナレーション）${clean(p.nar)}`);
  const says=Array.isArray(p.say)?p.say:p.say?[p.say]:[];
  for(const s of says){if(typeof s==='string'){lines.push(`　「${clean(s)}」`);continue}
    lines.push(`　${who(p.figs,s.side)}「${clean(s.text)}」${s.evil?'（悪）':''}`)}
  (p.figs||[]).forEach(f=>{const n=f[2]||(f[0]==='hero'?'佐藤':NAMES[f[0]]||f[0]);(appear[f[0]]||=new Map());const a=appear[f[0]];if(!a.has(n))a.set(n,new Set());a.get(n).add(ep)});
  if(p.figs&&p.figs.length)lines.push(`　〔登場：${p.figs.map(f=>f[2]||(f[0]==='hero'?'佐藤':NAMES[f[0]]||f[0])).join('・')}${p.bg?`／背景：${p.bg}`:''}${p.props?`／小物：${p.props.map(x=>x[0]).join('・')}`:''}〕`);
}
const panels=(arr,ep,L,head)=>{if(!arr||!arr.length)return;if(head)L.push('',`#### ${head}`);arr.forEach(p=>{panel(p,ep,L);L.push('')})};
const fin=e=>e.fin||(e.no>=37&&e.no<=40?'sumo':e.no>=33&&e.no<=36?'bowling':e.no>=29&&e.no<=32?'homerun':e.no>=25&&e.no<=28?'chabudai':e.no>=21&&e.no<=24?'ryusei':e.no>=17&&e.no<=20?'swing':e.no>=10&&e.no<=13?'hyaku':e.no>=6?'slash':'hokuto');
const FIN={hokuto:'北斗の拳ふうの奥義',slash:'法の一閃',hyaku:'佐藤百裂拳（最後はアッパー）',tekken:'鉄拳',swing:'ジャイアントスイング',ryusei:'流星キック',chabudai:'ちゃぶ台返し',homerun:'ホームラン',bowling:'ボウリング',jihi:'慈悲の法拳（痛みなく天へ送る）',sumo:'法の突っ張り（押し出し）'};

const L=['# LEGAL BREAK ―法の拳― 全話の物語（台本）','',
'> このファイルは `node tools/story_bible.mjs` でゲームのデータから自動で作っている。直接書きかえず、ゲームの各話（episodes/*.js）を直してから作り直す。',
'> 登場する人物・団体・事件はすべて架空。実在の警察・役所・団体とは関係がない。','',
'## 目次',''];
const eps=ctx.LB.eps.slice().sort((a,b)=>(typeof a.no==='string'?-1:0)-(typeof b.no==='string'?-1:0)||String(a.no).localeCompare(String(b.no),undefined,{numeric:true}));
for(const e of eps)L.push(`- 第${e.no}話 ${e.title}${e.cat?`（${e.cat}）`:''}`);
for(const e of eps){
  const ep=`第${e.no}話`;
  L.push('','---','',`## ${ep} ${e.title}`,'');
  if(e.arc)L.push(`- 章：${e.arc}`);
  if(e.cat)L.push(`- 分野：${e.cat}（記述）`);
  L.push(`- 論点：${clean(e.topic)}`);
  if(e.enemy||(e.boss&&e.boss.enemy))L.push(`- 敵：${e.enemy||''}${e.boss&&e.boss.enemy&&e.boss.enemy!==e.enemy?` ／ ボス：${e.boss.enemy}`:''}`);
  if(e.kijutsu||e.hon)L.push(`- 必殺技：${FIN[fin(e)]||fin(e)}`);
  const lines=e[fin(e)];if(lines&&typeof lines==='object')L.push(`- 決めの台詞：敵「${clean(lines.taunt)}」／佐藤「${clean(lines.reply)}」`);
  if(e.op&&e.op.length){L.push('','### オープニング','');e.op.forEach(o=>L.push(`> ${clean(o.t)}`))}
  if(e.parts){e.parts.forEach((p,i)=>{
      L.push('',`### ${p.type==='boss'?'章ボス':'事件'}${p.type==='boss'?'':i+1}：${clean(p.title||p.topic)}`,'');
      if(p.enemy)L.push(`- 敵：${p.enemy}`);if(p.topic)L.push(`- 論点：${clean(p.topic)}`);L.push('');
      panels(p.panels,ep,L);
      if(p.kime)L.push(`　佐藤（決め台詞）「${clean(p.kime)}」`);
      if(p.ougi)L.push(`　奥義：${clean(p.ougi)}${p.lawName?`（${p.lawName}・${p.lawRef||''}）`:''}`);
      if(p.result)L.push('',`（結末）${clean(p.result)}`);
    })}
  if(e.panels){L.push('','### 事件','');panels(e.panels,ep,L)}
  if(e.steps&&e.steps.length){L.push('','### 佐藤の推理（4つの問い）','');e.steps.forEach((s,i)=>L.push(`${i+1}. ${clean(s.topic)}：${clean(s.q)}（技：${clean(s.tech)}）`))}
  if(e.boss){const b=e.boss;L.push('','### ボス戦','');panels(b.panels,ep,L);
    L.push(`- 記述の問い：${clean(b.q)}`,`- 模範解答：${clean(b.model)}`,`- 奥義：${clean(b.ougi)}（${clean(b.lawName)}・${clean(b.lawRef)}）`);
    if(b.result)L.push('',`（結末）${clean(b.result)}`)}
  ['arrest','epi'].forEach(k=>{if(Array.isArray(e[k])&&e[k].length)panels(e[k],ep,L,k==='epi'?(e.epiTitle||'後日談'):'逮捕')});
  if(e.arcEnd)L.push('',`（章の締め）${clean(e.arcEnd)}`);
  if(e.yokoku&&e.yokoku.length){L.push('','### 次回予告','');e.yokoku.forEach(y=>L.push(`> ${clean(y)}`))}
  else if(e.next)L.push('','### 次回予告','',`> ${clean(e.next)}`);
}
fs.writeFileSync(OUT+'STORY.md',L.join('\n')+'\n');

const C=['# LEGAL BREAK 登場人物','','> `node tools/story_bible.mjs` で自動作成。「絵のキー」はゲームのキャラ絵の名前（index.html / kijutsu.js の SIL）。同じ絵を、話によって別の役名で使っていることがある。','',
'| 絵のキー | 役名（登場する話） | 絵の説明 |','|---|---|---|'];
for(const k of Object.keys(appear).sort()){
  const roles=[...appear[k]].map(([n,s])=>`${n}（${[...s].slice(0,6).join('・')}${s.size>6?' ほか':''}）`).join(' ／ ');
  C.push(`| ${k} | ${roles} | ${(DESC[k]||'').replace(/\|/g,'／')} |`);
}
fs.writeFileSync(OUT+'CHARACTERS.md',C.join('\n')+'\n');
console.log('話数',eps.length,'人物',Object.keys(appear).length,'行数',L.length);
