import { renderHook } from '@testing-library/react';

const trayMenuHookTestState = vi.hoisted(() => ({
  isDesktop: true,
  isTauri: false,
  updateTrayMenuMock: vi.fn(),
}));

vi.mock('@/api', () => ({
  updateTrayMenu: (...args: unknown[]) => trayMenuHookTestState.updateTrayMenuMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  get IS_DESKTOP() {
    return trayMenuHookTestState.isDesktop;
  },
  get IS_TAURI_APP() {
    return trayMenuHookTestState.isTauri;
  },
}));

describe('useTrayMenuSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    trayMenuHookTestState.isDesktop = true;
    trayMenuHookTestState.isTauri = false;
    trayMenuHookTestState.updateTrayMenuMock.mockReset().mockResolvedValue(undefined);
  });

  it('does not invoke tray initialization in a desktop browser preview', async () => {
    const mod = await import('@/app/shell/hooks/use-tray-menu-sync');

    renderHook(() => mod.useTrayMenuSync((key) => key));

    expect(trayMenuHookTestState.updateTrayMenuMock).not.toHaveBeenCalled();
  });

  it('initializes the tray when running in a desktop tauri runtime', async () => {
    const mod = await import('@/app/shell/hooks/use-tray-menu-sync');
    trayMenuHookTestState.isTauri = true;

    renderHook(() => mod.useTrayMenuSync((key) => key));

    expect(trayMenuHookTestState.updateTrayMenuMock).toHaveBeenCalledWith({
      showText: 'tray.show',
      settingsText: 'tray.settings',
      quitText: 'tray.quit',
    });
  });
});
