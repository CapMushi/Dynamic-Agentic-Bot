#!/usr/bin/env python3
"""
Syntax Error Testing Suite
Tests all backend files for syntax errors and import issues.
Run this from the backend directory: python tests/test_syntax_errors.py
"""

import sys
import os
import importlib
import traceback
from pathlib import Path

def test_import(module_name, file_path):
    """Test importing a specific module"""
    try:
        # Add the current directory to Python path
        if str(Path.cwd()) not in sys.path:
            sys.path.insert(0, str(Path.cwd()))
        
        # Try to import the module
        module = importlib.import_module(module_name)
        print(f"[OK] {file_path} - Import successful")
        return True
    except SyntaxError as e:
        print(f"[ERROR] {file_path} - Syntax Error: {e}")
        return False
    except ImportError as e:
        print(f"[ERROR] {file_path} - Import Error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] {file_path} - Unexpected Error: {e}")
        return False

def test_file_syntax(file_path):
    """Test a single file for syntax errors"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Try to compile the content
        compile(content, file_path, 'exec')
        print(f"[OK] {file_path} - Syntax OK")
        return True
    except SyntaxError as e:
        print(f"[ERROR] {file_path} - Syntax Error: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] {file_path} - Error reading file: {e}")
        return False

def find_python_files(directory):
    """Find all Python files in a directory recursively"""
    python_files = []
    for root, dirs, files in os.walk(directory):
        # Skip __pycache__ and .git directories
        dirs[:] = [d for d in dirs if d not in ['__pycache__', '.git', 'tests']]
        
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    return python_files

def main():
    """Main testing function"""
    print("Starting Syntax Error Testing Suite")
    print("=" * 50)
    
    # Get the backend directory
    backend_dir = Path.cwd()
    print(f"Testing backend directory: {backend_dir}")
    print()
    
    # Test all Python files for syntax errors
    print("Testing Python files for syntax errors:")
    print("-" * 40)
    
    python_files = find_python_files(backend_dir)
    syntax_errors = 0
    
    for file_path in python_files:
        if not test_file_syntax(file_path):
            syntax_errors += 1
    
    print()
    print("Testing module imports:")
    print("-" * 40)
    
    # Test specific module imports
    modules_to_test = [
        ('app.config', 'app/config.py'),
        ('app.main', 'app/main.py'),
        ('app.api_routes', 'app/api_routes.py'),
        ('app.websocket_routes', 'app/websocket_routes.py'),
        ('models.schemas', 'models/schemas.py'),
        ('services.pinecone_service', 'services/pinecone_service.py'),
        ('services.pdf_service', 'services/pdf_service.py'),
        ('services.csv_service', 'services/csv_service.py'),
        ('services.llm_service', 'services/llm_service.py'),
        ('services.websocket_service', 'services/websocket_service.py'),
        ('nodes.base_node', 'nodes/base_node.py'),
        ('nodes.router_node', 'nodes/router_node.py'),
        ('nodes.document_node', 'nodes/document_node.py'),
        ('nodes.database_node', 'nodes/database_node.py'),
        ('nodes.math_node', 'nodes/math_node.py'),
        ('nodes.persona_selector_node', 'nodes/persona_selector_node.py'),
        ('nodes.suggestion_node', 'nodes/suggestion_node.py'),
        ('nodes.answer_formatter_node', 'nodes/answer_formatter_node.py'),
        ('utils.langgraph_orchestrator', 'utils/langgraph_orchestrator.py'),
    ]
    
    import_errors = 0
    for module_name, file_path in modules_to_test:
        if not test_import(module_name, file_path):
            import_errors += 1
    
    print()
    print("Test Summary:")
    print("=" * 50)
    print(f"Total Python files tested: {len(python_files)}")
    print(f"Syntax errors found: {syntax_errors}")
    print(f"Import errors found: {import_errors}")
    
    if syntax_errors == 0 and import_errors == 0:
        print("All tests passed! No syntax or import errors found.")
        return True
    else:
        print("Some errors were found. Please fix them before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 