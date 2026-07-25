import type { ReactNode } from 'react';
import { useWindowMaximized } from '@/app/shell/hooks/use-window-maximized';
import { cn } from '@/lib/utils';
import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';
import { useCompactLayout } from '@/platform/runtime/use-compact-layout';

interface TitleBarShellProps {
  title?: string;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  onDoubleClick?: () => void;
}

export function TitleBarShell({
  title,
  leftActions,
  rightActions,
  onDoubleClick,
}: TitleBarShellProps) {
  const { isMaximized } = useWindowMaximized();
  const isMobile = useCompactLayout();
  const isTauri = IS_TAURI_APP;

  if (!IS_DESKTOP || (!isTauri && isMobile)) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-background/95 supports-backdrop-filter:bg-background/60 border-border/40 flex h-8 items-center justify-between border-b backdrop-blur select-none',
        !isMaximized ? 'rounded-t-lg' : '',
      )}
    >
      <div
        data-tauri-drag-region
        onDoubleClick={onDoubleClick}
        className="flex grow items-center gap-2 pl-2"
      >
        {title && <span className="text-sm font-medium text-slate-400">{title}</span>}
        {leftActions}
      </div>

      <div className="flex items-center gap-1">
        {rightActions}
      </div>
    </div>
  );
}
