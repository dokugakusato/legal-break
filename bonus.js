/* LEGAL BREAK　BONUS STAGE（CM）「肩書き警察 VS 街の法律家・佐藤」
   第22話のクリア画面から第23話へ進むときだけ流れる、試験とは関係のないギャグ。
   本編の話・問題・採点・セーブには、何もさわらない（P も S.stats も変えない）。
   行政書士版だけで動く（宅建版・海事代理士版では何もしない）。 */
(function(){
if(typeof SAVE_KEY==='undefined'||SAVE_KEY!=='legalbreak.v2')return;

/* 行政書士法（基礎知識）の早押し。肩書き警察のまちがいに、正しい言い返しを選ぶ。
   令和8年1月1日施行の改正後の条文番号（1条＝使命、1条の2＝職責、1条の3＝業務、1条の4＝業務の追加） */
const BQ=[
 {c:2,cop:"行政書士の使命なんか、法律に書いてない！",say:"改正で、第1条は使命になった。",law:"行政書士法1条（令和8年1月1日施行）",
  ok:"第1条は「使命」になった。行政手続の円滑な実施に寄与し、国民の権利利益の実現に資すること",ng:["第1条は、今も「目的」の規定のままだ","試験が簡単な資格に、使命なんて書かれていない"]},
 {c:2,cop:"行政書士の仕事は、役所に出す書類だけだ！",say:"権利義務と事実証明の書類も、業務だ。",law:"行政書士法1条の3",
  ok:"官公署に出す書類のほか、権利義務・事実証明に関する書類の作成も業務だ",ng:["行政書士は、役所の書類を書くだけの代書屋にすぎない","裁判所に出す訴状の作成も、行政書士の業務だ"]},
 {c:3,cop:"契約書を、代理人として作るなんてできない！",say:"契約書は、代理人として作成できる。",law:"行政書士法1条の4第1項3号",
  ok:"契約その他に関する書類を、代理人として作成できる",ng:["弁護士の下位資格だから、代理人にはなれない","特定行政書士だけができる"]},
 {c:3,cop:"行政書士が、不服申立ての代理なんてできるもんか！",say:"特定行政書士なら、不服申立ての代理ができる。",law:"行政書士法1条の4第1項2号・2項（令和8年改正で範囲拡大）",
  ok:"研修を修了した特定行政書士なら、許認可等に関する審査請求などの代理ができる",ng:["行政書士なら、誰でも研修なしでできる","弁護士と一緒でなければ、できない"]},
 {c:0,cop:"依頼なんて、気分で断ればいい！",say:"正当な事由がなければ、依頼は拒めない。",law:"行政書士法11条",
  ok:"正当な事由がなければ、依頼を拒むことはできない",ng:["断るのは、行政書士の自由だ","理由を書面で示せば、いつでも断れる"]},
 {c:0,cop:"やめた後なら、客の秘密をしゃべってもいい！",say:"やめた後も、秘密は守る。",law:"行政書士法12条",
  ok:"行政書士でなくなった後も、業務で知った秘密を漏らしてはならない",ng:["行政書士をやめた後は、自由に話してよい","3年たてば、話してよい"]},
 {c:1,cop:"肩書きがなくても、お礼の名目なら、書類作りを商売にしていい！",say:"名目が何でも、報酬をもらって業としては、できない。",law:"行政書士法19条1項（令和8年改正で明確化）",
  ok:"行政書士でない者は、いかなる名目でも報酬を得て、業として書類作成をすることはできない",ng:["お礼という名目なら、問題ない","月に5件までなら、問題ない"]}
];
/* 「行政書士は法律家か」論争の早押し（どうでもいい議論を、法律の事実で終わらせる） */
const BQ2=[
 {c:1,cop:"試験が簡単だから、行政書士は法律家じゃない！",say:"試験の難しさで法律家が決まる法律はない。",law:"「法律家」の法的定義は、どの法律にもない",
  ok:"試験の難しさで「法律家」かどうかを決める法律はない",ng:["試験が簡単なのは本当だから、法律家ではない","合格率が10％を超えたら、法律家ではないと法律で決まっている"]},
 {c:3,cop:"裁判をしない者は、法律家じゃない！",say:"得意分野の法律を、実務で扱っている。",law:"許認可・契約・相続…それぞれ行政法・民法の実務",
  ok:"それぞれ得意分野の法律を実務で扱っている。法律家ではないとは言えない",ng:["裁判に出ない仕事は、法律の仕事ではない","法律家を名乗れるのは、難関試験の合格者だけだ"]},
 {c:2,cop:"『法律家』と名乗ったら、法律違反だ！",say:"名称の使用制限があるのは、行政書士という名称だ。",law:"行政書士法19条の2（名称の使用制限）",
  ok:"「法律家」の名乗りを禁じる法律はない。使用が制限されるのは「行政書士」の名称だ",ng:["法律家と名乗るには、国の許可がいる","法律家と名乗れるのは弁護士だけと、法律で決まっている"]},
 {c:0,cop:"なら行政書士は、どんな法律事件でも代理できるんだな！",say:"他の法律で制限された業務は、できない。",law:"行政書士法1条の3第2項・弁護士法72条",
  ok:"できない。他の法律で制限されている業務（弁護士法72条の法律事件など）は扱えない",ng:["法律家なら、何でもできる","特定行政書士なら、民事裁判の代理もできる"]}
];
/* せりふ（声の自動録音は tools/gen_voice.mjs がこの一覧を読む） */
const BONUS_LINES=[["ここでトラブル発生。","narrf"],["またもや、資格に取り憑かれた魔物が現る。","narrf"],["行政書士は法律家じゃない！","katagaki"],["では、法律家の法的定義を示せ。","hero"]].concat(BQ.map(q=>[q.cop,"katagaki"]),BQ.map(q=>[q.say,"hero"]),BQ2.map(q=>[q.cop,"katagaki"]),BQ2.map(q=>[q.say,"hero"]),[["待てー！！お前は法律家ではない！！","katagaki"],["ここだけ急に何の取り締まりなんだよ。","hero"],["どうでもいい議論で、時間の無駄だ。","hero"],["街の法律家、百烈拳！","hero"],["アッパーカット！","hero"],["ぎゃあああ〜っ！","katagaki"],["ほら見ろ！ 法律家じゃない！","katagaki"],["やっぱり、ただの代書屋だ！","katagaki"],["試験が簡単なくせに、生意気な！","katagaki"],["ぐはっ……","hero"],["行政書士は法律家じゃなーい！","katagaki"],["佐藤は、行政書士は法律家ではない、に屈した。","narrf"],["……だが、本編は続く。","narrf"],["行政書士は、法律家だ！","hero"],["法律の勉強だけやってないで、早く実務しろよ。","hero"],["肩書き警察は去っていった。","narrf"],["なお、何の試験対策にもならなかった。","narrf"],["……と思ったら、行政書士法は、本試験の基礎知識に出る。","narrf"]]);
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
.bcm-cm.alert{color:#ff5a4a;text-shadow:0 0 18px rgba(255,60,40,.8);animation:bcmIn .4s cubic-bezier(.2,1.6,.4,1) both,alertB .5s .4s steps(2) 4}
@keyframes alertB{50%{opacity:.2}}
.bcm-cm{font-family:var(--display);font-size:clamp(34px,11vw,56px);color:#fff;letter-spacing:.08em;animation:bcmIn .4s cubic-bezier(.2,1.6,.4,1) both}
.bcm-bonus{font-family:var(--display);font-size:clamp(30px,10vw,48px);color:#ffd84a;text-shadow:3px 3px 0 #c22d22,0 0 22px rgba(255,216,74,.7);animation:bcmIn .4s cubic-bezier(.2,1.6,.4,1) both}
.bcm-sub{font-weight:900;font-size:clamp(20px,6vw,28px);color:#fff;border-top:3px solid #c22d22;border-bottom:3px solid #c22d22;padding:6px 14px;animation:bcmIn .4s .2s cubic-bezier(.2,1.6,.4,1) both}
.bcm-note{font-size:13px;line-height:1.7;color:#c9b89a;max-width:340px;animation:bcmIn .4s .4s both}
@keyframes bcmIn{0%{opacity:0;transform:scale(2)}100%{opacity:1;transform:none}}
.bstage{position:relative;width:100%;height:clamp(200px,34vh,320px);overflow:visible;border:3px solid #f2e6d0;background:linear-gradient(180deg,#2a1a3a,#7a3a2a 60%,#2a1a14)}
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
.bres p.real{color:#ffd84a}.bres p.real b{display:inline-block;margin-top:6px;font-size:20px;color:#fff;background:#c22d22;padding:4px 12px}
.bq{width:100%;display:grid;gap:7px}
.bhp{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;font-weight:900;font-size:13px;color:#f2e6d0}
.bhp div{display:flex;align-items:center;gap:6px}.bhp b{color:#ff4d3d;font-size:20px;letter-spacing:2px}
.bhp .e{flex:1;justify-content:flex-end}.bhp i{display:block;width:110px;height:10px;border:2px solid #f2e6d0;background:#222}.bhp em{display:block;height:100%;width:100%;background:linear-gradient(90deg,#c22d22,#ffd84a);transition:width .4s}
.bred{position:absolute;inset:0;z-index:8;background:rgba(220,30,20,.45);animation:imp .5s forwards;pointer-events:none}
.bstage .fig.hero.bhurt{animation:bhurt .5s}
@keyframes bhurt{0%,100%{transform:translateX(-50%)}25%{transform:translateX(-58%) rotate(-6deg);filter:brightness(2) sepia(1) hue-rotate(-40deg)}60%{transform:translateX(-44%) rotate(4deg)}}
.bstage .fig.katk{animation:katk .6s}
@keyframes katk{0%,100%{transform:none}40%{transform:translateY(-10%) scale(1.08)}}
.bdmg.mine{color:#ff4d3d;-webkit-text-stroke:1.5px #000}
.bcrit.miss b{color:#9aa4ae;-webkit-text-stroke:2px #000}.bcrit.miss span{background:#2a3448}
.bstage .fig.hero.bfall{transform:translateX(-50%) translateY(18%) rotate(-82deg);transform-origin:50% 100%;transition:transform .9s cubic-bezier(.5,0,.8,.6);filter:grayscale(.6)}
.bstage .fig.bcheer{animation:bcheer .5s ease-in-out infinite alternate}
@keyframes bcheer{to{transform:translateY(-8%)}}
.bcm-wrap.bgray{filter:grayscale(1) contrast(1.15) brightness(.75);transition:filter 1.6s}
.bcm-wrap.bgray .bstage{transform:scale(1.08);transition:transform 3s ease-out}
.bwasted{position:fixed;inset:0;z-index:65;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:0 16px}
.bwasted .band{width:100vw;background:linear-gradient(90deg,transparent,rgba(0,0,0,.78) 18%,rgba(0,0,0,.78) 82%,transparent);padding:14px 0}
.bwasted .txt{font-family:var(--display);font-size:clamp(56px,17vw,104px);letter-spacing:.1em;color:#c22d22;-webkit-text-stroke:2.5px #000;text-shadow:4px 4px 0 #000;animation:wst .9s cubic-bezier(.2,.8,.3,1) both}
.bwasted p{margin:0;font-weight:900;font-size:clamp(15px,4.4vw,19px);color:#f2e6d0;text-shadow:0 2px 0 #000;animation:wst 1s .3s both}
.bwasted p.cont{color:#ffd84a}
.bwin{position:absolute;z-index:9;left:0;right:0;top:14%;text-align:center;font-family:var(--display);font-size:clamp(34px,11vw,56px);line-height:1.15;color:#fff;-webkit-text-stroke:2px #c22d22;text-shadow:0 0 24px rgba(255,216,74,.9),4px 4px 0 #000;animation:bcmIn .45s cubic-bezier(.2,1.6,.4,1) both;pointer-events:none}
.bwin small{display:block;font-size:.45em;color:#ffd84a;-webkit-text-stroke:0;letter-spacing:.2em}
.bwin.perfect{color:#ffd84a}
.bconf{position:absolute;z-index:8;top:-4%;width:7px;height:12px;animation:bconf 2.2s linear forwards;pointer-events:none}
@keyframes bconf{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(340px) rotate(720deg);opacity:0}}
.bqh{display:flex;justify-content:space-between;font-weight:900;font-size:14px;color:#ffd84a;letter-spacing:.08em}
.bqh span{color:#c9b89a}
.bqo{appearance:none;text-align:left;background:#fbf6ec;color:#120c0a;border:3px solid #120c0a;padding:9px 12px;font:800 15px/1.45 var(--body);box-shadow:3px 3px 0 #000}
.bqo.ok{background:#e6f6e6;border-color:#5fae6a;box-shadow:0 0 0 3px #5fae6a}
.bqo.ng{background:#f6e2e0;border-color:#c22d22;text-decoration:line-through}
.bqo:disabled{opacity:1}
.bonusep{border-color:#ffd84a!important;background:linear-gradient(90deg,rgba(194,45,34,.35),rgba(42,52,72,.5))!important}
.bonusep .no{color:#ffd84a!important}
.bres p.dry{color:#c9b89a;font-size:15px}
</style>`);


/* 曲：おどおどした不穏な曲（登場）と、冷たい電子音の戦闘曲（マトリックス風の空気。旋律はオリジナル） */
Object.assign(TR,{
 bsus:{bpm:66,f(a,o,s,t,d){
  if(s%16===0){I.cello(a,o,[28,27][s>>4],t,16*d,.07);I.pad(a,o,[52,53],t,16*d,.025,700)}
  if(s%8===0||s%8===1)I.kick(a,o,t,s%8===0?.4:.25);if(s%2===0)I.tick(a,o,t,s%4===0?1800:1500,.025);
  if(s===6||s===22)I.bell(a,o,[82,76][s>>4],t,.03,3);if(s===13)I.bell(a,o,75,t,.025,3);if(s===29)I.bell(a,o,70,t,.03,4)}},
 bmatrix:{bpm:138,f(a,o,s,t,d){const bar=s>>3,r=[40,40,43,38][bar];
  I.bass(a,o,s%4===2?r+12:r,t,d*.6,.17,1);if(s%4===0)I.kick(a,o,t,.7);if(s%8===4)I.snare(a,o,t,.3);if(s%8===7)I.snare(a,o,t,.12);I.hat(a,o,t,s%2?.018:.03);
  I.pluck(a,o,[r+24,r+27,r+31,r+34,r+31,r+27,r+24,r+22][s%8],t,.028);
  if(s%16===0)I.pad(a,o,[r+12,r+15,r+19],t,16*d,.025,1200);
  if(s===15||s===31){I.whip(a,o,t,.25);I.tick(a,o,t,3200,.03)}
  const m={0:[64,4],4:[67,2],6:[66,2],8:[64,6],16:[71,4],20:[70,2],22:[67,2],24:[64,6]}[s];if(m)I.vib(a,o,m[0],t,.03,2)}}
});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const sayP=(t,k)=>new Promise(r=>say([[t,k]],r));
const BG={on:false};

/* 安っぽいCMのジングル（その場で鳴らす） */
function jingle(){const a=ac();if(!a)return;const t=a.currentTime;[[72,0],[76,.12],[79,.24],[84,.36],[79,.6],[84,.72]].forEach(([n,dt])=>I.bell(a,a.destination,n,t+dt,.08,1.5))}
function siren(){const a=ac();if(!a)return;try{I.siren(a,a.destination,a.currentTime,1.6,.04)}catch(e){}}

function bonusCM(done,label){BG.label=label;
  BGM.stop();closeSheet();stopSay();
  const ov=$('#ov');ov.hidden=false;ov.className='bcm';ov.style.cssText='';
  let end=false;
  const finish=()=>{if(end)return;end=true;stopSay();ov.hidden=true;ov.innerHTML='';ov.className='';ov.style.cssText='';done()};
  const skip='<button class="bcm-skip" type="button" id="bcmSkip">スキップ ▶▶</button>';
  const bindSkip=()=>{const b=$('#bcmSkip');if(b)b.onclick=finish};
  const alive=()=>!end;
  (async()=>{
    // 1. 画面暗転 → 「ここでトラブル発生」
    ov.innerHTML=skip+`<div class="bcm-wrap"><div class="bcm-title" id="bcmT"></div></div>`;bindSkip();
    BGM.play('bsus');await wait(700);if(!alive())return;
    $('#bcmT').innerHTML='<div class="bcm-cm alert">ここでトラブル発生</div>';siren();await Promise.all([sayP('ここでトラブル発生。','narrf'),wait(1900)]);if(!alive())return;
    $('#bcmT').innerHTML='<div class="bcm-bonus">BONUS STAGE</div><div class="bcm-sub">またもや、資格に取り憑かれた魔物が現る。</div><div class="bcm-note">その名は、肩書き警察。<br>法律の勉強をこじらせた末、<br>他人の肩書きを取り締まることだけが<br>生きがいになった男たち。</div>';
    await Promise.all([sayP('またもや、資格に取り憑かれた魔物が現る。','narrf'),wait(3600)]);if(!alive())return;
    // 2. 佐藤を取り囲む
    BGM.play('bmatrix');
    ov.innerHTML=skip+`<div class="bcm-wrap"><div class="bhp"><div><span>佐藤</span><b id="bhpH">♥♥♥</b></div><div class="e"><span>肩書き警察</span><i><em id="bhpE"></em></i></div></div><div class="bstage" id="bst"><div class="fig katagaki k3">${SIL.katagaki}</div><div class="fig katagaki k4">${SIL.katagaki}</div><div class="fig katagaki k1">${SIL.katagaki}</div><div class="fig katagaki k2">${SIL.katagaki}</div><div class="fig hero">${SIL.hero}<span class="ntag">佐藤</span></div></div><div class="bline" id="bl"></div><div id="bq" class="bq"></div><div id="bbd" class="bboard"></div></div>`;bindSkip();
    const st=$('#bst'),hero=st.querySelector('.hero'),cops=[...st.querySelectorAll('.katagaki')];
    const line=(t,who,cls='')=>{const l=$('#bl');if(l)l.innerHTML=`<div class="fl ${cls}"><b>${who}</b>${t}</div>`};
    const crit=(sub)=>{const c=document.createElement('div');c.className='bcrit';c.innerHTML=`<b>CRITICAL!!</b>${sub?`<span>${sub}</span>`:''}`;st.appendChild(c);setTimeout(()=>c.remove(),1700)};
    const dmg=(fig,n,big,mine)=>{const r=fig.getBoundingClientRect(),sr=st.getBoundingClientRect(),d=document.createElement('div');d.className='bdmg'+(big?' big':'')+(mine?' mine':'');d.textContent=n;d.style.left=(r.left-sr.left+r.width*.2)+'px';d.style.top=(r.top-sr.top+r.height*.1)+'px';st.appendChild(d);setTimeout(()=>d.remove(),1200)};
    const flash=()=>{const w=document.createElement('div');w.className='whiteout-mini';st.appendChild(w);setTimeout(()=>w.remove(),400)};
    await wait(500);if(!alive())return;
    // 3. まずは、ひと言で
    line('行政書士は法律家じゃない！','肩書き警察');await Promise.all([sayP('行政書士は法律家じゃない！','katagaki'),wait(1300)]);if(!alive())return;
    line('では、法律家の法的定義を示せ。','佐藤','hero');await Promise.all([sayP('では、法律家の法的定義を示せ。','hero'),wait(1300)]);if(!alive())return;
    flash();punch(1.8);hit(1.2);crit('法律家認定権など、存在しない！');dmg(cops[1],'-9999');await wait(1600);if(!alive())return;
    // 4. 行政書士法で言い返せ（基礎知識の早押し）
    let score=0;const left={};[...BQ,...BQ2].forEach(q=>left[q.c]=(left[q.c]||0)+1);const TOTAL=BQ.length+BQ2.length;
    let miss=0,ehp=100;const GLOAT=['ほら見ろ！ 法律家じゃない！','やっぱり、ただの代書屋だ！','試験が簡単なくせに、生意気な！'];
    const bars2=()=>{const h=$('#bhpH'),e=$('#bhpE');if(h)h.textContent='♥'.repeat(Math.max(0,3-miss))+'♡'.repeat(Math.min(3,miss));if(e)e.style.width=Math.max(0,ehp)+'%'};bars2();
    const redflash=()=>{const w=document.createElement('div');w.className='bred';st.appendChild(w);setTimeout(()=>w.remove(),500)};
    const quiz=async(set,off,head)=>{for(let qi=0;qi<set.length;qi++){const q=set[qi],c=cops[q.c];c.classList.remove('down');
      line(q.cop,'肩書き警察');say([[q.cop,'katagaki']]);
      const opts=[[q.ok,1],...q.ng.map(t=>[t,0])].sort(()=>Math.random()-.5);
      const box=$('#bq');box.innerHTML=`<div class="bqh">${head}<span>${off+qi+1}／${TOTAL}</span></div>`+opts.map(([t,k])=>`<button type="button" class="bqo" data-k="${k}">${t}</button>`).join('');
      try{box.lastElementChild.scrollIntoView({block:'nearest'})}catch(e){}
      const pick=await new Promise(res=>{box.querySelectorAll('.bqo').forEach(b=>b.onclick=()=>res(b))});
      if(!alive())return false;
      const ok=pick.dataset.k==='1';box.querySelectorAll('.bqo').forEach(b=>{b.disabled=true;if(b.dataset.k==='1')b.classList.add('ok');else if(b===pick)b.classList.add('ng')});
      if(ok)score++;
      if(ok){
        line(q.say,'佐藤','hero');await Promise.all([sayP(q.say,'hero'),wait(1100)]);if(!alive())return false;
        flash();punch(1.8);hit(1.2);crit(q.law);dmg(c,'-'+(7000+(off+qi)*111));ehp-=100/TOTAL;bars2();
        if(--left[q.c]===0)c.classList.add('down');
      }else{
        // まちがえると、肩書き警察の反撃。佐藤がダメージを受ける
        miss++;const g=GLOAT[(miss-1)%GLOAT.length];c.classList.remove('down');c.classList.add('katk');setTimeout(()=>c.classList.remove('katk'),600);
        line(g,'肩書き警察','big');say([[g,'katagaki']]);await wait(350);
        redflash();hero.classList.remove('bhurt');void hero.offsetWidth;hero.classList.add('bhurt');punch(1.6);hit(1.4);dmg(hero,'-1',false,true);bars2();
        const m=document.createElement('div');m.className='bcrit miss';m.innerHTML=`<b>MISS…</b><span>正解：${q.law}</span>`;st.appendChild(m);setTimeout(()=>m.remove(),2400);
        await wait(1500);if(!alive())return false;
        line('ぐはっ……','佐藤','hero');await Promise.all([sayP('ぐはっ……','hero'),wait(1000)]);if(!alive())return false;
        if(miss>=3){box.innerHTML='';return 'dead'}
      }
      await wait(1700);if(!alive())return false;box.innerHTML=''}return true};
    // 3回まちがえると、佐藤が倒れる → WASTED
    const defeat=async()=>{BGM.stop();$('#bq').innerHTML='';
      hero.classList.add('bfall');cops.forEach(c=>{c.classList.remove('down','fly');c.classList.add('bcheer')});
      line('行政書士は法律家じゃなーい！','肩書き警察','big');await Promise.all([sayP('行政書士は法律家じゃなーい！','katagaki'),wait(1600)]);if(!alive())return;
      const a=ac();if(a){const t=a.currentTime;[[52,0],[51,.5],[50,1],[47,1.5]].forEach(([n,dt])=>I.cello(a,a.destination,n,t+dt,1.2,.06))}
      const wr=$('.bcm-wrap');wr.classList.add('bgray');$('#bl').innerHTML='';
      const w=document.createElement('div');w.className='bwasted';w.innerHTML='<div class="band"><div class="txt">WASTED</div></div><p>佐藤は「行政書士は法律家ではない」に屈した。</p>';ov.appendChild(w);
      await Promise.all([sayP('佐藤は、行政書士は法律家ではない、に屈した。','narrf'),wait(2600)]);if(!alive())return;
      w.insertAdjacentHTML('beforeend','<p class="cont">……だが、本編は続く。</p>');await Promise.all([sayP('……だが、本編は続く。','narrf'),wait(1600)]);if(!alive())return;
      const go=document.createElement('button');go.className='btn';go.type='button';go.textContent=BG.label||'第23話へ';go.onclick=finish;w.appendChild(go);
      const sk=$('#bcmSkip');if(sk)sk.remove()};
    {const r=await quiz(BQ,0,'行政書士法で言い返せ！');if(r==='dead')return defeat();if(!r)return}
    S.bonusScore=score;
    // 5. 〇〇家ボード
    $('#bl').innerHTML='';const bd=$('#bbd');
    const rows=[['料理をする','料理家'],['格闘技をする','格闘家'],['妻を愛する','愛妻家']];
    for(const [a,b] of rows){bd.insertAdjacentHTML('beforeend',`<div><span>${a}</span><i>→</i><b>${b}</b></div>`);const x=ac();if(x)I.bell(x,x.destination,79,x.currentTime,.07,1);await wait(800);if(!alive())return}
    bd.insertAdjacentHTML('beforeend',`<div class="ng"><span>法律を専門業務として扱う行政書士</span><i>→</i><b>？</b></div>`);await wait(700);if(!alive())return;
    siren();const last=cops[1];last.classList.remove('down');
    line('待てー！！お前は法律家ではない！！','肩書き警察','big');await Promise.all([sayP('待てー！！お前は法律家ではない！！','katagaki'),wait(1800)]);if(!alive())return;
    line('ここだけ急に何の取り締まりなんだよ。','佐藤','hero');await Promise.all([sayP('ここだけ急に何の取り締まりなんだよ。','hero'),wait(1600)]);if(!alive())return;
    bd.innerHTML='';cops.forEach(c=>c.classList.remove('down'));
    // 5b. 「行政書士は法律家か」論争を、法律の事実で終わらせる
    Object.keys(left).forEach(k=>left[k]=0);BQ2.forEach(q=>left[q.c]++);
    {const r=await quiz(BQ2,BQ.length,'法律家論争に、法律で決着を！');if(r==='dead')return defeat();if(!r)return}
    S.bonusScore=score;
    line('どうでもいい議論で、時間の無駄だ。','佐藤','hero');await Promise.all([sayP('どうでもいい議論で、時間の無駄だ。','hero'),wait(1700)]);if(!alive())return;
    cops.forEach(c=>c.classList.remove('down'));
    // 6. 必殺技：街の法律家・百烈拳 → アッパーカット
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
    // 6b. 勝利。全問正解なら、いっそう華やかに
    {const v=document.createElement('div');v.className='bwin'+(miss===0?' perfect':'');v.innerHTML=(miss===0?'<small>PERFECT!!</small>':'')+'行政書士は<br>法律家だ！';st.appendChild(v);
      if(miss===0)for(let i=0;i<40;i++){const p=document.createElement('div');p.className='bconf';p.style.left=(Math.random()*100)+'%';p.style.background=['#ffd84a','#c22d22','#5fae6a','#38b6ff','#fff'][i%5];p.style.animationDelay=(Math.random()*.8)+'s';st.appendChild(p)}
      if(typeof fanfare==='function')fanfare();await Promise.all([sayP('行政書士は、法律家だ！','hero'),wait(2400)]);if(!alive())return;v.remove()}
    // 7. 捨て台詞
    line('法律の勉強だけやってないで、早く実務しろよ。','佐藤','hero');await Promise.all([sayP('法律の勉強だけやってないで、早く実務しろよ。','hero'),wait(2200)]);if(!alive())return;
    // 8. リザルト
    ov.innerHTML=skip+`<div class="bcm-wrap"><div class="bres"><h2>BONUS STAGE CLEAR!!</h2><table><tr><td>獲得経験値</td><td>0</td></tr><tr><td>獲得法律知識</td><td>0</td></tr><tr><td>失った時間</td><td>5分</td></tr></table><div id="bres2"></div></div></div>`;bindSkip();
    if(typeof fanfare==='function')fanfare();await wait(1400);if(!alive())return;
    $('#bres2').insertAdjacentHTML('beforeend','<p>肩書き警察は去っていった。</p>');await Promise.all([sayP('肩書き警察は去っていった。','narrf'),wait(1800)]);if(!alive())return;
    $('#bres2').insertAdjacentHTML('beforeend','<p class="dry">なお、何の試験対策にもならなかった。</p>');await Promise.all([sayP('なお、何の試験対策にもならなかった。','narrf'),wait(1800)]);if(!alive())return;
    $('#bres2').insertAdjacentHTML('beforeend',`<p class="real">……と思ったら、行政書士法は、本試験の基礎知識に出る。<br><b>行政書士法・法律家論争 ${S.bonusScore||0}／${BQ.length+BQ2.length}問</b></p>`);await Promise.all([sayP('……と思ったら、行政書士法は、本試験の基礎知識に出る。','narrf'),wait(2000)]);if(!alive())return;
    const go=document.createElement('button');go.className='btn';go.type='button';go.textContent=BG.label||'第23話へ';go.onclick=finish;$('#bres2').appendChild(go);
    const sk=$('#bcmSkip');if(sk)sk.remove();
  })();
}
window.bonusCM=bonusCM;

/* 話を選ぶ：第22話の下に、BONUS STAGE を出す（第22話をクリアすると遊べる） */
{const _rs=renderSelect;renderSelect=function(){const r=_rs.apply(this,arguments);
  const list=$('#epList');if(!list)return r;const after=list.querySelector('.ep[data-no="22"]');if(!after)return r;
  const open=!!P.eps[22];const b=document.createElement('button');b.type='button';b.className='ep bonusep';b.disabled=!open;
  b.innerHTML=`<span class="no">BONUS</span><span class="t">肩書き警察、襲来。<small>${open?'【おまけ】行政書士法（基礎知識）・法律家論争の早押し':'第22話をクリアすると解放'}</small></span><span class="st">${open?'BONUS':'未解放'}</span>`;
  b.onclick=()=>bonusCM(()=>openSelect(),'話を選ぶへ戻る');after.insertAdjacentElement('afterend',b);return r}}

/* 第22話のクリア画面の「第23話へ」を押したときだけ、CMをはさむ */
{const _ec=epClear;epClear=function(){const r=_ec.apply(this,arguments);
  if(CH&&CH.no===22){const b=$('#goNext');if(b&&!b.dataset.bcm){b.dataset.bcm='1';const go=b.onclick;b.onclick=()=>bonusCM(()=>go?go():playEp(23))}}
  return r}}
})();
