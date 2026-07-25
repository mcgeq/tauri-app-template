import { render, screen } from '@testing-library/react';

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/features/updater/components/updater-dialog', () => ({
  UpdaterDialog: () => <div>Updater Dialog</div>,
}));

vi.mock('@/app/shell/window-frame', () => ({
  WindowFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/app/shell/main-title-bar', () => ({
  MainTitleBar: () => <div>Main Title Bar</div>,
}));

vi.mock('@/app/shell/sidebar', () => ({
  Sidebar: () => <div>Sidebar</div>,
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
  IS_DESKTOP: false,
  SUPPORTS_TAURI_CALLBACKS: false,
}));

vi.mock('@/lib/shortcut', () => ({
  registerShortcut: vi.fn(),
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: () => true,
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

describe('home page mobile updater handling', () => {
  it('keeps the three tech logos on one row with smaller mobile sizing', async () => {
    const mod = await import('@/features/home/pages/home');

    render(<mod.default />);

    const viteLogo = screen.getByAltText('Vite logo');
    const tauriLogo = screen.getByAltText('Tauri logo');
    const reactLogo = screen.getByAltText('React logo');
    const logoRow = viteLogo.closest('div');

    expect(logoRow?.className).toContain('flex-nowrap');
    expect(viteLogo.className).toContain('h-16');
    expect(tauriLogo.className).toContain('h-16');
    expect(reactLogo.className).toContain('h-16');
  });
});
