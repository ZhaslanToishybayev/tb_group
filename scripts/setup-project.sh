#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

log_info "Setting up TB Group Base Stack..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    log_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+"
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    log_info "Installing pnpm..."
    npm install -g pnpm@8.0.0
fi

# Install dependencies
log_info "Installing project dependencies..."
cd "$REPO_ROOT"
pnpm install

# Setup environment
if [ ! -f .env ]; then
    log_info "Creating .env file from template..."
    cp .env.example .env
    log_warning "Please edit .env file with your configuration"
fi

# Setup database
log_info "Setting up database..."
cd "$REPO_ROOT/apps/api"
if [ -f prisma/schema.prisma ]; then
    pnpm prisma generate
    log_info "Prisma client generated"
fi

# Build project
log_info "Building project..."
cd "$REPO_ROOT"
pnpm build

log_success "Project setup completed successfully!"
log_info "Run 'pnpm dev' to start development servers"
