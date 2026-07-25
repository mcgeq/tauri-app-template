import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEffect, useState } from 'react';
import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';

export function useWindowMaximized() {
  const [isMaximized, setIsMaximized] = useState(false);
  const isTauri = IS_TAURI_APP;

  useEffect(() => {
    if (!IS_DESKTOP || !isTauri) {
      return;
    }

    const appWindow = getCurrentWebviewWindow();

    appWindow.isMaximized().then(setIsMaximized);

    const unlisten = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [isTauri]);

  return { isMaximized, isTauri };
}
