#!/usr/bin/env python3
"""
TestSprite MCP Lint Test: LT001 - Code Style & Quality
Executes project linting and reports results via TestSprite.
"""

import sys
import os
import subprocess
import time
from typing import Dict, Any

class LintTest:
    @staticmethod
    def get_test_info() -> Dict[str, Any]:
        return {
            "test_id": "LT001",
            "test_name": "Code Style & Quality Check",
            "category": "lint",
            "priority": "High",
            "description": "Validates code style and quality using ESLint"
        }
    
    def run_tests(self):
        """Execute linting command with strict enforcement"""
        print(f"\n[LT001] Starting Strict Production Lint Check...")
        
        # Get project root (parent of testsprite_tests)
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        backend_dir = os.path.join(project_root, 'backend')
        
        start_time = time.time()
        try:
            # Use strict flags: max-warnings 0 to treat all warnings as errors, no-fix
            # Targeting backend specifically with production standards
            print(f"  [EXEC] Running strict ESLint on backend...")
            process = subprocess.run(
                ["npx.cmd", "eslint", "{src,test}/**/*.ts", "--max-warnings", "0"],
                capture_output=True,
                text=True,
                cwd=backend_dir,
                shell=True
            )
            
            duration = time.time() - start_time
            
            if process.returncode == 0:
                print(f"  [PASS] Production linting criteria met ({duration:.2f}s)")
                return True
            else:
                print(f"  [FAIL] Production linting failed ({duration:.2f}s)")
                # Print first few violations if output is too large
                output = process.stdout or process.stderr
                lines = output.splitlines()
                violation_summary = "\n".join(lines[:20])
                if len(lines) > 20:
                    violation_summary += f"\n... and {len(lines) - 20} more lines."
                
                print(f"     Violations detected:\n{violation_summary}")
                return False
                
        except Exception as e:
            print(f"  [ERROR] Failed to execute production lint check: {e}")
            return False

def main():
    test = LintTest()
    success = test.run_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
