import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import sharedConfig from '../../packages/config/vitest.config';

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      ...sharedConfig.test.coverage,
      exclude: [
        ...sharedConfig.test.coverage.exclude,
        'node_modules/',
        'dist/',
        'src/test/',
        'src/types/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        'src/middleware/logger.ts',
        'src/config/',
        'src/lib/prisma.ts',
      ],
      thresholds: {
        ...sharedConfig.test.coverage.thresholds,
        // Higher coverage for critical modules
        'src/modules/**/*': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      reportsDirectory: './coverage',
      reportOnFailure: true,
    },
    // API-specific configuration
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts',
    ],
    exclude: ['node_modules', 'dist', 'e2e'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },
  resolve: {
    ...sharedConfig.resolve,
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/config': resolve(__dirname, './src/config'),
    },
  },
});
