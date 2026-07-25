import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { exit } from '@tauri-apps/plugin-process';
import { Maximize2, Minimize2, Minus, X } from 'lucide-react';
import { useEffect } from 'react';
import { useWindowMaximized } from '@/app/shell/hooks/use-window-maximized';
import { closeWindow } from '@/platform/windows/window-manager';
import { useWindowBehavior } from '@/stores/window-behavior';

interface TitleBarControlsProps {
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  windowMenu?: boolean;
}

export function TitleBarControls({
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  windowMenu = false,
}: TitleBarControlsProps) {
  const { isMaximized, isTauri } = useWindowMaximized();
  const { minimizeAction, closeAction } = useWindowBehavior();

  const minimize = async () => {
    if (!isTauri) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    if (windowMenu && minimizeAction === 'tray') {
      await appWindow.hide();
    }
    else {
      await appWindow.minimize();
    }
  };

  const toggleMaximize = async () => {
    if (!isTauri) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    if (!isTauri) {
      return;
    }
    const appWindow = getCurrentWebviewWindow();
    if (windowMenu) {
      if (closeAction === 'quit') {
        await exit(0);
      }
      else {
        await appWindow.hide();
      }
    }
    else {
      const isMain = appWindow.label === 'main';
      if (isMain) {
        await appWindow.hide();
      }
      else {
        await closeWindow(appWindow.label);
      }
    }
  };

  useEffect(() => {
    if (!isTauri || !showClose) {
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
    if (!isTauri || !showClose) {
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

  if (!isTauri) {
    return null;
  }

  return (
    <>
      {showMinimize && (
        <button
          onClick={minimize}
          className="title-bar-control"
          aria-label="Minimize"
          tabIndex={-1}
        >
          <Minus className="h-4 w-4" />
        </button>
      )}

      {showMaximize && (
        <button
          onClick={toggleMaximize}
          className="title-bar-control"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          tabIndex={-1}
        >
          {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      )}

      {showClose && (
        <button
          onClick={handleClose}
          className="title-bar-control hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Close"
          tabIndex={-1}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </>
  );
}
