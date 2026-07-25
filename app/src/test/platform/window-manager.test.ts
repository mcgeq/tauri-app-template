import { beforeEach, describe, expect, it, vi } from 'vitest';

const getByLabelMock = vi.fn();
const cancelDestroyWindowMock = vi.fn();
const destroyWindowMock = vi.fn();
const getDesktopWindowCloseConfigMock = vi.fn();
const createdWindows: Array<{ label: string; options: Record<string, unknown> }> = [];

vi.mock('@tauri-apps/api/dpi', () => ({
  LogicalPosition: class LogicalPosition {
    constructor(
      public x: number,
      public y: number,
    ) {}
  },
}));

vi.mock('@tauri-apps/api/event', () => ({
  once: vi.fn(),
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  WebviewWindow: class MockWebviewWindow {
    static getByLabel(...args: unknown[]) {
      return getByLabelMock(...args);
    }

    static getCurrent = vi.fn();

    once = vi.fn(async (_event: string, handler?: () => void) => {
      await handler?.();
    });

    show = vi.fn().mockResolvedValue(undefined);
    center = vi.fn().mockResolvedValue(undefined);
    setPosition = vi.fn().mockResolvedValue(undefined);

    constructor(label: string, options: Record<string, unknown>) {
      createdWindows.push({ label, options });
    }
  },
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: true,
  IS_MOBILE_DEVICE: false,
}));

vi.mock('@/platform/windows/window-lifecycle', () => ({
  cancelDestroyWindow: (...args: unknown[]) => cancelDestroyWindowMock(...args),
  destroyWindow: (...args: unknown[]) => destroyWindowMock(...args),
}));

vi.mock('@/routes/registry/route-registry', () => ({
  getDesktopWindowCloseConfig: (...args: unknown[]) => getDesktopWindowCloseConfigMock(...args),
}));

describe('window manager', () => {
  beforeEach(() => {
    getByLabelMock.mockReset();
    cancelDestroyWindowMock.mockReset();
    destroyWindowMock.mockReset();
    getDesktopWindowCloseConfigMock.mockReset().mockReturnValue({ strategy: 'hide' });
    createdWindows.length = 0;
  });

  it('no-ops when a desktop window label is not found', async () => {
    getByLabelMock.mockResolvedValue(null);
    const mod = await import('@/platform/windows/window-manager');

    await expect(mod.showWindow('missing')).resolves.toBeUndefined();
  });

  it('hides a desktop window without scheduling destroy by default', async () => {
    const hideMock = vi.fn().mockResolvedValue(undefined);
    getByLabelMock.mockResolvedValue({ hide: hideMock });
    const mod = await import('@/platform/windows/window-manager');

    await mod.hideWindow('settings');

    expect(hideMock).toHaveBeenCalledTimes(1);
    expect(destroyWindowMock).not.toHaveBeenCalled();
  });

  it('closes hide-strategy windows by hiding them in place', async () => {
    const hideMock = vi.fn().mockResolvedValue(undefined);
    getByLabelMock.mockResolvedValue({ hide: hideMock });
    const mod = await import('@/platform/windows/window-manager');

    await mod.closeWindow('settings');

    expect(getDesktopWindowCloseConfigMock).toHaveBeenCalledWith('settings');
    expect(hideMock).toHaveBeenCalledTimes(1);
    expect(destroyWindowMock).not.toHaveBeenCalled();
  });

  it('closes destroy-strategy windows by scheduling teardown through hideWindow', async () => {
    const hideMock = vi.fn().mockResolvedValue(undefined);
    getDesktopWindowCloseConfigMock.mockReturnValue({ strategy: 'destroy', destroyDelayMs: 2500 });
    getByLabelMock.mockResolvedValue({ hide: hideMock });
    const mod = await import('@/platform/windows/window-manager');

    await mod.closeWindow('dialog');

    expect(getDesktopWindowCloseConfigMock).toHaveBeenCalledWith('dialog');
    expect(hideMock).toHaveBeenCalledTimes(1);
    expect(destroyWindowMock).toHaveBeenCalledWith('dialog', 2500);
  });

  it('creates windows without passing parent-only metadata to the WebviewWindow constructor', async () => {
    getByLabelMock.mockResolvedValue(null);
    const mod = await import('@/platform/windows/window-manager');

    await mod.createWindow('settings', {
      parent: 'main',
      title: 'Settings',
      url: '/settings',
      width: 960,
      height: 720,
      transparent: true,
    });

    expect(createdWindows).toHaveLength(1);
    expect(createdWindows[0]).toMatchObject({
      label: 'settings',
      options: {
        title: 'Settings',
        url: '/settings',
        width: 960,
        height: 720,
        transparent: true,
        visible: false,
      },
    });
    expect(createdWindows[0]?.options).not.toHaveProperty('parent');
  });
});
