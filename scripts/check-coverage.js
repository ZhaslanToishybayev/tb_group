#!/usr/bin/env node
/**
 * Coverage Gating Script
 *
 * This script validates that code coverage meets defined thresholds
 * and can be integrated into CI/CD pipelines to enforce quality gates.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import coverageConfig from '../config/coverage-gating.config.js';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    return null;
  }
}

function parseCoverageReport(jsonReport) {
  if (!jsonReport) return null;

  try {
    const report = JSON.parse(jsonReport);
    return {
      total: report.total || {},
      files: report.files || [],
    };
  } catch (error) {
    log(`Failed to parse coverage report: ${error.message}`, 'red');
    return null;
  }
}

function checkThresholds(actual, thresholds, packageName = 'global') {
  const results = {
    passed: true,
    violations: [],
    warnings: [],
  };

  const metrics = ['branches', 'functions', 'lines', 'statements'];

  metrics.forEach(metric => {
    const actualValue = actual[metric]?.pct || 0;
    const thresholdValue = thresholds[metric] || thresholds.global?.[metric] || 0;

    if (actualValue < thresholdValue) {
      results.violations.push({
        package: packageName,
        metric,
        actual: actualValue,
        threshold: thresholdValue,
        diff: thresholdValue - actualValue,
      });
      results.passed = false;
    } else if (actualValue < thresholdValue + 5) {
      results.warnings.push({
        package: packageName,
        metric,
        actual: actualValue,
        threshold: thresholdValue,
        diff: thresholdValue - actualValue,
      });
    }
  });

  return results;
}

function generateCoverageReport(coverageData) {
  const report = [];

  report.push('📊 Coverage Report Summary');
  report.push('='.repeat(50));

  // Overall coverage
  if (coverageData.total) {
    const total = coverageData.total;
    report.push('\n🌐 Overall Coverage:');
    report.push(`  Lines: ${total.lines?.pct || 0}% (${total.lines?.covered || 0}/${total.lines?.total || 0})`);
    report.push(`  Statements: ${total.statements?.pct || 0}% (${total.statements?.covered || 0}/${total.statements?.total || 0})`);
    report.push(`  Functions: ${total.functions?.pct || 0}% (${total.functions?.covered || 0}/${total.functions?.total || 0})`);
    report.push(`  Branches: ${total.branches?.pct || 0}% (${total.branches?.covered || 0}/${total.branches?.total || 0})`);
  }

  // Package-specific coverage
  if (coverageData.files && coverageData.files.length > 0) {
    report.push('\n📦 Package Coverage:');

    const packageCoverage = {};
    coverageData.files.forEach(file => {
      const packageName = file.file?.match(/^(packages|apps)\/([^/]+)/)?.[0] || 'other';
      if (!packageCoverage[packageName]) {
        packageCoverage[packageName] = {
          lines: { covered: 0, total: 0 },
          statements: { covered: 0, total: 0 },
          functions: { covered: 0, total: 0 },
          branches: { covered: 0, total: 0 },
        };
      }

      // Aggregate coverage data
      ['lines', 'statements', 'functions', 'branches'].forEach(metric => {
        packageCoverage[packageName][metric].covered += file[metric]?.covered || 0;
        packageCoverage[packageName][metric].total += file[metric]?.total || 0;
      });
    });

    Object.entries(packageCoverage).forEach(([pkg, data]) => {
      report.push(`\n  ${pkg}:`);
      Object.entries(data).forEach(([metric, values]) => {
        const pct = values.total > 0 ? (values.covered / values.total * 100).toFixed(1) : '0.0';
        report.push(`    ${metric}: ${pct}% (${values.covered}/${values.total})`);
      });
    });
  }

  return report.join('\n');
}

async function main() {
  log('🔍 Starting coverage gate check...', 'blue');

  // Run tests with coverage
  log('Running tests with coverage collection...', 'yellow');
  const testCommand = 'vitest run --coverage --reporter=json --outputFile=coverage/coverage-report.json';

  const testOutput = runCommand(testCommand);
  if (!testOutput) {
    log('❌ Tests failed - cannot generate coverage report', 'red');
    process.exit(1);
  }

  // Read coverage report
  const coverageFile = 'coverage/coverage-report.json';
  if (!fs.existsSync(coverageFile)) {
    log(`❌ Coverage report not found at ${coverageFile}`, 'red');
    process.exit(1);
  }

  const coverageContent = fs.readFileSync(coverageFile, 'utf-8');
  const coverageData = parseCoverageReport(coverageContent);

  if (!coverageData) {
    log('❌ Failed to parse coverage report', 'red');
    process.exit(1);
  }

  // Display coverage report
  log(generateCoverageReport(coverageData));

  // Check thresholds
  log('\n🔍 Checking coverage thresholds...', 'blue');

  let overallPassed = true;
  const violations = [];

  // Check global thresholds
  if (coverageData.total) {
    const globalResult = checkThresholds(
      coverageData.total,
      coverageConfig.thresholds.global,
      'global'
    );

    if (!globalResult.passed) {
      overallPassed = false;
      violations.push(...globalResult.violations);
      log('\n❌ Global coverage thresholds violated:', 'red');
      globalResult.violations.forEach(v => {
        log(`  ${v.metric}: ${v.actual}% < ${v.threshold}% (${v.diff}% short)`, 'red');
      });
    } else {
      log('\n✅ Global coverage thresholds passed', 'green');
    }
  }

  // Check per-package thresholds
  if (coverageData.files && coverageData.files.length > 0) {
    const packageCoverage = {};
    coverageData.files.forEach(file => {
      const packageMatch = file.file?.match(/^(packages|apps)\/([^/]+)/);
      const packageName = packageMatch ? `${packageMatch[1]}/${packageMatch[2]}` : null;

      if (packageName && coverageConfig.thresholds.perPackage[packageName]) {
        if (!packageCoverage[packageName]) {
          packageCoverage[packageName] = {
            lines: { covered: 0, total: 0 },
            statements: { covered: 0, total: 0 },
            functions: { covered: 0, total: 0 },
            branches: { covered: 0, total: 0 },
          };
        }

        // Aggregate coverage data for package
        ['lines', 'statements', 'functions', 'branches'].forEach(metric => {
          packageCoverage[packageName][metric].covered += file[metric]?.covered || 0;
          packageCoverage[packageName][metric].total += file[metric]?.total || 0;
        });
      }
    });

    Object.entries(packageCoverage).forEach(([packageName, data]) => {
      // Calculate percentages
      const packageData = {};
      Object.entries(data).forEach(([metric, values]) => {
        packageData[metric] = {
          pct: values.total > 0 ? (values.covered / values.total * 100) : 0,
          covered: values.covered,
          total: values.total,
        };
      });

      const packageThresholds = coverageConfig.thresholds.perPackage[packageName];
      const result = checkThresholds(packageData, packageThresholds, packageName);

      if (!result.passed) {
        overallPassed = false;
        violations.push(...result.violations);
        log(`\n❌ ${packageName} coverage thresholds violated:`, 'red');
        result.violations.forEach(v => {
          log(`  ${v.metric}: ${v.actual.toFixed(1)}% < ${v.threshold}% (${v.diff.toFixed(1)}% short)`, 'red');
        });
      } else {
        log(`\n✅ ${packageName} coverage thresholds passed`, 'green');
      }
    });
  }

  // Final result
  log('\n' + '='.repeat(50), 'blue');

  if (overallPassed) {
    log('🎉 All coverage thresholds passed!', 'green');
    log('✅ Quality gate passed - proceeding with deployment', 'green');

    // Generate coverage badge
    if (coverageConfig.reporting.badges.generate) {
      log('📊 Coverage badge can be generated from the report', 'blue');
    }

    process.exit(0);
  } else {
    log('💥 Coverage thresholds violated!', 'red');
    log('❌ Quality gate failed - deployment blocked', 'red');
    log(`\n🔧 To fix coverage issues:`, 'yellow');
    log('1. Write more tests for uncovered code', 'yellow');
    log('2. Add integration tests for edge cases', 'yellow');
    log('3. Consider excluding non-critical code from coverage', 'yellow');
    log(`\n📊 Detailed coverage report available at: ${coverageFile}`, 'blue');

    if (coverageConfig.enforcement.failOnFail) {
      process.exit(1);
    }
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the script
main().catch(error => {
  log(`❌ Coverage gate check failed: ${error.message}`, 'red');
  process.exit(1);
});
