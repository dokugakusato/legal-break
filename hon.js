/* LEGAL BREAK 本試験ボーナス（BONUS STAGE 0.1・0.2・0.3）
   今年（令和8年度）の本試験の記述問題を題材にした、記述ボス戦。
   ・話を選ぶ画面のいちばん上（第1話の前＝「0話」の位置）に3つ並べる。何もクリアしていなくても遊べる。
   ・記述ボス戦だけ。まちがえても佐藤はダメージを受けず、ギャグが出るだけ。何度でも書き直せる（再起不能にはしない）。
   ・クリアしても「クリアした話の数」や地位には入れない（記述の得点だけ P.kj['0.1'] などに残す）。
   データは episodes/hon01.js〜hon03.js（LB.episode の形。声の自動録音もこのファイルを読む）。 */
(function(){
const HON=[{no:'0.1',file:'hon01.js',q:'問44',cat:'行政法',t:'訴えの利益の消滅（開催予定日の経過）'},
           {no:'0.2',file:'hon02.js',q:'問45',cat:'民法',t:'種類債権の特定と所有権の移転'},
           {no:'0.3',file:'hon03.js',q:'問46',cat:'民法',t:'併存的債務引受'}];
const loadHon=m=>LB.eps[m.no]?Promise.resolve(LB.eps[m.no]):new Promise((res,rej)=>{const s=document.createElement('script');s.src='episodes/'+m.file+'?t='+Date.now();
  s.onload=()=>LB.eps[m.no]?res(LB.eps[m.no]):rej(new Error('形が違う'));s.onerror=()=>rej(new Error('読み込み失敗'));document.body.appendChild(s)});

async function playHon(no){
  ac();const m=HON.find(x=>x.no===no);let e;
  try{e=await loadHon(m)}catch(err){const box=$('#epList');if(box)box.insertAdjacentHTML('afterbegin',`<div class="card err"><p class="qtext">第${no}話を読み込めなかった。通信を確かめて、もう一度押してくれ。</p></div>`);return}
  CH=e;setWorld(e.world);S.yk=0;S.life=3;S.hp=100;S.bossFails=0;S.stats={};S.run={ok:0,n:0,lost:0,died:0,bossMiss:0};
  Object.assign(KJ,{step:0,miss:{},cards:(e.cards||[]).slice(),score:0,best:0,tries:0,done:0,shown:0,bannered:0});
  CH.parts=[{topic:e.boss.topic,type:'boss'}];S.part=0;
  if(e.op&&e.op.length)opening(e,kjBossIntro);else kjBossIntro();
}
window.playHon=playHon;

// まちがえても、だれも傷つかない：ダメージの代わりに、ギャグが出る
const HON_GAGS=['おしい！ 魔物が、赤ペンで花丸を半分だけ描いていった。',
 '答案用紙が、紙ひこうきになって飛んでいった。もう一枚どうぞ。',
 '看板猫が「にゃー（もう一回）」と鳴いた。',
 '佐藤、キーワードを手のひらに書こうとして、自分で止めた。えらい。',
 '魔物「ふふん」……と言いつつ、ちょっと汗をかいている。',
 '大丈夫。本試験はもう終わった。ここは何度でも書き直せる。',
 '佐藤のまゆげが、1ミリだけ下がった。すぐ戻った。',
 '六法が、そっと正しいページを開いてくれた（気がした）。'];
let honGagN=0;
function honGag(){const st=$('#stage');if(!st)return;const d=document.createElement('div');d.className='hon-gag';d.textContent=HON_GAGS[honGagN++%HON_GAGS.length];st.appendChild(d);setTimeout(()=>d.remove(),3200);
  const a=ac();if(a&&I.wood){I.wood(a,a.destination,a.currentTime,1300,.1);I.wood(a,a.destination,a.currentTime+.14,1000,.1)}
  const e=$('#stage .fig.r');if(e){e.classList.remove('knock');void e.offsetWidth;e.classList.add('knock');setTimeout(()=>e.classList.remove('knock'),900)}}
{const _h=hurt;hurt=function(){if(CH&&CH.hon){honGag();return}return _h.apply(this,arguments)}}
{const _kb=kjBoss;kjBoss=function(){if(CH&&CH.hon){S.life=3;S.hp=100}return _kb.apply(this,arguments)}}

// クリアしたら、話の記録には入れず、ボーナス用のクリア画面を出す
{const _ec=epClear;epClear=function(){
  if(!(CH&&CH.hon))return _ec.apply(this,arguments);
  closeSheet();BGM.stop();const no=CH.no,i=HON.findIndex(x=>x.no===no),nx=HON[i+1],m=HON[i],ov=$('#ov');
  ov.hidden=false;ov.className='black';ov.style.cssText='overflow-y:auto';
  ov.innerHTML=`<div class="finisher hon-clear"><div class="doka">第${no}話 BONUS STAGE CLEAR!!</div>
   <div class="card"><span class="qtag">令和8年本試験版 記述 ${m.q}（${m.cat}）</span><div class="kjscore"><b>${KJ.score}</b><small>／20点</small></div><p class="note">${m.t}</p></div>
   <div class="hon-btns">${nx?`<button class="btn" type="button" id="honNext">第${nx.no}話（${nx.q}）へ</button>`:''}<button class="btn ${nx?'ghost':''}" type="button" id="honBack">話を選ぶへ戻る</button></div></div>`;
  if(typeof fanfare==='function')fanfare();
  const close=()=>{ov.hidden=true;ov.innerHTML='';ov.style.cssText='';ov.className=''};
  $('#honBack').onclick=()=>{close();openSelect()};
  if(nx)$('#honNext').onclick=()=>{close();playHon(nx.no)};
}}

// 話を選ぶ：いちばん上（第1話の前）に、第0.1話・第0.2話・第0.3話 を出す
{const _rs=renderSelect;renderSelect=function(){const r=_rs.apply(this,arguments);
  const list=$('#epList');if(!list)return r;const kj=P.kj||{};
  const html=`<div class="hon-head">★ 令和8年本試験版 BONUS STAGE<small>今年の記述3問。最初から、何度でも遊べる</small></div>`+
    HON.map(m=>`<button class="ep bonusep honep" type="button" data-hon="${m.no}"><span class="no">第${m.no}話</span><span class="t">令和8年 ${m.q}（${m.cat}）<small>${m.t}</small></span><span class="st">${kj[m.no]!=null?`<b>${kj[m.no]}</b>/20`:'BONUS'}</span></button>`).join('')+'<div style="height:8px"></div>';
  list.insertAdjacentHTML('afterbegin',html);
  list.querySelectorAll('.honep').forEach(b=>b.onclick=()=>playHon(b.dataset.hon));
  return r}}

document.body.insertAdjacentHTML('beforeend',`<style>
.hon-head{font-weight:900;color:#ffd84a;letter-spacing:.04em;padding:4px 2px 0;display:flex;flex-direction:column;gap:2px}
.hon-gag{position:absolute;left:4%;right:4%;top:6%;z-index:6;background:#fffbe8;color:#2a221c;border:3px solid #0b0807;border-radius:14px;padding:8px 10px;font-weight:900;font-size:14px;line-height:1.4;text-align:center;box-shadow:0 4px 0 #0b0807;animation:honGag 3.2s ease forwards}
@keyframes honGag{0%{transform:scale(.4) rotate(-6deg);opacity:0}10%{transform:scale(1.06) rotate(2deg);opacity:1}18%{transform:none}85%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
.hon-head small{font-weight:400;color:#d8cfc0;font-size:12px;letter-spacing:0}
.honep{border-color:#ffd84a!important;background:linear-gradient(90deg,rgba(217,164,65,.32),rgba(42,52,72,.5))!important}
.honep .no{color:#ffd84a!important;font-weight:900}
.hon-clear .doka{font-size:clamp(30px,10vw,46px)!important;line-height:1.15;transform:rotate(-4deg)}
.hon-clear .hon-btns{display:flex;flex-direction:column;gap:10px;margin-top:12px}
</style>`);
})();
