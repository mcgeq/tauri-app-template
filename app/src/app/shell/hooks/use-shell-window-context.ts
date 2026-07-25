import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { IS_DESKTOP } from '@/platform/runtime/platform';

function getIsMainWindow(): boolean {
  if (!IS_DESKTOP) {
    return true;
  }
  try {
    return getCurrentWebviewWindow().label === 'main';
  }
  catch {
    return true;
  }
}

// eslint-disable-next-line react/no-unnecessary-use-prefix
export function useShellWindowContext() {
  return { isMainWindow: getIsMainWindow() };
}
