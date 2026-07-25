const { isTauriMock, platformMock } = vi.hoisted(() => ({
  isTauriMock: vi.fn(),
  platformMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  isTauri: isTauriMock,
}));

vi.mock('@tauri-apps/plugin-os', () => ({
  platform: platformMock,
}));

describe('platform detection', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete (globalThis.window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  it('prefers tauri-plugin-os for tauri desktop environments and keeps legacy constants', async () => {
    isTauriMock.mockReturnValue(true);
    platformMock.mockReturnValue('windows');
    (globalThis.window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
      transformCallback: vi.fn(),
    };

    const mod = await import('@/platform/runtime/platform');

    expect(mod.getPlatformInfo()).toMatchObject({
      isDesktop: true,
      isMobile: false,
      isTauri: true,
      osPlatform: 'windows',
      supportsIpc: true,
      supportsMultiWindow: true,
      supportsTauriCallbacks: true,
    });
    expect(mod.IS_DESKTOP).toBe(true);
    expect(mod.IS_MOBILE_DEVICE).toBe(false);
    expect(mod.IS_TAURI_APP).toBe(true);
    expect(mod.SUPPORTS_TAURI_CALLBACKS).toBe(true);
  });

  it('treats tauri mobile without transformCallback as lacking callback API support', async () => {
    isTauriMock.mockReturnValue(true);
    platformMock.mockReturnValue('android');
    (globalThis.window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {};

    const mod = await import('@/platform/runtime/platform');

    expect(mod.getPlatformInfo()).toMatchObject({
      isDesktop: false,
      isMobile: true,
      isTauri: true,
      osPlatform: 'android',
      supportsMultiWindow: false,
      supportsTauriCallbacks: false,
    });
  });

  it('falls back to user agent detection outside tauri', async () => {
    isTauriMock.mockReturnValue(false);

    const mod = await import('@/platform/runtime/platform');

    expect(
      mod.detectPlatform({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        tauri: false,
      }),
    ).toMatchObject({
      isDesktop: false,
      isMobile: true,
      isTauri: false,
      osPlatform: 'ios',
      supportsIpc: false,
      supportsTauriCallbacks: true,
    });
    expect(platformMock).not.toHaveBeenCalled();
  });

  it('caches platform info for repeated synchronous reads', async () => {
    isTauriMock.mockReturnValue(true);
    platformMock.mockReturnValue('macos');
    (globalThis.window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {
      transformCallback: vi.fn(),
    };

    const mod = await import('@/platform/runtime/platform');

    mod.resetPlatformCache();
    platformMock.mockClear();

    const first = mod.getPlatformInfo();
    const second = mod.getPlatformInfo();

    expect(first).toBe(second);
    expect(platformMock).toHaveBeenCalledTimes(1);
  });
});
