import { Outlet, useNavigate } from '@tanstack/react-router';
import { Suspense } from 'react';
import { BottomNav } from '@/app/shell/bottom-nav';
import { useGlobalShortcutSync } from '@/app/shell/hooks/use-global-shortcut-sync';
import { useOpenSettingsEvent } from '@/app/shell/hooks/use-open-settings-event';
import { useShellWindowContext } from '@/app/shell/hooks/use-shell-window-context';
import { useTrayMenuSync } from '@/app/shell/hooks/use-tray-menu-sync';
import { MainTitleBar } from '@/app/shell/main-title-bar';
import { ShellRouteBoundary } from '@/app/shell/shell-route-boundary';
import { Sidebar } from '@/app/shell/sidebar';
import { WindowFrame } from '@/app/shell/window-frame';
import { Loading } from '@/components/loading';
import { UpdaterDialog } from '@/features/updater/components/updater-dialog';
import { useAppTranslation } from '@/hooks/use-app-translation';
import { IS_DESKTOP } from '@/platform/runtime/platform';
import { useCompactLayout } from '@/platform/runtime/use-compact-layout';

export function AppShellLayout() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const isMobile = useCompactLayout();
  const { isMainWindow } = useShellWindowContext();

  useTrayMenuSync(t);
  useGlobalShortcutSync();
  useOpenSettingsEvent(navigate, t);

  const showBottomNav = isMobile && isMainWindow;

  return (
    <WindowFrame
      titleBar={<MainTitleBar />}
      mobileSafeArea="none"
      contentClassName={
        IS_DESKTOP ? 'flex min-h-0 flex-1 flex-row overflow-hidden' : 'flex min-h-0 flex-1 overflow-hidden'
      }
    >
      {!isMobile && <Sidebar />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {IS_DESKTOP && <UpdaterDialog />}
        <div
          className={
            isMobile
              ? 'flex min-h-0 min-w-0 flex-1 flex-col pt-[var(--app-safe-area-top)] pl-[var(--app-safe-area-left)] pr-[var(--app-safe-area-right)]'
              : 'flex min-h-0 min-w-0 flex-1 flex-col'
          }
        >
          <ShellRouteBoundary>
            <Suspense
              fallback={
                <div className="route-fade-shell">
                  <Loading />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ShellRouteBoundary>
        </div>
        {showBottomNav && <BottomNav />}
      </div>
    </WindowFrame>
  );
}
