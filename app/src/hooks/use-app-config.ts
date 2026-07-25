import { useQuery } from '@tanstack/react-query';
import { getAppConfig } from '@/api/config';
import { queryKeys } from '@/lib/query-keys';

export function useAppConfig() {
  return useQuery({
    queryKey: queryKeys.appConfig.all,
    queryFn: getAppConfig,
    staleTime: 1000 * 60 * 60,
    meta: {
      persist: true,
    },
  });
}
