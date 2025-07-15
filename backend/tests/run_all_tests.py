#!/usr/bin/env python3
"""
Master Test Runner
Runs all test suites and provides a comprehensive report.
Run this from the backend directory: python tests/run_all_tests.py
"""

import sys
import os
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Tuple

def run_test(test_name, test_file):
    """Run a single test suite and return results"""
    print(f"\n{'='*60}")
    print(f"Running {test_name}")
    print(f"{'='*60}")
    
    start_time = time.time()
    try:
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=True, text=True, timeout=30)
        duration = time.time() - start_time
        
        if result.returncode == 0:
            print(f"[OK] {test_name} PASSED ({duration:.2f}s)")
            return True, duration
        else:
            print(f"[ERROR] {test_name} FAILED ({duration:.2f}s)")
            print(f"Error output: {result.stdout}")
            return False, duration
    except subprocess.TimeoutExpired:
        print(f"[ERROR] {test_name} TIMEOUT")
        return False, 30.0
    except Exception as e:
        print(f"[ERROR] {test_name} ERROR: {e}")
        return False, 0.0

def print_summary(results: Dict[str, Tuple[bool, str]]):
    """Print a summary of all test results"""
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = 0
    failed = 0
    
    for test_name, (success, output) in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name}: {status}")
        
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Backend is ready for deployment.")
    else:
        print(f"\n{failed} test(s) failed. Please fix the issues before proceeding.")

def check_prerequisites():
    """Check if all prerequisites are met"""
    print("Checking prerequisites...")
    
    # Check if we're in the backend directory
    if not Path("app").exists() or not Path("models").exists():
        print("❌ Error: Must run from backend directory")
        return False
    
    # Check if test files exist
    test_files = [
        "tests/test_syntax_errors.py",
        "tests/test_dependencies.py", 
        "tests/test_api_endpoints.py",
        "tests/test_langgraph_integration.py"
    ]
    
    missing_files = []
    for test_file in test_files:
        if not Path(test_file).exists():
            missing_files.append(test_file)
    
    if missing_files:
        print(f"❌ Missing test files: {missing_files}")
        return False
    
    print("✅ Prerequisites met")
    return True

def main():
    """Main test runner function"""
    print("Starting Comprehensive Backend Test Suite")
    print("=" * 60)
    
    # Check prerequisites
    if not check_prerequisites():
        sys.exit(1)
    
    # Define test suites
    test_suites = [
        ("tests/test_syntax_errors.py", "Syntax Error Tests"),
        ("tests/test_dependencies.py", "Dependency Tests"),
        ("tests/test_api_endpoints.py", "API Endpoint Tests"),
        ("tests/test_langgraph_integration.py", "LangGraph Integration Tests"),
    ]
    
    results = {}
    
    # Run all test suites
    for test_file, test_name in test_suites:
        success, output = run_test(test_name, test_file)
        results[test_name] = (success, output)
    
    # Print summary
    print_summary(results)
    
    # Exit with appropriate code
    all_passed = all(success for success, _ in results.values())
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main() 