import { render, screen } from '@testing-library/react';

const locationState = {
  pathname: '/profile',
};

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => locationState,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        'bottomNav.home': 'Home',
        'bottomNav.tasks': 'Tasks',
        'bottomNav.me': 'Profile',
      };
      return labels[key] ?? key;
    },
  }),
}));

describe('bottom nav safe area handling', () => {
  it('uses the shared bottom safe-area CSS variable', async () => {
    const mod = await import('@/app/shell/bottom-nav');

    render(<mod.BottomNav />);

    expect(screen.getByRole('navigation').className).toContain('var(--app-safe-area-bottom)');
  });

  it('participates in the normal mobile shell layout instead of using a fixed overlay', async () => {
    const mod = await import('@/app/shell/bottom-nav');

    render(<mod.BottomNav />);

    expect(screen.getByRole('navigation').className).toContain('shrink-0');
    expect(screen.getByRole('navigation').className).not.toContain('fixed');
  });
});
