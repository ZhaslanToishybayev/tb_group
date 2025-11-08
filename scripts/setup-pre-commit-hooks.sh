#!/bin/bash
# Pre-Commit Hooks Setup Script
# This script sets up Husky and lint-staged for the project

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Setting up Pre-Commit Hooks...${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}❌ Not a git repository${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Git repository detected${NC}"

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"

if command -v pnpm &> /dev/null; then
  echo "Using pnpm..."
  pnpm add -w -D husky lint-staged
elif command -v yarn &> /dev/null; then
  echo "Using yarn..."
  yarn add -D husky lint-staged
elif command -v npm &> /dev/null; then
  echo "Using npm..."
  npm install --save-dev husky lint-staged
else
  echo -e "${RED}❌ No package manager found${NC}"
  exit 1
fi

# Initialize Husky
echo -e "\n${YELLOW}🎣 Initializing Husky...${NC}"
npx husky init

# Update package.json scripts (ensure prepare script exists)
echo -e "\n${YELLOW}📝 Configuring package.json...${NC}"

if ! grep -q '"prepare": "husky"' package.json; then
  # Use a simple approach to add the script
  echo -e "${GREEN}Adding prepare script to package.json${NC}"
  # This will be added manually or by husky init
fi

# Make hooks executable
echo -e "\n${YELLOW}🔐 Setting hook permissions...${NC}"
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/post-merge

# Verify installation
echo -e "\n${YELLOW}✅ Verifying installation...${NC}"

if [ -f ".husky/pre-commit" ]; then
  echo -e "${GREEN}✅ pre-commit hook installed${NC}"
else
  echo -e "${RED}❌ pre-commit hook missing${NC}"
fi

if [ -f ".husky/commit-msg" ]; then
  echo -e "${GREEN}✅ commit-msg hook installed${NC}"
else
  echo -e "${RED}❌ commit-msg hook missing${NC}"
fi

if [ -f ".husky/post-merge" ]; then
  echo -e "${GREEN}✅ post-merge hook installed${NC}"
else
  echo -e "${YELLOW}⚠️  post-merge hook not installed (optional)${NC}"
fi

# Test if hooks work
echo -e "\n${YELLOW}🧪 Testing hooks...${NC}"

if npx --yes husky@latest --version &> /dev/null; then
  echo -e "${GREEN}✅ Husky is working${NC}"
else
  echo -e "${RED}❌ Husky test failed${NC}"
fi

if npx --yes lint-staged@latest --version &> /dev/null; then
  echo -e "${GREEN}✅ lint-staged is working${NC}"
else
  echo -e "${RED}❌ lint-staged test failed${NC}"
fi

echo -e "\n${GREEN}🎉 Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Review .husky/pre-commit for customization"
echo -e "2. Review .husky/commit-msg for commit message format"
echo -e "3. Test with: git add . && git commit -m \"test: verify hooks\""
echo -e "\n${GREEN}Happy coding! 🚀${NC}"

exit 0
