import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { appShellRoute } from '@/routes/app-shell-route';

const TaskDemoPage = lazy(() => import('@/features/tasks/pages/task-demo'));

export const tasksRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: '/tasks',
  component: TaskDemoPage,
});
