import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import react from '@vitejs/plugin-react';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;
const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version?: string };
const appVersion = packageJson.version ?? '0.0.0';

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const isAnalyze = mode === 'analyze';
  return {
    plugins: [
      react(),
      AutoImport({
        imports: ['react'],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/hooks', 'src/lib', 'src/platform/runtime', 'src/platform/windows'],
        include: [/\.[tj]sx?$/],
        exclude: [/node_modules/, /\.git/, /src-tauri/],
      }),
      isAnalyze
      && (await import('rollup-plugin-visualizer')).visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },

    clearScreen: false,
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
    build: {
      target: 'chrome92',
      assetsInlineLimit: 8192,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/'))
              return 'vendor-react';
            if (id.includes('node_modules/i18next') || id.includes('node_modules/zustand') || id.includes('node_modules/zod') || id.includes('node_modules/date-fns'))
              return 'vendor-utils';
            if (id.includes('node_modules/@tanstack/'))
              return 'router';
            if (id.includes('node_modules/sonner') || id.includes('node_modules/cmdk') || id.includes('node_modules/lucide-react') || id.includes('node_modules/motion') || id.includes('node_modules/next-themes'))
              return 'ui';
          },
        },
      },
    },
  };
});
