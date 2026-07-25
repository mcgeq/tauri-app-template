import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { getCurrentWebviewWindow, WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AppProviders } from '@/app/providers/app-providers';
import { useWindowMaximized } from '@/app/shell/hooks/use-window-maximized';
import { Loading } from '@/components/loading';
import { cn } from '@/lib/utils';
import { IS_DESKTOP } from '@/platform/runtime/platform';
import { buildWebviewWindowOptions } from '@/platform/windows/webview-window-options';
import { setNavigateFn } from '@/platform/windows/window-navigation-bridge';
import { getPreloadableDesktopWindows } from '@/routes/registry/route-registry';
import { useWindowBehaviorSync } from '@/stores/window-behavior';
import '@/i18n';

const CommandPaletteLazy = lazy(() => import('@/features/command-palette/components/command-palette'));

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { isMaximized } = useWindowMaximized();
  useWindowBehaviorSync();
  const navigate = useNavigate();

  useEffect(() => {
    setNavigateFn((path: string) => navigate({ to: path }));
  }, [navigate]);

  useEffect(() => {
    if (!IS_DESKTOP) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    const label = appWindow.label;

    if (label === 'main') {
      appWindow.show().catch(console.error);

      const preloadTimer = setTimeout(async () => {
        const windows = getPreloadableDesktopWindows();
        for (const w of windows) {
          const windowConfig = w.platform.desktop.window;
          if (!windowConfig || (await WebviewWindow.getByLabel(windowConfig.label))) {
            continue;
          }
          const { label: windowLabel } = windowConfig;
          const webview = new WebviewWindow(windowLabel, buildWebviewWindowOptions({
            ...windowConfig,
            url: w.path,
            title: '',
          }));
          webview.once('tauri://error', (e) => {
            console.error('Failed to pre-create window:', windowLabel, e);
          });
        }
      }, 1500);

      return () => clearTimeout(preloadTimer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppProviders>
      <div
        className={cn(
          'bg-background flex h-full min-h-[100vh] min-w-0 flex-col overflow-hidden',
          IS_DESKTOP && !isMaximized ? 'rounded-lg' : '',
        )}
      >
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col',
          )}
        >
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPaletteLazy open={paletteOpen} onOpenChange={setPaletteOpen} />
        </Suspense>
      )}
    </AppProviders>
  );
}
export { RootLayout };
