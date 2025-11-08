#!/usr/bin/env node

/**
 * Performance Audit Script
 * Analyzes bundle size, performance, and accessibility
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
};

// Analyze bundle size
function analyzeBundleSize() {
  log.section('📦 Bundle Size Analysis');

  const distPath = path.join(process.cwd(), 'apps', 'web', '.next');
  const staticPath = path.join(distPath, 'static');

  if (!fs.existsSync(staticPath)) {
    log.warning('No .next/static directory found. Run build first.');
    return;
  }

  const chunksPath = path.join(staticPath, 'chunks');
  const cssPath = path.join(staticPath, 'css');
  const mediaPath = path.join(staticPath, 'media');

  let totalSize = 0;
  const files = [];

  // Analyze JavaScript chunks
  if (fs.existsSync(chunksPath)) {
    const jsFiles = fs.readdirSync(chunksPath).filter((f) => f.endsWith('.js'));
    jsFiles.forEach((file) => {
      const filePath = path.join(chunksPath, file);
      const size = fs.statSync(filePath).size;
      totalSize += size;
      files.push({
        name: file,
        size: (size / 1024 / 1024).toFixed(2) + ' MB',
        sizeBytes: size,
        type: 'JavaScript',
      });
    });
  }

  // Analyze CSS files
  if (fs.existsSync(cssPath)) {
    const cssFiles = fs.readdirSync(cssPath).filter((f) => f.endsWith('.css'));
    cssFiles.forEach((file) => {
      const filePath = path.join(cssPath, file);
      const size = fs.statSync(filePath).size;
      totalSize += size;
      files.push({
        name: file,
        size: (size / 1024 / 1024).toFixed(2) + ' MB',
        sizeBytes: size,
        type: 'CSS',
      });
    });
  }

  // Sort by size (largest first)
  files.sort((a, b) => b.sizeBytes - a.sizeBytes);

  // Display results
  log.info(`Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  log.info(`Total files: ${files.length}\n`);

  // Show largest files
  log.info('Largest files:');
  files.slice(0, 10).forEach((file) => {
    const sizeMB = parseFloat(file.size);
    if (sizeMB > 0.5) {
      log.warning(`  ${file.type.padEnd(12)} ${file.name.padEnd(40)} ${file.size}`);
    } else {
      log.success(`  ${file.type.padEnd(12)} ${file.name.padEnd(40)} ${file.size}`);
    }
  });

  // Check for large chunks
  const largeChunks = files.filter((f) => f.sizeBytes > 500 * 1024); // > 500KB
  if (largeChunks.length > 0) {
    log.warning(`\n⚠️  Found ${largeChunks.length} chunks larger than 500KB`);
    log.warning('Consider:');
    log.warning('  - Code splitting');
    log.warning('  - Dynamic imports');
    log.warning('  - Tree shaking unused code');
  } else {
    log.success('\n✅ All chunks are under 500KB');
  }

  return { totalSize, files };
}

// Run Lighthouse audit
function runLighthouseAudit() {
  log.section('🔍 Lighthouse Performance Audit');

  try {
    // Check if Lighthouse CI is configured
    const lighthouseConfig = path.join(process.cwd(), 'apps', 'web', 'lighthouserc.json');

    if (!fs.existsSync(lighthouseConfig)) {
      log.info('Creating Lighthouse CI configuration...');
      const config = {
        ci: {
          collect: {
            url: ['http://localhost:3000'],
            startServerCommand: 'npm run start:web',
          },
          assert: {
            assertions: {
              'categories:performance': ['warn', { minScore: 0.9 }],
              'categories:accessibility': ['error', { minScore: 0.9 }],
              'categories:best-practices': ['warn', { minScore: 0.9 }],
              'categories:seo': ['warn', { minScore: 0.9 }],
            },
          },
          upload: {
            target: 'temporary-public-storage',
          },
        },
      };

      fs.writeFileSync(lighthouseConfig, JSON.stringify(config, null, 2));
      log.success('Lighthouse CI configuration created');
    }

    log.info('Running Lighthouse audit...');
    // This would typically run: npx lhci autorun
    log.info('Note: Run "npx lhci autorun" to perform the actual audit');
    log.info('For local testing: npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html');

  } catch (error) {
    log.error(`Lighthouse audit failed: ${error.message}`);
  }
}

// Analyze dependencies
function analyzeDependencies() {
  log.section('📚 Dependency Analysis');

  const packageJsonPath = path.join(process.cwd(), 'apps', 'web', 'package.json');
  const lockFilePath = path.join(process.cwd(), 'apps', 'web', 'package-lock.json');

  if (!fs.existsSync(packageJsonPath)) {
    log.error('package.json not found');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  log.info(`Total dependencies: ${Object.keys(dependencies).length}`);
  log.info(`Production dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
  log.info(`Dev dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);

  // Check for duplicates
  if (fs.existsSync(lockFilePath)) {
    const lockFile = JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));
    const packages = lockFile.packages || lockFile.dependencies || {};

    const duplicates = [];
    const seen = new Set();

    for (const [name, version] of Object.entries(dependencies)) {
      const key = name.replace(/@\d+\.\d+\.\d+/, ''); // Remove version for comparison
      if (seen.has(key)) {
        duplicates.push(name);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      log.warning(`Found duplicate dependencies: ${duplicates.join(', ')}`);
    } else {
      log.success('No duplicate dependencies found');
    }
  }
}

// Check for unused dependencies
function checkUnusedDependencies() {
  log.section('🧹 Unused Dependencies Check');

  try {
    log.info('Analyzing source code for unused dependencies...');
    log.info('This is a simplified check - use depcheck tool for detailed analysis');

    const srcPath = path.join(process.cwd(), 'apps', 'web', 'src');
    const packageJsonPath = path.join(process.cwd(), 'apps', 'web', 'package.json');

    if (!fs.existsSync(srcPath) || !fs.existsSync(packageJsonPath)) {
      log.warning('Source or package.json not found');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = new Set([
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ]);

    log.info(`Found ${allDeps.size} total dependencies to check`);
    log.info('Install depcheck for detailed unused dependency analysis: npm install -g depcheck');

  } catch (error) {
    log.error(`Dependency check failed: ${error.message}`);
  }
}

// Generate performance report
function generateReport(data) {
  const reportPath = path.join(process.cwd(), 'performance-audit-report.json');

  const report = {
    timestamp: new Date().toISOString(),
    bundleSize: data.bundleSize,
    recommendations: [],
  };

  // Add recommendations based on findings
  if (data.bundleSize.totalSize > 1024 * 1024 * 1024) { // > 1GB
    report.recommendations.push({
      type: 'critical',
      message: 'Bundle size exceeds 1GB - significant optimization needed',
    });
  } else if (data.bundleSize.totalSize > 1024 * 1024 * 500) { // > 500MB
    report.recommendations.push({
      type: 'warning',
      message: 'Bundle size exceeds 500MB - consider optimization',
    });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.success(`Performance report saved to: ${reportPath}`);
}

// Main execution
async function main() {
  log.section('🎨 TB Group - Performance & Accessibility Audit');

  const bundleData = analyzeBundleSize();
  runLighthouseAudit();
  analyzeDependencies();
  checkUnusedDependencies();

  log.section('✅ Audit Complete');

  log.info('Next Steps:');
  log.info('1. Run: npm run build (if not already done)');
  log.info('2. Run: npx lighthouse http://localhost:3000');
  log.info('3. Run: npx lhci autorun (for CI integration)');
  log.info('4. Review lighthouse-report.html for detailed metrics');

  if (bundleData) {
    generateReport({ bundleSize: bundleData });
  }
}

main().catch((error) => {
  log.error(`Audit failed: ${error.message}`);
  process.exit(1);
});
