/* 用户上传表情包的本地存储（IndexedDB） */

const DB_NAME = 'guoziyuan-memes';
const STORE = 'memes';
const MAX_MEMES = 40;

export interface StoredMeme {
  id?: number;
  dataUrl: string;
  top: string;
  bottom: string;
  ts: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listMemes(): Promise<StoredMeme[]> {
  const db = await openDB();
  const all = await tx(db, 'readonly', (s) => s.getAll() as IDBRequest<StoredMeme[]>);
  db.close();
  return all.sort((a, b) => b.ts - a.ts);
}

export async function addMemes(items: Omit<StoredMeme, 'id'>[]): Promise<void> {
  const db = await openDB();
  for (const item of items) {
    await tx(db, 'readwrite', (s) => s.add(item));
  }
  // 超上限裁剪最旧
  const all = await tx(db, 'readonly', (s) => s.getAll() as IDBRequest<StoredMeme[]>);
  if (all.length > MAX_MEMES) {
    const excess = all.sort((a, b) => a.ts - b.ts).slice(0, all.length - MAX_MEMES);
    for (const m of excess) {
      await tx(db, 'readwrite', (s) => s.delete(m.id!));
    }
  }
  db.close();
}

export async function deleteMeme(id: number): Promise<void> {
  const db = await openDB();
  await tx(db, 'readwrite', (s) => s.delete(id));
  db.close();
}
