export const OPEN_SETTINGS_WINDOW_EVENT = 'open-settings-window';
export const WINDOW_BEHAVIOR_SYNC_EVENT = 'window-behavior-sync';
export const TASK_PROGRESS_EVENT = 'task-progress';
export const TASK_COMPLETE_EVENT = 'task-complete';

export function destroyWindowEvent(label: string) {
  return `destroy-window:${label}`;
}
