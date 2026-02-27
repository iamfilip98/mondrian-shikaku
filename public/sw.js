const CACHE_NAME = 'mondrian-shikaku-v1';

// Cache-first for static assets
const CACHE_FIRST_PATTERNS = [
  /\/assets\//,
  /\.woff2?$/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
];

// Network-first for API and HTML
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\.html$/,
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Cache-first for static assets
  if (CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname) || pattern.test(url.href))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for API and navigation
  if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname)) || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.mode === 'navigate') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});

// Background Sync for offline solve queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-solves') {
    event.waitUntil(syncOfflineSolves());
  }
});

async function syncOfflineSolves() {
  const DB_NAME = 'shikaku_offline';
  const STORE_NAME = 'pending_solves';

  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const solves = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const solve of solves) {
      try {
        const res = await fetch('/api/solve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + solve.token,
          },
          body: JSON.stringify(solve.payload),
        });

        if (res.ok || (res.status >= 400 && res.status < 500)) {
          const deleteTx = db.transaction(STORE_NAME, 'readwrite');
          deleteTx.objectStore(STORE_NAME).delete(solve.id);
        }
      } catch {
        break; // Still offline
      }
    }
  } catch {
    // DB not available
  }
}
