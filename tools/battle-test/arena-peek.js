// 最近の試合の状態を見る（試験用）。Cloud Shell で：cd ~/lb/functions && node ../tools/battle-test/arena-peek.js
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'legal-break-battle-test' });
(async () => {
  const q = await admin.firestore().collection('arenaMatches').orderBy('created', 'desc').limit(4).get();
  const f = t => t ? new Date(t + 9 * 3600e3).toISOString().slice(11, 19) : '-';
  q.docs.forEach(d => {
    const m = d.data();
    console.log(d.id, f(m.created), 'phase', m.phase, 'R' + m.round, 'phaseAt', f(m.phaseAt), 'until', f(m.until), 'v', m.v, 'ev', (m.ev || []).length, 'log', JSON.stringify(m.log), 'res', JSON.stringify(m.result && { w: (m.players[m.result.winner] || {}).name, r: m.result.reason }));
    Object.values(m.players).forEach(p => console.log('   ', p.name, p.char, 'ready', p.ready, 'seen', f(p.seen), 'hp', p.hp));
  });
  process.exit(0);
})();
