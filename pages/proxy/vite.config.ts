import { ConfigEnv, defineConfig, UserConfig } from 'vite';
import { resolve } from 'path';
import { makeEntryPointPlugin, watchRebuildPlugin } from '@chrome-extension-boilerplate/hmr';

const rootDir = resolve(__dirname);
const libDir = resolve(rootDir, 'lib');
const zaloDir = resolve(rootDir, 'zalo');
const utilsDir = resolve(rootDir, 'utils');

const isDev = process.env.__DEV__ === 'true';
const isProduction = !isDev;

const commonConfig = {
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
      name: 'ProxyScript',
      fileName: 'index',
    },
    outDir: resolve(rootDir, '..', '..', 'dist', 'proxy'),
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
} as UserConfig;

const mainConfig = commonConfig as UserConfig;
const proxyConfig = {
  ...commonConfig,
  build: {
    ...commonConfig.build,
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, 'utils/zalo-extension-helpers.ts'),
      name: 'ProxyScript',
      fileName: 'helper',
    },
  },
} as UserConfig;

export default defineConfig(({ mode }: ConfigEnv) => {
  if (mode == 'proxy') {
    return proxyConfig;
  } else {
    return mainConfig;
  }
});
