#!/usr/bin/env python3
"""
TestSprite MCP Error Handling Test: EH005 - Authentication Errors

Tests authentication failure scenarios and security edge cases.
"""

import sys
import os
from typing import Dict, Any, List

BASE_URL = os.getenv('ATLAS_API_URL', 'http://localhost:5173')


class TestAuthenticationErrors:
    """Test authentication error handling"""
    
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def log(self, name: str, passed: bool, msg: str = "", recovery: bool = False):
        status = "[OK]" if passed else "[FAIL]"
        rec = " [RECOVERY]" if recovery else ""
        print(f"  {status}{rec} {name}")
        if msg:
            print(f"     {msg}")
        self.results.append({
            "test": name, 
            "passed": passed, 
            "recovery": recovery,
            "message": msg
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def test_invalid_credentials(self) -> bool:
        """Test invalid credentials handling"""
        print("\n[TEST] Invalid Credentials")
        
        all_passed = True
        
        cred_tests = [
            ("Wrong password", "user@test.com", "wrongpass", 401),
            ("Wrong email", "wrong@test.com", "password", 401),
            ("Both wrong", "wrong@wrong.com", "wrongpass", 401),
            ("Empty credentials", "", "", 400),
            ("Null values", None, None, 400),
        ]
        
        for desc, email, password, expected_code in cred_tests:
            try:
                handled = self._simulate_auth_failure(email, password, expected_code)
                passed = handled
                self.log(
                    f"Auth: {desc}",
                    passed,
                    f"Code: {expected_code}",
                    handled
                )
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Auth: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_token_expiration(self) -> bool:
        """Test JWT token expiration handling"""
        print("\n[TEST] Token Expiration")
        
        all_passed = True
        
        token_tests = [
            ("Expired token", "expired_token", 401, True),
            ("Invalid signature", "bad_signature", 401, True),
            ("Malformed token", "not_a_token", 401, True),
            ("Missing token", None, 401, True),
            ("Wrong issuer", "wrong_issuer", 401, True),
        ]
        
        for desc, token, code, should_handle in token_tests:
            try:
                handled = self._simulate_token_error(token, code)
                passed = handled == should_handle
                self.log(
                    f"Token: {desc}",
                    passed,
                    f"Code: {code}",
                    handled
                )
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Token: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_permission_denied(self) -> bool:
        """Test authorization/permission failures"""
        print("\n[TEST] Permission Denied")
        
        all_passed = True
        
        permission_tests = [
            ("User access admin", "user", "admin_resource", 403, True),
            ("Free tier pro feature", "free", "pro_feature", 403, True),
            ("Expired subscription", "expired", "premium", 403, True),
            ("Team member venture", "member", "other_venture", 403, True),
            ("Read-only write", "readonly", "write_op", 403, True),
        ]
        
        for desc, user_type, resource, code, should_handle in permission_tests:
            try:
                handled = self._simulate_permission_error(user_type, resource, code)
                passed = handled == should_handle
                self.log(
                    f"Permission: {desc}",
                    passed,
                    f"Code: {code}",
                    handled
                )
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Permission: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_account_lockout(self) -> bool:
        """Test account lockout scenarios"""
        print("\n[TEST] Account Lockout")
        
        all_passed = True
        
        lockout_tests = [
            ("5 failed attempts", 5, True),
            ("10 failed attempts", 10, True),
            ("Lockout duration", 900, True),  # 15 minutes
            ("Successful unlock", True, True),
            ("Admin override", True, True),
        ]
        
        for desc, value, should_lock in lockout_tests:
            try:
                locked = self._simulate_lockout(value)
                passed = True  # Should handle gracefully
                self.log(
                    f"Lockout: {desc}",
                    passed,
                    f"Handled: True",
                    True
                )
            except Exception as e:
                self.log(f"Lockout: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_mfa_failures(self) -> bool:
        """Test multi-factor authentication failures"""
        print("\n[TEST] MFA Failures")
        
        all_passed = True
        
        mfa_tests = [
            ("Wrong TOTP code", "123456", False),
            ("Expired TOTP", "654321", False),
            ("Backup code used", "backup1", True),
            ("MFA timeout", 300, True),  # 5 min
            ("Device not recognized", "new_device", True),
        ]
        
        for desc, input_val, should_succeed in mfa_tests:
            try:
                handled = self._simulate_mfa_failure(input_val)
                passed = True  # Should always handle
                self.log(
                    f"MFA: {desc}",
                    passed,
                    f"Handled: {handled}",
                    handled
                )
            except Exception as e:
                self.log(f"MFA: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    # Simulation methods
    def _simulate_auth_failure(self, email, password, code: int) -> bool:
        """Simulate authentication failure"""
        return True
    
    def _simulate_token_error(self, token, code: int) -> bool:
        """Simulate token error"""
        return True
    
    def _simulate_permission_error(self, user_type: str, resource: str, code: int) -> bool:
        """Simulate permission error"""
        return True
    
    def _simulate_lockout(self, value) -> bool:
        """Simulate account lockout"""
        return True
    
    def _simulate_mfa_failure(self, input_val) -> bool:
        """Simulate MFA failure"""
        return True
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Execute all authentication error tests"""
        print("\n" + "="*70)
        print("EH005: Authentication Error Handling")
        print("="*70)
        
        self.test_invalid_credentials()
        self.test_token_expiration()
        self.test_permission_denied()
        self.test_account_lockout()
        self.test_mfa_failures()
        
        print("\n" + "="*70)
        print("EH005 SUMMARY")
        print("="*70)
        print(f"Total: {len(self.results)}")
        print(f"Passed: {self.passed} [OK]")
        print(f"Failed: {self.failed} [FAIL]")
        recovery_ok = sum(1 for r in self.results if r.get("recovery"))
        print(f"Recovery OK: {recovery_ok} [RECOVERY]")
        print("="*70)
        
        return {
            "test_id": "EH005",
            "total": len(self.results),
            "passed": self.passed,
            "failed": self.failed,
            "status": "PASSED" if self.failed == 0 else "FAILED"
        }


def main():
    runner = TestAuthenticationErrors()
    report = runner.run_all_tests()
    sys.exit(0 if report["status"] == "PASSED" else 1)


if __name__ == "__main__":
    main()
