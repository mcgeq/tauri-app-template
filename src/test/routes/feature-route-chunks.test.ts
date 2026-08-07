const routeLoaders = [
  {
    feature: 'home',
    loadSource: () => import('@/features/home/route?raw'),
    expectedImport: "import('@/features/home/pages/home')",
    disallowedImports: ["import('@/features/home')", "from '@/features/home'"],
  },
  {
    feature: 'tasks',
    loadSource: () => import('@/features/tasks/route?raw'),
    expectedImport: "import('@/features/tasks/pages/task-demo')",
    disallowedImports: ["from '@/features/tasks'"],
  },
  {
    feature: 'profile',
    loadSource: () => import('@/features/profile/route?raw'),
    expectedImport: "import('@/features/profile/pages/profile')",
    disallowedImports: ["from '@/features/profile'"],
  },
  {
    feature: 'settings',
    loadSource: () => import('@/features/settings/route?raw'),
    expectedImport: "import('@/features/settings/pages/settings')",
    disallowedImports: ["from '@/features/settings'"],
  },
  {
    feature: 'about',
    loadSource: () => import('@/features/about/route?raw'),
    expectedImport: "import('@/features/about/pages/about')",
    disallowedImports: ["from '@/features/about'"],
  },
] as const;

describe('feature route chunk boundaries', () => {
  it.each(routeLoaders)(
    'lazy-loads the $feature page module directly',
    async ({ loadSource, expectedImport, disallowedImports }) => {
      const source = await loadSource();

      expect(source.default).toContain('createRoute');
      expect(source.default).toContain('lazy(() =>');
      expect(source.default).toContain(expectedImport);
      for (const disallowedImport of disallowedImports) {
        expect(source.default).not.toContain(disallowedImport);
      }
    },
  );
});
