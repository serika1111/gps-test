importScripts('version.js');

const CACHE_NAME = APP_VERSION;

// install
self.addEventListener('install', e => {
  self.skipWaiting();
});

// activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// fetch
self.addEventListener('fetch', e => {

  // ❌ HTML არ დაკეშო (ეს არის შენი ბაგის მიზეზი)
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // დანარჩენი ფაილები — cache OK
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
