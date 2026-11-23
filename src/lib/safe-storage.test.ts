import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getStorageItem,
  readJsonStorage,
  removeStorageItem,
  setStorageItem,
  writeJsonStorage,
} from './safe-storage';

function installStorage(
  options: {
    getItem?: (key: string) => string | null;
    setItem?: (key: string, value: string) => void;
    removeItem?: (key: string) => void;
  } = {},
) {
  const values = new Map<string, string>();
  const storage = {
    getItem: options.getItem ?? ((key: string) => values.get(key) ?? null),
    setItem: options.setItem ?? ((key: string, value: string) => values.set(key, value)),
    removeItem: options.removeItem ?? ((key: string) => values.delete(key)),
  } as Storage;
  vi.stubGlobal('window', {
    get localStorage() {
      return storage;
    },
    dispatchEvent: () => true,
  });
  return { storage, values };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('safe browser storage', () => {
  it('reads, writes, removes, and parses normal localStorage values', () => {
    const { values } = installStorage();

    expect(setStorageItem('normal', 'value')).toBe(true);
    expect(getStorageItem('normal')).toEqual({ value: 'value', persistent: true });
    expect(writeJsonStorage('normal-json', { complete: true })).toBe(true);
    expect(readJsonStorage('normal-json', null)).toEqual({
      value: { complete: true },
      persistent: true,
    });
    expect(removeStorageItem('normal')).toBe(true);
    expect(values.has('normal')).toBe(false);
  });

  it('returns the fallback and removes malformed JSON', () => {
    const { values } = installStorage();
    values.set('corrupt-json', '{invalid');

    expect(readJsonStorage('corrupt-json', { visited: [] })).toEqual({
      value: { visited: [] },
      persistent: true,
    });
    expect(values.has('corrupt-json')).toBe(false);
  });

  it('uses memory when the localStorage getter is denied', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('Access denied');
      },
      dispatchEvent: () => true,
    });

    expect(writeJsonStorage('getter-denied', { progress: 1 })).toBe(false);
    expect(readJsonStorage('getter-denied', null)).toEqual({
      value: { progress: 1 },
      persistent: false,
    });
  });

  it('falls back to memory when getItem throws', () => {
    installStorage({
      getItem: () => {
        throw new Error('Read denied');
      },
    });

    expect(getStorageItem('get-denied')).toEqual({ value: null, persistent: false });
  });

  it('keeps JSON data in memory when setItem throws', () => {
    installStorage({
      setItem: () => {
        throw new Error('Write denied');
      },
    });

    expect(writeJsonStorage('set-denied', { value: 42 })).toBe(false);
    expect(readJsonStorage('set-denied', null)).toEqual({
      value: { value: 42 },
      persistent: false,
    });
  });

  it('uses an in-memory deletion when removeItem throws', () => {
    installStorage({
      removeItem: () => {
        throw new Error('Remove denied');
      },
    });
    expect(setStorageItem('remove-denied', 'old')).toBe(true);

    expect(removeStorageItem('remove-denied')).toBe(false);
    expect(getStorageItem('remove-denied')).toEqual({ value: null, persistent: false });
  });
});
