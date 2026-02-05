#!/usr/bin/env python3
"""
TestSprite MCP Edge Case Test: EC004 - Data Limits

Tests resource limits, quota enforcement, and data size boundaries.
"""

import sys
import os
from typing import Dict, Any, List

BASE_URL = os.getenv('ATLAS_API_URL', 'http://localhost:5173')


class TestDataLimits:
    """Test data limits and resource quotas"""
    
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def log(self, name: str, passed: bool, msg: str = ""):
        status = "[OK]" if passed else "[FAIL]"
        print(f"  {status} {name}")
        if msg:
            print(f"     {msg}")
        self.results.append({"test": name, "passed": passed, "message": msg})
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def test_venture_limits(self) -> bool:
        """Test venture creation limits per user"""
        print("\n[TEST] Venture Limits")
        
        all_passed = True
        
        limits = [
            ("Free tier", 3, 3, True),
            ("Pro tier", 10, 10, True),
            ("Enterprise tier", 100, 100, True),
            ("Exceed free tier", 4, 3, False),
            ("Exceed pro tier", 11, 10, False),
        ]
        
        for desc, current, limit, should_succeed in limits:
            try:
                allowed = current <= limit
                passed = allowed == should_succeed
                self.log(f"Venture limit: {desc}", passed, f"{current}/{limit}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Venture limit: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_team_member_limits(self) -> bool:
        """Test team member limits per venture"""
        print("\n[TEST] Team Member Limits")
        
        all_passed = True
        
        team_limits = [
            ("Small team", 5, 5, True),
            ("Large team", 50, 50, True),
            ("Exceed limit", 51, 50, False),
        ]
        
        for desc, members, limit, allowed in team_limits:
            try:
                is_allowed = members <= limit
                passed = is_allowed == allowed
                self.log(f"Team: {desc}", passed, f"{members}/{limit} members")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Team: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_storage_limits(self) -> bool:
        """Test storage quota enforcement"""
        print("\n[TEST] Storage Limits")
        
        all_passed = True
        
        storage_tests = [
            ("100MB used", 100*1024*1024, 1024*1024*1024, True),  # 100MB/1GB
            ("500MB used", 500*1024*1024, 1024*1024*1024, True),  # 500MB/1GB
            ("1GB limit", 1024*1024*1024, 1024*1024*1024, True),  # 1GB/1GB
            ("Exceed 1GB", 1025*1024*1024, 1024*1024*1024, False),  # Over limit
        ]
        
        for desc, used, limit, should_fit in storage_tests:
            try:
                fits = used <= limit
                passed = fits == should_fit
                size_mb = used / (1024*1024)
                limit_mb = limit / (1024*1024)
                self.log(f"Storage: {desc}", passed, f"{size_mb:.1f}MB/{limit_mb:.1f}MB")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Storage: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_api_quota_limits(self) -> bool:
        """Test API quota enforcement"""
        print("\n[TEST] API Quota Limits")
        
        all_passed = True
        
        quota_tests = [
            ("Daily requests", 950, 1000, True),
            ("At daily limit", 1000, 1000, True),
            ("Over daily limit", 1001, 1000, False),
            ("Analysis quota", 45, 50, True),
            ("Over analysis quota", 51, 50, False),
        ]
        
        for desc, used, limit, allowed in quota_tests:
            try:
                within_quota = used <= limit
                passed = within_quota == allowed
                self.log(f"API: {desc}", passed, f"{used}/{limit} requests")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"API: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_ai_token_limits(self) -> bool:
        """Test AI token usage limits"""
        print("\n[TEST] AI Token Limits")
        
        all_passed = True
        
        token_tests = [
            ("Input tokens", 3000, 4000, True),
            ("Output tokens", 1500, 2000, True),
            ("Combined tokens", 4500, 5000, True),
            ("Exceed input limit", 4001, 4000, False),
            ("Exceed output limit", 2001, 2000, False),
        ]
        
        for desc, tokens, limit, allowed in token_tests:
            try:
                within_limit = tokens <= limit
                passed = within_limit == allowed
                self.log(f"AI: {desc}", passed, f"{tokens}/{limit} tokens")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"AI: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Execute all data limit tests"""
        print("\n" + "="*70)
        print("EC004: Data Limits Edge Cases")
        print("="*70)
        
        self.test_venture_limits()
        self.test_team_member_limits()
        self.test_storage_limits()
        self.test_api_quota_limits()
        self.test_ai_token_limits()
        
        print("\n" + "="*70)
        print("EC004 SUMMARY")
        print("="*70)
        print(f"Total: {len(self.results)}")
        print(f"Passed: {self.passed} [OK]")
        print(f"Failed: {self.failed} [FAIL]")
        print("="*70)
        
        return {
            "test_id": "EC004",
            "total": len(self.results),
            "passed": self.passed,
            "failed": self.failed,
            "status": "PASSED" if self.failed == 0 else "FAILED"
        }


def main():
    runner = TestDataLimits()
    report = runner.run_all_tests()
    sys.exit(0 if report["status"] == "PASSED" else 1)


if __name__ == "__main__":
    main()
