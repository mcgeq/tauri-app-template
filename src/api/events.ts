import { emit, listen } from '@tauri-apps/api/event';

export interface ShortcutChangedPayload {
  shortcut: string;
}

export interface LanguageChangedPayload {
  language: string;
}

export async function emitShortcutChanged(shortcut: string): Promise<void> {
  await emit('shortcut-changed', { shortcut });
}

export async function emitLanguageChanged(language: string): Promise<void> {
  await emit('language-changed', { language });
}

export function onShortcutChanged(handler: (payload: ShortcutChangedPayload) => void): Promise<() => void> {
  return listen<ShortcutChangedPayload>('shortcut-changed', (event) => {
    handler(event.payload);
  });
}

export function onLanguageChanged(handler: (payload: LanguageChangedPayload) => void): Promise<() => void> {
  return listen<LanguageChangedPayload>('language-changed', (event) => {
    handler(event.payload);
  });
}
