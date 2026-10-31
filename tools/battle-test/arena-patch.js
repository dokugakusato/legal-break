/* build-arena.sh から呼ぶ。コピーしたオンライン版（battle/lb/online/index.html）に、
   記述バトルの問題（ノートの論点・本試験の過去問）を足す小さな差し込みをする。本番のファイルは変えない。 */
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || 'battle/lb';
const F = path.join(OUT, 'online/index.html');
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('差し込み場所が見つからない（オンライン版が変わった？）: ' + a.slice(0, 60)); s = s.replace(a, b); };
// 1) 追加の問題を読む
rep('<script src="decoys.js"></script>', '<script src="decoys.js"></script>\n<script src="extra-q.js"></script>');
// 2) ストーリーモードの問題を作ったあとに、追加の問題を足す
rep('/* ---------- 声 ---------- */', "{const _bq=buildQuestions;buildQuestions=function(){_bq();(window.OL_EXTRA||[]).forEach(x=>QS.push(x))}}\n/* ---------- 声 ---------- */");
// 3) 紙芝居の見出し（話の番号がない問題は、出典を出す）・コマ数
rep('`記述ファイト｜第${Q.no}話 ${Q.title}`', '`記述ファイト｜${Q.tag||(\'第\'+Q.no+\'話 \'+Q.title)}`');
rep('Q.panels.slice(0,3)', 'Q.panels.slice(0,Q.pn||3)');
// 4) 通常版の index.html はページとして置かず、絵を借りるための文字として読む
rep("fetch('../index.html')", "fetch('../main-index.txt')");
// 5) 声は本番のサイトのファイルをそのまま使う
rep("'../audio/'+h+'.mp3'", "'https://legal-break.5ukaku.com/audio/'+h+'.mp3'");
rep("'audio/'+id+'.mp3'", "'https://legal-break.5ukaku.com/online/audio/'+id+'.mp3'");
// 6) 「通常版へ」は本番のサイトへ
rep('<a href="../"', '<a href="https://legal-break.5ukaku.com/"');
// 7) キャラを増やす（通常版の登場人物の絵を使う。声は録音がないので読み上げ）
rep('\n];\n\n/* ---------- 通常版のファイルから', `
];
CHARS.push(
 {id:'old',name:'田中',sp:'時効百裂杖',spMove:'rush',cap:'頑固で物知りなじいさん'},
 {id:'oldwoman',name:'鈴木',sp:'井戸端百烈ビンタ',spMove:'rush',cap:'町いちばんの物知りばあさん'},
 {id:'okami',name:'松本',sp:'女将の大回転おもてなし',spMove:'spin',cap:'宿屋の女将'},
 {id:'keiji',name:'鬼塚',sp:'現行犯ドロップキック',spMove:'dash',cap:'荒野の鬼刑事'},
 {id:'kuroda',name:'黒田',sp:'無権代理・影分身',spMove:'dash',cap:'偽りの代理人'},
 {id:'ronanushi',name:'鬼瓦',sp:'牢名主ボディプレス',spMove:'upper',cap:'雑居房の牢名主'},
 {id:'junsa',name:'矢吹',sp:'職務質問ラリアット',spMove:'dash',cap:'町の巡査'}
);

/* ---------- 通常版のファイルから`);
rep('const ANN={', `Object.assign(TAUNT,{old:'わしの畑に手を出す気か、若いの。',oldwoman:'あんたの言い分、ぜーんぶお見通しだよ。',okami:'うちの宿で暴れるなら、お代はきっちりいただくよ。',keiji:'証拠はそろってる。観念しな。',kuroda:'代理人の黒田だ。話は通してある。',ronanushi:'うその告げ口も、立派な武器よ。',junsa:'ちょっと、お話いいですか？'});
Object.assign(WINL,{old:'ふぉっふぉっ、若いもんにはまだ負けんわい。',oldwoman:'おやまあ、口ほどにもないねえ。',okami:'またのお越しを！',keiji:'署まで来てもらおうか。',kuroda:'契約成立、ってことで。',ronanushi:'懲罰房がお似合いだぜ。',junsa:'本官の勝ちであります！'});
[['a1',{old:'ほいさっ！',oldwoman:'えいっ！',okami:'はいっ！',keiji:'おらっ！',kuroda:'ふっ！',ronanushi:'ふんがっ！',junsa:'はっ！'}],
 ['a2',{old:'どっこいしょぉ！',oldwoman:'ほれっ！',okami:'どうぞっ！',keiji:'確保ぉ！',kuroda:'はぁっ！',ronanushi:'どすこいっ！',junsa:'とぉっ！'}],
 ['rush',{old:'杖杖杖杖ぇっ！',oldwoman:'ペシペシペシペシッ！',okami:'はいはいはいはいっ！',keiji:'逮捕逮捕逮捕ぉっ！',kuroda:'シャシャシャシャッ！',ronanushi:'オラオラオラァッ！',junsa:'ピピピピーッ！'}],
 ['lose',{old:'こ、腰がぁぁっ！',oldwoman:'あれまぁぁっ！',okami:'きゃあああっ！',keiji:'ぐあああっ！',kuroda:'ば、ばれたかぁぁっ！',ronanushi:'お、お助けぇぇっ！',junsa:'ほ、本官がぁぁっ！'}],
 ['groan',{old:'あいたた……腰が……',oldwoman:'おおぉ……',okami:'くっ……',keiji:'ぬぅ……',kuroda:'ぐぅ……',ronanushi:'ぐへぇ……',junsa:'う……'}],
 ['counter',{old:'年寄りをなめるでない！',oldwoman:'甘いねえ！',okami:'お見通しよ！',keiji:'甘いんだよ！',kuroda:'甘いな！',ronanushi:'効かねえなぁ！',junsa:'見逃しませんよ！'}]
].forEach(([k,v])=>Object.assign(CHAR_LINES[k],v));
const ANN={`);
rep('/^(mina)/.test(id)', '/^(mina|girl|oldwoman|okami)/.test(id)');
// 8) 試作の表示
s = s.replace('試作版・CPUと練習', '試作版・CPUと練習（全論点）');
fs.writeFileSync(F, s);
// 追加の問題（オンライン版の問題の形に変える）
const conv = (k, i, tag, pn) => {
  const pt = Math.round(20 / k.slots.length);
  const panels = k.story.filter(p => !/^出題/.test(p.nar || '')).slice(0, pn).map(p => Object.assign({}, p));
  return { good: k.slots.map(x => ({ t: x.a, label: x.hint || x.a, pt })), pool: k.wrong.map(w => typeof w === 'string' ? { t: w, why: '' } : { t: w.t, why: w.why || '' }),
    no: 1000 + i, ep: { no: 1000 + i, title: k.topic }, title: k.topic, tag: tag, pn: panels.length, lawName: k.topic, q: k.q,
    keys: [], model: k.model, exp: k.exp, panels, efig: 'boss', narr: 'narr' };
};
const N = require(path.resolve('functions/kijutsu.js')), KK = require(path.resolve('functions/kakomon.js'));
const X = [];
N.forEach(k => X.push(conv(k, X.length, `${k.field}｜${k.topic}`, 4)));
KK.forEach(k => X.push(conv(k, X.length, `${k.field}｜${k.topic}`, 3)));
X.forEach(x => { x.keys = x.good.concat(x.pool).sort(() => Math.random() - .5); });
fs.writeFileSync(path.join(OUT, 'online/extra-q.js'), '/* 自動で作る（tools/battle-test/arena-patch.js）。記述バトルの問題：ノートの論点・本試験の過去問 */\nwindow.OL_EXTRA=' + JSON.stringify(X) + ';\n');
console.log('オンライン版の試作：ストーリーモードの問題＋追加', X.length, '問 →', OUT + '/online/');
