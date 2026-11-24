export const STORAGE_STATUS_EVENT = 'atomika-storage-status';

interface StorageStatusDetail {
  persistent: boolean;
}

type MemoryEntry =
  | { kind: 'raw'; value: string }
  | { kind: 'json'; value: unknown }
  | { kind: 'deleted' };

export interface StorageReadResult<T> {
  value: T;
  persistent: boolean;
}

const memoryStorage = new Map<string, MemoryEntry>();
let persistentStorageAvailable = true;

function reportStatus(persistent: boolean, _key: string, error?: unknown): void {
  persistentStorageAvailable = persistent;
  if (!persistent && error) {
    console.warn('[storage] Penyimpanan browser gagal:', error);
  }
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;

  try {
    window.dispatchEvent(
      new CustomEvent<StorageStatusDetail>(STORAGE_STATUS_EVENT, {
        detail: { persistent },
      }),
    );
  } catch (dispatchError) {
    console.warn('[storage] Gagal memberi tahu status penyimpanan:', dispatchError);
  }
}

function getBrowserStorage(key: string): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (error) {
    reportStatus(false, key, error);
    return null;
  }
}

export function isPersistentStorageAvailable(): boolean {
  if (typeof window === 'undefined') return persistentStorageAvailable;
  const storage = getBrowserStorage('__atomika_storage_probe__');
  if (!storage) return false;

  try {
    storage.getItem('__atomika_storage_probe__');
    return true;
  } catch (error) {
    reportStatus(false, '__atomika_storage_probe__', error);
    return false;
  }
}

export function getLastStorageStatus(): boolean {
  return persistentStorageAvailable;
}

export function getStorageItem(key: string): StorageReadResult<string | null> {
  const memoryEntry = memoryStorage.get(key);
  if (memoryEntry) {
    reportStatus(false, key);
    if (memoryEntry.kind === 'raw') return { value: memoryEntry.value, persistent: false };
    return { value: null, persistent: false };
  }

  const storage = getBrowserStorage(key);
  if (!storage) return { value: null, persistent: false };

  try {
    const value = storage.getItem(key);
    return { value, persistent: true };
  } catch (error) {
    reportStatus(false, key, error);
    return { value: null, persistent: false };
  }
}

export function setStorageItem(key: string, value: string): boolean {
  memoryStorage.set(key, { kind: 'raw', value });
  const storage = getBrowserStorage(key);
  if (!storage) return false;

  try {
    storage.setItem(key, value);
    memoryStorage.delete(key);
    reportStatus(true, key);
    return true;
  } catch (error) {
    reportStatus(false, key, error);
    return false;
  }
}

export function removeStorageItem(key: string): boolean {
  memoryStorage.set(key, { kind: 'deleted' });
  const storage = getBrowserStorage(key);
  if (!storage) return false;

  try {
    storage.removeItem(key);
    memoryStorage.delete(key);
    reportStatus(true, key);
    return true;
  } catch (error) {
    reportStatus(false, key, error);
    return false;
  }
}

export function readJsonStorage<T>(key: string, fallback: T): StorageReadResult<T> {
  const memoryEntry = memoryStorage.get(key);
  if (memoryEntry?.kind === 'json') {
    reportStatus(false, key);
    return { value: memoryEntry.value as T, persistent: false };
  }
  if (memoryEntry?.kind === 'deleted') {
    reportStatus(false, key);
    return { value: fallback, persistent: false };
  }

  const { value: raw, persistent } = getStorageItem(key);
  if (raw === null) return { value: fallback, persistent };

  try {
    return { value: JSON.parse(raw) as T, persistent };
  } catch (error) {
    console.error('[storage] Data JSON rusak:', error);
    return { value: fallback, persistent: removeStorageItem(key) };
  }
}

export function writeJsonStorage(key: string, value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError('Nilai tidak dapat diubah menjadi JSON.');
    return setStorageItem(key, serialized);
  } catch (error) {
    memoryStorage.set(key, { kind: 'json', value });
    reportStatus(false, key, error);
    return false;
  }
}
