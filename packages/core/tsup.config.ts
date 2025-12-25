import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'calculator/index': 'src/calculator/index.ts',
    'validator/index': 'src/validator/index.ts',
    'layout/index': 'src/layout/index.ts',
    'formatter/index': 'src/formatter/index.ts',
  },
  format: ['cjs', 'esm', 'iife'],
  globalName: 'ContributionMarginCore',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
});
