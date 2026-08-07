describe('app route definitions', () => {
  it('exposes app-shell navigation routes in stable order for both platforms', async () => {
    const mod = await import('@/routes/registry/route-registry');

    expect(mod.getNavRoutes('desktop').map((route) => route.key)).toEqual(['home', 'tasks', 'profile']);
    expect(mod.getNavRoutes('mobile').map((route) => route.key)).toEqual(['home', 'tasks', 'profile']);
  });

  it('marks standalone desktop window routes as preloadable', async () => {
    const mod = await import('@/routes/registry/route-registry');

    expect(mod.getPreloadableDesktopWindows().map((route) => route.key)).toEqual(['settings', 'about']);
  });

  it('marks reusable standalone desktop windows to close by hiding', async () => {
    const mod = await import('@/routes/registry/route-registry');

    expect(mod.getRouteMeta('settings').platform.desktop.window?.closeStrategy).toBe('hide');
    expect(mod.getRouteMeta('about').platform.desktop.window?.closeStrategy).toBe('hide');
    expect(mod.getDesktopWindowCloseConfig('settings')).toEqual({
      strategy: 'hide',
    });
  });

  it('resolves back navigation and path lookups from route keys', async () => {
    const mod = await import('@/routes/registry/route-registry');

    expect(mod.getRouteMetaByPath('/settings')?.backTo).toBe('profile');
    expect(mod.getRoutePath('about')).toBe('/about');
    expect(mod.getBackRoutePath('about')).toBe('/profile');
  });
});
