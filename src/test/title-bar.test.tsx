import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const titleBarTestState = vi.hoisted(() => ({
  label: 'settings',
  isDesktop: true,
  isMobile: false,
  hideMock: vi.fn(),
  closeMock: vi.fn(),
  minimizeMock: vi.fn(),
  toggleMaximizeMock: vi.fn(),
  isMaximizedMock: vi.fn(),
  onResizedMock: vi.fn(),
  onCloseRequestedMock: vi.fn(),
  unlistenResizeMock: vi.fn(),
  unlistenCloseRequestedMock: vi.fn(),
  closeRequestedHandler: undefined as undefined | ((event: { preventDefault: () => void }) => void | Promise<void>),
  closeWindowMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: () => ({
    label: titleBarTestState.label,
    hide: titleBarTestState.hideMock,
    close: titleBarTestState.closeMock,
    minimize: titleBarTestState.minimizeMock,
    toggleMaximize: titleBarTestState.toggleMaximizeMock,
    isMaximized: titleBarTestState.isMaximizedMock,
    onResized: titleBarTestState.onResizedMock,
    onCloseRequested: titleBarTestState.onCloseRequestedMock,
  }),
}));

vi.mock('@tauri-apps/plugin-process', () => ({
  exit: vi.fn(),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' '),
}));

vi.mock('@/platform/runtime/platform', () => ({
  get IS_DESKTOP() {
    return titleBarTestState.isDesktop;
  },
  IS_TAURI_APP: true,
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: () => titleBarTestState.isMobile,
}));

vi.mock('@/stores/window-behavior', () => ({
  useWindowBehavior: () => ({
    minimizeAction: 'taskbar',
    closeAction: 'tray',
  }),
}));

vi.mock('@/platform/windows/window-manager', () => ({
  closeWindow: (...args: unknown[]) => titleBarTestState.closeWindowMock(...args),
}));

describe('title bar desktop close behavior', () => {
  beforeEach(() => {
    titleBarTestState.label = 'settings';
    titleBarTestState.isDesktop = true;
    titleBarTestState.isMobile = false;
    titleBarTestState.closeRequestedHandler = undefined;
    titleBarTestState.hideMock.mockReset().mockResolvedValue(undefined);
    titleBarTestState.closeMock.mockReset().mockResolvedValue(undefined);
    titleBarTestState.closeWindowMock.mockReset().mockResolvedValue(undefined);
    titleBarTestState.minimizeMock.mockReset().mockResolvedValue(undefined);
    titleBarTestState.toggleMaximizeMock.mockReset().mockResolvedValue(undefined);
    titleBarTestState.isMaximizedMock.mockReset().mockResolvedValue(false);
    titleBarTestState.unlistenResizeMock.mockReset();
    titleBarTestState.unlistenCloseRequestedMock.mockReset();
    titleBarTestState.onResizedMock.mockReset().mockResolvedValue(titleBarTestState.unlistenResizeMock);
    titleBarTestState.onCloseRequestedMock.mockReset().mockImplementation((handler: typeof titleBarTestState.closeRequestedHandler) => {
      titleBarTestState.closeRequestedHandler = handler ?? undefined;
      return Promise.resolve(titleBarTestState.unlistenCloseRequestedMock);
    });
    delete (window as Window & { __TAURI__?: unknown }).__TAURI__;
  });

  it('hides standalone windows when the close button is clicked', async () => {
    const mod = await import('@/app/shell/title-bar');

    render(<mod.TitleBar title="Settings" />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(titleBarTestState.closeWindowMock).toHaveBeenCalledWith('settings'));
    expect(titleBarTestState.closeMock).not.toHaveBeenCalled();
  });

  it('still works when global __TAURI__ is disabled but the runtime is tauri', async () => {
    const mod = await import('@/app/shell/title-bar');

    render(<mod.TitleBar title="Settings" showMinimize showMaximize />);

    fireEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(titleBarTestState.minimizeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(titleBarTestState.toggleMaximizeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(titleBarTestState.closeWindowMock).toHaveBeenCalledWith('settings'));
  });

  it('prevents native close requests from destroying standalone windows', async () => {
    const mod = await import('@/app/shell/title-bar');

    render(<mod.TitleBar title="Settings" />);

    const preventDefault = vi.fn();
    await titleBarTestState.closeRequestedHandler?.({ preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(titleBarTestState.closeWindowMock).toHaveBeenCalledWith('settings');
    expect(titleBarTestState.closeMock).not.toHaveBeenCalled();
  });

  it('hides standalone windows when Escape is pressed', async () => {
    const mod = await import('@/app/shell/title-bar');

    render(<mod.TitleBar title="Settings" />);

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(titleBarTestState.closeWindowMock).toHaveBeenCalledWith('settings'));
    expect(titleBarTestState.closeMock).not.toHaveBeenCalled();
  });
});
