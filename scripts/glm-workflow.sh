#!/usr/bin/env bash

set -euo pipefail

# GLM Complete Workflow Script
# Full GLM integration workflow with aliases

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Create function instead of alias for this script
speckit() {
    python3 spec-kit/src/specify_cli "$@"
}

# Test GLM API first
log_info "Testing GLM API status..."
if bash scripts/test-glm-api.sh >/dev/null 2>&1; then
    log_success "GLM API is working!"
else
    log_warning "GLM API quota not available yet."
    log_info "Try again in a few hours when quota resets."
    exit 1
fi

# Menu for actions
case "${1:-help}" in
    "test")
        log_info "Testing GLM API..."
        bash scripts/test-glm-api.sh
        ;;
    "create"|"new")
        FEATURE_NAME="${2:-new-feature}"
        log_info "Creating new feature: $FEATURE_NAME"
        speckit specify "$FEATURE_NAME" --short-name "$(echo "$FEATURE_NAME" | tr ' ' '-' | cut -c1-10)"
        ;;
    "tasks")
        log_info "Generating tasks..."
        speckit plan
        speckit tasks
        ;;
    "analyze"|"glm")
        log_info "Running GLM analysis..."
        bash spec-kit/scripts/bash/glm-simple.sh
        ;;
    "status")
        log_info "Checking GLM API status..."
        bash scripts/test-glm-api.sh
        ;;
    "workflow"|"full")
        FEATURE_NAME="${2:-example-feature}"
        log_info "Complete GLM workflow for: $FEATURE_NAME"
        
        # 1. Create feature
        log_info "1. Creating feature..."
        speckit specify "$FEATURE_NAME" --short-name "$(echo "$FEATURE_NAME" | tr ' ' '-' | cut -c1-10)"
        
        # 2. Generate tasks
        log_info "2. Generating tasks..."
        speckit plan
        speckit tasks
        
        # 3. GLM analysis
        log_info "3. Running GLM analysis..."
        bash spec-kit/scripts/bash/glm-simple.sh
        
        # 4. Show results
        log_success "GLM workflow completed!"
        log_info "Check the generated implementation plan in specs/"
        ;;
    "help"|*)
        echo "🤖 GLM Workflow Commands:"
        echo ""
        echo "  test                    - Test GLM API status"
        echo "  create <feature-name>    - Create new feature"
        echo "  tasks                   - Generate tasks for current feature"
        echo "  analyze                 - Run GLM analysis"
        echo "  status                  - Check GLM API status"
        echo "  workflow <feature-name> - Complete GLM workflow"
        echo "  help                    - Show this help"
        echo ""
        echo "Examples:"
        echo "  bash scripts/glm-workflow.sh create 'User Authentication'"
        echo "  bash scripts/glm-workflow.sh workflow 'Add testimonials'"
        echo "  bash scripts/glm-workflow.sh analyze"
        ;;
esac
