import type { AppPlatform, AppRouteKey, AppRouteMeta, RouteWindowCloseConfig } from '@/routes/registry/route-types';

type NavigableAppRouteMeta = AppRouteMeta & {
  nav: NonNullable<AppRouteMeta['nav']>;
};

export const APP_ROUTES: Record<AppRouteKey, AppRouteMeta> = {
  home: {
    key: 'home',
    path: '/',
    shell: 'app',
    titleKey: 'app.title',
    nav: {
      labelKey: 'bottomNav.home',
      order: 1,
      iconKey: 'home',
    },
    platform: {
      desktop: { mode: 'page' },
      mobile: { mode: 'page' },
    },
  },
  tasks: {
    key: 'tasks',
    path: '/tasks',
    shell: 'app',
    titleKey: 'bottomNav.tasks',
    nav: {
      labelKey: 'bottomNav.tasks',
      order: 2,
      iconKey: 'tasks',
    },
    platform: {
      desktop: { mode: 'page' },
      mobile: { mode: 'page' },
    },
  },
  profile: {
    key: 'profile',
    path: '/profile',
    shell: 'app',
    titleKey: 'bottomNav.me',
    nav: {
      labelKey: 'bottomNav.me',
      order: 3,
      iconKey: 'profile',
    },
    platform: {
      desktop: { mode: 'page' },
      mobile: { mode: 'page' },
    },
  },
  settings: {
    key: 'settings',
    path: '/settings',
    shell: 'standalone',
    titleKey: 'settings.title',
    backTo: 'profile',
    platform: {
      desktop: {
        mode: 'window',
        window: {
          label: 'settings',
          titleKey: 'settings.title',
          width: 600,
          height: 500,
          resizable: true,
          maximizable: true,
          minimizable: false,
          decorations: false,
          transparent: true,
          shadow: false,
          parent: 'main',
          preload: true,
          closeStrategy: 'hide',
        },
      },
      mobile: { mode: 'page' },
    },
  },
  about: {
    key: 'about',
    path: '/about',
    shell: 'standalone',
    titleKey: 'about.title',
    backTo: 'profile',
    platform: {
      desktop: {
        mode: 'window',
        window: {
          label: 'about',
          titleKey: 'about.title',
          width: 500,
          height: 400,
          resizable: false,
          maximizable: false,
          minimizable: false,
          decorations: false,
          transparent: true,
          shadow: false,
          alwaysOnTop: true,
          parent: 'main',
          preload: true,
          closeStrategy: 'hide',
        },
      },
      mobile: { mode: 'page' },
    },
  },
};

export const APP_ROUTE_LIST: AppRouteMeta[] = Object.values(APP_ROUTES);

function hasNav(route: AppRouteMeta): route is NavigableAppRouteMeta {
  return !!route.nav;
}

export function getRouteMeta(key: AppRouteKey) {
  return APP_ROUTES[key];
}

export function getRouteMetaByPath(pathname: string) {
  return APP_ROUTE_LIST.find(route => route.path === pathname);
}

export function getRoutePath(key: AppRouteKey) {
  return getRouteMeta(key).path;
}

export function getBackRoutePath(key: AppRouteKey) {
  const backTo = getRouteMeta(key).backTo;
  return backTo ? getRoutePath(backTo) : undefined;
}

export function getNavRoutes(platform: AppPlatform) {
  return APP_ROUTE_LIST
    .filter(route => route.shell === 'app' && route.platform[platform].mode === 'page')
    .filter(hasNav)
    .sort((a, b) => a.nav.order - b.nav.order);
}

export function getPreloadableDesktopWindows() {
  return APP_ROUTE_LIST.filter(route =>
    route.platform.desktop.mode === 'window'
    && route.platform.desktop.window?.preload,
  );
}

export function getDesktopWindowCloseConfig(label: string): RouteWindowCloseConfig {
  const windowMeta = APP_ROUTE_LIST.find(route =>
    route.platform.desktop.mode === 'window'
    && route.platform.desktop.window?.label === label,
  )?.platform.desktop.window;

  if (!windowMeta?.closeStrategy || windowMeta.closeStrategy === 'hide') {
    return { strategy: 'hide' };
  }

  return {
    strategy: 'destroy',
    destroyDelayMs: windowMeta.destroyDelayMs,
  };
}
