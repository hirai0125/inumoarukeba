// 犬も歩けば君 サービスワーカー（オフラインでも起動できるようにする）
const VER='inumoarukeba-v9';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{mode:u.startsWith('http')?'no-cors':'same-origin'})).catch(()=>{}))))); self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // 地図タイル：見たことのある場所はオフラインでも表示
  if(u.hostname==='cyberjapandata.gsi.go.jp'){
    e.respondWith(caches.open(VER+'-tiles').then(async c=>{const hit=await c.match(e.request);
      const net=fetch(e.request).then(r=>{if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r;}).catch(()=>hit);
      return hit||net;}));return;}
  // アプリ本体：新しい版を優先、つながらない時は保存分
  if(u.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(VER).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));return;}
  // ライブラリ
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
