const createWindowMock = vi.fn().mockResolvedValue(undefined);
const platformState = {
  isDesktop: true,
  isTauriApp: true,
};

vi.mock('@/platform/windows/window-manager', () => ({
  createWindow: (...args: unknown[]) => createWindowMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  get IS_DESKTOP() {
    return platformState.isDesktop;
  },
  get IS_TAURI_APP() {
    return platformState.isTauriApp;
  },
}));

describe('openAppRoute', () => {
  beforeEach(() => {
    createWindowMock.mockClear();
    platformState.isDesktop = true;
    platformState.isTauriApp = true;
  });

  it('opens standalone desktop routes as windows when tauri desktop is available', async () => {
    const navigateMock = vi.fn();
    const mod = await import('@/platform/windows/open-app-route');

    await mod.openAppRoute('settings', {
      navigate: navigateMock,
      t: (key: string) => key,
    });

    expect(createWindowMock).toHaveBeenCalledWith(
      'settings',
      expect.objectContaining({
        title: 'settings.title',
        url: '/settings',
        width: 600,
        height: 500,
      }),
    );
    expect(createWindowMock.mock.calls[0]?.[1]).not.toHaveProperty('preload');
    expect(createWindowMock.mock.calls[0]?.[1]).not.toHaveProperty('closeStrategy');
    expect(createWindowMock.mock.calls[0]?.[1]).not.toHaveProperty('destroyDelayMs');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('falls back to in-app navigation when desktop window mode is unavailable', async () => {
    const navigateMock = vi.fn().mockResolvedValue(undefined);
    platformState.isDesktop = false;
    const mod = await import('@/platform/windows/open-app-route');

    await mod.openAppRoute('about', {
      navigate: navigateMock,
      t: (key: string) => key,
    });

    expect(createWindowMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith({ to: '/about' });
  });
});
