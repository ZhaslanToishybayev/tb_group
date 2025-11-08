# Pre-Commit Hooks Setup

## Overview

This project uses **Husky** and **lint-staged** to enforce code quality standards through automated pre-commit checks. All code must pass these checks before it can be committed to the repository.

## Features

### 🔍 Pre-Commit Checks (`pre-commit`)

The pre-commit hook automatically runs the following checks:

1. **lint-staged** - Formats and lints staged files
   - ESLint fixes on TypeScript/JavaScript files
   - Prettier formatting on all files
   - Type checking on TypeScript files

2. **Type Check** - Full TypeScript compilation check
   - Runs `tsc --noEmit` to verify all types are correct
   - Prevents type errors from entering the codebase

3. **Tests** - Executes the test suite
   - Runs tests in the status-service workspace
   - Uses Vitest with `--run` flag for CI-like execution
   - Fails commit if any tests don't pass

4. **Security Audit** - Scans for vulnerabilities
   - Runs `npm audit` with moderate level
   - Identifies known security vulnerabilities in dependencies
   - Prevents committing code with security issues

5. **Task Master Integration** - Validates task dependencies
   - Checks if Task Master is installed
   - Validates task dependencies if available
   - Helps maintain task management discipline

### 📝 Commit Message Validation (`commit-msg`)

The commit-msg hook enforces **Conventional Commits** format:

```
<type>[optional scope]: <description>
```

**Examples:**
```bash
feat: add new user authentication module
fix(api): resolve memory leak in data handler
docs: update installation instructions
test(status-service): add integration tests
```

**Valid types:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that do not affect the meaning of the code
- `refactor` - A code change that neither fixes a bug nor adds a feature
- `perf` - A code change that improves performance
- `test` - Adding missing tests or correcting existing tests
- `chore` - Changes to the build process or auxiliary tools
- `ci` - Changes to CI configuration files and scripts
- `build` - Changes that affect the build system or dependencies
- `revert` - Reverts a previous commit

## Configuration

### lint-staged Configuration

Located in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "tsc --noEmit"
    ]
  }
}
```

This configuration:
- Runs ESLint with auto-fix on TypeScript/JavaScript files
- Formats all files with Prettier
- Type-checks TypeScript files

### Security Audit Level

The security audit is set to `--audit-level=moderate`, which will:
- Fail on high and critical severity vulnerabilities
- Warn on moderate severity vulnerabilities
- Allow low severity vulnerabilities (for development dependencies)

## Usage

### Normal Commit Flow

```bash
# Stage your changes
git add .

# Commit (pre-commit hooks run automatically)
git commit -m "feat: add new feature"

# If checks pass, commit succeeds ✅
# If checks fail, fix issues and try again ❌
```

### Bypassing Hooks (Not Recommended)

```bash
# Bypass pre-commit checks (use sparingly)
git commit --no-verify -m "feat: emergency fix"

# This skips:
# - lint-staged formatting
# - Type checking
# - Tests
# - Security audit
# - Task Master validation
```

### Skipping Individual Checks

You can modify `.husky/pre-commit` to skip certain checks if needed:

```bash
# Comment out sections to skip:
# echo -e "${YELLOW}🧪 Running tests...${NC}"
# cd status-service
# npm test -- --run
# cd ..
```

## Installation

The pre-commit hooks are automatically installed via Husky's `prepare` script:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

When you run `npm install`, Husky sets up the git hooks automatically.

### Manual Setup (if needed)

```bash
# Install dependencies
npm install

# Initialize Husky (if not already done)
npx husky init

# The prepare script will handle the rest
npm run prepare
```

## Troubleshooting

### Hook Not Running

```bash
# Check if .husky directory exists
ls -la .husky/

# Check if hooks are executable
ls -la .husky/pre-commit
ls -la .husky/commit-msg

# Make hooks executable (if needed)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### TypeScript Errors

If TypeScript compilation fails:

```bash
# Run type check manually
npx tsc --noEmit

# Fix all type errors before committing
```

### Linting Errors

If ESLint fails:

```bash
# Fix linting issues manually
npx eslint src/**/*.ts --fix

# Then commit again
```

### Test Failures

If tests fail:

```bash
# Run tests manually to see detailed output
cd status-service
npm test

# Fix failing tests before committing
```

### Security Audit Failures

If `npm audit` fails:

```bash
# Check for vulnerabilities
npm audit

# Update vulnerable packages
npm audit fix

# If needed, update package.json with secure versions
npm update <package-name>
```

## Benefits

### ✅ Code Quality
- Ensures all code meets style guidelines
- Enforces TypeScript type safety
- Requires passing tests

### 🔒 Security
- Scans for known vulnerabilities
- Prevents insecure code from being committed
- Maintains dependency health

### 📋 Consistent Commits
- Enforces conventional commit format
- Makes commit history more readable
- Enables automatic changelog generation

### ⚡ Fast Feedback
- Catches issues before CI/CD
- Immediate feedback on code quality
- Prevents problematic code from spreading

### 🛠️ Task Integration
- Validates Task Master task dependencies
- Maintains project organization
- Helps track development progress

## Best Practices

### 1. Commit Frequently
The pre-commit hooks are fast (usually < 10 seconds). Commit often to get quick feedback.

### 2. Write Good Commit Messages
Follow conventional commits format. Good messages help:
- Review code changes
- Generate release notes
- Track project history

### 3. Keep Tests Updated
Before committing new features, ensure tests pass locally:
```bash
cd status-service
npm test
```

### 4. Review Dependencies
Regularly update dependencies to avoid security issues:
```bash
npm update
npm audit
```

### 5. Handle Hook Failures Gracefully
When a hook fails:
1. Read the error message carefully
2. Fix the issues locally
3. Stage the fixes
4. Commit again

### 6. Use Task Master
Keep tasks organized with Task Master:
```bash
task-master list
task-master next
```

## Integration with CI/CD

These pre-commit hooks complement CI/CD by catching issues early. The CI pipeline should run the same (or additional) checks to ensure consistency.

### CI Pipeline Checks

Your CI pipeline should include:
```bash
# Lint
npm run lint

# Type check
npm run type-check

# Tests with coverage
npm run test:ci

# Security audit
npm audit --audit-level=moderate

# Build
npm run build
```

## Advanced Configuration

### Adding New Checks

To add a new check to the pre-commit hook:

1. Edit `.husky/pre-commit`
2. Add your check with appropriate messaging
3. Make sure it exits with non-zero on failure

Example:
```bash
echo -e "${YELLOW}🔍 Running custom check...${NC}"
./scripts/custom-check.sh
print_status "Custom check completed"
```

### Customizing Security Audit Level

Change the audit level in `.husky/pre-commit`:
```bash
npm audit --audit-level=high  # Only fail on high/critical
npm audit --audit-level=critical  # Only fail on critical
```

### Excluding Paths from Type Check

Modify the type check in `.husky/pre-commit`:
```bash
npx tsc --noEmit --skipLibCheck
```

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Documentation](https://eslint.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vitest Documentation](https://vitest.dev/)

## Support

If you encounter issues with the pre-commit hooks:

1. Check the error message carefully
2. Review the troubleshooting section above
3. Run checks manually to isolate the issue
4. Check the GitHub issues or create a new issue

---

**Note**: These hooks are designed to improve code quality. If you find them too restrictive, you can modify the configuration in `.husky/pre-commit` or bypass them with `--no-verify` (though this is not recommended for regular development).
