import { act, renderHook, waitFor } from '@testing-library/react';
import { useWindowBehavior, useWindowBehaviorSync } from '@/stores/window-behavior';

vi.mock('@/platform/runtime/platform', () => ({
  IS_TAURI_APP: false,
  SUPPORTS_TAURI_CALLBACKS: false,
}));

describe('window behavior browser fallback', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    globalThis.localStorage.setItem('tauri-window-behavior', JSON.stringify({
      minimizeAction: 'tray',
      closeAction: 'quit',
    }));

    useWindowBehavior.setState({
      hydrated: false,
      minimizeAction: 'taskbar',
      closeAction: 'tray',
    });
  });

  it('hydrates from browser persistence through the same async path', async () => {
    renderHook(() => useWindowBehaviorSync());

    await waitFor(() => {
      expect(useWindowBehavior.getState()).toMatchObject({
        hydrated: true,
        minimizeAction: 'tray',
        closeAction: 'quit',
      });
    });
  });

  it('persists browser updates to localStorage', async () => {
    const { result } = renderHook(() => useWindowBehavior());

    await act(async () => {
      await result.current.setMinimizeAction('tray');
      await result.current.setCloseAction('quit');
    });

    expect(globalThis.localStorage.getItem('tauri-window-behavior')).toBe(JSON.stringify({
      minimizeAction: 'tray',
      closeAction: 'quit',
    }));
  });
});
