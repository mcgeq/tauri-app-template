export { CommandError, invokeCommand } from './client';
export {
  getWindowBehaviorConfig,
  setWindowBehaviorConfig,
} from './commands/window-behavior';
export type { WindowBehaviorConfig } from './commands/window-behavior';
export { getAppConfig } from './config';
export type { AppConfig } from './config';
export {
  emitLanguageChanged,
  emitShortcutChanged,
  onLanguageChanged,
  onShortcutChanged,
} from './events';
export type {
  LanguageChangedPayload,
  ShortcutChangedPayload,
} from './events';
export { greet } from './greet';
export { createNote, listNotes } from './notes';
export type { Note } from './notes';
export { getStore, resetStore } from './store';
export { onTaskComplete, onTaskProgress, startBackgroundTask } from './task';
export type { TaskCompletePayload, TaskProgressPayload } from './task';
export { updateTrayMenu } from './tray';
export type { TrayMenuText } from './tray';
