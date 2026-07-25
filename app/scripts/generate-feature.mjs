import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const name = process.argv[2];

if (!name) {
  console.error('Usage: node scripts/generate-feature.mjs <feature-name>');
  process.exit(1);
}

const featureDir = resolve('src', 'features', name);
const featureName = toPascalCase(name);
const routeName = `${featureName}Route`;
const testDir = resolve('src', 'test', 'features');

if (existsSync(featureDir)) {
  console.error(`Feature "${name}" already exists at ${featureDir}`);
  process.exit(1);
}

mkdirSync(resolve(featureDir, 'components'), { recursive: true });
mkdirSync(resolve(featureDir, 'hooks'), { recursive: true });
mkdirSync(resolve(featureDir, 'pages'), { recursive: true });
mkdirSync(testDir, { recursive: true });

const page = `import { useTranslation } from 'react-i18next';

export default function ${featureName}Page() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{t('${name}.title')}</h1>
      <p className="text-muted-foreground text-sm">{t('${name}.description')}</p>
    </div>
  );
}
`;

const route = `import { createRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { appShellRoute } from '@/routes/app-shell-route';

const ${featureName}Page = lazy(() => import('@/features/${name}/pages/${name}'));

export const ${routeName} = createRoute({
  getParentRoute: () => appShellRoute,
  path: '/${name}',
  component: ${featureName}Page,
});
`;

const index = `export { ${routeName} } from './route';
export { default as ${featureName}Page } from './pages/${name}';
`;

const pageTest = `import { render, screen } from '@testing-library/react';
import ${featureName}Page from '@/features/${name}/pages/${name}';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe('${featureName}Page', () => {
  it('renders the feature title key', () => {
    render(<${featureName}Page />);

    expect(screen.getByText('${name}.title')).toBeInTheDocument();
  });
});
`;

writeFileSync(resolve(featureDir, `pages/${name}.tsx`), page);
writeFileSync(resolve(featureDir, 'route.ts'), route);
writeFileSync(resolve(featureDir, 'index.ts'), index);
writeFileSync(resolve(featureDir, 'hooks', '.gitkeep'), '');
writeFileSync(resolve(featureDir, 'components', '.gitkeep'), '');
writeFileSync(resolve(testDir, `${name}-page.test.tsx`), pageTest);

console.log(`Feature "${name}" generated at ${featureDir}`);

function toPascalCase(value) {
  return value
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}
