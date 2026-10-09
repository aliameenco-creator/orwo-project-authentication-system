"use client";

/**
 * Tiny IndexedDB store for converted PDF page images (too large for localStorage).
 * Keyed by PdfDoc id → array of JPEG data URLs, one per page.
 */
const DB = "orwo-family-pages";
const STORE = "pages";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export const savePages = (id: string, pages: string[]) => run<void>("readwrite", (s) => s.put(pages, id));
export const loadPages = (id: string) => run<string[] | undefined>("readonly", (s) => s.get(id));
export const deletePages = (id: string) => run<void>("readwrite", (s) => s.delete(id)).catch(() => {});
export const clearPages = () => run<void>("readwrite", (s) => s.clear()).catch(() => {});
