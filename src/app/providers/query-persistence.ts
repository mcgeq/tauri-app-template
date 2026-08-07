import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const QUERY_CACHE_STORAGE_KEY = 'tauri-template-query-cache';
export const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24;
export const DEFAULT_QUERY_CACHE_BUSTER = 'query-cache-v1';

export function getQueryCacheBuster(version: string | undefined) {
  return version?.trim() || DEFAULT_QUERY_CACHE_BUSTER;
}

export const QUERY_CACHE_BUSTER = getQueryCacheBuster(import.meta.env.VITE_APP_VERSION);

function getStorageAdapter(storage: StorageLike | null | undefined) {
  if (!storage) {
    return undefined;
  }

  return {
    getItem: (key: string) => storage.getItem(key),
    setItem: (key: string, value: string) => storage.setItem(key, value),
    removeItem: (key: string) => storage.removeItem(key),
  };
}

export function createQueryPersister(storage: StorageLike | null | undefined) {
  return createAsyncStoragePersister({
    storage: getStorageAdapter(storage),
    key: QUERY_CACHE_STORAGE_KEY,
  });
}

export function createQueryPersistenceOptions(
  storage: StorageLike | null | undefined = typeof window === 'undefined' ? undefined : window.localStorage,
): Omit<PersistQueryClientOptions, 'queryClient'> {
  return {
    persister: createQueryPersister(storage),
    maxAge: QUERY_CACHE_MAX_AGE,
    buster: QUERY_CACHE_BUSTER,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => query.meta?.persist === true,
    },
  };
}
