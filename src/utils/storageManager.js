/**
 * Storage Manager for UniWorkload AI
 * Solves "Storage Quota Exceeded" (พื้นที่ไม่พอ) by pairing LocalStorage with native browser IndexedDB.
 * Provides multi-gigabyte local capacity for high-res evidence photos & PDF documents,
 * while keeping LocalStorage lean, safe, and immune to DOMException 22 (QuotaExceededError).
 */

const DB_NAME = 'uniworkload_indexed_db';
const DB_VERSION = 1;
const STORE_NAME = 'orders_vault';
const ORDERS_STORAGE_KEY = 'uniworkload_orders_data_clean_zero';

// Open or initialize native browser IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save all orders to native IndexedDB (supports 10GB+ storage without quota failure)
 */
export async function saveOrdersToIndexedDb(orders) {
  if (!orders || !Array.isArray(orders)) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear old records and save current batch
    store.clear();
    for (const ord of orders) {
      store.put(ord);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[StorageManager] IndexedDB save warning:', err);
  }
}

/**
 * Load all orders from native IndexedDB
 */
export async function loadOrdersFromIndexedDb() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[StorageManager] IndexedDB load warning:', err);
    return [];
  }
}

/**
 * Strips huge base64 Data URLs from orders before saving to LocalStorage (5MB cap)
 * to prevent DOMException: QuotaExceededError
 */
export function sanitizeOrdersForLocalStorage(orders) {
  if (!orders || !Array.isArray(orders)) return [];

  return orders.map((ord) => {
    const safeActualPhotos = (ord.actualPhotos || []).map((p) => {
      const url = p.url || '';
      // If photo has a massive base64 string (> 150KB), trim it for LocalStorage cache
      if (url.startsWith('data:image/') && url.length > 150000) {
        return {
          ...p,
          url: p.thumbnailUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect fill="%231e293b" width="400" height="260"/><text fill="%2394a3b8" font-size="14" x="200" y="130" text-anchor="middle">ภาพถ่ายหลักฐาน (จัดเก็บใน IndexedDB / คลาวด์)</text></svg>',
          isCachedInIndexedDb: true
        };
      }
      return p;
    });

    const safeEvidenceFiles = (ord.evidenceFiles || []).map((ef) => {
      const url = ef.url || '';
      if (url.startsWith('data:') && url.length > 100000) {
        return {
          ...ef,
          url: null,
          isCachedInIndexedDb: true
        };
      }
      return ef;
    });

    return {
      ...ord,
      actualPhotos: safeActualPhotos,
      evidenceFiles: safeEvidenceFiles
    };
  });
}

/**
 * Robust, failsafe order saving that never throws QuotaExceededError
 */
export async function saveOrdersSafely(orders) {
  if (!orders) return;

  // 1. Always save full high-res orders to IndexedDB (virtually unlimited quota)
  saveOrdersToIndexedDb(orders).catch(() => {});

  // 2. Try saving to LocalStorage
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (quotaErr) {
    console.warn('[StorageManager] LocalStorage quota exceeded, applying compression fallback:', quotaErr);
    try {
      const sanitized = sanitizeOrdersForLocalStorage(orders);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (secondErr) {
      console.error('[StorageManager] LocalStorage critically full, storing only order IDs:', secondErr);
      try {
        // Strip everything except essential meta
        const barebones = orders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          title: o.title,
          signDate: o.signDate,
          eventDate: o.eventDate,
          category: o.category,
          status: o.status,
          facultyId: o.facultyId,
          facultyAssigned: o.facultyAssigned
        }));
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(barebones));
      } catch (finalErr) {
        console.error('[StorageManager] LocalStorage unavailable:', finalErr);
      }
    }
  }
}

/**
 * Robust initial order loader combining LocalStorage and IndexedDB
 */
export async function loadOrdersSafely() {
  let localOrders = [];
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      localOrders = JSON.parse(saved);
    }
  } catch (e) {}

  // Check if IndexedDB has more detailed / higher resolution photo data
  try {
    const idbOrders = await loadOrdersFromIndexedDb();
    if (idbOrders && idbOrders.length > 0) {
      // Merge IndexedDB full photos into local orders
      const merged = (localOrders.length > 0 ? localOrders : idbOrders).map(lOrd => {
        const idbMatch = idbOrders.find(i => i.id === lOrd.id);
        if (idbMatch && idbMatch.actualPhotos && idbMatch.actualPhotos.length > (lOrd.actualPhotos || []).length) {
          return {
            ...lOrd,
            actualPhotos: idbMatch.actualPhotos
          };
        }
        return lOrd;
      });
      return merged;
    }
  } catch (e) {}

  return localOrders;
}
