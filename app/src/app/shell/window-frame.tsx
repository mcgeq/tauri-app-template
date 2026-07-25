import type { ReactNode } from 'react';
import { useWindowMaximized } from '@/app/shell/hooks/use-window-maximized';
import { cn } from '@/lib/utils';
import { IS_DESKTOP, IS_TAURI_APP } from '@/platform/runtime/platform';
import { useCompactLayout } from '@/platform/runtime/use-compact-layout';

interface WindowFrameProps {
  titleBar: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  mobileSafeArea?: 'all' | 'none';
}

export function WindowFrame({
  titleBar,
  children,
  className,
  contentClassName,
  mobileSafeArea = 'all',
}: WindowFrameProps) {
  const { isMaximized } = useWindowMaximized();
  const isMobile = useCompactLayout();
  const isTauri = IS_TAURI_APP;
  const showDesktopChrome = IS_DESKTOP && (isTauri || !isMobile);

  return (
    <div
      className={cn(
        'bg-background flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
        showDesktopChrome && !isMaximized ? 'border-border rounded-lg border' : '',
        className,
      )}
    >
      {showDesktopChrome && titleBar}
      <main
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col',
          isMobile && mobileSafeArea === 'all' && 'pt-[var(--app-safe-area-top)] pl-[var(--app-safe-area-left)] pr-[var(--app-safe-area-right)]',
          contentClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
