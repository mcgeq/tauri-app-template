import { useEffect } from 'react';
import { onShortcutChanged } from '@/api';
import { registerShortcut } from '@/lib/shortcut';
import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';
import { toggleWindow } from '@/platform/windows/window-manager';

const SHORTCUT_KEY = 'global-shortcut-show-main';

async function registerMainWindowShortcut(shortcut: string) {
  if (!shortcut) {
    return;
  }

  await registerShortcut(shortcut, async () => {
    await toggleWindow('main');
  });
}

export function useGlobalShortcutSync() {
  useEffect(() => {
    if (!(IS_DESKTOP && IS_TAURI_APP)) {
      return;
    }

    const unlistenShortcutChanged = onShortcutChanged(async (payload) => {
      await registerMainWindowShortcut(payload.shortcut);
    });

    const initShortcut = async () => {
      const savedShortcut = localStorage.getItem(SHORTCUT_KEY);
      if (savedShortcut) {
        await registerMainWindowShortcut(savedShortcut);
      }
    };

    void initShortcut();

    return () => {
      unlistenShortcutChanged.then(fn => fn());
    };
  }, []);
}
