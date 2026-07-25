import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useAppConfig } from '@/hooks/use-app-config';

const getAppConfigMock = vi.fn().mockResolvedValue({
  data_dir: 'data',
  log_dir: 'logs',
  config_dir: 'config',
});

vi.mock('@/api/config', () => ({
  getAppConfig: (...args: unknown[]) => getAppConfigMock(...args),
}));

it('marks app config as a persistable stable query', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useAppConfig(), { wrapper });

  await waitFor(() => {
    expect(result.current.data?.config_dir).toBe('config');
  });

  const cached = queryClient.getQueryCache().find({ queryKey: ['appConfig'] });
  expect(cached?.meta?.persist).toBe(true);
});
