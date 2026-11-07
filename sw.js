const CACHE='daftar-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  const sameOrigin=url.origin===location.origin;
  const fonts=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(!sameOrigin&&!fonts) return;
  const isDoc=req.mode==='navigate'||(sameOrigin&&(url.pathname.endsWith('/')||url.pathname.endsWith('/index.html')));
  if(isDoc){
    e.respondWith(
      fetch(req).then(res=>{
        if(res&&res.ok){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); }
        return res;
      }).catch(()=>caches.match('./index.html').then(h=>h||caches.match('./')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit=>{
      const net=fetch(req).then(res=>{
        if(res&&(res.ok||res.type==='opaque')){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
        return res;
      }).catch(()=>hit);
      return hit||net;
    })
  );
});
