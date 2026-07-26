import antfu from '@antfu/eslint-config';

export default await antfu({
  type: 'app',

  react: true,
  typescript: true,

  formatters: {
    css: true,
    html: true,
    markdown: 'dprint',
  },

  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },

  ignores: [
    'dist',
    'node_modules',
    'src-tauri',
    'docs',
    'scripts',
    '**/*.md',
    'tsconfig.json',
    'tsconfig.node.json',
  ],
}, {
  files: ['pnpm-workspace.yaml'],
  rules: {
    'pnpm/yaml-enforce-settings': 'off',
  },
}, {
  rules: {
    'no-console': 'off',
    'no-debugger': 'warn',
    'unused-imports/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'react-refresh/only-export-components': 'off',
    'react/no-context-provider': 'off',
    'react/no-use-context': 'off',
    'react/set-state-in-effect': 'off',
    'ts/no-redeclare': 'off',
  },
});
