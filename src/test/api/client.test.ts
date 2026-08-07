import { invoke } from '@tauri-apps/api/core';
import { CommandError, invokeCommand } from '@/api/client';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('invokeCommand', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns data on successful response', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue('hello');

    const result = await invokeCommand<string>('greet', { name: 'test' });

    expect(result).toBe('hello');
    expect(invoke).toHaveBeenCalledWith('greet', { name: 'test' });
  });

  it('returns undefined for void commands', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await invokeCommand('noop');

    expect(result).toBeUndefined();
  });

  it('throws CommandError on invoke exception', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));

    await expect(invokeCommand('boom')).rejects.toThrow(CommandError);
    await expect(invokeCommand('boom')).rejects.toThrow(/boom/);
  });

  it('throws CommandError on timeout', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    await expect(invokeCommand('slow', {}, { timeoutMs: 10 })).rejects.toThrow(CommandError);
    await expect(invokeCommand('slow', {}, { timeoutMs: 10 })).rejects.toThrow(/may still complete/);
  });

  it('wraps non-CommandError in CommandError', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockRejectedValue('raw string error');

    await expect(invokeCommand('bad')).rejects.toThrow(CommandError);
  });
});
