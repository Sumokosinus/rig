/* Rig – Service Worker: App läuft auch ohne Empfang am Wasser */
const VERSION = 'rig-v1';
const SHELL = ['./', './index.html', './style.css', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const STATIC_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const TILE_HOSTS = ['tile.openstreetmap.org', 'server.arcgisonline.com'];
const TILE_CACHE = 'rig-tiles';
const TILE_LIMIT = 600;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== TILE_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimTiles(){
  const c = await caches.open(TILE_CACHE);
  const keys = await c.keys();
  for(let i = 0; i < keys.length - TILE_LIMIT; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  // Wetterdaten nie cachen
  if(url.hostname.endsWith('open-meteo.com')) return;

  // Kartenkacheln: erst Cache, dann Netz; zuletzt gesehene Ausschnitte bleiben offline verfügbar
  if(TILE_HOSTS.some(h => url.hostname.endsWith(h))){
    e.respondWith(caches.open(TILE_CACHE).then(async c => {
      const hit = await c.match(req);
      if(hit) return hit;
      try{
        const res = await fetch(req);
        if(res.ok || res.type === 'opaque'){ c.put(req, res.clone()); trimTiles(); }
        return res;
      } catch(err){ return hit || Response.error(); }
    }));
    return;
  }

  // Bibliotheken und Schriften: Cache zuerst
  if(STATIC_HOSTS.includes(url.hostname)){
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      if(hit) return hit;
      const res = await fetch(req);
      if(res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    }));
    return;
  }

  // Eigene Dateien: Netz zuerst (Updates kommen sofort an), offline aus dem Cache
  if(url.origin === self.location.origin){
    e.respondWith(
      fetch(req).then(res => {
        if(res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, {ignoreSearch:true}).then(hit => hit || caches.match('./index.html')))
    );
  }
});
