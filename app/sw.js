/*
 * Minimal offline cache for the 미리꼭 PWA (standalone web build only).
 *
 * Registered from src/main.tsx ONLY when the app is built with VITE_PWA=true,
 * so the App-in-Toss / Toss-webview build never installs a service worker.
 *
 * Strategy: cache-first with a background refresh. After the first online load
 * the app opens offline; data itself lives in localStorage, not here.
 */
const CACHE = "mirikkok-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      // Navigations fall back to the cached app shell when offline.
      if (request.mode === "navigate") return cached || network || cache.match("./");
      return cached || network;
    })(),
  );
});
