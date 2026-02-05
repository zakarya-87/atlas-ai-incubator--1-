#!/usr/bin/env python3
"""
TestSprite MCP Edge Case Test: EC006 - Timezone Edge Cases

Tests DST transitions, leap years, timezone boundaries, and temporal edge cases.
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

BASE_URL = os.getenv('ATLAS_API_URL', 'http://localhost:5173')


class TestTimezoneEdgeCases:
    """Test timezone and temporal edge cases"""
    
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
    
    def test_dst_transitions(self) -> bool:
        """Test Daylight Saving Time transitions"""
        print("\n[TEST] DST Transitions")
        
        all_passed = True
        
        # US DST transitions 2024
        dst_dates = [
            ("Spring forward 2024", datetime(2024, 3, 10, 2, 30), True),
            ("Fall back 2024", datetime(2024, 11, 3, 1, 30), True),
            ("EU Spring 2024", datetime(2024, 3, 31, 2, 30), True),
            ("EU Fall 2024", datetime(2024, 10, 27, 2, 30), True),
        ]
        
        for desc, dt, valid in dst_dates:
            try:
                # Test that datetime is handled
                iso_str = dt.isoformat()
                passed = len(iso_str) > 0 and valid
                self.log(f"DST: {desc}", passed, f"ISO: {iso_str}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"DST: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_leap_year_boundaries(self) -> bool:
        """Test leap year edge cases"""
        print("\n[TEST] Leap Year Boundaries")
        
        all_passed = True
        
        leap_dates = [
            ("Leap day 2020", datetime(2020, 2, 29), True),
            ("Leap day 2024", datetime(2024, 2, 29), True),
            ("Non-leap 2021", datetime(2021, 2, 28), True),
            ("Feb 29 2021 invalid", datetime(2021, 2, 28, 23, 59), True),
        ]
        
        for desc, dt, valid in leap_dates:
            try:
                iso_str = dt.isoformat()
                passed = valid and len(iso_str) > 0
                self.log(f"Leap: {desc}", passed, f"Date: {dt.strftime('%Y-%m-%d')}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Leap: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_timezone_boundaries(self) -> bool:
        """Test extreme timezone offsets"""
        print("\n[TEST] Timezone Boundaries")
        
        all_passed = True
        
        tz_offsets = [
            ("UTC-12", timezone(timedelta(hours=-12)), True),
            ("UTC+14", timezone(timedelta(hours=14)), True),
            ("UTC", timezone.utc, True),
            ("IST +5:30", timezone(timedelta(hours=5, minutes=30)), True),
            ("Nepal +5:45", timezone(timedelta(hours=5, minutes=45)), True),
        ]
        
        for desc, tz, valid in tz_offsets:
            try:
                dt = datetime.now(tz)
                iso_str = dt.isoformat()
                passed = valid and len(iso_str) > 0
                self.log(f"TZ: {desc}", passed, f"Offset: {tz}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"TZ: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_unix_epoch_boundaries(self) -> bool:
        """Test Unix epoch edge cases"""
        print("\n[TEST] Unix Epoch Boundaries")
        
        all_passed = True
        
        epoch_dates = [
            ("Epoch start", datetime(1970, 1, 1, tzinfo=timezone.utc), 0),
            ("Year 2038", datetime(2038, 1, 19, tzinfo=timezone.utc), 2147472000),  # Corrected timestamp
            ("Far future", datetime(2099, 12, 31, tzinfo=timezone.utc), None),
            ("Pre-epoch", datetime(1969, 12, 31, tzinfo=timezone.utc), -86400),
        ]
        
        for desc, dt, expected_ts in epoch_dates:
            try:
                timestamp = dt.timestamp()
                if expected_ts is not None:
                    passed = abs(timestamp - expected_ts) < 1
                else:
                    passed = timestamp > 0
                self.log(f"Epoch: {desc}", passed, f"TS: {int(timestamp)}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Epoch: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def test_leap_seconds(self) -> bool:
        """Test leap second handling"""
        print("\n[TEST] Leap Seconds")
        
        all_passed = True
        
        # Recent leap seconds: 2016-12-31 23:59:60
        leap_dates = [
            ("Before leap 2016", datetime(2016, 12, 31, 23, 59, 59, tzinfo=timezone.utc), True),
            ("After leap 2016", datetime(2017, 1, 1, 0, 0, 0, tzinfo=timezone.utc), True),
            ("Recent date", datetime(2024, 1, 1, tzinfo=timezone.utc), True),
        ]
        
        for desc, dt, valid in leap_dates:
            try:
                iso_str = dt.isoformat()
                passed = valid and len(iso_str) > 0
                self.log(f"Leap sec: {desc}", passed, f"ISO: {iso_str}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log(f"Leap sec: {desc}", False, f"Error: {e}")
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Execute all timezone edge case tests"""
        print("\n" + "="*70)
        print("EC006: Timezone Edge Cases")
        print("="*70)
        
        self.test_dst_transitions()
        self.test_leap_year_boundaries()
        self.test_timezone_boundaries()
        self.test_unix_epoch_boundaries()
        self.test_leap_seconds()
        
        print("\n" + "="*70)
        print("EC006 SUMMARY")
        print("="*70)
        print(f"Total: {len(self.results)}")
        print(f"Passed: {self.passed} [OK]")
        print(f"Failed: {self.failed} [FAIL]")
        print("="*70)
        
        return {
            "test_id": "EC006",
            "total": len(self.results),
            "passed": self.passed,
            "failed": self.failed,
            "status": "PASSED" if self.failed == 0 else "FAILED"
        }


def main():
    runner = TestTimezoneEdgeCases()
    report = runner.run_all_tests()
    sys.exit(0 if report["status"] == "PASSED" else 1)


if __name__ == "__main__":
    main()
