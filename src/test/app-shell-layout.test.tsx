import { render, screen } from '@testing-library/react';

const navigateMock = vi.fn();
const useShellWindowContextMock = vi.fn();
const useTrayMenuSyncMock = vi.fn();
const useGlobalShortcutSyncMock = vi.fn();
const useOpenSettingsEventMock = vi.fn();
const useIsMobileMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="app-shell-outlet" />,
  useNavigate: () => navigateMock,
}));

vi.mock('@/app/shell/bottom-nav', () => ({
  BottomNav: () => <nav aria-label="Bottom Navigation" />,
}));

vi.mock('@/features/updater/components/updater-dialog', () => ({
  UpdaterDialog: () => <div>Updater Dialog</div>,
}));

vi.mock('@/app/shell/window-frame', () => ({
  WindowFrame: ({ children, mobileSafeArea }: { children: React.ReactNode; mobileSafeArea?: string }) => (
    <div data-testid="window-frame" data-mobile-safe-area={mobileSafeArea ?? 'default'}>
      {children}
    </div>
  ),
}));

vi.mock('@/app/shell/main-title-bar', () => ({
  MainTitleBar: () => <div>Main Title Bar</div>,
}));

vi.mock('@/app/shell/sidebar', () => ({
  Sidebar: () => <div>Sidebar</div>,
}));

vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/app/shell/hooks/use-shell-window-context', () => ({
  useShellWindowContext: (...args: unknown[]) => useShellWindowContextMock(...args),
}));

vi.mock('@/app/shell/hooks/use-tray-menu-sync', () => ({
  useTrayMenuSync: (...args: unknown[]) => useTrayMenuSyncMock(...args),
}));

vi.mock('@/app/shell/hooks/use-global-shortcut-sync', () => ({
  useGlobalShortcutSync: (...args: unknown[]) => useGlobalShortcutSyncMock(...args),
}));

vi.mock('@/app/shell/hooks/use-open-settings-event', () => ({
  useOpenSettingsEvent: (...args: unknown[]) => useOpenSettingsEventMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: false,
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: (...args: unknown[]) => useIsMobileMock(...args),
}));

describe('app shell mobile safe area handling', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useShellWindowContextMock.mockReset();
    useShellWindowContextMock.mockReturnValue({ isMainWindow: true });
    useTrayMenuSyncMock.mockReset();
    useGlobalShortcutSyncMock.mockReset();
    useOpenSettingsEventMock.mockReset();
    useIsMobileMock.mockReset();
    useIsMobileMock.mockReturnValue(true);
  });

  it('keeps the canonical shell layout focused on app-shell modules', async () => {
    const canonicalSource = await import('@/app/shell/app-shell-layout?raw');

    expect(canonicalSource.default).toContain("from '@/app/shell/main-title-bar'");
    expect(canonicalSource.default).toContain("from '@/app/shell/sidebar'");
    expect(canonicalSource.default).toContain("from '@/app/shell/window-frame'");
    expect(canonicalSource.default).toContain("from '@/app/shell/hooks/use-global-shortcut-sync'");
    expect(canonicalSource.default).not.toContain('@/features/home/components/main-title-bar');
  });

  it('keeps the bottom nav outside the shared top and side safe-area inset while composing shell hooks', async () => {
    const mod = await import('@/app/shell/app-shell-layout');

    render(<mod.AppShellLayout />);

    const outletContainer = screen.getByTestId('app-shell-outlet').parentElement;

    expect(useShellWindowContextMock).toHaveBeenCalledTimes(1);
    expect(useTrayMenuSyncMock).toHaveBeenCalledWith(expect.any(Function));
    expect(useGlobalShortcutSyncMock).toHaveBeenCalledTimes(1);
    expect(useOpenSettingsEventMock).toHaveBeenCalledWith(navigateMock, expect.any(Function));
    expect(screen.getByTestId('window-frame').getAttribute('data-mobile-safe-area')).toBe('none');
    expect(outletContainer?.className).toContain('pt-[var(--app-safe-area-top)]');
    expect(outletContainer?.className).toContain('pl-[var(--app-safe-area-left)]');
    expect(outletContainer?.className).toContain('pr-[var(--app-safe-area-right)]');
    expect(screen.getByLabelText('Bottom Navigation')).toBeTruthy();
  });
});
