import { emit } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { IS_DESKTOP } from '@/platform/runtime/platform';
import { destroyWindowEvent } from '@/platform/tauri/events';

const destroyTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const destroyVersions: Record<string, number> = {};

export function cancelDestroyWindow(label: string) {
  destroyVersions[label] = (destroyVersions[label] ?? 0) + 1;

  if (destroyTimers[label]) {
    clearTimeout(destroyTimers[label]);
    delete destroyTimers[label];
  }
}

export async function destroyWindow(label: string, delay = 0) {
  if (!IS_DESKTOP) {
    return;
  }

  if (!delay) {
    const window = await WebviewWindow.getByLabel(label);
    if (!window) {
      return;
    }

    await emit(destroyWindowEvent(label));
    await window.destroy();
    return;
  }

  const destroyVersion = (destroyVersions[label] ?? 0) + 1;
  destroyVersions[label] = destroyVersion;

  const window = await WebviewWindow.getByLabel(label);
  if (!window) {
    return;
  }

  if (destroyTimers[label]) {
    clearTimeout(destroyTimers[label]);
  }

  await window.hide();
  destroyTimers[label] = setTimeout(async () => {
    if (destroyVersions[label] !== destroyVersion) {
      return;
    }

    delete destroyTimers[label];

    const currentWindow = await WebviewWindow.getByLabel(label);
    if (!currentWindow) {
      return;
    }

    if (destroyVersions[label] !== destroyVersion) {
      return;
    }

    await emit(destroyWindowEvent(label));
    await currentWindow.destroy();
    delete destroyVersions[label];
  }, delay);
}
