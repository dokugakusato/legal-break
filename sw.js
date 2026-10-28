/* LEGAL BREAK：アプリとして動かすための仕組み（電波が弱くても前に遊んだ話は開ける）
   毎日の更新が届くよう、ゲーム本体と話のデータは「まずネットから取り、だめなら保存分」を使う。
   声のファイルは中身が変わらないので「保存分を優先」する。 */
const CACHE='legalbreak-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.endsWith('.mp3')||u.pathname.includes('/icons/')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok)c.put(req,r.clone());return r}))));
    return;
  }
  e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>caches.match(req,{ignoreSearch:true})));
});
