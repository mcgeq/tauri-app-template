import { render } from '@testing-library/react';

const listenMock = vi.fn().mockResolvedValue(vi.fn());

vi.mock('@tauri-apps/api/event', () => ({
  listen: (...args: unknown[]) => listenMock(...args),
}));

vi.mock('@/api', () => ({
  onShortcutChanged: vi.fn(),
  updateTrayMenu: vi.fn(),
}));

vi.mock('@/platform/windows/open-app-route', () => ({
  openAppRoute: vi.fn(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/features/updater/components/updater-dialog', () => ({
  UpdaterDialog: () => <div>Updater Dialog</div>,
}));

vi.mock('@/features/home/hooks/use-greet', () => ({
  useGreet: () => ({
    mutateAsync: vi.fn().mockResolvedValue('hello'),
    isPending: false,
    data: null,
  }),
}));

vi.mock('@/features/profile', () => ({
  ProfilePage: () => <div>Profile Page</div>,
}));

vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: true,
  SUPPORTS_TAURI_CALLBACKS: false,
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: () => false,
}));

vi.mock('@/lib/shortcut', () => ({
  registerShortcut: vi.fn(),
}));

vi.mock('@/platform/windows/window-manager', () => ({
  createWindow: vi.fn(),
  toggleWindow: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('home page desktop layout', () => {
  beforeEach(() => {
    listenMock.mockClear();
  });

  it('keeps the dashboard page content top-aligned within the shared app shell', async () => {
    const mod = await import('@/features/home/pages/home');
    const { container } = render(<mod.default />);

    const shell = container.querySelector('.overflow-y-auto');
    const dashboardPanel = container.querySelector('.min-h-full');

    expect(shell?.className).toContain('justify-start');
    expect(shell?.className).not.toContain('justify-center');
    expect(shell?.className).not.toContain('items-center');
    expect(shell?.className).not.toContain('text-center');
    expect(dashboardPanel?.className).toContain('justify-center');
    expect(dashboardPanel?.className).not.toContain('sm:justify-start');
  });
});
