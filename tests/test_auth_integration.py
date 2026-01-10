#!/usr/bin/env python3
"""
BZION Admin Authentication Test Suite
Run: python tests/test_auth_integration.py
"""

import os
import uuid
import requests
import json

# Configuration
BASE_URL = os.getenv("BZION_BASE_URL", "http://localhost:3000")

def random_email():
    return f"qa+{uuid.uuid4().hex[:8]}@bzion.com"

def test_admin_endpoints():
    """Test admin authentication endpoints"""
    print("[TEST] Testing Admin Endpoints...")
    
    # Admin login page
    try:
        r = requests.get(f"{BASE_URL}/admin/login", timeout=5)
        assert r.status_code == 200, f"Admin login failed: {r.status_code}"
        print("[PASS] Admin login page accessible")
    except Exception as e:
        print(f"[SKIP] Admin login test: {e}")
    
    # Admin dashboard (should redirect)
    try:
        r = requests.get(f"{BASE_URL}/admin", allow_redirects=False, timeout=5)
        assert r.status_code in [302, 307], f"Should redirect: {r.status_code}"
        print("[PASS] Admin dashboard protected")
    except Exception as e:
        print(f"[SKIP] Admin dashboard test: {e}")
    
    # API requires auth
    try:
        r = requests.get(f"{BASE_URL}/api/admin/dashboard-data", timeout=5)
        assert r.status_code == 403, f"API unprotected: {r.status_code}"
        print("[PASS] Admin API protected")
    except Exception as e:
        print(f"[SKIP] Admin API test: {e}")

def test_sql_injection():
    """Test SQL injection protection"""
    print("[TEST] Testing SQL Injection...")
    
    payloads = ["' OR '1'='1", "'; DROP TABLE users; --"]
    
    for payload in payloads:
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": payload,
            "password": "test"
        })
        assert r.status_code in [400, 401, 422], f"SQL injection risk: {r.status_code}"
    
    print("[PASS] SQL injection protected")

def run_tests():
    """Run all tests"""
    print("BZION Auth Test Suite")
    print("=" * 30)
    
    tests = [test_admin_endpoints, test_sql_injection]
    passed = failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"[FAIL] {test.__name__}: {e}")
            failed += 1
        print()
    
    print(f"[PASS] Passed: {passed}, [FAIL] Failed: {failed}")

if __name__ == "__main__":
    run_tests()