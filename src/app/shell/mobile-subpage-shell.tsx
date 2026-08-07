import { ArrowLeft } from 'lucide-react';
import { useMobileBackTransition } from '@/hooks/use-mobile-back-transition';
import { useSwipeBack } from '@/hooks/use-swipe-back';
import { cn } from '@/lib/utils';
import { IS_MOBILE_DEVICE } from '@/platform/runtime/platform';

interface MobileSubpageShellProps {
  title?: string;
  onBack: () => void;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function MobileSubpageShell({ title, onBack, className, contentClassName, children }: MobileSubpageShellProps) {
  const { isLeaving, startBackTransition } = useMobileBackTransition(onBack);
  useSwipeBack({ onSwipeBack: startBackTransition, enabled: IS_MOBILE_DEVICE });

  return (
    <div className={cn('slide-in-right', isLeaving && 'fade-out-mobile-page', className)}>
      <div className="flex items-center px-4 pb-3 pt-3">
        <button type="button" onClick={startBackTransition} className="p-1" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {title && <h1 className="ml-2 text-base font-semibold">{title}</h1>}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
