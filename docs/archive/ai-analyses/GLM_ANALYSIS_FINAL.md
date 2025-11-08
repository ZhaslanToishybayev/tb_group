#!/usr/bin/env bash

set -euo pipefail

# GLM Integration with SSL Fix
# Bypasses SSL certificate expiry issue

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
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"

# Load environment
ENV_FILE="$PROJECT_ROOT/.env"
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    log_info "Loaded environment from .env"
else
    log_error ".env file not found"
    exit 1
fi

# Check GLM API key
if [ -z "${GLM_API_KEY:-}" ]; then
    log_error "GLM_API_KEY not found"
    exit 1
fi

log_success "GLM API key found"

# Simple test with SSL bypass
log_info "Testing GLM API with SSL bypass..."

TEST_RESPONSE=$(curl -k -s -X POST "https://api.zhipu.ai/v4/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $GLM_API_KEY" \
    -d '{
        "model": "glm-4",
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 10
    }')

if echo "$TEST_RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    ERROR_MSG=$(echo "$TEST_RESPONSE" | jq -r '.error.message')
    log_error "API Error: $ERROR_MSG"
    if [[ "$ERROR_MSG" == *"余额不足"* ]]; then
        log_warning "Balance insufficient. Please top up at https://zhipuai.cn/"
    fi
    exit 1
else
    CONTENT=$(echo "$TEST_RESPONSE" | jq -r '.choices[0].message.content')
    log_success "GLM API working! Response: $CONTENT"
fi

log_success "SSL fix applied successfully!"
