#!/bin/bash
# TestSprite MCP Full Test Suite Execution
# ATLAS AI Incubator

echo "============================================"
echo "TestSprite MCP Full Test Suite Execution"
echo "ATLAS AI Incubator"
echo "============================================"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "[INFO] Starting full test suite execution..."
echo ""

# Define test categories
CATEGORIES="core edge_cases error_handling security performance regression"

# Run tests for each category
for category in $CATEGORIES; do
    echo "============================================"
    echo "Running: $category tests"
    echo "============================================"
    
    python3 testsprite_runner.py --category $category --report-format json
    
    if [ $? -eq 0 ]; then
        echo "[PASS] $category tests completed successfully"
        ((PASSED_TESTS++))
    else
        echo "[FAIL] $category tests failed"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    echo ""
done

echo "============================================"
echo "Test Suite Summary"
echo "============================================"
echo "Total Categories: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "[SUCCESS] All test suites passed! ✅"
    exit 0
else
    echo "[FAILURE] $FAILED_TESTS test suite(s) failed ❌"
    exit 1
fi
