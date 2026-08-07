describe('app shell primitive boundaries', () => {
  it('keeps the canonical title bar inside the app shell layer', async () => {
    const mainTitleBarSource = await import('@/app/shell/main-title-bar?raw');
    const settingsSource = await import('@/features/settings/pages/settings?raw');
    const aboutSource = await import('@/features/about/pages/about?raw');

    expect(mainTitleBarSource.default).toContain("from '@/app/shell/title-bar'");
    expect(settingsSource.default).toContain("from '@/app/shell/title-bar'");
    expect(aboutSource.default).toContain("from '@/app/shell/title-bar'");
    expect(mainTitleBarSource.default).not.toContain('@/components/title-bar');
    expect(settingsSource.default).not.toContain('@/components/title-bar');
    expect(aboutSource.default).not.toContain('@/components/title-bar');
  });
});
