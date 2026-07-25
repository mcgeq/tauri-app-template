import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { appShellRoute } from '@/routes/app-shell-route';

const HomePage = lazy(() => import('@/features/home/pages/home'));

export const homeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: '/',
  component: HomePage,
});
