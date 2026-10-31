// 動作確認用の「相手役」ボット（試験用プロジェクトだけ）。Cloud Shell などで動かす：
//   cd ~/lb/tools/battle-test && npm i --no-save firebase@10 && node arena-bot.mjs
// 相手を探し、組めたら紙芝居で準備OK→FIGHTではキーワードをときどき出す。ひとことも言う。終わったら終了
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'node:fs'; import vm from 'node:vm';
const box = { window: {} }; vm.runInNewContext(fs.readFileSync(new URL('../../battle/config.js', import.meta.url), 'utf8'), box);
const cfg = box.window.LB_BATTLE_FIREBASE;
if (cfg.projectId === 'legal-break-6882d') throw new Error('本番では動かさない');
const app = initializeApp(cfg), auth = getAuth(app), db = getFirestore(app);
const call = (op, d) => httpsCallable(getFunctions(app, 'asia-northeast1'), 'battle')(Object.assign({ op }, d || {})).then(r => r.data);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const { user } = await signInAnonymously(auth); const me = user.uid;
console.log('ボット', me);
let id = null;
for (let i = 0; i < 60 && !id; i++) {
  const r = await call('arFind', { name: 'テストボット', char: process.argv[2] || 'boss' });
  if (r.matchId) id = r.matchId; else { await sleep(2500); const t = await getDoc(doc(db, 'battleTickets', me)); if (t.exists() && t.data().kind === 'arena' && Date.now() - t.data().at < 30000) id = t.data().matchId; }
}
if (!id) { console.log('相手が見つからなかった'); process.exit(0); }
console.log('試合', id);
await sleep(1500); await call('arStamp', { matchId: id, k: 'pre', i: 1 }).catch(() => {});
let m = null, lastRound = 0, said = false;
for (let i = 0; i < 400; i++) {
  const r = await call('arTick', { matchId: id }); m = r.match;
  if (m.phase === 'end') break;
  if ((m.phase === 'story' || m.phase === 'inter') && !m.players[me].ready && Date.now() - m.phaseAt > 12000) await call('arReady', { matchId: id });
  if (m.phase === 'fight' && Date.now() - m.phaseAt > 7000 && Math.random() < .5) {
    const keys = m.rounds[m.round - 1].keys, used = String(m.used[me] || '').split(',');
    const left = keys.map((_, k) => k).filter(k => !used.includes(String(k)));
    const n = Math.random() < .6 ? 1 : 2, pick = left.sort(() => Math.random() - .5).slice(0, n);
    const a = await call('arAttack', { matchId: id, picks: pick }).catch(e => ({ err: e.message }));
    console.log('R' + m.round, '攻撃', pick, a.ok === true ? '命中 ' + a.dmg : a.ok === false ? '自爆' : JSON.stringify(a).slice(0, 80));
  }
  await sleep(3000);
}
console.log('おわり', m && m.result);
await sleep(2000); await call('arStamp', { matchId: id, k: m && m.result && m.result.winner === me ? 'win' : 'lose', i: 0 }).catch(() => {});
process.exit(0);
