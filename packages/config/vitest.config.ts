/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Shared Vitest Configuration for TB Group Base Stack
 *
 * This configuration is shared across all packages and applications:
 * - apps/api
 * - apps/web
 * - apps/admin
 * - packages/ui
 *
 * Usage in individual packages:
 *
 * import { defineConfig } from 'vitest/config';
 * import sharedConfig from '../../packages/config/vitest.config';
 *
 * export default defineConfig(sharedConfig);
 */

const sharedConfig = defineConfig({
  test: {
    // Global test environment
    environment: 'node',

    // Test files pattern
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Coverage configuration with strict gating
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportOnFailure: true, // Generate coverage report even when tests fail
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts,mjs,cjs}',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/vite.config.{timestamp}*',
        '**/vitest.config.{timestamp}*',
        '**/.{idea,git,cache,output,xx}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        // Additional exclusions for coverage scope
        'src/main.{ts,tsx,js,jsx}',
        'src/index.{ts,tsx,js,jsx}',
        'src/server.{ts,tsx,js,jsx}',
        'src/app.{ts,tsx,js,jsx}',
        'generated/**',
        '**/generated/**',
        'docs/**',
        'examples/**',
        'scripts/**',
      ],
      thresholds: {
        // Global thresholds (foundation hardening - increased from 80/80/85/85)
        global: {
          branches: 85,
          functions: 85,
          lines: 90,
          statements: 90,
        },
        // Per-package thresholds for more granular control
        'apps/api': {
          branches: 90,
          functions: 90,
          lines: 92,
          statements: 92,
        },
        'apps/web': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'packages/ui': {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'packages/config': {
          branches: 90,
          functions: 90,
          lines: 95,
          statements: 95,
        },
        'status-service': {
          branches: 85,
          functions: 85,
          lines: 90,
          statements: 90,
        },
      },
      // Enable branch coverage tracking
      branches: true,
      // Function coverage tracking
      functions: true,
      // Line coverage tracking
      lines: true,
      // Statement coverage tracking
      statements: true,
    },

    // Test output
    outputFile: {
      junit: 'test-results.xml',
      html: 'coverage/index.html',
    },

    // Test behavior
    testTimeout: 10000,
    hookTimeout: 10000,

    // Pass on environment variables
    env: {
      NODE_ENV: 'test',
    },

    //pool: 'threads',
    //poolOptions: {
    //  threads: {
    //    singleThread: true,
    //  },
    //},

    // CSS handling
    css: true,

    // Mock configuration
    mockReset: true,
    clearMocks: true,

    // Reporter configuration
    reporters: ['default', 'junit'],

    // Watch mode
    watch: true,

    // Restore mocks after each test
    restoreMocks: true,

    // Set to true to cache test results
    cache: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../..'),
    },
  },

  // Build configuration (for esbuild transforms)
  esbuild: {
    target: 'node18',
  },
});

export default sharedConfig;

/**
 * API-specific configuration
 *
 * Use when testing backend/API code with:
 * - Database operations
 * - File system access
 * - Network requests
 * - Node.js specific features
 */
export const apiConfig = {
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      ...sharedConfig.test.coverage,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        ...sharedConfig.test.coverage.exclude,
        'src/**/*.d.ts',
        'src/server.ts',
        'src/app.ts',
        'src/openapi/**/*',
      ],
    },
  },
};

/**
 * Web-specific configuration
 *
 * Use when testing frontend/Next.js code with:
 * - React components
 * - Browser APIs
 * - Next.js router
 * - Window/DOM objects
 */
export const webConfig = {
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      ...sharedConfig.test.coverage,
      include: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
      exclude: [
        ...sharedConfig.test.coverage.exclude,
        'src/pages/api/**/*',
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/providers.tsx',
      ],
    },
    testTimeout: 5000,
    hookTimeout: 5000,
  },
  resolve: {
    ...sharedConfig.resolve,
    alias: {
      ...sharedConfig.resolve.alias,
      '@/*': path.resolve(__dirname, '../web/src'),
    },
  },
};

/**
 * UI-specific configuration
 *
 * Use when testing UI components with:
 * - React Testing Library
 * - Component testing
 * - JSDOM
 * - DOM APIs
 */
export const uiConfig = {
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      ...sharedConfig.test.coverage,
      include: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
      exclude: [
        ...sharedConfig.test.coverage.exclude,
        'src/index.ts',
      ],
    },
  },
  resolve: {
    ...sharedConfig.resolve,
    alias: {
      ...sharedConfig.resolve.alias,
      '@/*': path.resolve(__dirname, '../ui/src'),
    },
  },
};

/**
 * Admin-specific configuration
 *
 * Use when testing admin panel code with:
 * - React components
 * - Vite dev server
 * - Client-side routing
 */
export const adminConfig = {
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      ...sharedConfig.test.coverage,
      include: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
      exclude: [
        ...sharedConfig.test.coverage.exclude,
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
    testTimeout: 5000,
    hookTimeout: 5000,
  },
  resolve: {
    ...sharedConfig.resolve,
    alias: {
      ...sharedConfig.resolve.alias,
      '@/*': path.resolve(__dirname, '../admin/src'),
    },
  },
};

/**
 * Integration test configuration
 *
 * Use for integration tests that test multiple packages together:
 * - API + Database tests
 * - E2E API tests
 * - Multi-package workflows
 */
export const integrationConfig = {
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'node',
    include: ['**/*.integration.{test,spec}.{js,ts}'],
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../..'),
    },
  },
};

/**
 * E2E test configuration
 *
 * Use for end-to-end tests:
 * - Playwright tests
 * - Full workflow tests
 * - User interaction tests
 */
export const e2eConfig = defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.e2e.{test,spec}.{js,ts}'],
    testTimeout: 60000,
    setupFiles: ['./tests/e2e/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../..'),
    },
  },
});
