import path from 'node:path';
import react from '@vitejs/plugin-react';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: ['react'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/hooks', 'src/lib', 'src/platform/runtime', 'src/platform/windows'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/vite-env.d.ts',
      ],
    },
  },
});
