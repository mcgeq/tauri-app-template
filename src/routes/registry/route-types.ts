export type AppRouteKey = 'home' | 'tasks' | 'profile' | 'settings' | 'about';
export type AppShellKind = 'app' | 'standalone';
export type AppPlatform = 'desktop' | 'mobile';
export type PlatformOpenMode = 'page' | 'window';
export type NavIconKey = 'home' | 'tasks' | 'profile' | 'settings' | 'about';
export type WindowCloseStrategy = 'hide' | 'destroy';

export interface RouteWindowCloseConfig {
  strategy: WindowCloseStrategy;
  destroyDelayMs?: number;
}

export interface RouteWindowMeta {
  label: string;
  titleKey: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  decorations?: boolean;
  transparent?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  shadow?: boolean;
  parent?: string;
  preload?: boolean;
  closeStrategy?: WindowCloseStrategy;
  destroyDelayMs?: number;
}

export interface RoutePlatformMeta {
  mode: PlatformOpenMode;
  fallbackTo?: AppRouteKey;
  window?: RouteWindowMeta;
}

export interface RouteNavMeta {
  labelKey: string;
  order: number;
  iconKey: NavIconKey;
}

export interface AppRouteMeta {
  key: AppRouteKey;
  path: string;
  shell: AppShellKind;
  titleKey: string;
  backTo?: AppRouteKey;
  nav?: RouteNavMeta;
  platform: {
    desktop: RoutePlatformMeta;
    mobile: RoutePlatformMeta;
  };
}
