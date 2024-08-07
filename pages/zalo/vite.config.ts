import { defineConfig } from 'vite';
import { resolve } from 'path';
import { makeEntryPointPlugin, watchRebuildPlugin } from '@chrome-extension-boilerplate/hmr';

const rootDir = resolve(__dirname);
const libDir = resolve(rootDir, 'lib');
const zaloDir = resolve(rootDir, 'zalo');
const utilsDir = resolve(rootDir, 'utils');

const isDev = process.env.__DEV__ === 'true';
const isProduction = !isDev;

export default defineConfig({
  resolve: {
    alias: {
      '@lib': libDir,
      '@zalo': zaloDir,
      '@utils': utilsDir,
    },
  },
  plugins: [isDev && watchRebuildPlugin({ refresh: true }), isDev && makeEntryPointPlugin()],
  publicDir: resolve(rootDir, 'public'),
  build: {
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'ZaloScript',
      fileName: 'index',
    },
    outDir: resolve(rootDir, '..', '..', 'dist', 'zalo'),
    sourcemap: isDev,
    minify: isProduction,
    reportCompressedSize: isProduction,
    modulePreload: true,
    rollupOptions: {
      external: ['chrome'],
    },
  },
  define: {
    'process.env.NODE_ENV': isDev ? `"development"` : `"production"`,
  },
});
