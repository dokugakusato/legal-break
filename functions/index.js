/* LEGAL BREAK オンライン対戦：サーバー側の判定（呼び出し口と保存）。
   正誤・回答の順番・時間・ダメージ・勝敗・レーティングは、すべてサーバーで決める（ルールの計算は logic.js）。
   スマホから届くのは「何番を押したか」だけ。正解（questions.js）はスマホには送らない。
   時刻はすべてサーバーの時計（Date.now()）。
   動きを軽くするため、呼び出し口は1つ（battle）にまとめ、温まったサーバーを使い回す。
   また、変えた後の試合の状態をそのまま返し、スマホはそれを待たずに描く。 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onMessagePublished } = require('firebase-functions/v2/pubsub');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const L = require('./logic');
const Q = require('./questions');
const K = require('./kijutsu').concat(require('./kakomon'), require('./story-kj')); // ノートの論点＋本試験の過去問（令和5〜7年）＋ストーリーモードの章ボス

admin.initializeApp();
const db = admin.firestore();
const R = L.R;

// 東京リージョン。同時に立ち上がる数に上限（大量アクセスで費用が膨らまないように）
setGlobalOptions({ region: 'asia-northeast1', maxInstances: 5 });
const CALL = { enforceAppCheck: process.env.ENFORCE_APPCHECK === '1', cors: true, cpu: 1, memory: '256MiB', concurrency: 40 };

const now = () => Date.now();
const needAuth = req => { if (!req.auth) throw new HttpsError('unauthenticated', 'ログインが必要です'); return req.auth.uid; };
const needName = n => { const c = L.cleanName(n); if (!c) throw new HttpsError('invalid-argument', '名前は1〜12文字（@は使えません）'); return c; };
const pRef = uid => db.collection('battlePlayers').doc(uid);
const mRef = id => db.collection('battleMatches').doc(id);
const sRef = id => db.collection('battleSecrets').doc(id);
const tRef = uid => db.collection('battleTickets').doc(uid);
const MODES = ['choice', 'kj'];
const modeOf = x => MODES.includes(x) ? x : 'choice';
const qRef = mode => db.collection('battleQueue').doc(mode === 'kj' ? 'kj' : 'main');
const expire = t => admin.firestore.Timestamp.fromMillis(t + 24 * 3600 * 1000);
const clean = m => { const o = Object.assign({}, m); delete o.expireAt; return o; };

// つながっているか（Realtime Database の status/{uid}）。確認できないときは、つながっている扱い（勝手に負けにしない）
async function online(uid) {
  try { const v = (await admin.database().ref('status/' + uid).get()).val(); return !v || v.state !== 'offline'; }
  catch (e) { return true; }
}

// 試合を読み、ルールで変えて、書く（トランザクション）
async function mutate(matchId, uid, fn, pre) {
  if (typeof matchId !== 'string' || !/^[A-Za-z0-9]{10,40}$/.test(matchId)) throw new HttpsError('invalid-argument', '試合が見つかりません');
  const extra = pre ? await pre() : null;
  return db.runTransaction(async tx => {
    const [md, sd] = await Promise.all([tx.get(mRef(matchId)), tx.get(sRef(matchId))]);
    if (!md.exists || !sd.exists) throw new HttpsError('not-found', '試合が見つかりません');
    const m = md.data(), s = sd.data();
    if (!m.uids.includes(uid)) throw new HttpsError('permission-denied', 'この試合の参加者ではありません');
    const t = now(), wasEnd = m.phase === 'end', before = JSON.stringify([m.phase, m.qi, m.ans, m.players, m.paused, m.stamps, m.ev && m.ev.seq, m.ev && m.ev.list.length, m.kj && m.kj.prog]);
    const out = fn(m, s, t, extra) || {};
    const changed = before !== JSON.stringify([m.phase, m.qi, m.ans, m.players, m.paused, m.stamps, m.ev && m.ev.seq, m.ev && m.ev.list.length, m.kj && m.kj.prog]);
    if (!changed) return Object.assign({ now: t, phase: m.phase, match: clean(m) }, out); // 何も変わらなければ書かない（費用の節約）
    m.v = (m.v || 0) + 1;
    let pw = null;
    if (!wasEnd && m.phase === 'end' && !m.cpu) {
      const [a, b] = m.uids;
      const [da, dbb] = await Promise.all([tx.get(pRef(a)), tx.get(pRef(b))]);
      const pa = da.exists ? da.data() : L.newPlayer(m.players[a].name, t), pb = dbb.exists ? dbb.data() : L.newPlayer(m.players[b].name, t);
      L.settle(m, pa, pb, t);
      pw = [[pRef(a), pa], [pRef(b), pb]];
    }
    tx.set(mRef(matchId), m);
    tx.set(sRef(matchId), s);
    if (pw) pw.forEach(([r, d]) => tx.set(r, d));
    return Object.assign({ now: t, phase: m.phase, match: clean(m) }, out);
  });
}

function createMatch(tx, a, b, cpu, t, mode) {
  const id = db.collection('battleMatches').doc().id;
  const { m, s } = mode === 'kj' ? L.buildKJ(a, b, cpu, t, K) : L.buildMatch(a, b, cpu, t, Q.length);
  m.expireAt = expire(t); s.expireAt = expire(t);
  tx.set(mRef(id), m); tx.set(sRef(id), s);
  return id;
}

// ===================== それぞれの操作 =====================
const OPS = {
  // 自分の記録（名前・キャラを渡すと、なければ作る・変える）
  async me(uid, d) {
    const name = d.name != null ? needName(d.name) : null, chara = d.chara != null ? L.cleanChara(d.chara) : null;
    const p = await db.runTransaction(async tx => {
      const doc = await tx.get(pRef(uid));
      let p = doc.exists ? doc.data() : null;
      if (!p) { if (!name) return null; p = L.newPlayer(name, now()); if (chara) p.chara = chara; tx.set(pRef(uid), p); return p; }
      if ((name && name !== p.name) || (chara && chara !== p.chara)) { if (name) p.name = name; if (chara) p.chara = chara; p.updated = now(); tx.set(pRef(uid), p); }
      return p;
    });
    return { player: p ? Object.assign(L.pub(p), { games: p.games || 0 }) : null };
  },

  // 相手を探す。待っている人がいれば試合を作る、いなければ自分が待つ
  async find(uid, d) {
    const name = needName(d.name), chara = L.cleanChara(d.chara), mode = modeOf(d.mode);
    const q0 = await qRef(mode).get(), w0 = q0.exists ? q0.data().waiting : null;
    const alive = w0 && w0.uid !== uid ? await online(w0.uid) : false; // ページを閉じた人と組まないように
    return db.runTransaction(async tx => {
      const [qd, me] = await Promise.all([tx.get(qRef(mode)), tx.get(pRef(uid))]);
      const w = qd.exists ? qd.data().waiting : null, t = now();
      const p = me.exists ? me.data() : L.newPlayer(name, t);
      const meChanged = !me.exists || p.name !== name || p.chara !== chara; p.name = name; p.chara = chara;
      if (w && w0 && w.uid === w0.uid && w.uid !== uid && alive && t - w.at < R.QUEUE_FRESH) {
        const od = await tx.get(pRef(w.uid));
        const op = od.exists ? od.data() : L.newPlayer(w.name, t);
        const id = createMatch(tx, { uid: w.uid, p: op }, { uid, p }, false, t, mode);
        tx.set(tRef(w.uid), { matchId: id, at: t }); tx.set(tRef(uid), { matchId: id, at: t });
        tx.set(qRef(mode), { waiting: null });
        if (meChanged) tx.set(pRef(uid), p);
        if (!od.exists) tx.set(pRef(w.uid), op);
        return { matchId: id };
      }
      tx.set(qRef(mode), { waiting: { uid, name, rating: p.rating, at: t } });
      if (meChanged) tx.set(pRef(uid), p);
      return { waiting: true, since: t };
    });
  },

  // 探すのをやめる
  async cancel(uid, d) {
    const mode = modeOf(d.mode);
    await db.runTransaction(async tx => {
      const qd = await tx.get(qRef(mode)), w = qd.exists ? qd.data().waiting : null;
      if (w && w.uid === uid) tx.set(qRef(mode), { waiting: null });
    });
    return {};
  },

  // 見つからなかったので CPU と戦う（その間に誰かと組めていたら、そちらを返す）
  async cpu(uid, d) {
    const since = Number(d.since) || 0, mode = modeOf(d.mode);
    return db.runTransaction(async tx => {
      const [qd, td, me] = await Promise.all([tx.get(qRef(mode)), tx.get(tRef(uid)), tx.get(pRef(uid))]);
      const w = qd.exists ? qd.data().waiting : null, t = now();
      if (since > 0 && td.exists && td.data().at >= since) return { matchId: td.data().matchId };
      if (!me.exists) throw new HttpsError('failed-precondition', '先に名前を決めてください');
      if (w && w.uid === uid) tx.set(qRef(mode), { waiting: null });
      const cc = L.CHARAS[Math.floor(Math.random() * L.CHARAS.length)];
      const cpu = { uid: 'cpu' + Math.random().toString(36).slice(2, 10), p: { name: '修行相手（CPU）', rating: 0, rank: 'CPU', chara: cc } };
      const id = createMatch(tx, { uid, p: me.data() }, cpu, true, t, mode);
      tx.set(tRef(uid), { matchId: id, at: t });
      return { matchId: id };
    });
  },

  // 答える
  async answer(uid, d) {
    const { matchId, qi, choice } = d;
    if (!Number.isInteger(choice) || choice < 0 || choice > 4 || !Number.isInteger(qi)) throw new HttpsError('invalid-argument', '選択肢が正しくありません');
    return mutate(matchId, uid, (m, s, t) => L.answer(m, s, uid, qi, choice, t, Q));
  },

  // 時間で進める（スマホが締め切りの時刻に呼ぶ。サーバーが自分の時計で本当に過ぎたか確かめる）
  // 相手の切断に気づいたときも呼ぶ（15秒待って戻らなければ不戦敗）
  async tick(uid, d) {
    const { matchId } = d;
    return mutate(matchId, uid, (m, s, t, on) => { L.presence(m, t, on || {}); L.advance(m, s, t, Q); }, async () => {
      const md = await mRef(matchId).get(); if (!md.exists) return {};
      const m = md.data(); if (m.phase === 'end') return {};
      const humans = m.uids.filter(u => !m.players[u].cpu);
      const st = await Promise.all(humans.map(online));
      const on = {}; humans.forEach((u, i) => { on[u] = st[i]; }); return on;
    });
  },

  // 記述バトル：札を1枚出す
  async kj(uid, d) {
    const { matchId } = d, chips = Array.isArray(d.chips) ? d.chips.slice(0, 20) : d.chip;
    if (!(Number.isInteger(chips) || (Array.isArray(chips) && chips.length && chips.every(Number.isInteger)))) throw new HttpsError('invalid-argument', '札が正しくありません');
    return mutate(matchId, uid, (m, s, t) => L.kjAnswer(m, s, uid, chips, t));
  },

  // ひとこと（問題を解いている間は送れない）
  async stamp(uid, d) {
    return mutate(d.matchId, uid, (m, s, t) => L.stamp(m, uid, d.id, t));
  },

  // サーバーを温めるだけ
  async ping() { return {}; }
};

exports.battle = onCall(CALL, async req => {
  const uid = needAuth(req);
  const d = req.data || {}, op = OPS[d.op];
  if (!op) throw new HttpsError('invalid-argument', '操作が正しくありません');
  const r = await op(uid, d);
  return Object.assign({ now: now() }, r);
});

// 予算を超えたら課金を止める（試験用プロジェクトの安全装置）
// 予算の通知先 Pub/Sub トピック「budget-stop」をこれにつなぐ。止めると Functions も止まり、再開はオーナーの手動操作だけ。
exports.stopBillingOverBudget = onMessagePublished({ topic: 'budget-stop', region: 'asia-northeast1', maxInstances: 1 }, async ev => {
  const data = (ev.data && ev.data.message && ev.data.message.json) || {};
  if (!(Number(data.costAmount) > Number(data.budgetAmount))) { console.log('予算内', data.costAmount, '/', data.budgetAmount); return; }
  const { CloudBillingClient } = require('@google-cloud/billing');
  const projectId = process.env.GCLOUD_PROJECT || JSON.parse(process.env.FIREBASE_CONFIG || '{}').projectId;
  const client = new CloudBillingClient();
  const name = 'projects/' + projectId;
  const [info] = await client.getProjectBillingInfo({ name });
  if (!info.billingEnabled) { console.log('すでに停止済み'); return; }
  await client.updateProjectBillingInfo({ name, projectBillingInfo: { billingAccountName: '' } });
  console.log('予算を超えたので課金を停止した', data.costAmount, '/', data.budgetAmount);
});
