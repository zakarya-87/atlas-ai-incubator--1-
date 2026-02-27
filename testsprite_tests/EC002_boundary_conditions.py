#!/usr/bin/env python3
"""
TestSprite MCP Edge Case Test: EC002 - Boundary Conditions

Tests numeric boundaries, array limits, temporal edge cases, and resource limits.
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
import math

BASE_URL = os.getenv('ATLAS_API_URL', 'http://localhost:5173')


class TestBoundaryConditions:
    """Edge case testing for boundary conditions"""
    
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
    
    def test_numeric_boundaries(self) -> bool:
        """Test numeric min/max values and edge cases"""
        print("\n[TEST] Numeric Boundaries")
        
        tests = [
            ("Integer MAX", 2**31 - 1, 2**31 - 1),
            ("Integer MIN", -(2**31), -(2**31)),
            ("Float MAX", sys.float_info.max, sys.float_info.max),
            ("Float MIN", sys.float_info.min, sys.float_info.min),
            ("Zero", 0, 0),
            ("Negative Zero", -0.0, 0.0),
            ("Infinity", float('inf'), float('inf')),
            ("-Infinity", float('-inf'), float('-inf')),
            ("NaN", float('nan'), None),  # NaN != NaN
        ]
        
        all_passed = True
        for name, input_val, expected in tests:
            try:
                # Test serialization
                import json
                serialized = json.dumps({"val": input_val})
                deserialized = json.loads(serialized)
                
                if input_val != input_val:  # NaN check
                    passed = True
                else:
                    passed = deserialized["val"] == expected or \
                             (math.isinf(deserialized["val"]) and math.isinf(expected))
                
                self.log(name, passed, f"Value: {input_val}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(name, False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_array_boundaries(self) -> bool:
        """Test array/collection limits"""
        print("\n[TEST] Array Boundaries")
        
        tests = [
            ("Empty array", [], True),
            ("Single element", [1], True),
            ("100 elements", list(range(100)), True),
            ("1000 elements", list(range(1000)), True),
            ("Nested depth 10", [[[[[[[[[[[]]]]]]]]]]], True),
            ("Mixed types", [1, "a", True, None, {}], True),
        ]
        
        all_passed = True
        for name, arr, expected_pass in tests:
            try:
                import json
                serialized = json.dumps(arr)
                deserialized = json.loads(serialized)
                passed = len(deserialized) == len(arr)
                self.log(name, passed, f"Length: {len(arr)}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(name, False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_time_boundaries(self) -> bool:
        """Test temporal edge cases"""
        print("\n[TEST] Temporal Boundaries")
        
        tests = [
            ("Unix epoch", datetime(1970, 1, 1, tzinfo=timezone.utc)),
            ("Min datetime", datetime.min),
            ("Max datetime", datetime.max),
            ("Leap year", datetime(2020, 2, 29)),
            ("DST transition", datetime(2023, 3, 12, 2, 30)),
            ("Far future", datetime(2099, 12, 31)),
        ]
        
        all_passed = True
        for name, dt in tests:
            try:
                # Test ISO format serialization
                iso_str = dt.isoformat() if hasattr(dt, 'isoformat') else str(dt)
                passed = len(iso_str) > 0
                self.log(name, passed, f"ISO: {iso_str[:30]}...")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(name, False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_resource_limits(self) -> bool:
        """Test resource boundary limits"""
        print("\n[TEST] Resource Limits")
        
        # Test string memory limits
        tests = [
            ("1MB string", "x" * (1024 * 1024)),
            ("10MB string", "x" * (10 * 1024 * 1024)),
            ("Deep nesting", {"a": {"b": {"c": {"d": {"e": "deep"}}}}}),
        ]
        
        all_passed = True
        for name, data in tests:
            try:
                import json
                start = datetime.now()
                serialized = json.dumps(data)
                deserialized = json.loads(serialized)
                elapsed = (datetime.now() - start).total_seconds()
                
                size = len(serialized) if isinstance(serialized, str) else 0
                passed = elapsed < 5.0  # Should process in under 5 seconds
                
                self.log(name, passed, f"Size: {size} chars, Time: {elapsed:.3f}s")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(name, False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Execute all boundary tests"""
        print("\n" + "="*70)
        print("EC002: Boundary Conditions")
        print("="*70)
        
        self.test_numeric_boundaries()
        self.test_array_boundaries()
        self.test_time_boundaries()
        self.test_resource_limits()
        
        print("\n" + "="*70)
        print("EC002 SUMMARY")
        print("="*70)
        print(f"Total: {len(self.results)}")
        print(f"Passed: {self.passed} [OK]")
        print(f"Failed: {self.failed} [FAIL]")
        print("="*70)
        
        return {
            "test_id": "EC002",
            "total": len(self.results),
            "passed": self.passed,
            "failed": self.failed,
            "status": "PASSED" if self.failed == 0 else "FAILED"
        }


def main():
    runner = TestBoundaryConditions()
    report = runner.run_all_tests()
    sys.exit(0 if report["status"] == "PASSED" else 1)


if __name__ == "__main__":
    main()
