import { render, screen } from '@testing-library/react';

const eventListenMock = vi.fn().mockResolvedValue(vi.fn());
const openSettingsEventMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div>Outlet</div>,
  useNavigate: () => vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: (...args: unknown[]) => eventListenMock(...args),
}));

vi.mock('@/app/shell/bottom-nav', () => ({
  BottomNav: () => <nav aria-label="Bottom Navigation">Bottom Navigation</nav>,
}));

vi.mock('@/app/shell/hooks/use-global-shortcut-sync', () => ({
  useGlobalShortcutSync: vi.fn(),
}));

vi.mock('@/app/shell/hooks/use-open-settings-event', () => ({
  useOpenSettingsEvent: (...args: unknown[]) => openSettingsEventMock(...args),
}));

vi.mock('@/app/shell/hooks/use-tray-menu-sync', () => ({
  useTrayMenuSync: vi.fn(),
}));

vi.mock('@/app/shell/hooks/use-shell-window-context', () => ({
  useShellWindowContext: () => ({ isMainWindow: true }),
}));

vi.mock('@/app/shell/main-title-bar', () => ({
  MainTitleBar: () => <div>Title</div>,
}));

vi.mock('@/app/shell/sidebar', () => ({
  Sidebar: () => <div>Sidebar</div>,
}));

vi.mock('@/app/shell/shell-route-boundary', () => ({
  ShellRouteBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/app/shell/window-frame', () => ({
  WindowFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/loading', () => ({
  Loading: () => <div>Loading</div>,
}));

vi.mock('@/features/updater/components/updater-dialog', () => ({
  UpdaterDialog: () => <div>Updater Dialog</div>,
}));

vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: false,
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: () => true,
}));

describe('app shell layout on mobile', () => {
  beforeEach(() => {
    eventListenMock.mockClear();
    openSettingsEventMock.mockClear();
  });

  it('does not mount the updater dialog on mobile shell', async () => {
    const mod = await import('@/app/shell/app-shell-layout');

    render(<mod.AppShellLayout />);

    expect(screen.queryByText('Updater Dialog')).not.toBeInTheDocument();
  });

  it('does not register desktop tauri listeners on mobile shell', async () => {
    const mod = await import('@/app/shell/app-shell-layout');

    render(<mod.AppShellLayout />);

    expect(eventListenMock).not.toHaveBeenCalled();
  });
});
