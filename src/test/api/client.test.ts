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
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: 'hello',
    });

    const result = await invokeCommand<string>('greet', { name: 'test' });

    expect(result).toBe('hello');
    expect(invoke).toHaveBeenCalledWith('greet', { name: 'test' });
  });

  it('returns undefined when no data field', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    const result = await invokeCommand('noop');

    expect(result).toBeUndefined();
  });

  it('throws CommandError on unsuccessful response', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      message: 'something went wrong',
    });

    await expect(invokeCommand('fail')).rejects.toThrow(CommandError);
    await expect(invokeCommand('fail')).rejects.toThrow(/something went wrong/);
  });

  it('throws CommandError on invoke exception', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));

    await expect(invokeCommand('boom')).rejects.toThrow(CommandError);
    await expect(invokeCommand('boom')).rejects.toThrow(/boom/);
  });

  it('throws CommandError on timeout', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100)),
    );

    await expect(invokeCommand('slow', {}, { timeoutMs: 10 })).rejects.toThrow(CommandError);
    await expect(invokeCommand('slow', {}, { timeoutMs: 10 })).rejects.toThrow(/may still complete/);
  });

  it('wraps non-CommandError in CommandError', async () => {
    (invoke as ReturnType<typeof vi.fn>).mockRejectedValue('raw string error');

    await expect(invokeCommand('bad')).rejects.toThrow(CommandError);
  });
});
