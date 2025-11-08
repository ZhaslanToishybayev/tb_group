import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import sharedConfig from '../../packages/config/vitest.config';

export default defineConfig({
  plugins: [react()],
  test: {
    ...sharedConfig.test,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    root: '.',
    testTimeout: 5000,
    hookTimeout: 5000,
  },
  resolve: {
    ...sharedConfig.resolve,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
