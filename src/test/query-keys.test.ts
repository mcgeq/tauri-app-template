import { queryKeys } from '@/lib/query-keys';

describe('queryKeys', () => {
  it('exposes a stable query key for app config', () => {
    expect(queryKeys.appConfig.all).toEqual(['appConfig']);
  });

  it('generates greet all key', () => {
    expect(queryKeys.greet.all).toEqual(['greet']);
  });

  it('generates greet detail key with name', () => {
    expect(queryKeys.greet.detail('World')).toEqual(['greet', 'World']);
  });
});
