#!/usr/bin/env bash

set -euo pipefail

# Test Alternative GLM Endpoints

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Load environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

GLM_KEY="b96dba2582c349a5a2e44f90f3bca2c5.k5azyANSMElthCGC"

log_info "Testing alternative GLM endpoints..."

# Test 1: Alternative endpoint with glm-4 (lighter model)
log_info "Test 1: api.zhipu.ai with glm-4"
RESPONSE1=$(curl -s -X POST "https://api.zhipu.ai/v4/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $GLM_KEY" \
    -d '{"model": "glm-4", "messages": [{"role": "user", "content": "hello"}], "max_tokens": 10}')

if echo "$RESPONSE1" | jq -e '.error' >/dev/null 2>&1; then
    ERROR_MSG1=$(echo "$RESPONSE1" | jq -r '.error.message')
    log_error "Endpoint 1 failed: $ERROR_MSG1"
else
    CONTENT1=$(echo "$RESPONSE1" | jq -r '.choices[0].message.content')
    log_success "Endpoint 1 works: $CONTENT1"
fi

# Test 2: Bigmodel endpoint with glm-4
log_info "Test 2: open.bigmodel.cn with glm-4"
RESPONSE2=$(curl -s -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $GLM_KEY" \
    -d '{"model": "glm-4", "messages": [{"role": "user", "content": "hello"}], "max_tokens": 10}')

if echo "$RESPONSE2" | jq -e '.error' >/dev/null 2>&1; then
    ERROR_MSG2=$(echo "$RESPONSE2" | jq -r '.error.message')
    log_error "Endpoint 2 failed: $ERROR_MSG2"
else
    CONTENT2=$(echo "$RESPONSE2" | jq -r '.choices[0].message.content')
    log_success "Endpoint 2 works: $CONTENT2"
fi

# Test 3: Check available models
log_info "Test 3: Checking available models"
MODELS_RESPONSE=$(curl -s -X GET "https://api.zhipu.ai/v4/models" \
    -H "Authorization: Bearer $GLM_KEY")

if echo "$MODELS_RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    ERROR_MSG3=$(echo "$MODELS_RESPONSE" | jq -r '.error.message')
    log_error "Models check failed: $ERROR_MSG3"
else
    log_success "Models available:"
    echo "$MODELS_RESPONSE" | jq -r '.data[].id' | head -5
fi

# Summary
log_info "=== SUMMARY ==="
log_info "GLM API Key: ${GLM_KEY:0:20}..."
log_warning "If all tests show '余额不足', balance is the issue"
log_warning "Visit: https://open.bigmodel.cn/ or https://zhipuai.cn/ to top up"
