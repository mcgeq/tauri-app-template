import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export function TooltipProvider({ children, ...props }: TooltipPrimitive.TooltipProviderProps) {
  return <TooltipPrimitive.Provider {...props}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({ children, ...props }: TooltipPrimitive.TooltipProps) {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
}

export function TooltipTrigger({ children, ...props }: TooltipPrimitive.TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>;
}

export function TooltipContent({ className, sideOffset = 4, ...props }: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-xs shadow-md',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
