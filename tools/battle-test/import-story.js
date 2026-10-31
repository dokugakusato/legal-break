/* ストーリーモードの章ボスの記述を、対戦の問題（functions/story-kj.js）に変える。
   読むのは main ブランチ（本番）の episodes/*.js と online/stories.js・online/decoys.js（git show で読むだけ。本番のファイルは変えない）。
   ストーリーモードに話が増えたら、次の公開のときに自動で対戦にも入る。
   変換の仕方はオンライン版（online/index.html の buildQuestions）と同じ。
   使い方: node tools/battle-test/import-story.js [ブランチ名=origin/main] */
const { execSync } = require('child_process'), vm = require('vm'), fs = require('fs'), path = require('path');
const REF = process.argv[2] || 'origin/main';
const show = f => { try { return execSync(`git show ${REF}:${f}`, { encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return null; } };
const eps = [];
const ctx = { window: {}, console };
ctx.LB = { episode: e => eps.push(e) }; ctx.window.LB = ctx.LB;
vm.createContext(ctx);
const run = (src, name) => { if (src) try { vm.runInContext(src, ctx, { filename: name }); } catch (e) { console.warn('読めない:', name, e.message); } };
run(show('episodes/list.js'), 'list.js');
(ctx.window.LB_LIST || []).forEach(m => run(show('episodes/' + m.file), m.file));
run(show('online/stories.js'), 'stories.js');
run(show('online/decoys.js'), 'decoys.js');
const ST = ctx.window.OL_STORIES || {}, DE = ctx.window.OL_DECOYS || {};
const out = [];
for (const e of eps.sort((a, b) => a.no - b.no)) {
  const b = e.kijutsu ? e.boss : (e.parts || []).find(p => p.type === 'boss'); if (!b) continue;
  let keys = [];
  if (b.keys) keys = b.keys.map(k => k.ok ? { t: k.t, label: k.label || k.t, ok: 1 } : { t: k.t, why: k.why || '' });
  else if (b.tiles && b.points) {
    const used = new Set();
    for (const p of b.points) { const tile = b.tiles.find(t => (p.mark || []).some(m => t.includes(m) || m.includes(t))); if (tile && !used.has(tile)) { used.add(tile); keys.push({ t: tile, label: p.label, ok: 1 }); } }
    for (const d of b.decoys || []) { const ng = (b.ng || []).find(n => (n.any || []).some(a => d.includes(a))); keys.push({ t: d, why: ng ? ng.why : '答案に入れてはいけない言葉だ。' }); }
  }
  const good = keys.filter(k => k.ok);
  const bad = [...keys.filter(k => !k.ok), ...(DE[e.no] || [])].filter((k, i, a) => a.findIndex(x => x.t === k.t) === i && !good.some(g => g.t === k.t));
  if (good.length < 3 || bad.length < 4) { console.warn('とばす: 第' + e.no + '話（キーワードが足りない）'); continue; }
  const st = ST[e.no];
  const q = String(b.q || '').replace(/(答案に書くべき|答案の|記述の|判例の)キーワードを.*$/, '').replace(/40字程度で記述せよ。?$/, '').trim().replace(/、$/, '答えよ。');
  const story = st ? st.panels.map(p => Object.assign({}, p)) : [{ nar: (e.title || '') + '。' + (b.topic || ''), figs: [['hero', 'c', '佐藤']] }];
  story.push({ nar: '出題：' + q, figs: [['hero', 'c', '佐藤']], say: { side: 'c', text: '答案のキーワードを選んで戦え！' }, bg: 'red' });
  out.push({
    id: 'ep' + String(e.no).padStart(3, '0'), field: 'ストーリー第' + e.no + '話', topic: (st && st.law) || b.lawName || b.topic || e.title,
    note: 'ストーリーモード 第' + e.no + '話「' + String(e.title || '').split(' ― ')[0] + '」', src: 'story',
    story, q, tpl: '[]'.repeat(good.length),
    slots: good.map(k => ({ a: k.t, hint: k.label })), wrong: bad.map(k => ({ t: k.t, why: k.why || '答案に入れてはいけない言葉だ。' })),
    model: b.model || good.map(k => k.t).join('、'), exp: b.exp || '', keys: good.map(k => k.label)
  });
}
const file = path.join(__dirname, '../../functions/story-kj.js');
fs.writeFileSync(file, '/* 自動で作るファイル（tools/battle-test/import-story.js）。手で直さない。もと：ストーリーモードの章ボスの記述（' + REF + '） */\nmodule.exports = ' + JSON.stringify(out, null, 1) + ';\n');
console.log('ストーリーモードから', out.length, '問 →', path.relative(process.cwd(), file));
