/* service-worker.js */

const SW_VERSION = 'sfc-v1.1.0';
const PRECACHE = `precache-${SW_VERSION}`;
const RUNTIME = `runtime-${SW_VERSION}`;

// Derive the service worker scope base path (works at / or a subpath)
const ORIGIN = self.location.origin;
const BASE_PATH = self.registration.scope.replace(ORIGIN, '') || '/';

// Helper to build URLs relative to the current scope
const u = (path) => new URL(path, ORIGIN + BASE_PATH).pathname;

// App shell you want available offline (adjust as needed)
const APP_SHELL = [
  u('/'), // If deploying under a subpath, this resolves correctly
  u('/index.html'),
  u('/public/manifest.json'),
  u('/icons/snapfaultcore-192.png'),
  u('/icons/snapfaultcore-512.png'),
  u('/icons/snapfaultcore-maskable-512.png')
];

// Optional: keep runtime cache from exploding
const MAX_RUNTIME_ENTRIES = 200;
async function limitCacheSize(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]); // delete oldest
    return limitCacheSize(cacheName, maxEntries);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old versions
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (![PRECACHE, RUNTIME].includes(key)) {
            return caches.delete(key);
          }
        })
      );

      // Enable navigation preload (faster first paint on slow networks)
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests
  const isGET = req.method === 'GET';
  const sameOrigin = new URL(req.url).origin === ORIGIN;
  if (!isGET || !sameOrigin) {
    return; // let the browser handle it
  }

  // 1) Navigation requests (HTML) → network-first + offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Use navigation preload if available
          const preload = await event.preloadResponse;
          if (preload) {
            const cache = await caches.open(PRECACHE);
            cache.put(u('/index.html'), preload.clone());
            return preload;
          }

          const net = await fetch(req);
          // Cache the latest index for offline
          const cache = await caches.open(PRECACHE);
          cache.put(u('/index.html'), net.clone());
          return net;
        } catch {
          // Fallback to cached shell
          const cached = await caches.match(u('/index.html'));
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 2) Static assets (CSS/JS/images/manifest) → cache-first, then network
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        // Skip opaque or error responses
        if (!res || res.status !== 200 || res.type === 'opaque') return res;

        const cache = await caches.open(RUNTIME);
        cache.put(req, res.clone());
        limitCacheSize(RUNTIME, MAX_RUNTIME_ENTRIES);
        return res;
      } catch {
        // Optional: add extension-specific fallbacks (e.g., default image)
        return caches.match(req) || Response.error();
      }
    })()
  );
});

// Allow the page to trigger immediate activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
