// 離線用：App 本身和函式庫存進快取；書本身存在 IndexedDB
const C="shelf-v1";
const CORE=["./","index.html","manifest.webmanifest","icon-512.png",
"https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
"https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.hostname.endsWith("standardebooks.org"))return;
  // App 頁面：先拿新的，沒網路才用快取
  if(u.origin===location.origin){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));return}
  // 函式庫、字型：快取優先
  if(/cdnjs|jsdelivr|fonts\.(googleapis|gstatic)/.test(u.hostname))e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r})));
});
