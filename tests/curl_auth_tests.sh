#!/bin/bash

# BZION Authentication cURL Test Script
# Usage: ./tests/curl_auth_tests.sh

BASE_URL="${BZION_BASE_URL:-http://localhost:9003}"
TEST_EMAIL="qa+$(date +%s)@bzion.com"

echo "🚀 BZION Auth cURL Tests"
echo "========================"
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo

# Test 1: Admin login page
echo "🔍 Test 1: Admin login page"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/admin/login"
echo

# Test 2: Admin dashboard (should redirect)
echo "🔍 Test 2: Admin dashboard protection"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/admin"
echo

# Test 3: Admin API protection
echo "🔍 Test 3: Admin API protection"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/api/admin/dashboard-data"
echo

# Test 4: SQL injection attempt
echo "🔍 Test 4: SQL injection protection"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"'\'' OR '\''1'\''='\''1","password":"test"}' \
  -w "Status: %{http_code}\n" -o /dev/null
echo

# Test 5: User registration (if endpoint exists)
echo "🔍 Test 5: User registration"
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\",\"firstName\":\"QA\"}" \
  -w "Status: %{http_code}\n" -o /dev/null
echo

echo "✅ cURL tests complete"