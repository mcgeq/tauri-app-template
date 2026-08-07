import { listen } from '@tauri-apps/api/event';
import { invokeCommand } from './client';

export interface TaskProgressPayload {
  progress: number;
  message: string;
}

export interface TaskCompletePayload {
  message: string;
}

export async function startBackgroundTask(): Promise<void> {
  return invokeCommand<void>('start_background_task', {}, { timeoutMs: 30_000 });
}

export function onTaskProgress(handler: (payload: TaskProgressPayload) => void): Promise<() => void> {
  return listen<TaskProgressPayload>('task-progress', (event) => {
    handler(event.payload);
  });
}

export function onTaskComplete(handler: (payload: TaskCompletePayload) => void): Promise<() => void> {
  return listen<TaskCompletePayload>('task-complete', (event) => {
    handler(event.payload);
  });
}
