#!/usr/bin/env python3
"""
TestSprite MCP Test Runner for ATLAS AI Incubator
Executes all TestSprite test cases and generates comprehensive reports
"""

import os
import sys
import subprocess
import json
import time
from datetime import datetime
from pathlib import Path
import traceback

class TestSpriteRunner:
    def __init__(self):
        self.test_results = []
        self.test_files = []
        self.start_time = None
        self.end_time = None

        # Find all Python test files
        self.test_directory = Path(__file__).parent
        self.test_files = list(self.test_directory.glob("TC*.py"))

        # Sort test files by TC number for consistent execution
        self.test_files.sort(key=lambda x: int(x.stem.split('_')[0][2:]))

    def run_single_test(self, test_file):
        """Run a single TestSprite test file"""
        test_name = test_file.stem
        print(f"\n[*] Running {test_name}...")

        start_time = time.time()
        result = {
            'test_id': test_name,
            'file': str(test_file),
            'status': 'unknown',
            'duration': 0,
            'error': None,
            'output': None
        }

        try:
            # Run the Python test file
            process = subprocess.run(
                [sys.executable, str(test_file)],
                capture_output=True,
                text=True,
                timeout=60,  # 60 second timeout per test
                cwd=self.test_directory
            )

            result['duration'] = time.time() - start_time

            if process.returncode == 0:
                result['status'] = 'PASSED'
                result['output'] = process.stdout
                print(f"[PASS] {test_name}: PASSED ({result['duration']:.2f}s)")
            else:
                result['status'] = 'FAILED'
                result['error'] = process.stderr or process.stdout
                print(f"[FAIL] {test_name}: FAILED ({result['duration']:.2f}s)")
                if result['error']:
                    print(f"   Error: {result['error'][:200]}...")

        except subprocess.TimeoutExpired:
            result['status'] = 'TIMEOUT'
            result['duration'] = time.time() - start_time
            result['error'] = "Test timed out after 60 seconds"
            print(f"[TIMEOUT] {test_name}: TIMEOUT ({result['duration']:.2f}s)")

        except Exception as e:
            result['status'] = 'ERROR'
            result['duration'] = time.time() - start_time
            result['error'] = str(e)
            print(f"[ERROR] {test_name}: ERROR - {str(e)}")

        return result

    def run_all_tests(self):
        """Run all TestSprite tests"""
        print("[START] Starting TestSprite MCP Test Suite")
        print("=" * 60)
        print(f"Test Environment: {os.getenv('NODE_ENV', 'development')}")
        print(f"Total Tests Found: {len(self.test_files)}")
        print(f"Test Files: {[f.stem for f in self.test_files]}")
        print("=" * 60)

        self.start_time = time.time()

        for test_file in self.test_files:
            result = self.run_single_test(test_file)
            self.test_results.append(result)

        self.end_time = time.time()

        return self.generate_report()

    def generate_report(self):
        """Generate comprehensive test report"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == 'PASSED'])
        failed_tests = len([r for r in self.test_results if r['status'] == 'FAILED'])
        timeout_tests = len([r for r in self.test_results if r['status'] == 'TIMEOUT'])
        error_tests = len([r for r in self.test_results if r['status'] == 'ERROR'])

        total_duration = self.end_time - self.start_time

        # Calculate success rate
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0

        report = {
            'summary': {
                'test_suite': 'TestSprite MCP',
                'project': 'ATLAS AI Incubator',
                'execution_date': datetime.now().isoformat(),
                'total_tests': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'timeout': timeout_tests,
                'error': error_tests,
                'success_rate': success_rate,
                'total_duration': total_duration,
                'status': 'PASSED' if failed_tests == 0 and timeout_tests == 0 and error_tests == 0 else 'FAILED'
            },
            'test_results': self.test_results,
            'environment': {
                'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
                'platform': sys.platform,
                'working_directory': str(self.test_directory),
                'test_files_found': len(self.test_files)
            }
        }

        return report

    def print_summary(self, report):
        """Print test execution summary"""
        print("\n" + "=" * 60)
        print("TESTSPRITE MCP TEST EXECUTION SUMMARY")
        print("=" * 60)

        summary = report['summary']
        print(f"Execution Date: {summary['execution_date']}")
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed']}")
        print(f"Failed: {summary['failed']}")
        print(f"Timeout: {summary['timeout']}")
        print(f"Error: {summary['error']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Total Duration: {summary['total_duration']:.2f}s")
        print(f"Overall Status: {summary['status']}")
        print("=" * 60)

        if summary['failed'] > 0 or summary['timeout'] > 0 or summary['error'] > 0:
            print("\nFAILED TESTS:")
            for result in report['test_results']:
                if result['status'] != 'PASSED':
                    print(f"  • {result['test_id']}: {result['status']}")
                    if result['error']:
                        print(f"    └─ {result['error'][:100]}...")
        else:
            print("\nALL TESTS PASSED!")

    def save_report(self, report, filename=None):
        """Save test report to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"testsprite_report_{timestamp}.json"

        report_path = self.test_directory / filename
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"\n[SAVE] Report saved to: {report_path}")
        return report_path

def main():
    """Main entry point"""
    runner = TestSpriteRunner()
    report = runner.run_all_tests()
    runner.print_summary(report)

    # Save detailed report
    report_file = runner.save_report(report)

    # Exit with appropriate code
    if report['summary']['status'] == 'PASSED':
        print("\n[SUCCESS] TestSprite MCP Test Suite: PASSED")
        sys.exit(0)
    else:
        print("\n[FAILED] TestSprite MCP Test Suite: FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()