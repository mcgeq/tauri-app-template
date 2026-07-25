import releaseWorkflow from '../../../.github/workflows/release.yml?raw';

describe('release workflow', () => {
  it('does not keep placeholder release metadata values', () => {
    expect(releaseWorkflow).not.toContain('__VERSION__');
  });

  it('requires an explicit tag when manually dispatching a release', () => {
    expect(releaseWorkflow).toContain('workflow_dispatch:');
    expect(releaseWorkflow).toContain('release_tag:');
  });
});
