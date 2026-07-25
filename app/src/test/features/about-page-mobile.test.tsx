import { fireEvent, render, screen } from '@testing-library/react';

const navigateMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@tauri-apps/api/app', () => ({
  getVersion: vi.fn().mockResolvedValue('0.0.1'),
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: vi.fn(),
}));

vi.mock('@/app/shell/title-bar', () => ({
  TitleBar: () => <div>Title Bar</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/features/updater/hooks/use-manual-update-check', () => ({
  useManualUpdateCheck: () => ({
    checkUpdate: vi.fn(),
    checking: false,
    showNoUpdate: false,
  }),
}));

vi.mock('@/app/shell/window-frame', () => ({
  WindowFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({
    t: (key: string, vars?: { num?: string }) => {
      if (key === 'about.version') {
        return `Version ${vars?.num ?? ''}`.trim();
      }

      const values: Record<string, string> = {
        'about.title': 'About',
        'about.appName': 'Qianyu',
        'about.copyright': 'Copyright',
        'updater.checking': 'Checking...',
        'updater.checkForUpdates': 'Check for Updates',
      };

      return values[key] ?? key;
    },
  }),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_DESKTOP: false,
  IS_MOBILE_DEVICE: true,
  IS_TAURI_APP: true,
  SUPPORTS_TAURI_CALLBACKS: false,
}));

vi.mock('@/platform/windows/window-lifecycle', () => ({
  cancelDestroyWindow: vi.fn(),
  destroyWindow: vi.fn(),
}));

describe('about page mobile updater handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hides the desktop-only update button on mobile', async () => {
    const mod = await import('@/features/about/pages/about');

    render(<mod.default />);

    expect(screen.queryByRole('button', { name: 'Check for Updates' })).not.toBeInTheDocument();
  });

  it('fades out before navigating back to profile on mobile', async () => {
    const mod = await import('@/features/about/pages/about');

    const { container } = render(<mod.default />);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(container.querySelector('.fade-out-mobile-page')).not.toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(180);

    expect(navigateMock).toHaveBeenCalledWith({ to: '/profile' });
  });
});
