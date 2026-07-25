import { useEffect } from 'react';
import { updateTrayMenu } from '@/api';
import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';

export function useTrayMenuSync(t: (key: string) => string) {
  useEffect(() => {
    if (!(IS_DESKTOP && IS_TAURI_APP)) {
      return;
    }

    updateTrayMenu({
      showText: t('tray.show'),
      settingsText: t('tray.settings'),
      quitText: t('tray.quit'),
    }).catch((error) => {
      console.error('Failed to initialize tray menu:', error);
    });
  }, [t]);
}
