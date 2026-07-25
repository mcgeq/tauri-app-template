import { renderHook } from '@testing-library/react';

const globalShortcutHookTestState = vi.hoisted(() => ({
  isDesktop: true,
  isTauri: false,
  onShortcutChangedMock: vi.fn(),
  registerShortcutMock: vi.fn(),
}));

vi.mock('@/api', () => ({
  onShortcutChanged: (...args: unknown[]) => globalShortcutHookTestState.onShortcutChangedMock(...args),
}));

vi.mock('@/lib/shortcut', () => ({
  registerShortcut: (...args: unknown[]) => globalShortcutHookTestState.registerShortcutMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  get IS_DESKTOP() {
    return globalShortcutHookTestState.isDesktop;
  },
  get IS_TAURI_APP() {
    return globalShortcutHookTestState.isTauri;
  },
}));

vi.mock('@/platform/windows/window-manager', () => ({
  toggleWindow: vi.fn(),
}));

describe('useGlobalShortcutSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalShortcutHookTestState.isDesktop = true;
    globalShortcutHookTestState.isTauri = false;
    globalShortcutHookTestState.onShortcutChangedMock.mockReset().mockResolvedValue(vi.fn());
    globalShortcutHookTestState.registerShortcutMock.mockReset().mockResolvedValue(undefined);
    localStorage.clear();
  });

  it('does not subscribe or register shortcuts in a desktop browser preview', async () => {
    const mod = await import('@/app/shell/hooks/use-global-shortcut-sync');

    renderHook(() => mod.useGlobalShortcutSync());

    expect(globalShortcutHookTestState.onShortcutChangedMock).not.toHaveBeenCalled();
    expect(globalShortcutHookTestState.registerShortcutMock).not.toHaveBeenCalled();
  });

  it('subscribes and restores saved shortcuts in a desktop tauri runtime', async () => {
    const mod = await import('@/app/shell/hooks/use-global-shortcut-sync');
    globalShortcutHookTestState.isTauri = true;
    localStorage.setItem('global-shortcut-show-main', 'Ctrl+Shift+K');

    renderHook(() => mod.useGlobalShortcutSync());

    expect(globalShortcutHookTestState.onShortcutChangedMock).toHaveBeenCalledTimes(1);
    expect(globalShortcutHookTestState.registerShortcutMock).toHaveBeenCalledWith(
      'Ctrl+Shift+K',
      expect.any(Function),
    );
  });
});
