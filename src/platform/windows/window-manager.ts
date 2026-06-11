import type { CreateWindowOptions } from '@/platform/windows/webview-window-options';
import { LogicalPosition } from '@tauri-apps/api/dpi';
import { once } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { IS_DESKTOP, IS_MOBILE_DEVICE } from '@/platform/runtime/platform';
import { destroyWindowEvent } from '@/platform/tauri/events';
import { buildWebviewWindowOptions } from '@/platform/windows/webview-window-options';
import { cancelDestroyWindow, destroyWindow } from '@/platform/windows/window-lifecycle';
import { navigateWindowFallback } from '@/platform/windows/window-navigation-bridge';
import { getDesktopWindowCloseConfig } from '@/routes/registry/route-registry';

const createWindowLoading: Record<string, boolean> = {};

async function calcCenterPosition(
  width: number,
  height: number,
  parentLabel?: string,
): Promise<{ center: true } | { x: number; y: number }> {
  const parentWindow = parentLabel
    ? await WebviewWindow.getByLabel(parentLabel)
    : WebviewWindow.getCurrent();

  if (!parentWindow) {
    return { center: true };
  }

  try {
    if (await parentWindow.isMinimized()) {
      return { center: true };
    }

    const position = await parentWindow.outerPosition();
    const size = await parentWindow.outerSize();
    const scaleFactor = await parentWindow.scaleFactor();

    if (!position || !size || !scaleFactor) {
      console.warn('Unable to get parent window info, using screen center');
      return { center: true };
    }

    const x = (position.x + (size.width - width * scaleFactor) / 2) / scaleFactor;
    const y = (position.y + (size.height - height * scaleFactor) / 2) / scaleFactor;

    if (Number.isNaN(x) || Number.isNaN(y)) {
      console.warn('Position calculation failed, using screen center');
      return { center: true };
    }

    return { x, y };
  }
  catch (error) {
    console.warn('Failed to calculate centered position:', error);
    return { center: true };
  }
}

export async function toggleWindow(label: string) {
  if (!IS_DESKTOP) {
    return;
  }

  const window = await WebviewWindow.getByLabel(label);
  if (!window) {
    return;
  }

  if ((await window.isVisible()) && !(await window.isMinimized()) && (await window.isFocused())) {
    await window.hide();
  }
  else {
    await showWindow(label);
  }
}

export async function showWindow(label: string) {
  if (!IS_DESKTOP) {
    return;
  }

  const window = await WebviewWindow.getByLabel(label);
  if (!window) {
    return;
  }

  cancelDestroyWindow(label);

  if (!(await window.isVisible())) {
    await window.show();
  }
  if (await window.isMinimized()) {
    await window.unminimize();
  }
  if (!(await window.isFocused())) {
    await window.setFocus();
  }
}

export async function hideWindow(label: string, destroyDelay?: number) {
  if (!IS_DESKTOP) {
    return;
  }

  const window = await WebviewWindow.getByLabel(label);
  if (!window) {
    return;
  }

  cancelDestroyWindow(label);
  await window.hide();

  if (destroyDelay !== undefined) {
    await destroyWindow(label, destroyDelay);
  }
}

export async function closeWindow(label: string) {
  const closeConfig = getDesktopWindowCloseConfig(label);

  if (closeConfig.strategy === 'destroy') {
    await hideWindow(label, closeConfig.destroyDelayMs ?? 0);
    return;
  }

  await hideWindow(label);
}

export async function createWindow(
  label: string,
  options: CreateWindowOptions,
  handlers?: {
    onCreated?: () => void;
    onDestroy?: () => void;
    onError?: () => void;
  },
) {
  if (!IS_DESKTOP || IS_MOBILE_DEVICE) {
    if (options.url) {
      navigateWindowFallback(options.url);
    }
    handlers?.onCreated?.();
    return;
  }

  cancelDestroyWindow(label);

  if (createWindowLoading[label]) {
    return;
  }
  createWindowLoading[label] = true;

  try {
    const window = await WebviewWindow.getByLabel(label);

    if (window) {
      if (options.parent) {
        try {
          const currentSize = await window.outerSize();
          const scaleFactor = await window.scaleFactor();
          const width = currentSize.width / scaleFactor;
          const height = currentSize.height / scaleFactor;

          const centerPos = await calcCenterPosition(width, height, options.parent);
          if ('center' in centerPos) {
            await window.center();
          }
          else {
            await window.setPosition(new LogicalPosition(centerPos.x, centerPos.y));
          }
        }
        catch (error) {
          console.error('Failed to center window:', error);
        }
      }

      await showWindow(label);
      createWindowLoading[label] = false;
      return;
    }

    const { parent } = options;
    const finalOptions = buildWebviewWindowOptions(options);

    const webview = new WebviewWindow(label, finalOptions);
    await webview.once('tauri://created', async () => {
      if (parent) {
        try {
          const width = options.width || 500;
          const height = options.height || 400;
          const centerPos = await calcCenterPosition(width, height, parent);
          if ('center' in centerPos) {
            await webview.center();
          }
          else {
            await webview.setPosition(new LogicalPosition(centerPos.x, centerPos.y));
          }
        }
        catch (error) {
          console.error('Failed to center window:', error);
          await webview.center();
        }
      }

      await webview.show();
      handlers?.onCreated?.();

      if (handlers?.onDestroy) {
        await once(destroyWindowEvent(label), () => {
          handlers.onDestroy?.();
        });
      }
    });
    await webview.once('tauri://error', (error) => {
      console.error('Failed to create window:', label, JSON.stringify(error));
      handlers?.onError?.();
    });
  }
  finally {
    createWindowLoading[label] = false;
  }
}
