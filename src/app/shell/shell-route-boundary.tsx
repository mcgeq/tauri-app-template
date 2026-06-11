import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

export function ShellRouteBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-destructive text-base font-semibold">Route failed to render</p>
          <p className="text-muted-foreground max-w-lg text-sm">{error.message}</p>
          <button
            onClick={reset}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm"
          >
            Retry route
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
