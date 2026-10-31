/* build-arena.sh から呼ぶ：arena-chars.js（キャラ・技・声の元データ）を、画面が読める chars-data.js にする */
const fs = require('fs'), path = require('path');
const AC = require('./arena-chars.js');
const out = process.argv[2] || 'battle/lb/online';
fs.writeFileSync(path.join(out, 'chars-data.js'), '/* 自動で作る（tools/battle-test/arena-data.js）。元は tools/battle-test/arena-chars.js */\nwindow.LBAC=' + JSON.stringify(AC) + ';\n');
