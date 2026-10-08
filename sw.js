const CACHE_NAME = "inkflow-shell-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigation = request.mode === "navigate";
  const isApiRequest =
    isSameOrigin &&
    (url.pathname === "/health" || url.pathname.startsWith("/v1/"));
  const shouldCache = isSameOrigin || url.hostname.includes("fonts.g");

  if (!shouldCache || isApiRequest) return;

  if (isNavigation) {
    const network = fetch(request);
    event.waitUntil(
      network
        .then((response) =>
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put("/", response.clone())),
        )
        .catch(() => undefined),
    );
    event.respondWith(network.catch(() => caches.match("/")));
    return;
  }

  const cached = caches.match(request);
  const network = fetch(request);
  event.waitUntil(
    network
      .then((response) => {
        if (response.ok || response.type === "opaque") {
          return caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, response.clone()));
        }
        return undefined;
      })
      .catch(() => undefined),
  );
  event.respondWith(
    cached.then((response) => response || network),
  );
});
