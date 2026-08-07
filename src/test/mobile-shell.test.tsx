import { render, screen } from '@testing-library/react';

const locationState = {
  pathname: '/settings',
};

vi.mock('@tanstack/react-query', () => ({
  QueryClient: class QueryClient {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}));

vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: () => null,
}));

vi.mock('@tanstack/react-router', () => ({
  createRootRoute: ({ component }: { component: React.ComponentType }) => ({ component }),
  Outlet: () => <div>Outlet</div>,
  useNavigate: () => vi.fn(),
  useLocation: () => locationState,
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: () => ({ label: 'main', show: vi.fn() }),
  WebviewWindow: { getByLabel: vi.fn() },
}));

vi.mock('@/app/providers/app-providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/command-palette/components/command-palette', () => ({
  CommandPalette: () => null,
}));

vi.mock('@/components/loading', () => ({
  Loading: () => <div>Loading</div>,
}));

vi.mock('@/stores/window-behavior', () => ({
  useWindowBehaviorSync: () => undefined,
}));

vi.mock('@/platform/windows/window-navigation-bridge', () => ({
  setNavigateFn: vi.fn(),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: false,
  IS_TAURI_APP: false,
}));

vi.mock('@/i18n', () => ({}));

describe('root mobile shell', () => {
  beforeEach(() => {
    locationState.pathname = '/settings';
  });

  it('hides the bottom nav on secondary mobile pages', async () => {
    const mod = await import('@/routes/__root');

    render(<mod.RootLayout />);

    expect(screen.queryByLabelText('Bottom Navigation')).not.toBeInTheDocument();
  });

  it('does not reserve extra bottom padding on the root shell when the bottom nav is visible', async () => {
    locationState.pathname = '/profile';
    const mod = await import('@/routes/__root');
    const { container } = render(<mod.RootLayout />);

    expect(container.firstElementChild?.className).not.toContain(
      'pb-[calc(var(--bottom-nav-height)+var(--app-safe-area-bottom))]',
    );
  });

  it('does not fake the content height with a bottom-nav subtraction when the bottom nav is visible', async () => {
    locationState.pathname = '/profile';
    const mod = await import('@/routes/__root');
    const { container } = render(<mod.RootLayout />);

    expect(container.firstElementChild?.className).not.toContain(
      'min-h-[calc(100dvh-var(--bottom-nav-height)-var(--app-safe-area-bottom))]',
    );
  });

  it('keeps the routed outlet inside a flex column shell on mobile', async () => {
    locationState.pathname = '/profile';
    const mod = await import('@/routes/__root');
    const { container } = render(<mod.RootLayout />);

    expect(container.firstElementChild?.className).toContain('flex');
    expect(container.firstElementChild?.className).toContain('flex-col');
  });
});
