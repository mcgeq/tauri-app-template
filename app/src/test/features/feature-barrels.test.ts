const featureBarrels = import.meta.glob('../../features/*/index.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

describe('feature barrel boundaries', () => {
  it('removes feature barrels that only existed for legacy route or shell re-exports', async () => {
    expect(featureBarrels).not.toHaveProperty('../../features/home/index.ts');
    expect(featureBarrels).not.toHaveProperty('../../features/about/index.ts');
    expect(featureBarrels).not.toHaveProperty('../../features/profile/index.ts');
    expect(featureBarrels).not.toHaveProperty('../../features/tasks/index.ts');
    expect(featureBarrels).not.toHaveProperty('../../features/settings/index.ts');
  });
});
