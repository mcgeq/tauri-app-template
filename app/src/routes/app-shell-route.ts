import { createRoute } from '@tanstack/react-router';
import { AppShellLayout } from '@/app/shell/app-shell-layout';
import { Route as rootRoute } from '@/routes/__root';

export const appShellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app-shell',
  component: AppShellLayout,
});
