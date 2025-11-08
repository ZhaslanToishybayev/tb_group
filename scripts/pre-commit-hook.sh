#!/bin/bash
# 🔗 Pre-commit Hook for TB Group Base Stack
# This script runs before each commit to ensure code quality and security

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Running pre-commit checks...${NC}"
echo ""

# Check if we should skip hooks
if [ -f ".git/hooks/pre-commit.skip" ]; then
  echo -e "${YELLOW}⚠ Pre-commit checks skipped (file exists)${NC}"
  exit 0
fi

# 1. Run linting
echo -e "${YELLOW}📏 Running ESLint...${NC}"
if ! pnpm lint 2>&1 | tee /tmp/lint-output.log; then
  echo -e "${RED}✗ Linting failed. Fix errors before committing.${NC}"
  echo "See /tmp/lint-output.log for details"
  exit 1
fi
echo -e "${GREEN}✓ Linting passed${NC}"
echo ""

# 2. Type checking
echo -e "${YELLOW}🔍 Running TypeScript type check...${NC}"
if ! pnpm typecheck 2>&1 | tee /tmp/typecheck-output.log; then
  echo -e "${RED}✗ Type checking failed. Fix type errors before committing.${NC}"
  echo "See /tmp/typecheck-output.log for details"
  exit 1
fi
echo -e "${GREEN}✓ Type checking passed${NC}"
echo ""

# 3. Run unit tests
echo -e "${YELLOW}🧪 Running unit tests...${NC}"
if ! pnpm test:unit 2>&1 | tee /tmp/test-output.log; then
  echo -e "${RED}✗ Unit tests failed. Fix failing tests before committing.${NC}"
  echo "See /tmp/test-output.log for details"
  exit 1
fi
echo -e "${GREEN}✓ All tests passed${NC}"
echo ""

# 4. Run security audit
echo -e "${YELLOW}🔒 Running security audit...${NC}"
if ! ./scripts/security-audit.sh --verbose 2>&1 | tee /tmp/security-output.log; then
  echo -e "${RED}✗ Security audit failed. Address security issues before committing.${NC}"
  echo "See /tmp/security-output.log for details"
  exit 1
fi
echo -e "${GREEN}✓ Security audit passed${NC}"
echo ""

# 5. Check for debug statements
echo -e "${YELLOW}🔍 Checking for debug statements (console.log, debugger)...${NC}"
if grep -r "console\.log\|debugger" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  apps/ > /tmp/debug-statements.log 2>/dev/null; then

  echo -e "${RED}✗ Found debug statements in code:${NC}"
  cat /tmp/debug-statements.log | head -10
  echo ""
  echo "Remove debug statements before committing."
  exit 1
fi
echo -e "${GREEN}✓ No debug statements found${NC}"
echo ""

# 6. Check for TODO/FIXME comments
echo -e "${YELLOW}📝 Checking for TODO/FIXME comments...${NC}"
TODO_COUNT=$(grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  apps/ | wc -l || echo "0")

if [ "$TODO_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Found $TODO_COUNT TODO/FIXME comments${NC}"
  echo "Consider addressing these before committing (not blocking)"

  if [ "$VERBOSE" = true ]; then
    grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
      --exclude-dir=node_modules \
      --exclude-dir=.git \
      apps/ | head -10
  fi
fi
echo ""

# 7. Check commit message format (if enabled)
if [ -f ".gitmessage" ] || git config commit.template >/dev/null 2>&1; then
  echo -e "${YELLOW}📄 Commit message template detected${NC}"
  echo "Use a descriptive commit message following conventional commits format"
  echo "  feat: add new feature"
  echo "  fix: bug fix"
  echo "  docs: documentation changes"
  echo ""
fi

# 8. Generate Task Master task files
echo -e "${YELLOW}📋 Updating Task Master task files...${NC}"
if command -v task-master >/dev/null 2>&1; then
  task-master generate 2>/dev/null || echo -e "${YELLOW}⚠ Task Master generate failed (non-blocking)${NC}"
else
  echo -e "${YELLOW}⚠ Task Master not found (skipping)${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}✅ All pre-commit checks passed!${NC}"
echo ""
echo "Files staged for commit:"
git diff --cached --stat 2>/dev/null || echo "  (no staged files)"
echo ""

exit 0
