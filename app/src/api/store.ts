import { Store } from '@tauri-apps/plugin-store';

const STORE_PATH = 'settings.json';

let _store: Store | null = null;

export async function getStore(): Promise<Store> {
  if (!_store) {
    _store = await Store.load(STORE_PATH, { defaults: {}, autoSave: true });
  }
  return _store;
}

export async function resetStore(): Promise<void> {
  if (_store) {
    await _store.clear();
    await _store.save();
  }
  _store = null;
}
