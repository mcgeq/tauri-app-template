import { render, screen } from '@testing-library/react';

const windowFrameTestState = vi.hoisted(() => ({
  isDesktop: false,
  isMobile: true,
  isTauriApp: false,
  getCurrentWebviewWindowMock: vi.fn(),
  isMaximizedMock: vi.fn(),
  onResizedMock: vi.fn(),
  unlistenResizeMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: (...args: unknown[]) => windowFrameTestState.getCurrentWebviewWindowMock(...args),
}));

vi.mock('@/platform/runtime/platform', () => ({
  get IS_DESKTOP() {
    return windowFrameTestState.isDesktop;
  },
  get IS_TAURI_APP() {
    return windowFrameTestState.isTauriApp;
  },
}));

vi.mock('@/platform/runtime/use-compact-layout', () => ({
  useCompactLayout: () => windowFrameTestState.isMobile,
}));

describe('window frame mobile safe area handling', () => {
  beforeEach(() => {
    windowFrameTestState.isDesktop = false;
    windowFrameTestState.isMobile = true;
    windowFrameTestState.isTauriApp = false;
    windowFrameTestState.unlistenResizeMock.mockReset();
    windowFrameTestState.isMaximizedMock.mockReset().mockResolvedValue(false);
    windowFrameTestState.onResizedMock.mockReset().mockResolvedValue(windowFrameTestState.unlistenResizeMock);
    windowFrameTestState.getCurrentWebviewWindowMock.mockReset().mockReturnValue({
      isMaximized: windowFrameTestState.isMaximizedMock,
      onResized: windowFrameTestState.onResizedMock,
    });
    delete (window as Window & { __TAURI__?: unknown }).__TAURI__;
  });

  it('applies shared top and horizontal safe-area padding on mobile by default', async () => {
    const mod = await import('@/app/shell/window-frame');

    render(
      <mod.WindowFrame titleBar={<div>Title Bar</div>}>
        <div>Page Content</div>
      </mod.WindowFrame>,
    );

    expect(screen.getByRole('main').className).toContain('pt-[var(--app-safe-area-top)]');
    expect(screen.getByRole('main').className).toContain('pl-[var(--app-safe-area-left)]');
    expect(screen.getByRole('main').className).toContain('pr-[var(--app-safe-area-right)]');
  });

  it('can opt out of the shared mobile safe-area padding for split layouts', async () => {
    const mod = await import('@/app/shell/window-frame');

    render(
      <mod.WindowFrame {...({ mobileSafeArea: 'none' } as Record<string, unknown>)} titleBar={<div>Title Bar</div>}>
        <div>Page Content</div>
      </mod.WindowFrame>,
    );

    expect(screen.getByRole('main').className).not.toContain('var(--app-safe-area-top)');
    expect(screen.getByRole('main').className).not.toContain('var(--app-safe-area-left)');
    expect(screen.getByRole('main').className).not.toContain('var(--app-safe-area-right)');
  });

  it('does not call Tauri window APIs in a desktop browser preview without Tauri runtime', async () => {
    const mod = await import('@/app/shell/window-frame');

    windowFrameTestState.isDesktop = true;
    windowFrameTestState.isMobile = false;
    windowFrameTestState.isTauriApp = false;

    render(
      <mod.WindowFrame titleBar={<div>Title Bar</div>}>
        <div>Page Content</div>
      </mod.WindowFrame>,
    );

    expect(screen.getByText('Title Bar')).toBeTruthy();
    expect(windowFrameTestState.getCurrentWebviewWindowMock).not.toHaveBeenCalled();
  });
});
