import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { Route as rootRoute } from '@/routes/__root';

const AboutPage = lazy(() => import('@/features/about/pages/about'));

export const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});
