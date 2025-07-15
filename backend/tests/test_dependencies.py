#!/usr/bin/env python3
"""
Dependency Testing Suite
Tests all required dependencies and environment configuration.
Run this from the backend directory: python tests/test_dependencies.py
"""

import sys
import os
from pathlib import Path

def test_package_import(package_name, import_name=None):
    """Test if a package can be imported"""
    try:
        if import_name:
            __import__(import_name)
        else:
            __import__(package_name)
        print(f"[OK] {package_name} - Import successful")
        return True
    except ImportError as e:
        print(f"[ERROR] {package_name} - Import failed: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] {package_name} - Unexpected error: {e}")
        return False

def test_environment_variables():
    """Test if required environment variables are set"""
    print("Testing environment variables:")
    print("-" * 40)
    
    # Load environment variables from .env file if it exists
    env_file = Path(".env")
    if env_file.exists():
        print("Loading environment from .env file...")
        with open(env_file, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    
    required_vars = [
        'PINECONE_API_KEY',
        'PINECONE_ENVIRONMENT',
        'PINECONE_INDEX_NAME',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'GOOGLE_API_KEY',
        'CLAUDE_API_KEY'
    ]
    
    optional_vars = [
        'LOG_LEVEL',
        'CORS_ORIGINS',
        'MAX_FILE_SIZE',
        'UPLOAD_DIR'
    ]
    
    missing_required = 0
    missing_optional = 0
    
    print("Required environment variables:")
    for var in required_vars:
        if os.getenv(var):
            print(f"[OK] {var} - Set")
        else:
            print(f"[ERROR] {var} - Missing")
            missing_required += 1
    
    print("\nOptional environment variables:")
    for var in optional_vars:
        if os.getenv(var):
            print(f"[OK] {var} - Set")
        else:
            print(f"[WARN] {var} - Not set (optional)")
            missing_optional += 1
    
    return missing_required, missing_optional

def test_directory_structure():
    """Test if required directories exist"""
    print("\nTesting directory structure:")
    print("-" * 40)
    
    required_dirs = [
        'uploads',
        'uploads/pdfs',
        'uploads/csvs',
        'app',
        'models',
        'services',
        'nodes',
        'utils',
        'tests'
    ]
    
    missing_dirs = 0
    for dir_path in required_dirs:
        if Path(dir_path).exists():
            print(f"[OK] {dir_path}/ - Exists")
        else:
            print(f"[ERROR] {dir_path}/ - Missing")
            missing_dirs += 1
    
    return missing_dirs

def test_file_existence():
    """Test if required files exist"""
    print("\nTesting required files:")
    print("-" * 40)
    
    required_files = [
        'requirements.txt',
        'env.example',
        'start_server.py',
        'README.md',
        'app/__init__.py',
        'app/config.py',
        'app/main.py',
        'app/api_routes.py',
        'app/websocket_routes.py',
        'models/__init__.py',
        'models/schemas.py',
        'services/__init__.py',
        'services/pinecone_service.py',
        'services/pdf_service.py',
        'services/csv_service.py',
        'services/llm_service.py',
        'services/websocket_service.py',
        'nodes/__init__.py',
        'nodes/base_node.py',
        'nodes/router_node.py',
        'nodes/document_node.py',
        'nodes/database_node.py',
        'nodes/math_node.py',
        'nodes/persona_selector_node.py',
        'nodes/suggestion_node.py',
        'nodes/answer_formatter_node.py',
        'utils/__init__.py',
        'utils/langgraph_orchestrator.py'
    ]
    
    missing_files = 0
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"[OK] {file_path} - Exists")
        else:
            print(f"[ERROR] {file_path} - Missing")
            missing_files += 1
    
    return missing_files

def main():
    """Main testing function"""
    print("Starting Dependency Testing Suite")
    print("=" * 50)
    
    # Test package imports
    print("Testing package imports:")
    print("-" * 40)
    
    packages_to_test = [
        ('fastapi', 'fastapi'),
        ('uvicorn', 'uvicorn'),
        ('pydantic', 'pydantic'),
        ('langchain', 'langchain'),
        ('langgraph', 'langgraph'),
        ('pinecone-client', 'pinecone'),
        ('openai', 'openai'),
        ('anthropic', 'anthropic'),
        ('google-generativeai', 'google.generativeai'),
        ('pandas', 'pandas'),
        ('numpy', 'numpy'),
        ('python-multipart', 'multipart'),
        ('websockets', 'websockets'),
        ('python-dotenv', 'dotenv'),
        ('pillow', 'PIL'),
        ('pytesseract', 'pytesseract'),
        ('pdf2image', 'pdf2image'),
        ('python-magic', 'magic'),
    ]
    
    import_errors = 0
    for package_name, import_name in packages_to_test:
        if not test_package_import(package_name, import_name):
            import_errors += 1
    
    # Test environment variables
    missing_required, missing_optional = test_environment_variables()
    
    # Test directory structure
    missing_dirs = test_directory_structure()
    
    # Test file existence
    missing_files = test_file_existence()
    
    print()
    print("Test Summary:")
    print("=" * 50)
    print(f"Package import errors: {import_errors}")
    print(f"Missing required env vars: {missing_required}")
    print(f"Missing optional env vars: {missing_optional}")
    print(f"Missing directories: {missing_dirs}")
    print(f"Missing files: {missing_files}")
    
    total_errors = import_errors + missing_required + missing_dirs + missing_files
    
    if total_errors == 0:
        print("All dependency tests passed!")
        return True
    else:
        print(f"{total_errors} issues found. Please fix them before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 