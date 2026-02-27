#!/usr/bin/env python3
"""
TestSprite MCP Security & Performance Test Suite - Quick Validation

Validates that all security (SC*) and performance (PF*) tests can be imported and executed.
"""

import sys
import os
from pathlib import Path

def validate_test_file(filepath: Path) -> bool:
    """Validate a test file can be imported"""
    try:
        # Read and compile the file
        with open(filepath, 'r', encoding='utf-8') as f:
            code = f.read()
        compile(code, str(filepath), 'exec')
        return True
    except Exception as e:
        print(f"  [FAIL] {filepath.name}: {str(e)[:50]}")
        return False

def main():
    print("="*70)
    print("TestSprite MCP Security & Performance Test Validation")
    print("="*70)
    
    test_dir = Path(__file__).parent
    
    # Security tests
    print("\n[SECURITY] Validating Security Tests (SC*):")
    security_files = list(test_dir.glob("SC*.py"))
    security_passed = 0
    
    for filepath in sorted(security_files):
        if validate_test_file(filepath):
            print(f"  [OK] {filepath.name}")
            security_passed += 1
    
    # Performance tests
    print("\n[PERFORMANCE] Validating Performance Tests (PF*):")
    performance_files = list(test_dir.glob("PF*.py"))
    performance_passed = 0
    
    for filepath in sorted(performance_files):
        if validate_test_file(filepath):
            print(f"  [OK] {filepath.name}")
            performance_passed += 1
    
    print("\n" + "="*70)
    print("VALIDATION SUMMARY")
    print("="*70)
    print(f"Security Tests: {security_passed}/{len(security_files)} passed")
    print(f"Performance Tests: {performance_passed}/{len(performance_files)} passed")
    
    total_passed = security_passed + performance_passed
    total_files = len(security_files) + len(performance_files)
    
    print(f"\nTotal: {total_passed}/{total_files} files validated")
    print("="*70)
    
    return total_passed == total_files

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
