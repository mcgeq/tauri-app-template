import { createRouter } from '@tanstack/react-router';
import { buildRouteTree } from '@/routes/builders/build-route-tree';

const routeTree = buildRouteTree();

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export { router };
export default router;
