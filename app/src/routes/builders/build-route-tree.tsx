import { aboutRoute } from '@/features/about/route';
import { homeRoute } from '@/features/home/route';
import { profileRoute } from '@/features/profile/route';
import { settingsRoute } from '@/features/settings/route';
import { tasksRoute } from '@/features/tasks/route';
import { Route as rootRoute } from '@/routes/__root';
import { appShellRoute } from '@/routes/app-shell-route';

export function buildRouteTree() {
  return rootRoute.addChildren([
    appShellRoute.addChildren([
      homeRoute,
      tasksRoute,
      profileRoute,
    ]),
    aboutRoute,
    settingsRoute,
  ]);
}
