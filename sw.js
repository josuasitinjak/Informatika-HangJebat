'use strict';
const CACHE = 'xavetra-offline-v1';
const FILES = [
  './','./index.html','./login.html','./register.html','./dashboard.html','./modul.html','./kuis.html','./simulator.html','./tugas.html','./catatan.html','./tanya-ai.html','./glosarium.html','./offline.html','./manifest.webmanifest',
  './assets/css/style.css','./assets/css/hj.css','./assets/css/landing.css','./assets/css/animated-list.css','./assets/css/demo-videos.css',
  './assets/js/core.js','./assets/js/tw-config.js','./assets/js/main.js','./assets/js/landing.js','./assets/js/content.js','./assets/js/lessons.js','./assets/js/auth.js','./assets/js/classroom.js','./assets/js/animated-list.js','./assets/js/glossary.js','./assets/js/gemini.js','./assets/js/motion-ui.js','./assets/js/cursor-glow.js','./assets/js/robot.js','./assets/js/robot-svg.js','./assets/js/demo-videos.js','./assets/js/gradient-ascii.js',
  './assets/data/penjualan-koperasi.csv','./assets/images/app-icon.svg','./assets/images/xavi-maskot.svg','./assets/images/jebat-konsep-maskot-v2.svg'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await Promise.allSettled(FILES.map((file) => cache.add(file)));
    const remote = [
      'https://cdn.tailwindcss.com',
      'https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
    ];
    await Promise.allSettled(remote.map(async (url) => {
      const request = new Request(url, { mode: 'no-cors' });
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') await cache.put(request, response);
    }));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('xavetra-offline-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    if (!['style','script','font'].includes(request.destination)) return;
    if (!['cdn.tailwindcss.com','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)) return;
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') {
        try { await (await caches.open(CACHE)).put(request, response.clone()); } catch (_) {}
      }
      return response;
    })().catch(() => caches.match(request)));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          try { await (await caches.open(CACHE)).put(url.pathname, response.clone()); } catch (_) {}
        }
        return response;
      } catch (_) {
        const key = new URL(request.url); key.search = ''; key.hash = '';
        return (await caches.match(key.pathname)) || (await caches.match('./offline.html'));
      }
    })());
    return;
  }
  event.respondWith(caches.match(request).then(async (cached) => {
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      try { await (await caches.open(CACHE)).put(request, response.clone()); } catch (_) {}
    }
    return response;
  }).catch(() => caches.match(request)));
});



