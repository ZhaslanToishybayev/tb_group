#!/bin/bash
# TB Group Base Stack - Security Audit Script
set -e
echo "🔒 Starting Security Audit..."
echo "================================"
ISSUES_FOUND=0
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ISSUES_FOUND=1
    fi
}
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}
echo ""
echo "1. Checking for exposed API keys..."
if grep -r "sk-" --include="*.js" --include="*.ts" --include="*.json" --exclude-dir=node_modules . 2>/dev/null | grep -v "example\|placeholder\|your_" | head -5; then
    print_result 1 "API keys found in code"
else
    print_result 0 "No exposed API keys found"
fi
echo ""
echo "2. Checking .env file is gitignored..."
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    print_result 0 ".env is properly gitignored"
else
    print_result 1 ".env is NOT gitignored"
fi
echo ""
echo "3. Checking for lock files..."
if [ -f "pnpm-lock.yaml" ]; then
    print_result 0 "pnpm-lock.yaml exists"
elif [ -f "package-lock.json" ]; then
    print_result 0 "package-lock.json exists"
else
    print_result 1 "No lock file found"
fi
echo ""
echo "4. Checking for known vulnerabilities..."
if command -v npm &> /dev/null; then
    if npm audit --audit-level moderate --json 2>/dev/null | grep -q "vulnerabilities"; then
        print_warning "Vulnerabilities found - run 'npm audit'"
        npm audit 2>/dev/null || true
    else
        print_result 0 "No known vulnerabilities"
    fi
else
    print_warning "npm not available"
fi
echo ""
echo "5. Checking for hardcoded credentials..."
if grep -r -E "(password|secret|key)\s*=\s*['\"][^'\"]+['\"]" --include="*.js" --include="*.ts" --exclude-dir=node_modules . 2>/dev/null | grep -v "example\|placeholder\|change-me" | head -5; then
    print_result 1 "Potential hardcoded credentials"
else
    print_result 0 "No hardcoded credentials"
fi
echo ""
echo "6. Checking JWT secret configuration..."
if grep -r "JWT.*SECRET" --include="*.js" --include="*.ts" --include=".env*" . 2>/dev/null | grep -q "change-me\|placeholder"; then
    print_warning "Default JWT secrets found"
else
    print_result 0 "Custom JWT secrets configured"
fi
echo ""
echo "================================"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ Security audit passed${NC}"
    exit 0
else
    echo -e "${RED}✗ Issues found${NC}"
    exit 1
fi
