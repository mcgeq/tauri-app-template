import { QueryClient } from '@tanstack/react-query';
import { QUERY_CACHE_MAX_AGE } from '@/app/providers/query-persistence';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: QUERY_CACHE_MAX_AGE,
    },
  },
});
