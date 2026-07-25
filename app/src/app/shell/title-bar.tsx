import type { ReactNode } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { TitleBarControls } from '@/app/shell/title-bar-controls';
import { TitleBarShell } from '@/app/shell/title-bar-shell';

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
  const handleDoubleClick = onDoubleClick ?? (showMaximize
    ? () => { getCurrentWebviewWindow().toggleMaximize(); }
    : undefined);

  return (
    <TitleBarShell
      title={title}
      leftActions={leftActions}
      rightActions={(
        <>
          {rightActions}
          {rightActions && (showMinimize || showMaximize || showClose) && (
            <div className="bg-border/40 mx-1 h-4 w-px" />
          )}
          <TitleBarControls
            showMinimize={showMinimize}
            showMaximize={showMaximize}
            showClose={showClose}
            windowMenu={windowMenu}
          />
        </>
      )}
      onDoubleClick={handleDoubleClick}
    />
  );
}
