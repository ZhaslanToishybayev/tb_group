#!/bin/bash
# Validation Test Script
# Tests server-side validation in the admin API

BASE_URL="http://localhost:3000"

echo "🧪 Testing Server-side Validation"
echo "================================="
echo ""

echo "1. Testing with VALID data (should succeed):"
echo "   Creating incident with all required fields"
curl -s -X POST "$BASE_URL/admin/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Performance Issue",
    "description": "Increased response times on main endpoints affecting user experience",
    "severity": "high",
    "status": "investigating"
  }' | jq '.success'

echo ""
echo "2. Testing with INVALID data (should fail with validation errors):"
echo "   Creating incident with empty title and invalid severity"

# Test with empty title
echo ""
echo "   Test A: Empty title"
curl -s -X POST "$BASE_URL/admin/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "description": "Test description",
    "severity": "medium"
  }' | jq '.error'

# Test with invalid severity
echo ""
echo "   Test B: Invalid severity"
curl -s -X POST "$BASE_URL/admin/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Incident",
    "description": "Test description",
    "severity": "invalid-severity"
  }' | jq '.error'

# Test with missing required fields
echo ""
echo "   Test C: Missing required fields"
curl -s -X POST "$BASE_URL/admin/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Incident"
  }' | jq '.error'

echo ""
echo "✅ Validation tests completed!"
echo ""
echo "Server-side validation is working if:"
echo "- Valid data creates incidents successfully (success: true)"
echo "- Invalid data returns validation errors (error.code: 'VALIDATION_ERROR')"
echo "- Error messages include field-specific details"
