# Coverage Gating System

**Version**: 1.0.0
**Date**: 2025-10-31
**Status**: Implemented and Active

---

## Overview

The TB Group Base Stack includes a comprehensive coverage gating system that enforces code quality standards through automated coverage validation. This system ensures that all code contributions maintain sufficient test coverage before being merged or deployed.

## Coverage Thresholds

### Global Thresholds (Baseline)

| Metric | Threshold | Description |
|--------|-----------|-------------|
| **Branches** | 85% | All conditional branches must be tested |
| **Functions** | 85% | All functions/methods must be called in tests |
| **Lines** | 90% | Most executable lines must be covered |
| **Statements** | 90% | All statements must be executed in tests |

### Package-Specific Thresholds

| Package | Branches | Functions | Lines | Statements | Rationale |
|---------|----------|-----------|-------|------------|-----------|
| **apps/api** | 90% | 90% | 92% | 92% | Core business logic - highest requirements |
| **packages/config** | 90% | 90% | 95% | 95% | Configuration code - critical infrastructure |
| **status-service** | 85% | 85% | 90% | 90% | Service layer - important for reliability |
| **apps/web** | 80% | 85% | 85% | 85% | Frontend code - UI testing complexity |
| **packages/ui** | 75% | 80% | 80% | 80% | UI components - visual testing challenges |

## Coverage Scope

### Included in Coverage

- Source code in `src/`, `lib/`, `services/`, `utils/`
- Business logic and core functionality
- API endpoints and route handlers
- Data models and schemas
- Utility functions and helpers
- Component logic (excluding pure presentation)

### Excluded from Coverage

#### Automatic Exclusions

- **Test files**: `*.test.ts`, `*.spec.ts`, `**/tests/**`
- **Build outputs**: `dist/`, `build/`, `coverage/`
- **Configuration files**: `*.config.ts`, `vitest.config.ts`, `jest.config.ts`
- **Type definitions**: `*.d.ts` files
- **Entry points**: `src/main.ts`, `src/index.ts`, `src/server.ts`

#### Manual Exclusions

- **Generated files**: Auto-generated code
- **Documentation**: Example code and demos
- **Scripts**: Build and deployment scripts
- **Third-party integrations**: External library wrappers

## Usage

### Running Coverage Checks

```bash
# Run tests with coverage
pnpm coverage

# Check coverage thresholds (CI/CD ready)
pnpm coverage:check

# Generate detailed HTML coverage report
pnpm coverage:report

# Run full CI test suite with coverage gating
pnpm test:ci
```

### Individual Package Testing

```bash
# Test status-service with coverage
pnpm test --workspace @tb/status-service -- --coverage

# Check coverage for specific package
pnpm test --workspace @tb/api -- --coverage --reporter=json --outputFile=coverage-api.json
```

## CI/CD Integration

### Quality Gate Script

The `scripts/check-coverage.js` script provides automated coverage validation:

```bash
node scripts/check-coverage.js
```

**Features:**
- Validates global and per-package thresholds
- Generates detailed coverage reports
- Provides actionable feedback for improvements
- Supports CI/CD pipeline integration
- Blocks deployments when coverage drops below thresholds

### GitHub Actions Integration

```yaml
name: Tests with Coverage Gating

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests with coverage gating
        run: pnpm test:ci

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

### Pre-commit Hook Integration

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run fast coverage check on staged files
pnpm coverage:check --staged-files-only
```

## Coverage Reports

### Report Formats

1. **Console Report**: Real-time coverage in terminal
2. **HTML Report**: Interactive coverage browser at `coverage/index.html`
3. **JSON Report**: Machine-readable coverage data at `coverage/coverage-report.json`
4. **LCov Report**: Line coverage data for external tools

### Understanding Coverage Data

```typescript
interface CoverageMetrics {
  lines: {
    total: number;      // Total lines of code
    covered: number;    // Lines executed in tests
    skipped: number;    // Lines ignored
    pct: number;        // Percentage covered
  };
  functions: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  branches: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
  statements: {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
  };
}
```

## Improving Coverage

### Strategies

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions and API endpoints
3. **Edge Case Testing**: Cover error conditions and boundary values
4. **Mocking**: Use mocks for external dependencies and complex setups

### Common Coverage Gaps

#### Uncovered Branches

```typescript
// ❌ Uncovered: else branch
if (user.isAdmin) {
  grantAccess();
}
// Missing: else branch with appropriate test

// ✅ Covered: both branches tested
if (user.isAdmin) {
  grantAccess();
} else {
  denyAccess();
}
```

#### Uncovered Error Handling

```typescript
// ❌ Uncovered: error paths
function parseData(data) {
  return JSON.parse(data); // What if data is invalid?
}

// ✅ Covered: error handling
function parseData(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}
```

### Tools and Techniques

#### Test Coverage Analysis

```bash
# Find files with low coverage
grep -r "Lines.*[0-9]%" coverage/coverage-report.json | sort

# Identify uncovered functions
grep -r "Functions.*0%" coverage/coverage-report.json

# Find uncovered branches
grep -r "Branches.*[0-9]%" coverage/coverage-report.json | head -10
```

#### Targeted Testing

```typescript
// Use test.each for comprehensive parameter testing
describe('parseConfig', () => {
  test.each([
    { input: '{"valid": "json"}', expected: { valid: 'json' } },
    { input: 'null', expected: null },
    { input: '{}', expected: {} },
  ])('parses $input correctly', ({ input, expected }) => {
    expect(parseConfig(input)).toEqual(expected);
  });
});
```

## Configuration

### Coverage Configuration File

Edit `config/coverage-gating.config.js` to adjust:

- Coverage thresholds per package
- Include/exclude patterns
- Enforcement rules
- Quality gate settings
- CI/CD integration options

### Vitest Configuration

Coverage settings are defined in:
- `packages/config/vitest.config.ts` (shared configuration)
- Individual package `vitest.config.ts` files (package-specific overrides)

## Monitoring and Alerts

### Coverage Trends

Track coverage changes over time:
- Monitor coverage percentage trends
- Alert on significant coverage drops
- Set quality gates based on historical data

### Quality Gates

Current enforcement rules:
- **Global threshold enforcement**: Fails if overall coverage drops
- **Per-package validation**: Each package must meet its specific thresholds
- **New file requirements**: New files must have minimum 80% coverage
- **Coverage regression detection**: Blocks merges that reduce coverage

### Alerts and Notifications

Configure alerts for:
- Coverage drops below thresholds
- New files with insufficient coverage
- Significant coverage regressions
- Quality gate failures

## Best Practices

### Test Strategy

1. **Test Pyramid**: Focus on unit tests for business logic
2. **Integration Tests**: Test critical user workflows
3. **End-to-End Tests**: Validate complete system functionality
4. **Contract Testing**: Ensure API compatibility

### Coverage Goals

- **New Code**: Aim for 95%+ coverage on new features
- **Critical Paths**: 100% coverage on business-critical functions
- **Error Handling**: Comprehensive error path testing
- **Edge Cases**: Test boundary conditions and error states

### Maintenance

- **Regular Reviews**: Monthly coverage audits
- **Threshold Updates**: Adjust thresholds as codebase matures
- **Scope Refinement**: Review exclusions and include patterns
- **Tool Updates**: Keep testing tools and libraries current

## Troubleshooting

### Common Issues

#### Coverage Drop After Merge

**Symptoms**: Coverage decreases after adding new code
**Solutions**:
1. Add tests for new functionality
2. Review excluded files for missed coverage
3. Check for test environment differences

#### Flaky Coverage Numbers

**Symptoms**: Coverage varies between runs
**Solutions**:
1. Ensure consistent test environment
2. Check for test order dependencies
3. Review time-sensitive test code

#### High Coverage, Low Quality

**Symptoms**: High coverage but tests don't catch real bugs
**Solutions**:
1. Improve test quality and assertions
2. Focus on behavior testing over line coverage
3. Add integration and E2E tests

### Debug Commands

```bash
# Generate detailed coverage report
pnpm test -- --coverage --reporter=verbose

# Find uncovered lines in specific file
npx vitest run --coverage --reporter=json | jq '.files[] | select(.file=="src/specific-file.ts")'

# Compare coverage with previous commit
git diff HEAD~1 --name-only | xargs npx vitest run --coverage
```

## Future Enhancements

### Planned Features

- **Coverage Badges**: Automatic coverage badges for README files
- **Coverage Trends**: Historical coverage tracking and visualization
- **Smart Exclusions**: AI-powered coverage exclusion suggestions
- **Quality Metrics**: Code quality score combining coverage and complexity
- **Team Analytics**: Individual and team coverage metrics

### Integration Roadmap

- **SonarQube**: Advanced code quality and coverage analysis
- **CodeClimate**: Comprehensive code quality monitoring
- **Coveralls**: External coverage tracking and reporting
- **Codecov**: Enhanced coverage reporting and PR integration

---

## Summary

The coverage gating system ensures code quality through:

✅ **Automated enforcement** of coverage thresholds
✅ **Package-specific** requirements for different code types
✅ **CI/CD integration** with quality gates
✅ **Comprehensive reporting** and monitoring
✅ **Actionable feedback** for improvement

This system maintains high code quality standards while providing flexibility for different package types and testing requirements.

**Current Status**: ✅ **Implemented and Active**
**Next Review**: 2026-01-31 (Quarterly Review)

---

## Quick Reference

### Essential Commands

```bash
# Check coverage (CI/CD ready)
pnpm coverage:check

# Generate HTML report
pnpm coverage:report

# Run full CI pipeline
pnpm test:ci

# Test specific package
pnpm test --workspace @tb/api -- --coverage
```

### Key Files

- `config/coverage-gating.config.js` - Coverage rules and thresholds
- `scripts/check-coverage.js` - Quality gate script
- `packages/config/vitest.config.ts` - Shared test configuration
- `coverage/coverage-report.json` - Coverage data output

### Quality Gates

- **Global**: 85% branches, 85% functions, 90% lines, 90% statements
- **API**: 90% branches, 90% functions, 92% lines, 92% statements
- **New Files**: Minimum 80% coverage requirement
- **Enforcement**: Blocks deployments on coverage failure
