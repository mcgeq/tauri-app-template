import { check } from '@tauri-apps/plugin-updater';
import { checkForUpdates } from '@/lib/updater';

vi.mock('@tauri-apps/plugin-updater', () => ({
  check: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-process', () => ({
  relaunch: vi.fn(),
}));

describe('checkForUpdates', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns available when update exists', async () => {
    (check as ReturnType<typeof vi.fn>).mockResolvedValue({
      version: '1.0.0',
      date: '2024-01-01',
      body: 'Release notes',
      downloadAndInstall: vi.fn(),
    });

    const result = await checkForUpdates();

    expect(result).toEqual({
      status: 'available',
      update: expect.objectContaining({ version: '1.0.0' }),
    });
  });

  it('returns up-to-date when no update', async () => {
    (check as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await checkForUpdates();

    expect(result).toEqual({ status: 'up-to-date' });
  });

  it('returns error when check throws', async () => {
    (check as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));

    const result = await checkForUpdates();

    expect(result).toEqual({
      status: 'error',
      error: expect.any(Error),
    });
  });
});
