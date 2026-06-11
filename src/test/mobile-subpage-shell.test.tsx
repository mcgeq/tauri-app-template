import { fireEvent, render, screen } from '@testing-library/react';

describe('mobile subpage shell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fades out before navigating back', async () => {
    const onBack = vi.fn();
    const mod = await import('@/app/shell/mobile-subpage-shell');
    const { container } = render(
      <mod.MobileSubpageShell title="Settings" onBack={onBack}>
        <div>body</div>
      </mod.MobileSubpageShell>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(container.querySelector('.fade-out-mobile-page')).not.toBeNull();
    expect(onBack).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(180);

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
