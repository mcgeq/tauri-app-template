import { useMutation } from '@tanstack/react-query';
import { greet as greetApi } from '@/api';
import { queryKeys } from '@/lib/query-keys';

export function useGreet() {
  return useMutation({
    mutationFn: (name: string) => greetApi(name),
    mutationKey: queryKeys.greet.all,
  });
}
