const DB_NAME = 'shikaku_offline';
const STORE_NAME = 'pending_solves';
const DB_VERSION = 1;

export interface QueuedSolve {
  id?: number;
  payload: Record<string, unknown>;
  token: string;
  queuedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueSolve(payload: Record<string, unknown>, token: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({ payload, token, queuedAt: Date.now() });
    tx.oncomplete = () => {
      // Request background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(reg => {
          (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-solves').catch(() => {});
        });
      }
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingSolves(): Promise<QueuedSolve[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeSolve(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function syncPendingSolves(): Promise<number> {
  const solves = await getPendingSolves();
  let synced = 0;

  for (const solve of solves) {
    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${solve.token}`,
        },
        body: JSON.stringify(solve.payload),
      });

      if (res.ok || (res.status >= 400 && res.status < 500)) {
        // Remove on success or permanent failure (4xx won't succeed on retry)
        if (solve.id !== undefined) await removeSolve(solve.id);
        if (res.ok) synced++;
      }
      // 5xx errors: leave in queue for retry
    } catch {
      // Network error: leave in queue
      break;
    }
  }

  return synced;
}
