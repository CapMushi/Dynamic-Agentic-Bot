# Backend Testing Suite

This directory contains comprehensive testing files to check for errors in the backend implementation.

## Test Files Overview

### 1. `test_syntax_errors.py`
- **Purpose**: Tests all Python files for syntax errors and import issues
- **What it checks**:
  - Syntax errors in all `.py` files
  - Import errors for all modules
  - Compilation errors
- **Usage**: `python tests/test_syntax_errors.py`

### 2. `test_dependencies.py`
- **Purpose**: Tests all required dependencies and environment configuration
- **What it checks**:
  - Package imports (FastAPI, LangChain, Pinecone, etc.)
  - Environment variables (API keys, configuration)
  - Directory structure
  - Required files existence
- **Usage**: `python tests/test_dependencies.py`

### 3. `test_api_endpoints.py`
- **Purpose**: Tests FastAPI routes and WebSocket connections
- **What it checks**:
  - FastAPI app creation
  - API route definitions
  - Pydantic model validation
  - Service initialization
  - LangGraph node imports
- **Usage**: `python tests/test_api_endpoints.py`

### 4. `test_langgraph_integration.py`
- **Purpose**: Tests LangGraph orchestrator and node connections
- **What it checks**:
  - Orchestrator creation
  - Node connections
  - Graph construction
  - Node execution
  - Service integration
  - Error handling
- **Usage**: `python tests/test_langgraph_integration.py`

### 5. `run_all_tests.py`
- **Purpose**: Master test runner that executes all test suites
- **What it does**:
  - Runs all test suites in sequence
  - Provides comprehensive summary
  - Shows success/failure rates
  - Exits with appropriate code
- **Usage**: `python tests/run_all_tests.py`

## How to Run Tests

### Prerequisites
1. Make sure you're in the backend directory
2. Install required dependencies: `pip install -r requirements.txt`
3. Set up environment variables (see `env.example`)

### Running Individual Tests
```bash
# Test syntax errors
python tests/test_syntax_errors.py

# Test dependencies
python tests/test_dependencies.py

# Test API endpoints
python tests/test_api_endpoints.py

# Test LangGraph integration
python tests/test_langgraph_integration.py
```

### Running All Tests
```bash
# Run all tests with comprehensive report
python tests/run_all_tests.py
```

## Understanding Test Results

### ✅ Success Indicators
- All imports successful
- No syntax errors
- All required files exist
- Environment variables set
- Services initialize properly
- Nodes connect successfully

### ❌ Common Issues and Solutions

#### 1. Import Errors
**Problem**: `ModuleNotFoundError` or `ImportError`
**Solutions**:
- Install missing packages: `pip install package_name`
- Check `requirements.txt` for all dependencies
- Ensure virtual environment is activated

#### 2. Environment Variable Errors
**Problem**: Missing API keys or configuration
**Solutions**:
- Copy `env.example` to `.env`
- Fill in all required API keys
- Set optional variables as needed

#### 3. Syntax Errors
**Problem**: Python syntax errors in files
**Solutions**:
- Check for missing imports
- Verify indentation
- Look for typos in class/function names

#### 4. File Structure Errors
**Problem**: Missing directories or files
**Solutions**:
- Create missing directories: `mkdir -p uploads/pdfs uploads/csvs`
- Ensure all required files exist
- Check file permissions

#### 5. Service Initialization Errors
**Problem**: Services fail to initialize
**Solutions**:
- Check API keys are valid
- Verify service configurations
- Ensure external services are accessible

## Test Output Interpretation

### Example Success Output
```
🔍 Starting Syntax Error Testing Suite
==================================================
Testing backend directory: /path/to/backend

📝 Testing Python files for syntax errors:
----------------------------------------
✅ app/config.py - Syntax OK
✅ app/main.py - Syntax OK
...

📦 Testing module imports:
----------------------------------------
✅ app.config - Import successful
✅ app.main - Import successful
...

📊 Test Summary:
==================================================
Total Python files tested: 25
Syntax errors found: 0
Import errors found: 0

🎉 All tests passed! No syntax or import errors found.
```

### Example Failure Output
```
❌ app/main.py - Syntax Error: invalid syntax
❌ services/pinecone_service.py - Import Error: No module named 'pinecone'
❌ Missing required env vars: 3
❌ Missing directories: 2
```

## Troubleshooting

### 1. Virtual Environment Issues
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. API Key Issues
```bash
# Check if environment variables are set
echo $PINECONE_API_KEY
echo $OPENAI_API_KEY

# Set environment variables
export PINECONE_API_KEY="your-key-here"
export OPENAI_API_KEY="your-key-here"
```

### 3. Permission Issues
```bash
# Make test files executable
chmod +x tests/*.py

# Check file permissions
ls -la tests/
```

### 4. Path Issues
```bash
# Ensure you're in the backend directory
pwd
ls -la

# Should see: app/, models/, services/, etc.
```

## Next Steps After Testing

1. **All Tests Pass**: Backend is ready for deployment
2. **Some Tests Fail**: Fix issues before proceeding
3. **Dependency Issues**: Install missing packages
4. **Configuration Issues**: Set up environment variables
5. **Code Issues**: Fix syntax or logic errors

## Continuous Integration

For CI/CD pipelines, you can run:
```bash
# Run all tests and exit with code 1 if any fail
python tests/run_all_tests.py

# Check exit code
echo $?
```

The test suite will exit with:
- `0`: All tests passed
- `1`: One or more tests failed

This allows for automated testing in deployment pipelines. 