import { render, screen } from '@testing-library/react';

vi.mock('@/app/shell/window-frame', () => ({
  WindowFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/app/shell/sidebar', () => ({
  Sidebar: () => <div>Sidebar</div>,
}));

vi.mock('@/app/shell/main-title-bar', () => ({
  MainTitleBar: () => <div>Main Title Bar</div>,
}));

vi.mock('@/app/shell/hooks/use-shell-window-context', () => ({
  useShellWindowContext: () => ({ isMainWindow: true }),
}));

vi.mock('@/app/shell/hooks/use-tray-menu-sync', () => ({
  useTrayMenuSync: () => {},
}));

vi.mock('@/app/shell/hooks/use-global-shortcut-sync', () => ({
  useGlobalShortcutSync: () => {},
}));

vi.mock('@/app/shell/hooks/use-open-settings-event', () => ({
  useOpenSettingsEvent: () => {},
}));

vi.mock('@/features/updater/components/updater-dialog', () => ({
  UpdaterDialog: () => null,
}));

vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: true,
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: () => false,
}));

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => {
    throw new Error('route crash');
  },
  useNavigate: () => vi.fn(),
}));

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

it('keeps shell chrome mounted when the route outlet crashes', async () => {
  const mod = await import('@/app/shell/app-shell-layout');

  render(<mod.AppShellLayout />);

  expect(screen.getByText('Sidebar')).toBeInTheDocument();
  expect(screen.getByText(/route crash/i)).toBeInTheDocument();
});
