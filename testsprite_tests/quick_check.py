#!/usr/bin/env python3
"""Quick test runner to check all categories"""

import subprocess
import sys

categories = ["core", "edge_cases", "error_handling", "performance", "regression", "security"]

print("="*70)
print("TEST CATEGORY STATUS CHECK")
print("="*70)

results = {}

for category in categories:
    print(f"\n[TESTING] {category.upper()}")
    result = subprocess.run(
        [sys.executable, "testsprite_runner.py", "--category", category, "--report-format", "json"],
        capture_output=True,
        text=True,
        cwd="C:\\Users\\zboud\\ATLAS AI Incubator\\testsprite_tests"
    )
    
    # Parse results from output
    passed = result.stdout.count("[PASS]")
    failed = result.stdout.count("[FAIL]")
    total = passed + failed
    
    results[category] = {"passed": passed, "failed": failed, "total": total}
    status = "[OK]" if failed == 0 else "[FAIL]"
    print(f"  {status} {category}: {passed}/{total} passed")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)

total_passed = sum(r["passed"] for r in results.values())
total_tests = sum(r["total"] for r in results.values())

for cat, data in results.items():
    pct = (data["passed"] / max(data["total"], 1)) * 100
    print(f"{cat:20s}: {data['passed']:2d}/{data['total']:2d} ({pct:5.1f}%)")

print("="*70)
print(f"TOTAL: {total_passed}/{total_tests} tests passed ({total_passed/max(total_tests,1)*100:.1f}%)")
print("="*70)
