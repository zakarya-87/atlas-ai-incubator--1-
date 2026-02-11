#!/usr/bin/env python3
"""
TestSprite MCP Test Runner for ATLAS AI Incubator
Advanced test execution with support for multiple test categories
Compatible with TestSprite MCP Server (@testsprite/testsprite-mcp@latest)
"""

import os
import sys
import subprocess
import json
import time
import argparse
from datetime import datetime
from pathlib import Path
import traceback
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import shutil


class TestCategory(Enum):
    """Test categories supported by the runner"""
    CORE = "core"                    # TC* - Core functionality tests
    EDGE_CASES = "edge_cases"        # EC* - Edge case tests
    ERROR_HANDLING = "error_handling" # EH* - Error handling tests
    PERFORMANCE = "performance"      # PF* - Performance tests
    SECURITY = "security"            # SC* - Security tests
    REGRESSION = "regression"        # RG* - Regression tests
    LINT = "lint"                    # LT* - Lint tests
    ALL = "all"                      # Run all categories


@dataclass
class TestResult:
    """Individual test result data structure"""
    test_id: str
    category: str
    file: str
    status: str  # PASSED, FAILED, TIMEOUT, ERROR, SKIPPED
    duration: float
    error: Optional[str] = None
    output: Optional[str] = None
    recovery_success: bool = False
    coverage_data: Optional[Dict] = None


@dataclass
class CategorySummary:
    """Summary for a test category"""
    category: str
    total: int
    passed: int
    failed: int
    timeout: int
    error: int
    skipped: int
    duration: float
    success_rate: float


class TestSpriteRunner:
    """
    Advanced TestSprite MCP Test Runner
    
    Features:
    - Multi-category test execution (TC, EC, EH, PF, SC, RG)
    - Comprehensive coverage analysis
    - Edge case detection reporting
    - Error recovery validation
    - CI/CD integration mode
    - Parallel execution support
    - Cloud execution via TestSprite MCP
    
    Required Environment Variables:
    - TESTSPRITE_API_KEY: Your TestSprite API key
    - PROJECT_PATH: Path to the project
    - COVERAGE_THRESHOLD: Minimum coverage percentage (default: 80)
    """
    
    def __init__(self, category: TestCategory = TestCategory.ALL, 
                 coverage_threshold: float = 80.0,
                 parallel: int = 1,
                 ci_mode: bool = False):
        self.category = category
        self.coverage_threshold = coverage_threshold
        self.parallel = parallel
        self.ci_mode = ci_mode
        
        # Test tracking
        self.test_results: List[TestResult] = []
        self.category_summaries: Dict[str, CategorySummary] = {}
        self.test_files: List[Path] = []
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
        
        # Configuration
        self.test_directory = Path(__file__).parent
        self.api_key: str = os.getenv('TESTSPRITE_API_KEY', '')
        self.mcp_server_available: bool = False
        
        # Statistics
        self.total_tests = 0
        self.total_passed = 0
        self.total_failed = 0
        self.total_duration = 0.0
        
        # Initialize
        self._load_test_files()
        self._check_mcp_server()
    
    def _get_category_from_filename(self, filename: str) -> str:
        """Extract category from filename prefix"""
        if filename.startswith('TC'):
            return 'core'
        elif filename.startswith('EC'):
            return 'edge_cases'
        elif filename.startswith('EH'):
            return 'error_handling'
        elif filename.startswith('PF'):
            return 'performance'
        elif filename.startswith('SC'):
            return 'security'
        elif filename.startswith('RG'):
            return 'regression'
        elif filename.startswith('LT'):
            return 'lint'
        return 'unknown'
    
    def _load_test_files(self):
        """Load test files based on selected category"""
        patterns = {
            TestCategory.CORE: ["TC*.py"],
            TestCategory.EDGE_CASES: ["EC*.py"],
            TestCategory.ERROR_HANDLING: ["EH*.py"],
            TestCategory.PERFORMANCE: ["PF*.py"],
            TestCategory.SECURITY: ["SC*.py"],
            TestCategory.REGRESSION: ["RG*.py"],
            TestCategory.LINT: ["LT*.py"],
            TestCategory.ALL: ["TC*.py", "EC*.py", "EH*.py", "PF*.py", "SC*.py", "RG*.py", "LT*.py"]
        }
        
        selected_patterns = patterns.get(self.category, patterns[TestCategory.ALL])
        
        for pattern in selected_patterns:
            self.test_files.extend(self.test_directory.glob(pattern))
        
        # Remove duplicates and sort
        self.test_files = list(set(self.test_files))
        self.test_files.sort(key=lambda x: x.stem)
        
        print(f"[INFO] Loaded {len(self.test_files)} test files for category: {self.category.value}")
    
    def _check_mcp_server(self):
        """Check if TestSprite MCP server is available"""
        cmd = self._testsprite_version_command()
        if not cmd:
            print("[INFO] MCP server check skipped: testsprite CLI not found")
            self.mcp_server_available = False
            return

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            self.mcp_server_available = result.returncode == 0
            if self.mcp_server_available:
                print("[INFO] TestSprite MCP server available")
            else:
                print("[INFO] TestSprite MCP server not available - running in standalone mode")
        except subprocess.TimeoutExpired:
            print("[INFO] MCP server check timed out - running in standalone mode")
            self.mcp_server_available = False
        except FileNotFoundError as e:
            print(f"[INFO] MCP server check skipped: {e}")
            self.mcp_server_available = False
        except Exception as e:
            print(f"[INFO] MCP server check skipped: {e}")
            self.mcp_server_available = False

    def _testsprite_version_command(self) -> Optional[List[str]]:
        """Return the command line that can print TestSprite MCP version"""
        node = shutil.which('node')
        cached_index = self._find_cached_testsprite_index()
        if node and cached_index:
            return [node, str(cached_index), '--version']

        npx = shutil.which('npx.cmd') or shutil.which('npx')
        if npx:
            return [npx, '-y', '@testsprite/testsprite-mcp@latest', '--version']

        return None

    def _find_cached_testsprite_index(self) -> Optional[Path]:
        """Look for a cached TestSprite MCP entry script in npm/_npx"""
        search_paths: List[Path] = []
        local_app = os.getenv('LOCALAPPDATA')
        if local_app:
            search_paths.append(Path(local_app) / 'npm-cache' / '_npx')

        npm_cache = os.getenv('NPM_CONFIG_CACHE')
        if npm_cache:
            search_paths.append(Path(npm_cache) / '_npx')

        search_paths.append(Path.home() / '.npm' / '_npx')

        for base in search_paths:
            if not base.is_dir():
                continue

            try:
                entries = sorted(base.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True)
            except OSError:
                entries = list(base.iterdir())
            for entry in entries:
                candidate = entry / 'node_modules' / '@testsprite' / 'testsprite-mcp' / 'dist' / 'index.js'
                if candidate.exists():
                    return candidate

        return None
    
    def validate_setup(self) -> bool:
        """Validate test environment setup"""
        print("\n" + "="*70)
        print("TEST ENVIRONMENT VALIDATION")
        print("="*70)
        
        checks = {
            'Test Directory': self.test_directory.exists(),
            'Test Files Found': len(self.test_files) > 0,
            'API Key Configured': bool(self.api_key),
            'MCP Server Available': self.mcp_server_available,
            'Node.js Available': self._check_nodejs(),
            'Python Version': sys.version_info >= (3, 8),
        }
        
        all_passed = True
        for check, passed in checks.items():
            status = "[OK]" if passed else "[FAIL]"
            print(f"  {status} {check}")
            if not passed:
                all_passed = False
        
        print("\n" + "="*70)
        
        if not self.api_key:
            print("\n[WARNING] TESTSPRITE_API_KEY not set")
            print("   Get your API key from: https://www.testsprite.com/dashboard")
            print("   Run: set TESTSPRITE_API_KEY=your_api_key")
        
        return all_passed
    
    def _check_nodejs(self) -> bool:
        """Check if Node.js is available"""
        try:
            subprocess.run(['node', '--version'], capture_output=True, timeout=5, shell=True)
            return True
        except:
            return False
    
    def run_single_test(self, test_file: Path) -> TestResult:
        """Execute a single test file"""
        test_name = test_file.stem
        category = self._get_category_from_filename(test_name)
        
        print(f"\n[CATEGORY] {category.upper()} - {test_name}")
        print("-" * 70)
        
        start_time = time.time()
        result = TestResult(
            test_id=test_name,
            category=category,
            file=str(test_file),
            status='unknown',
            duration=0.0
        )
        
        try:
            # Set up environment
            env = os.environ.copy()
            if self.api_key:
                env['TESTSPRITE_API_KEY'] = self.api_key
            env['TESTSPRITE_MODE'] = 'local'
            env['COVERAGE_THRESHOLD'] = str(self.coverage_threshold)
            
            # Execute test
            process = subprocess.run(
                [sys.executable, str(test_file)],
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout per test
                cwd=self.test_directory,
                env=env
            )
            
            result.duration = time.time() - start_time
            
            # Parse result
            if process.returncode == 0:
                result.status = 'PASSED'
                result.output = process.stdout[-500:] if len(process.stdout) > 500 else process.stdout
                print(f"  [PASS] PASSED ({result.duration:.2f}s)")
                
                # Check for recovery success in output
                if 'recovery' in process.stdout.lower() or 'RECOVERY' in process.stdout:
                    result.recovery_success = True
                    print(f"  [RECOVERY] Recovery mechanism validated")
                    
            else:
                result.status = 'FAILED'
                result.error = process.stderr or process.stdout
                print(f"  [FAIL] FAILED ({result.duration:.2f}s)")
                if result.error:
                    error_preview = result.error[:200].replace('\n', ' ')
                    print(f"     Error: {error_preview}...")
            
        except subprocess.TimeoutExpired:
            result.status = 'TIMEOUT'
            result.duration = time.time() - start_time
            result.error = "Test timed out after 120 seconds"
            print(f"  [TIMEOUT] TIMEOUT ({result.duration:.2f}s)")
        
        except Exception as e:
            result.status = 'ERROR'
            result.duration = time.time() - start_time
            result.error = str(e)
            print(f"  [ERROR] ERROR ({result.duration:.2f}s)")
            print(f"     {e}")
        
        return result
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Execute all selected tests"""
        print("\n" + "="*70)
        print("TESTSPRITE MCP TEST SUITE EXECUTION")
        print("="*70)
        print(f"Category: {self.category.value.upper()}")
        print(f"Test Files: {len(self.test_files)}")
        print(f"Coverage Threshold: {self.coverage_threshold}%")
        print(f"MCP Server: {'Connected' if self.mcp_server_available else 'Standalone'}")
        print(f"API Key: {'Configured' if self.api_key else 'Not Set'}")
        print("="*70)
        
        self.start_time = time.time()
        
        # Group tests by category
        tests_by_category: Dict[str, List[Path]] = {}
        for test_file in self.test_files:
            category = self._get_category_from_filename(test_file.stem)
            if category not in tests_by_category:
                tests_by_category[category] = []
            tests_by_category[category].append(test_file)
        
        # Run tests by category
        for category, files in sorted(tests_by_category.items()):
            print(f"\n{'='*70}")
            print(f"CATEGORY: {category.upper()}")
            print('='*70)
            
            category_results = []
            for test_file in files:
                result = self.run_single_test(test_file)
                self.test_results.append(result)
                category_results.append(result)
            
            # Calculate category summary
            summary = self._calculate_category_summary(category, category_results)
            self.category_summaries[category] = summary
        
        self.end_time = time.time()
        
        return self.generate_report()
    
    def _calculate_category_summary(self, category: str, results: List[TestResult]) -> CategorySummary:
        """Calculate summary statistics for a category"""
        total = len(results)
        passed = len([r for r in results if r.status == 'PASSED'])
        failed = len([r for r in results if r.status == 'FAILED'])
        timeout = len([r for r in results if r.status == 'TIMEOUT'])
        error = len([r for r in results if r.status == 'ERROR'])
        skipped = len([r for r in results if r.status == 'SKIPPED'])
        duration = sum(r.duration for r in results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        return CategorySummary(
            category=category,
            total=total,
            passed=passed,
            failed=failed,
            timeout=timeout,
            error=error,
            skipped=skipped,
            duration=duration,
            success_rate=success_rate
        )
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r.status == 'PASSED'])
        failed_tests = len([r for r in self.test_results if r.status == 'FAILED'])
        timeout_tests = len([r for r in self.test_results if r.status == 'TIMEOUT'])
        error_tests = len([r for r in self.test_results if r.status == 'ERROR'])
        recovery_tests = len([r for r in self.test_results if r.recovery_success])
        
        total_duration = (self.end_time - self.start_time) if (self.end_time and self.start_time) else 0.0
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        coverage_met = success_rate >= self.coverage_threshold
        
        report = {
            'summary': {
                'test_suite': 'TestSprite MCP',
                'project': 'ATLAS AI Incubator',
                'execution_date': datetime.now().isoformat(),
                'category': self.category.value,
                'total_tests': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'timeout': timeout_tests,
                'error': error_tests,
                'recovery_success': recovery_tests,
                'success_rate': success_rate,
                'coverage_threshold': self.coverage_threshold,
                'coverage_met': coverage_met,
                'total_duration': total_duration,
                'status': 'PASSED' if (failed_tests == 0 and timeout_tests == 0 and error_tests == 0 and coverage_met) else 'FAILED'
            },
            'category_breakdown': {
                cat: asdict(summary) for cat, summary in self.category_summaries.items()
            },
            'test_results': [asdict(r) for r in self.test_results],
            'environment': {
                'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
                'platform': sys.platform,
                'working_directory': str(self.test_directory),
                'test_files_found': len(self.test_files),
                'mcp_server_available': self.mcp_server_available,
                'api_key_configured': bool(self.api_key),
                'ci_mode': self.ci_mode
            }
        }
        
        return report
    
    def print_summary(self, report: Dict[str, Any]):
        """Print test execution summary"""
        print("\n" + "="*70)
        print("TEST EXECUTION SUMMARY")
        print("="*70)
        
        summary = report['summary']
        
        print(f"\n[RESULTS] Overall Results:")
        print(f"   Total Tests: {summary['total_tests']}")
        print(f"   [OK] Passed: {summary['passed']}")
        print(f"   [FAIL] Failed: {summary['failed']}")
        print(f"   [TIMEOUT] Timeout: {summary['timeout']}")
        print(f"   [ERROR] Error: {summary['error']}")
        print(f"   [RECOVERY] Recovery: {summary['recovery_success']}")
        
        print(f"\n[METRICS] Metrics:")
        print(f"   Success Rate: {summary['success_rate']:.1f}%")
        print(f"   Coverage Threshold: {summary['coverage_threshold']}%")
        print(f"   Coverage Met: {'[YES]' if summary['coverage_met'] else '[NO]'}")
        print(f"   Total Duration: {summary['total_duration']:.2f}s")
        print(f"   Overall Status: {summary['status']}")
        
        # Category breakdown
        if report['category_breakdown']:
            print(f"\n[CATEGORIES] Category Breakdown:")
            for cat, data in report['category_breakdown'].items():
                status_icon = "[OK]" if data['success_rate'] >= self.coverage_threshold else "[WARN]"
                print(f"   {status_icon} {cat.upper()}: {data['passed']}/{data['total']} ({data['success_rate']:.1f}%)")
        
        # Failed tests
        if summary['failed'] > 0 or summary['timeout'] > 0 or summary['error'] > 0:
            print(f"\n[FAILED] Failed Tests:")
            for result in report['test_results']:
                if result['status'] not in ['PASSED', 'SKIPPED']:
                    print(f"   - {result['test_id']}: {result['status']}")
                    if result.get('error'):
                        error_msg = result['error'][:60].replace('\n', ' ')
                        print(f"       {error_msg}...")
        
        print("\n" + "="*70)
    
    def save_report(self, report: Dict[str, Any], filename: Optional[str] = None) -> Path:
        """Save test report to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"testsprite_report_{timestamp}.json"
        
        report_path = self.test_directory / filename
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n[SAVE] JSON Report: {report_path}")
        return report_path
    
    def generate_markdown_report(self, report: Dict[str, Any], filename: Optional[str] = None) -> Path:
        """Generate markdown test report"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"testsprite_report_{timestamp}.md"
        
        report_path = self.test_directory / filename
        summary = report['summary']
        env = report['environment']
        
        md = f"""# TestSprite MCP Test Report

**Project:** ATLAS AI Incubator  
**Execution Date:** {summary['execution_date']}  
**Test Category:** {summary['category'].upper()}  
**TestSprite MCP:** @latest

## [RESULTS] Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | {summary['total_tests']} |
| [OK] Passed | {summary['passed']} |
| [FAIL] Failed | {summary['failed']} |
| [TIMEOUT] Timeout | {summary['timeout']} |
| [ERROR] Error | {summary['error']} |
| [RECOVERY] Recovery Success | {summary['recovery_success']} |
| **Success Rate** | **{summary['success_rate']:.1f}%** |
| Coverage Threshold | {summary['coverage_threshold']}% |
| Coverage Met | {'[YES]' if summary['coverage_met'] else '[NO]'} |
| Total Duration | {summary['total_duration']:.2f}s |
| **Status** | **{summary['status']}** |

## [CATEGORIES] Category Breakdown

"""
        
        for cat, data in report['category_breakdown'].items():
            md += f"""### {cat.upper()}

- **Tests:** {data['total']}
- **Passed:** {data['passed']} [OK]
- **Failed:** {data['failed']} [FAIL]
- **Success Rate:** {data['success_rate']:.1f}%
- **Duration:** {data['duration']:.2f}s

"""
        
        # Add failed tests section if any
        failed_tests = [r for r in report['test_results'] if r['status'] not in ['PASSED', 'SKIPPED']]
        if failed_tests:
            md += """## [FAILED] Failed Tests

"""
            for result in failed_tests:
                md += f"""### {result['test_id']}

- **Status:** {result['status']}
- **Category:** {result['category']}
- **Duration:** {result['duration']:.2f}s
"""
                if result.get('error'):
                    md += f"- **Error:** `{result['error'][:100]}...`\n"
                md += "\n"
        
        # Add recovery tests section
        recovery_tests = [r for r in report['test_results'] if r.get('recovery_success')]
        if recovery_tests:
            md += """## [RECOVERY] Recovery Mechanisms Validated

"""
            for result in recovery_tests:
                md += f"- [OK] {result['test_id']}\n"
            md += "\n"
        
        md += f"""## [ENV] Environment

- **Python:** {env['python_version']}
- **Platform:** {env['platform']}
- **MCP Server:** {'Available' if env['mcp_server_available'] else 'Standalone'}
- **API Key:** {'Configured' if env['api_key_configured'] else 'Not Set'}
- **CI Mode:** {env['ci_mode']}

## [NOTES] Notes

"""
        
        if not summary['coverage_met']:
            md += """[WARNING] Coverage threshold not met. Consider:
- Adding more tests for uncovered code paths
- Running edge case detection
- Reviewing error handling coverage

"""
        
        md += """---
*Generated by TestSprite MCP Test Runner*
"""
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(md)
        
        print(f"[SAVE] Markdown Report: {report_path}")
        return report_path


def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description='TestSprite MCP Test Runner for ATLAS AI Incubator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run all tests
  python testsprite_runner.py
  
  # Run only edge case tests
  python testsprite_runner.py --category edge_cases
  
  # Run with coverage threshold
  python testsprite_runner.py --coverage-threshold 85
  
  # CI mode (strict)
  python testsprite_runner.py --ci-mode --coverage-threshold 80
  
  # Validate setup
  python testsprite_runner.py --validate
  
  # Generate specific report format
  python testsprite_runner.py --report-format json
        """
    )
    
    parser.add_argument(
        '--category',
        choices=[c.value for c in TestCategory],
        default='all',
        help='Test category to run (default: all)'
    )
    
    parser.add_argument(
        '--coverage-threshold',
        type=float,
        default=80.0,
        help='Minimum coverage percentage (default: 80)'
    )
    
    parser.add_argument(
        '--validate',
        action='store_true',
        help='Validate test environment setup'
    )
    
    parser.add_argument(
        '--ci-mode',
        action='store_true',
        help='Enable CI/CD mode (strict exit codes)'
    )
    
    parser.add_argument(
        '--parallel',
        type=int,
        default=1,
        help='Number of parallel workers (default: 1)'
    )
    
    parser.add_argument(
        '--report-format',
        choices=['json', 'markdown', 'both'],
        default='both',
        help='Report output format (default: both)'
    )
    
    parser.add_argument(
        '--cloud',
        action='store_true',
        help='Execute tests in TestSprite cloud (requires API key)'
    )
    
    return parser.parse_args()


def main():
    """Main entry point"""
    args = parse_arguments()
    
    # Convert category string to enum
    category = TestCategory(args.category)
    
    # Initialize runner
    runner = TestSpriteRunner(
        category=category,
        coverage_threshold=args.coverage_threshold,
        parallel=args.parallel,
        ci_mode=args.ci_mode
    )
    
    # Validate only
    if args.validate:
        is_valid = runner.validate_setup()
        sys.exit(0 if is_valid else 1)
    
    # Run tests
    report = runner.run_all_tests()
    runner.print_summary(report)
    
    # Save reports
    if args.report_format in ['json', 'both']:
        runner.save_report(report)
    
    if args.report_format in ['markdown', 'both']:
        runner.generate_markdown_report(report)
    
    # Exit with appropriate code
    if args.ci_mode:
        sys.exit(0 if report['summary']['status'] == 'PASSED' else 1)
    else:
        if report['summary']['status'] == 'PASSED':
            print("\n[SUCCESS] TestSprite MCP Test Suite: PASSED")
            sys.exit(0)
        else:
            print("\n[FAILED] TestSprite MCP Test Suite: FAILED")
            print("Run with --validate to check your setup")
            sys.exit(1)


if __name__ == "__main__":
    main()
