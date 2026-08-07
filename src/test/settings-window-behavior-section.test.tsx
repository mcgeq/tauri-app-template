import { render, screen } from '@testing-library/react';

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

describe('window behavior section hydration', () => {
  it('disables all desktop window behavior buttons before hydration completes', async () => {
    const mod = await import('@/features/settings/components/window-behavior-section');

    render(
      <mod.WindowBehaviorSection
        hydrated={false}
        minimizeAction="taskbar"
        closeAction="tray"
        setMinimizeAction={vi.fn()}
        setCloseAction={vi.fn()}
        t={(key: string) => key}
      />,
    );

    expect(screen.getByRole('button', { name: 'settings.window.taskbar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'settings.window.quit' })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'settings.window.tray' })).toHaveLength(2);
    expect(
      screen
        .getAllByRole('button', { name: 'settings.window.tray' })
        .every((button) => button.hasAttribute('disabled')),
    ).toBe(true);
  });
});
