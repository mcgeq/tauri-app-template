import { dehydrate, QueryClient } from '@tanstack/react-query';
import {
  createQueryPersistenceOptions,
  createQueryPersister,
  DEFAULT_QUERY_CACHE_BUSTER,
  getQueryCacheBuster,
  QUERY_CACHE_MAX_AGE,
  QUERY_CACHE_STORAGE_KEY,
} from '@/app/providers/query-persistence';

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
  };
}

describe('query persistence', () => {
  it('only dehydrates queries marked with persist meta', async () => {
    const queryClient = new QueryClient();

    await queryClient.fetchQuery({
      queryKey: ['persisted'],
      queryFn: async () => 'keep me',
      meta: {
        persist: true,
      },
    });

    await queryClient.fetchQuery({
      queryKey: ['ephemeral'],
      queryFn: async () => 'drop me',
    });

    const persisted = dehydrate(
      queryClient,
      createQueryPersistenceOptions(createMemoryStorage()).dehydrateOptions,
    );

    expect(persisted.queries).toHaveLength(1);
    expect(persisted.queries[0]?.queryKey).toEqual(['persisted']);
  });

  it('persists and restores cached state through the official persister contract', async () => {
    const storage = createMemoryStorage();
    const persister = createQueryPersister(storage);
    const persistedClient = {
      timestamp: 1,
      buster: 'test-buster',
      clientState: {
        mutations: [],
        queries: [],
      },
    };

    await persister.persistClient(persistedClient);

    expect(storage.setItem).toHaveBeenCalledWith(
      QUERY_CACHE_STORAGE_KEY,
      expect.any(String),
    );
    expect(await persister.restoreClient()).toEqual(persistedClient);
  });

  it('sets a max age that matches the query client gc window', () => {
    expect(QUERY_CACHE_MAX_AGE).toBeGreaterThan(1000 * 60 * 5);
  });

  it('uses the app version as the cache buster and falls back when unavailable', () => {
    expect(getQueryCacheBuster('0.0.1')).toBe('0.0.1');
    expect(getQueryCacheBuster('')).toBe(DEFAULT_QUERY_CACHE_BUSTER);
    expect(getQueryCacheBuster(undefined)).toBe(DEFAULT_QUERY_CACHE_BUSTER);
  });
});
