import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { ReactNode } from 'react';
import { queryClient } from '@/app/providers/query-client';
import { createQueryPersistenceOptions } from '@/app/providers/query-persistence';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/toaster';
import { ThemeProvider } from '@/providers/theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={createQueryPersistenceOptions()}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster />
        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
        {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
