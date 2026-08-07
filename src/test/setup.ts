import { __resetInvokeHandler } from '@/test/mocks/tauri';
import '@testing-library/jest-dom/vitest';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi
    .fn()
    .mockImplementation((cmd: string, args?: Record<string, unknown>) =>
      import('@/test/mocks/tauri').then((m) => m.invoke(cmd, args)),
    ),
}));

const storage: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const k in storage) delete storage[k];
    },
    key: (_i: number) => '',
    get length() {
      return Object.keys(storage).length;
    },
  },
  configurable: true,
});

beforeEach(() => {
  __resetInvokeHandler();
});
