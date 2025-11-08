#!/usr/bin/env bash

set -euo pipefail

# Test GLM API Script
# Tests the GLM API key and connectivity

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Check GLM API key
if [ -z "${GLM_API_KEY:-}" ]; then
    log_error "GLM_API_KEY not found"
    exit 1
fi

log_success "GLM API key found"

# Test API call
echo "Testing GLM API..."

RESPONSE=$(curl -k -s -X POST "https://api.z.ai/api/paas/v4/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $GLM_API_KEY" \
    -d '{
        "model": "glm-4",
        "messages": [
            {
                "role": "user",
                "content": "Hello, this is a test. Please respond with \"API working correctly\"."
            }
        ],
        "temperature": 0.7,
        "max_tokens": 50
    }')

# Check response
if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message')
    log_error "API Error: $ERROR_MSG"
    
    if [[ "$ERROR_MSG" == *"余额不足"* ]]; then
        log_warning "GLM API balance insufficient. Please top up your account."
        log_warning "Visit: https://open.bigmodel.cn/ to add credits."
    fi
    exit 1
fi

# Extract content
CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null)

if [ -n "$CONTENT" ] && [ "$CONTENT" != "null" ]; then
    log_success "GLM API working correctly!"
    echo "Response: $CONTENT"
else
    log_error "Unexpected API response"
    echo "Raw response: $RESPONSE"
    exit 1
fi
