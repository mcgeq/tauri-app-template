import { render } from '@testing-library/react';

const rootPreloadTestState = vi.hoisted(() => ({
  createdWindows: [] as Array<{ label: string; options: Record<string, unknown> }>,
  getByLabelMock: vi.fn(),
  showMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  createRootRoute: ({ component }: { component: React.ComponentType }) => ({ component }),
  Outlet: () => <div>Outlet</div>,
  useNavigate: () => rootPreloadTestState.navigateMock,
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: () => ({
    label: 'main',
    show: rootPreloadTestState.showMock,
    isMaximized: vi.fn().mockResolvedValue(false),
    onResized: vi.fn().mockResolvedValue(vi.fn()),
  }),
  WebviewWindow: class MockWebviewWindow {
    static getByLabel(...args: unknown[]) {
      return rootPreloadTestState.getByLabelMock(...args);
    }

    once = vi.fn();

    constructor(label: string, options: Record<string, unknown>) {
      rootPreloadTestState.createdWindows.push({ label, options });
    }
  },
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
  IS_DESKTOP: true,
  IS_TAURI_APP: true,
}));

vi.mock('@/i18n', () => ({}));

describe('root desktop window preloading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    rootPreloadTestState.createdWindows = [];
    rootPreloadTestState.navigateMock.mockReset();
    rootPreloadTestState.showMock.mockReset().mockResolvedValue(undefined);
    rootPreloadTestState.getByLabelMock.mockReset().mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pre-creates desktop child windows without passing shell metadata to WebviewWindow', async () => {
    const mod = await import('@/routes/__root');

    render(<mod.RootLayout />);

    await vi.runAllTimersAsync();

    expect(rootPreloadTestState.createdWindows.map(window => window.label)).toEqual([
      'settings',
      'about',
    ]);
    for (const window of rootPreloadTestState.createdWindows) {
      expect(window.options).not.toHaveProperty('parent');
      expect(window.options).not.toHaveProperty('closeStrategy');
      expect(window.options).not.toHaveProperty('destroyDelayMs');
    }
    expect(rootPreloadTestState.createdWindows[0]?.options).toMatchObject({
      title: '',
      url: '/settings',
      visible: false,
    });
  });
});
