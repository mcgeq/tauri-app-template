import { invokeCommand } from '@/api/client';

export interface WindowBehaviorConfig {
  minimizeAction: 'taskbar' | 'tray';
  closeAction: 'quit' | 'tray';
}

export function getWindowBehaviorConfig() {
  return invokeCommand<WindowBehaviorConfig>('get_window_behavior_config');
}

export function setWindowBehaviorConfig(config: WindowBehaviorConfig) {
  return invokeCommand<void>('set_window_behavior_config', { ...config });
}
