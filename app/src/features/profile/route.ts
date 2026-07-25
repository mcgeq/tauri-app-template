import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { appShellRoute } from '@/routes/app-shell-route';

const ProfilePage = lazy(() => import('@/features/profile/pages/profile').then(m => ({ default: m.ProfilePage })));

export const profileRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: '/profile',
  component: ProfilePage,
});
