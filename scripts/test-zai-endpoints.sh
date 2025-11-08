#!/usr/bin/env bash

set -euo pipefail

# Test Z.AI Endpoints Script
# Tests various Z.AI API endpoints with your key

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

# Your GLM API key
GLM_KEY="b96dba2582c349a5a2e44f90f3bca2c5.k5azyANSMElthCGC"

# Test endpoints to try
ENDPOINTS=(
    "https://api.z.ai/api/paas/v4/chat/completions"
    "https://api.z.ai/v4/chat/completions"
    "https://chat.z.ai/api/v4/chat/completions"
    "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    "https://api.zhipu.ai/v4/chat/completions"
)

# Models to try
MODELS=(
    "glm-4"
    "glm-4.6"
    "glm-4.5"
    "glm-4-flash"
)

log_info "Testing Z.AI endpoints with your API key..."

for endpoint in "${ENDPOINTS[@]}"; do
    log_info "Testing endpoint: $endpoint"
    
    for model in "${MODELS[@]}"; do
        log_info "  Testing model: $model"
        
        RESPONSE=$(curl -k -s -X POST "$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $GLM_KEY" \
            -d "{
                \"model\": \"$model\",
                \"messages\": [{\"role\": \"user\", \"content\": \"test\"}],
                \"max_tokens\": 5
            }" 2>/dev/null || echo '{"error": {"message": "Connection failed"}}')
        
        # Check for errors
        if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
            ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null || echo "Unknown error")
            if [[ "$ERROR_MSG" == *"余额不足"* ]]; then
                log_warning "    Model works! Balance insufficient: $ERROR_MSG"
                echo "    ✅ WORKING: $endpoint + $model (needs top-up)"
                exit 0
            else
                log_error "    Error: $ERROR_MSG"
            fi
        else
            CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null || echo "No content")
            if [ "$CONTENT" != "null" ] && [ -n "$CONTENT" ]; then
                log_success "    ✅ SUCCESS! Response: $CONTENT"
                echo "    🎯 WORKING COMBINATION: $endpoint + $model"
                exit 0
            else
                log_warning "    Unexpected response format"
            fi
        fi
    done
done

log_info "=== SUMMARY ==="
log_warning "No working combination found yet."
log_info "Possible issues:"
log_info "1. Balance insufficient (most likely)"
log_info "2. Incorrect API endpoint"
log_info "3. Model not available"
log_info "4. Network/firewall issues"

log_info ""
log_info "Please check:"
log_info "- Your balance at https://z.ai/"
log_info "- API documentation at https://z.ai/model-api"
log_info "- Correct API endpoint"
