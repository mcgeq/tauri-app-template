import { render } from '@testing-library/react';
import { onTaskComplete, onTaskProgress } from '@/api';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/api', () => ({
  onTaskComplete: vi.fn().mockResolvedValue(vi.fn()),
  onTaskProgress: vi.fn().mockResolvedValue(vi.fn()),
  startBackgroundTask: vi.fn(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/platform/runtime/platform', () => ({
  SUPPORTS_TAURI_CALLBACKS: false,
}));

describe('task demo mobile runtime handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not subscribe to task progress listeners without callback support', async () => {
    const mod = await import('@/features/tasks/components/task-demo');

    render(<mod.TaskDemo />);

    expect(onTaskProgress).not.toHaveBeenCalled();
    expect(onTaskComplete).not.toHaveBeenCalled();
  });
});
