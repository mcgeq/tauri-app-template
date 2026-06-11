describe('route registry contract', () => {
  it('defines a path and platform modes for every app route', async () => {
    const mod = await import('@/routes/registry/route-registry');

    for (const route of mod.APP_ROUTE_LIST) {
      expect(route.path.startsWith('/')).toBe(true);
      expect(route.platform.desktop.mode).toBeTruthy();
      expect(route.platform.mobile.mode).toBeTruthy();
    }
  });
});
