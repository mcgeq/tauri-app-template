import { invoke } from '@tauri-apps/api/core';
import { greet } from '@/api/greet';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('greet API', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls greet command with name', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue('Hello, World!');

    const result = await greet('World');

    expect(result).toBe('Hello, World!');
    expect(invoke).toHaveBeenCalledWith('greet', { name: 'World' });
  });
});
