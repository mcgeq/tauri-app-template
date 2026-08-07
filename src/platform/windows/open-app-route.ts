import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';
import { buildCreateWindowOptionsFromRouteWindow } from '@/platform/windows/webview-window-options';
import { createWindow } from '@/platform/windows/window-manager';
import { getRouteMeta, getRoutePath } from '@/routes/registry/route-registry';
import type { AppRouteKey } from '@/routes/registry/route-types';

interface OpenAppRouteOptions {
  navigate: (options: { to: string }) => Promise<unknown> | unknown;
  t: (key: string) => string;
}

export async function openAppRoute(key: AppRouteKey, { navigate, t }: OpenAppRouteOptions) {
  const route = getRouteMeta(key);
  const target = IS_DESKTOP && IS_TAURI_APP ? route.platform.desktop : route.platform.mobile;

  if (target.mode === 'window' && target.window) {
    const { label, options } = buildCreateWindowOptionsFromRouteWindow(
      target.window,
      route.path,
      t(target.window.titleKey),
    );
    await createWindow(label, options);
    return;
  }

  if (target.fallbackTo) {
    await navigate({ to: getRoutePath(target.fallbackTo) });
    return;
  }

  await navigate({ to: route.path });
}
