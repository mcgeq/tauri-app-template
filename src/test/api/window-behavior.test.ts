import { describe, expect, it, vi } from 'vitest';

const invokeCommandMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/api/client', () => ({
  invokeCommand: (...args: unknown[]) => invokeCommandMock(...args),
}));

describe('window behavior api', () => {
  it('reads the window behavior config via the canonical command', async () => {
    invokeCommandMock.mockResolvedValueOnce({
      minimizeAction: 'taskbar',
      closeAction: 'tray',
    });

    const mod = await import('@/api/commands/window-behavior');
    const config = await mod.getWindowBehaviorConfig();

    expect(config).toEqual({
      minimizeAction: 'taskbar',
      closeAction: 'tray',
    });
    expect(invokeCommandMock).toHaveBeenCalledWith('get_window_behavior_config');
  });

  it('writes the window behavior command payload unchanged', async () => {
    const mod = await import('@/api/commands/window-behavior');

    await mod.setWindowBehaviorConfig({ minimizeAction: 'tray', closeAction: 'tray' });

    expect(invokeCommandMock).toHaveBeenCalledWith('set_window_behavior_config', {
      minimizeAction: 'tray',
      closeAction: 'tray',
    });
  });
});
