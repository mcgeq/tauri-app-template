import type { WindowBehaviorConfig } from '@/api/commands/window-behavior';
import { emit, listen } from '@tauri-apps/api/event';
import {
  getWindowBehaviorConfig,
  setWindowBehaviorConfig,
} from '@/api/commands/window-behavior';
import { IS_TAURI_APP, SUPPORTS_TAURI_CALLBACKS } from '@/platform/runtime/platform';
import { WINDOW_BEHAVIOR_SYNC_EVENT } from '@/platform/tauri/events';

const STORAGE_KEY = 'tauri-window-behavior';

export const DEFAULT_WINDOW_BEHAVIOR_CONFIG: WindowBehaviorConfig = {
  minimizeAction: 'taskbar',
  closeAction: 'tray',
};

export interface WindowBehaviorRepository {
  load: () => Promise<WindowBehaviorConfig>;
  save: (config: WindowBehaviorConfig) => Promise<void>;
  publish: (config: WindowBehaviorConfig) => Promise<void>;
  subscribe: (handler: (config: WindowBehaviorConfig) => void) => Promise<() => void>;
}

function readBrowserConfig(): WindowBehaviorConfig {
  const raw = globalThis.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return DEFAULT_WINDOW_BEHAVIOR_CONFIG;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WindowBehaviorConfig>;
    return {
      minimizeAction: parsed.minimizeAction === 'tray' ? 'tray' : 'taskbar',
      closeAction: parsed.closeAction === 'quit' ? 'quit' : 'tray',
    };
  }
  catch (error) {
    console.error('Failed to parse browser window behavior config:', error);
    return DEFAULT_WINDOW_BEHAVIOR_CONFIG;
  }
}

export function createWindowBehaviorRepository(): WindowBehaviorRepository {
  if (!IS_TAURI_APP) {
    return {
      async load() {
        return readBrowserConfig();
      },
      async save(config) {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      },
      async publish() {},
      async subscribe() {
        return () => {};
      },
    };
  }

  return {
    load: getWindowBehaviorConfig,
    save: setWindowBehaviorConfig,
    async publish(config) {
      if (IS_TAURI_APP && SUPPORTS_TAURI_CALLBACKS) {
        await emit(WINDOW_BEHAVIOR_SYNC_EVENT, config);
      }
    },
    async subscribe(handler) {
      if (!(IS_TAURI_APP && SUPPORTS_TAURI_CALLBACKS)) {
        return () => {};
      }

      return listen<WindowBehaviorConfig>(WINDOW_BEHAVIOR_SYNC_EVENT, event => handler(event.payload));
    },
  };
}
