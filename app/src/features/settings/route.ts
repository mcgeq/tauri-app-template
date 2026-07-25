import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { Route as rootRoute } from '@/routes/__root';

const SettingsPage = lazy(() => import('@/features/settings/pages/settings'));

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});
