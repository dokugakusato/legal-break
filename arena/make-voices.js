/* arena/voices.json（試作で録音するセリフの一覧）を作る。node arena/make-voices.js
   足したキャラの全セリフと、全キャラの笑い声。本番の online/voices.json とは別 */
const fs = require('fs'), path = require('path');
const { NEW, LAUGH, MOVES, ANN, STAMPS, ROSTER, KO } = require('../tools/battle-test/arena-chars.js');
const lines = Object.entries(ANN).map(([id, t]) => [id, 'ann', t]);
NEW.forEach(c => {
  ['a1', 'a2', 'rush', 'lose', 'groan', 'counter', 'taunt', 'win', 'pick'].forEach(k => lines.push([c.id + '_' + k, c.id, c[k]]));
  lines.push([c.id + '_sp', c.id, c.sp.replace(/・/g, '、') + '！']);
});
Object.entries(LAUGH).forEach(([id, t]) => lines.push([id + '_laugh', id, t]));
const say = t => t.replace(/・/g, '、');
Object.entries(MOVES).forEach(([id, m]) => { lines.push([id + '_mid', id, '中技！ ' + say(m[0]) + '！']); lines.push([id + '_big', id, '大技！ ' + say(m[1]) + '！']); lines.push([id + '_ultra', id, '超ウルトラ技！ ' + say(m[2]) + '！！']); });
Object.entries(KO).forEach(([id, t]) => lines.push([id + '_ko', id, t]));
// ひとこと：使うキャラ全員の声で（id＝キャラ_st_場面_番号）
ROSTER.forEach(id => Object.entries(STAMPS).forEach(([k, arr]) => arr.forEach((t, i) => lines.push([id + '_st_' + k + i, id, t]))));
fs.writeFileSync(path.join(__dirname, 'voices.json'), JSON.stringify({ _: '試作（/lb/online/）で録音する声。arena/make-voices.js が作る。変えると GitHub が自動で録音する（.github/workflows/arena-voice.yml）', lines }, null, 1) + '\n');
console.log(lines.length, '行');
