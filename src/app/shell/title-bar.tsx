import type { ReactNode } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { exit } from '@tauri-apps/plugin-process';
import { Maximize2, Minimize2, Minus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';
import { useCompactLayout } from '@/platform/runtime/use-compact-layout';
import { closeWindow } from '@/platform/windows/window-manager';
import { useWindowBehavior } from '@/stores/window-behavior';

interface TitleBarProps {
  title?: string;
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  windowMenu?: boolean;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  onDoubleClick?: () => void;
}

export function TitleBar({
  title,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  windowMenu = false,
  leftActions,
  rightActions,
  onDoubleClick,
}: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const { minimizeAction, closeAction } = useWindowBehavior();
  const isMobile = useCompactLayout();
  const isTauri = IS_TAURI_APP;

  useEffect(() => {
    if (!IS_DESKTOP || !showMaximize || !isTauri) {
      return;
    }

    const appWindow = getCurrentWebviewWindow();

    appWindow.isMaximized().then(setIsMaximized);

    const unlisten = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [isTauri, showMaximize]);

  const minimizeToTaskbar = async () => {
    if (!isTauri) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    await appWindow.minimize();
  };

  const minimizeToTray = async () => {
    if (!isTauri) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    await appWindow.hide();
  };

  const handleToggleMaximize = async () => {
    if (!isTauri) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    await appWindow.toggleMaximize();
  };

  const quitApp = async () => {
    await exit(0);
  };

  const handleClose = async () => {
    if (!isTauri) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    const isMain = appWindow.label === 'main';
    if (isMain) {
      await appWindow.hide();
    }
    else {
      await closeWindow(appWindow.label);
    }
  };

  useEffect(() => {
    if (!IS_DESKTOP || !showClose || !isTauri) {
      return;
    }

    const appWindow = getCurrentWebviewWindow();
    if (appWindow.label === 'main') {
      return;
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      await closeWindow(appWindow.label);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTauri, showClose]);

  useEffect(() => {
    if (!IS_DESKTOP || !showClose || !isTauri) {
      return;
    }

    const appWindow = getCurrentWebviewWindow();
    if (appWindow.label === 'main') {
      return;
    }

    const unlistenCloseRequested = appWindow.onCloseRequested(async (event) => {
      event.preventDefault();
      await closeWindow(appWindow.label);
    });

    return () => {
      unlistenCloseRequested.then(fn => fn());
    };
  }, [isTauri, showClose]);

  const handleDragRegionDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick();
    }
    else if (showMaximize) {
      handleToggleMaximize();
    }
  };

  if (!IS_DESKTOP || (!isTauri && isMobile)) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-background/95 supports-backdrop-filter:bg-background/60 border-border/40 flex h-8 items-center justify-between border-b backdrop-blur select-none',
        showMaximize && isMaximized ? '' : 'rounded-t-lg',
      )}
    >
      <div
        data-tauri-drag-region
        onDoubleClick={handleDragRegionDoubleClick}
        className="flex grow items-center gap-2 pl-2"
      >
        {title && <span className="text-sm font-medium text-slate-400">{title}</span>}
        {leftActions}
      </div>

      <div className="flex items-center gap-1">
        {rightActions}

        {rightActions && (showMinimize || showMaximize || showClose) && (
          <div className="bg-border/40 mx-1 h-4 w-px" />
        )}

        {showMinimize && (
          <button
            onClick={windowMenu ? (minimizeAction === 'tray' ? minimizeToTray : minimizeToTaskbar) : minimizeToTaskbar}
            className="title-bar-control"
            aria-label="Minimize"
            tabIndex={-1}
          >
            <Minus className="h-4 w-4" />
          </button>
        )}

        {showMaximize && (
          <button
            onClick={handleToggleMaximize}
            className="title-bar-control"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            tabIndex={-1}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        )}

        {showClose && (
          <button
            onClick={windowMenu ? (closeAction === 'quit' ? quitApp : minimizeToTray) : handleClose}
            className="title-bar-control hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Close"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
