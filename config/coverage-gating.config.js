/**
 * Coverage Gating Configuration
 *
 * This file defines the coverage scope and enforcement rules for the TB Group Base Stack.
 * It ensures that code coverage meets minimum thresholds before allowing merges.
 */

module.exports = {
  // Coverage thresholds for enforcement
  thresholds: {
    // Global thresholds (applies to entire codebase)
    global: {
      branches: 85,        // Increased from 80 to 85
      functions: 85,       // Increased from 80 to 85
      lines: 90,           // Increased from 85 to 90
      statements: 90,      // Increased from 85 to 90
    },

    // Per-package thresholds (more lenient for complex packages)
    perPackage: {
      // Core business logic - stricter requirements
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

    // File type specific thresholds
    fileTypes: {
      // Core service files - highest requirements
      '**/services/**': {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
      '**/utils/**': {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
      '**/types/**': {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
      '**/config/**': {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },

  // Coverage scope definitions
  scope: {
    // Include these patterns in coverage
    include: [
      'src/**/*.{ts,tsx,js,jsx}',
      'lib/**/*.{ts,tsx,js,jsx}',
      'services/**/*.{ts,tsx,js,jsx}',
      'utils/**/*.{ts,tsx,js,jsx}',
      'components/**/*.{ts,tsx,js,jsx}',
      'pages/**/*.{ts,tsx,js,jsx}',
      'api/**/*.{ts,tsx,js,jsx}',
      'modules/**/*.{ts,tsx,js,jsx}',
    ],

    // Exclude these patterns from coverage
    exclude: [
      // Test files
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/__tests__/**',
      '**/tests/**',
      '**/test/**',

      // Build outputs
      'dist/**',
      'build/**',
      'coverage/**',
      '.next/**',
      'out/**',

      // Configuration files
      '**/*.config.{ts,js,mjs,cjs}',
      '**/vitest.config.{ts,js}',
      '**/jest.config.{ts,js}',
      '**/babel.config.{ts,js}',
      '**/webpack.config.{ts,js}',
      '**/rollup.config.{ts,js}',
      '**/vite.config.{ts,js}',

      // Type definitions
      '**/*.d.ts',
      '**/*.d.tsx',

      // Entry points and bootstrap files
      'src/main.{ts,tsx,js,jsx}',
      'src/index.{ts,tsx,js,jsx}',
      'src/server.{ts,tsx,js,jsx}',
      'src/app.{ts,tsx,js,jsx}',

      // Generated files
      'generated/**',
      '**/generated/**',

      // Third party and external
      'node_modules/**',
      'vendor/**',
      'thirdparty/**',

      // Documentation and examples
      'docs/**',
      'examples/**',
      'demo/**',

      // Development tools
      'scripts/**',
      'tools/**',
      'bin/**',

      // Temporary files
      '**/*.tmp',
      '**/*.temp',
      '**/.cache/**',
    ],
  },

  // Enforcement rules
  enforcement: {
    // Fail build if coverage drops below thresholds
    failOnFail: true,

    // Generate coverage reports even when failing
    generateReportsOnFail: true,

    // Coverage report formats
    reporters: ['text', 'json', 'html', 'lcov'],

    // Coverage check behavior
    checkLatest: true,        // Check against latest commit
    compareWith: 'main',      // Compare with main branch

    // Ignore coverage drops in certain circumstances
    allowDroppingCoverage: false,

    // Minimum number of lines to consider for coverage
    minLines: 3,              // Ignore files with less than 3 lines
  },

  // CI/CD Integration
  ci: {
    // Coverage comment settings
    comment: {
      postCoverage: true,
      postFailure: true,
      header: '📊 Code Coverage Report',
    },

    // Quality gate settings
    qualityGate: {
      enabled: true,
      // Block PR if coverage drops
      blockOnCoverageDrop: true,
      // Block PR if new files have < 80% coverage
      enforceNewFilesCoverage: true,
      minimumNewFilesCoverage: 80,
    },
  },

  // Monitoring and reporting
  reporting: {
    // Coverage trend tracking
    trackTrends: true,

    // Alert thresholds (warn when below these)
    alertThresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 85,
        statements: 85,
      },
    },

    // Coverage badges and indicators
    badges: {
      generate: true,
      format: 'svg',
      style: 'flat',
    },
  },
};
