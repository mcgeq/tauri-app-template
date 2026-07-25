import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { SUPPORTS_TAURI_CALLBACKS } from '@/platform/runtime/platform';
import { OPEN_SETTINGS_WINDOW_EVENT } from '@/platform/tauri/events';
import { openAppRoute } from '@/platform/windows/open-app-route';

type OpenAppRouteOptions = Parameters<typeof openAppRoute>[1];

export function useOpenSettingsEvent(
  navigate: OpenAppRouteOptions['navigate'],
  t: OpenAppRouteOptions['t'],
) {
  useEffect(() => {
    if (!SUPPORTS_TAURI_CALLBACKS) {
      return;
    }

    const unlistenOpenSettings = listen(OPEN_SETTINGS_WINDOW_EVENT, () => openAppRoute('settings', { navigate, t }));

    return () => {
      unlistenOpenSettings.then(fn => fn());
    };
  }, [navigate, t]);
}
