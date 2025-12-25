import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    target: 'es2020',
    outDir: 'dist',
    external: ['chart.js', '@bobeec/contribution-margin-core'],
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'ContributionMarginChart',
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false, // Don't clean dist to keep CJS/ESM
    treeshake: true,
    minify: false,
    target: 'es2020',
    outDir: 'dist',
    external: ['chart.js'],
    noExternal: ['@bobeec/contribution-margin-core'],
  },
]);
