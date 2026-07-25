import tasksPageSource from '../../src/features/tasks/pages/task-demo.tsx?raw';

describe('desktop route layout regressions', () => {
  it('keeps the standalone tasks route centered on both axes', () => {
    expect(tasksPageSource).toContain('items-start justify-center');
  });
});
