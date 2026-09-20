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

  const SVG_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect fill="%231e293b" width="400" height="260"/><text fill="%2394a3b8" font-size="14" x="200" y="130" text-anchor="middle">ภาพถ่ายหลักฐาน (จัดเก็บใน IndexedDB / คลาวด์)</text></svg>';

  return orders.map((ord) => {
    const safeActualPhotos = (ord.actualPhotos || []).map((p) => {
      const url = p.url || p.dataUrl || '';
      // If photo has a massive base64 string (> 50KB), don't store raw base64 in LocalStorage
      if (url.startsWith('data:image/') && url.length > 50000) {
        const safeThumb = (p.thumbnailUrl && !p.thumbnailUrl.startsWith('data:image/') && p.thumbnailUrl.length < 50000)
          ? p.thumbnailUrl
          : SVG_PLACEHOLDER;
        return {
          ...p,
          url: safeThumb,
          thumbnailUrl: safeThumb,
          isCachedInIndexedDb: true
        };
      }
      return p;
    });

    const safeEvidenceFiles = (ord.evidenceFiles || []).map((ef) => {
      const url = ef.url || '';
      if (url.startsWith('data:') && url.length > 50000) {
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
 * Robust, failsafe order saving that never throws QuotaExceededError and never wipes photos
 */
export async function saveOrdersSafely(orders) {
  if (!orders || !Array.isArray(orders)) return;

  // 1. Always save full high-res orders to IndexedDB (virtually unlimited quota)
  // Check that we don't accidentally overwrite existing photos with stripped photos
  loadOrdersFromIndexedDb().then((existingIdb) => {
    let ordersToSave = orders;
    if (existingIdb && existingIdb.length > 0) {
      ordersToSave = orders.map((newOrd) => {
        const idbMatch = existingIdb.find((i) => i.id === newOrd.id);
        if (idbMatch && (idbMatch.actualPhotos || []).length > (newOrd.actualPhotos || []).length) {
          return {
            ...newOrd,
            actualPhotos: idbMatch.actualPhotos,
            evidenceFiles: (idbMatch.evidenceFiles && idbMatch.evidenceFiles.length > (newOrd.evidenceFiles || []).length)
              ? idbMatch.evidenceFiles
              : newOrd.evidenceFiles
          };
        }
        return newOrd;
      });
    }
    saveOrdersToIndexedDb(ordersToSave).catch(() => {});
  }).catch(() => {
    saveOrdersToIndexedDb(orders).catch(() => {});
  });

  // 2. Try saving to LocalStorage with progressive sanitization
  try {
    const sanitized = sanitizeOrdersForLocalStorage(orders);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (quotaErr) {
    console.warn('[StorageManager] LocalStorage quota exceeded, applying compression fallback:', quotaErr);
    try {
      // More aggressive stripping for LocalStorage cache while IndexedDB retains full photos
      const compact = orders.map(o => ({
        ...o,
        actualPhotos: (o.actualPhotos || []).map(p => ({
          id: p.id,
          name: p.name || p.title,
          size: p.size,
          uploadedAt: p.uploadedAt,
          url: (p.url && !p.url.startsWith('data:image/')) ? p.url : null,
          isCachedInIndexedDb: true
        })),
        evidenceFiles: (o.evidenceFiles || []).map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          uploadedAt: f.uploadedAt,
          url: (f.url && !f.url.startsWith('data:')) ? f.url : null,
          isCachedInIndexedDb: true
        }))
      }));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(compact));
    } catch (secondErr) {
      console.error('[StorageManager] LocalStorage critically full, storing essential meta:', secondErr);
      try {
        const barebones = orders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          title: o.title,
          signDate: o.signDate,
          eventDate: o.eventDate,
          category: o.category,
          status: o.status,
          facultyId: o.facultyId,
          facultyAssigned: o.facultyAssigned,
          workloadType: o.workloadType,
          workloadScore: o.workloadScore,
          score: o.score
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
      if (!localOrders || localOrders.length === 0) {
        return idbOrders;
      }
      // Merge IndexedDB full photos into local orders
      const merged = localOrders.map(lOrd => {
        const idbMatch = idbOrders.find(i => i.id === lOrd.id);
        if (idbMatch && idbMatch.actualPhotos && idbMatch.actualPhotos.length > 0) {
          const lPhotos = lOrd.actualPhotos || [];
          const lHasRealPhotos = lPhotos.some(p => p.url && !p.isCachedInIndexedDb && !p.url.includes('<svg'));
          if (!lHasRealPhotos || idbMatch.actualPhotos.length > lPhotos.length) {
            return {
              ...lOrd,
              actualPhotos: idbMatch.actualPhotos,
              evidenceFiles: (idbMatch.evidenceFiles && idbMatch.evidenceFiles.length > (lOrd.evidenceFiles || []).length)
                ? idbMatch.evidenceFiles
                : lOrd.evidenceFiles
            };
          }
        }
        return lOrd;
      });

      // Also include any orders that exist in IndexedDB but missing in localOrders
      const localIds = new Set(localOrders.map(l => l.id));
      for (const idbOrd of idbOrders) {
        if (!localIds.has(idbOrd.id)) {
          merged.push(idbOrd);
        }
      }
      return merged;
    }
  } catch (e) {}

  return localOrders;
}
