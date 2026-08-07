import { fireEvent, render, screen } from '@testing-library/react';

const commandPaletteTestState = vi.hoisted(() => ({
  openAppRouteMock: vi.fn(),
  setThemeMock: vi.fn(),
  setLanguageMock: vi.fn(),
  changeLanguageMock: vi.fn(),
  language: 'en',
  theme: 'light',
}));

vi.mock('cmdk', () => ({
  Command: {
    Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    List: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Empty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Group: ({ children, heading }: { children: React.ReactNode; heading?: string }) => (
      <section aria-label={heading}>{children}</section>
    ),
    Item: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => (
      <button onClick={onSelect} type="button">
        {children}
      </button>
    ),
  },
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: commandPaletteTestState.language,
      changeLanguage: (...args: unknown[]) => commandPaletteTestState.changeLanguageMock(...args),
    },
  }),
}));

vi.mock('@/providers/theme-provider', () => ({
  useTheme: () => ({
    theme: commandPaletteTestState.theme,
    setTheme: (...args: unknown[]) => commandPaletteTestState.setThemeMock(...args),
  }),
}));

vi.mock('@/platform/windows/open-app-route', () => ({
  openAppRoute: (...args: unknown[]) => commandPaletteTestState.openAppRouteMock(...args),
}));

vi.mock('@/i18n/language', () => ({
  toggleLanguage: (language: string) => (language === 'en' ? 'zh' : 'en'),
  setLanguage: (...args: unknown[]) => commandPaletteTestState.setLanguageMock(...args),
}));

describe('command palette route opening', () => {
  beforeEach(() => {
    commandPaletteTestState.openAppRouteMock.mockReset();
    commandPaletteTestState.setThemeMock.mockReset();
    commandPaletteTestState.setLanguageMock.mockReset();
    commandPaletteTestState.changeLanguageMock.mockReset();
    commandPaletteTestState.language = 'en';
    commandPaletteTestState.theme = 'light';
  });

  it('opens settings and about through the shared app-route window entrypoint', async () => {
    const mod = await import('@/features/command-palette/components/command-palette');

    render(<mod.CommandPalette open={true} onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.click(screen.getByRole('button', { name: 'About' }));

    expect(commandPaletteTestState.openAppRouteMock).toHaveBeenNthCalledWith(
      1,
      'settings',
      expect.objectContaining({
        navigate: expect.any(Function),
        t: expect.any(Function),
      }),
    );
    expect(commandPaletteTestState.openAppRouteMock).toHaveBeenNthCalledWith(
      2,
      'about',
      expect.objectContaining({
        navigate: expect.any(Function),
        t: expect.any(Function),
      }),
    );
  });

  it('changes language through the shared language workflow', async () => {
    const mod = await import('@/features/command-palette/components/command-palette');

    render(<mod.CommandPalette open={true} onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'language.toggle' }));

    expect(commandPaletteTestState.setLanguageMock).toHaveBeenCalledWith('zh');
    expect(commandPaletteTestState.changeLanguageMock).not.toHaveBeenCalled();
  });
});
