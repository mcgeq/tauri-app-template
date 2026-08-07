import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';

const listenMock = vi.fn().mockResolvedValue(vi.fn());
const onShortcutChangedMock = vi.fn().mockResolvedValue(vi.fn());
const updateTrayMenuMock = vi.fn().mockResolvedValue(undefined);
const pendingRouteChunk = new Promise<never>(() => {});
let suspendOutlet = false;

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => {
    if (suspendOutlet) {
      throw pendingRouteChunk;
    }

    return <div data-testid="app-shell-outlet" />;
  },
  useNavigate: () => vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: (...args: unknown[]) => listenMock(...args),
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: () => ({
    label: 'main',
  }),
}));

vi.mock('@/api', () => ({
  onShortcutChanged: (...args: unknown[]) => onShortcutChangedMock(...args),
  updateTrayMenu: (...args: unknown[]) => updateTrayMenuMock(...args),
}));

vi.mock('@/components/loading', () => ({
  Loading: () => <div data-testid="shell-loading">Shell Loading</div>,
}));

vi.mock('@/app/shell/bottom-nav', () => ({
  BottomNav: () => <nav aria-label="Bottom Navigation" />,
}));

vi.mock('@/features/updater/components/updater-dialog', () => ({
  UpdaterDialog: () => <div>Updater Dialog</div>,
}));

vi.mock('@/app/shell/window-frame', () => ({
  WindowFrame: ({ children, titleBar }: { children: React.ReactNode; titleBar: React.ReactNode }) => (
    <div>
      {titleBar}
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

vi.mock('@/platform/windows/open-app-route', () => ({
  openAppRoute: vi.fn(),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: true,
  IS_TAURI_APP: true,
  SUPPORTS_TAURI_CALLBACKS: false,
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: () => false,
}));

vi.mock('@/lib/shortcut', () => ({
  registerShortcut: vi.fn(),
}));

vi.mock('@/platform/windows/window-manager', () => ({
  toggleWindow: vi.fn(),
}));

describe('app shell desktop suspense handling', () => {
  beforeEach(() => {
    listenMock.mockClear();
    onShortcutChangedMock.mockClear();
    updateTrayMenuMock.mockClear();
    suspendOutlet = false;
  });

  it('keeps the sidebar mounted while the first desktop route chunk is loading', async () => {
    suspendOutlet = true;
    const mod = await import('@/app/shell/app-shell-layout');

    render(
      <Suspense fallback={<div>Root Loading</div>}>
        <mod.AppShellLayout />
      </Suspense>,
    );

    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Shell Loading')).toBeInTheDocument();
    expect(screen.queryByText('Root Loading')).not.toBeInTheDocument();
  });

  it('renders the route loading state with a fade transition container', async () => {
    suspendOutlet = true;
    const mod = await import('@/app/shell/app-shell-layout');

    render(
      <Suspense fallback={<div>Root Loading</div>}>
        <mod.AppShellLayout />
      </Suspense>,
    );

    expect(screen.getByTestId('shell-loading').parentElement?.className).toContain('route-fade-shell');
  });
});
