import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ProfilePage } from '@/features/profile/pages/profile';

const navigateMock = vi.fn().mockResolvedValue(undefined);
const useCompactLayoutMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: (...args: unknown[]) => useCompactLayoutMock(...args),
}));

vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({
    t: (key: string, vars?: { num?: string }) => {
      const values: Record<string, string> = {
        'profile.settings': 'Settings',
        'profile.about': 'About',
        'profile.appName': 'Qianyu',
        'settings.title': 'Settings',
        'about.title': 'About',
      };

      if (key === 'profile.version') {
        return `Version ${vars?.num ?? ''}`.trim();
      }

      return values[key] ?? key;
    },
  }),
}));

vi.mock('@/platform/windows/open-app-route', () => ({
  openAppRoute: (routeKey: string, options: { navigate: (payload: { to: string }) => Promise<unknown> }) =>
    options.navigate({ to: routeKey === 'settings' ? '/settings' : '/about' }),
}));

describe('profilePage mobile navigation', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    useCompactLayoutMock.mockReset();
    useCompactLayoutMock.mockReturnValue(true);
  });

  it('navigates to settings in mobile mode', async () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: '/settings' });
    });
  });
});
