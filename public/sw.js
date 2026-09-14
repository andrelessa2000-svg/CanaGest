const CACHE_NAME = "canagest-v1";

const PRECACHE_URLS = [
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network-first for everything: always try the network first and, when available,
// keep a copy in cache for offline fallback. This is safe in dev (no stale chunks)
// and gives full offline support when the network is unreachable.
function cacheable(request) {
  const url = new URL(request.url);
  if (request.method !== "GET") return false;
  if (url.origin !== self.location.origin) return false;
  const { pathname } = url;
  return (
    pathname === "/" ||
    pathname === "/fazendas" ||
    pathname === "/fazendas/nova" ||
    pathname === "/colheitas/nova" ||
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (!cacheable(request)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // For navigations, fall back to the cached shell when the exact page isn't cached.
          if (request.mode === "navigate") return caches.match("/");
          return Response.error();
        })
      )
  );
});