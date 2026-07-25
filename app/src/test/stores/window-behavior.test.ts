import { emit } from '@tauri-apps/api/event';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useWindowBehavior, useWindowBehaviorSync } from '@/stores/window-behavior';

const listenMock = vi.fn().mockResolvedValue(vi.fn());
const getWindowBehaviorConfigMock = vi.fn().mockResolvedValue({
  minimizeAction: 'taskbar',
  closeAction: 'tray',
});
const setWindowBehaviorConfigMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@tauri-apps/api/event', () => ({
  emit: vi.fn(),
  listen: (...args: unknown[]) => listenMock(...args),
}));

vi.mock('@/api/commands/window-behavior', () => ({
  getWindowBehaviorConfig: (...args: unknown[]) => getWindowBehaviorConfigMock(...args),
  setWindowBehaviorConfig: (...args: unknown[]) => setWindowBehaviorConfigMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  IS_TAURI_APP: true,
  SUPPORTS_TAURI_CALLBACKS: true,
}));

beforeEach(() => {
  globalThis.localStorage.clear();
  useWindowBehavior.setState({ minimizeAction: 'taskbar', closeAction: 'tray', hydrated: false });
  listenMock.mockClear();
  getWindowBehaviorConfigMock.mockClear();
  setWindowBehaviorConfigMock.mockClear();
  vi.clearAllMocks();
});

describe('useWindowBehavior', () => {
  it('has default values', () => {
    const { result } = renderHook(() => useWindowBehavior());

    expect(result.current.minimizeAction).toBe('taskbar');
    expect(result.current.closeAction).toBe('tray');
    expect(result.current.hydrated).toBe(false);
  });

  it('updates minimizeAction', async () => {
    const { result } = renderHook(() => useWindowBehavior());

    await act(async () => {
      await result.current.setMinimizeAction('tray');
    });

    expect(result.current.minimizeAction).toBe('tray');
    expect(setWindowBehaviorConfigMock).toHaveBeenCalledWith({
      minimizeAction: 'tray',
      closeAction: 'tray',
    });
  });

  it('updates closeAction', async () => {
    const { result } = renderHook(() => useWindowBehavior());

    await act(async () => {
      await result.current.setCloseAction('quit');
    });

    expect(result.current.closeAction).toBe('quit');
    expect(setWindowBehaviorConfigMock).toHaveBeenCalledWith({
      minimizeAction: 'taskbar',
      closeAction: 'quit',
    });
  });

  it('emits event on minimizeAction change', async () => {
    const { result } = renderHook(() => useWindowBehavior());

    await act(async () => {
      await result.current.setMinimizeAction('tray');
    });

    expect(emit).toHaveBeenCalledWith('window-behavior-sync', {
      minimizeAction: 'tray',
      closeAction: 'tray',
    });
  });

  it('emits event on closeAction change', async () => {
    const { result } = renderHook(() => useWindowBehavior());

    await act(async () => {
      await result.current.setCloseAction('quit');
    });

    expect(emit).toHaveBeenCalledWith('window-behavior-sync', {
      minimizeAction: 'taskbar',
      closeAction: 'quit',
    });
  });

  it('does not persist state to localStorage', async () => {
    const { result } = renderHook(() => useWindowBehavior());

    await act(async () => {
      await result.current.setMinimizeAction('tray');
      await result.current.setCloseAction('quit');
    });

    expect(globalThis.localStorage.getItem('tauri-window-behavior')).toBeNull();
  });

  it('subscribes to sync events only when callback support is available', async () => {
    renderHook(() => useWindowBehaviorSync());

    await waitFor(() => {
      expect(listenMock).toHaveBeenCalledWith('window-behavior-sync', expect.any(Function));
    });
  });

  it('hydrates state from the backend config when tauri is available', async () => {
    getWindowBehaviorConfigMock.mockResolvedValueOnce({
      minimizeAction: 'tray',
      closeAction: 'quit',
    });

    renderHook(() => useWindowBehaviorSync());

    await waitFor(() => {
      expect(getWindowBehaviorConfigMock).toHaveBeenCalledTimes(1);
      expect(useWindowBehavior.getState().minimizeAction).toBe('tray');
      expect(useWindowBehavior.getState().closeAction).toBe('quit');
      expect(useWindowBehavior.getState().hydrated).toBe(true);
    });
  });
});
