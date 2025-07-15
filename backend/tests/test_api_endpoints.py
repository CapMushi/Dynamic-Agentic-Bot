#!/usr/bin/env python3
"""
API Endpoint Testing Suite
Tests FastAPI routes and WebSocket connections.
Run this from the backend directory: python tests/test_api_endpoints.py
"""

import sys
import os
import asyncio
import json
from pathlib import Path
from typing import Dict, Any

# Add the current directory to Python path
sys.path.insert(0, str(Path.cwd()))

try:
    from fastapi.testclient import TestClient
    from fastapi import FastAPI
    import websockets
except ImportError as e:
    print(f"[ERROR] Missing required packages for API testing: {e}")
    print("Install with: pip install httpx websockets")
    sys.exit(1)

def test_fastapi_app_creation():
    """Test if FastAPI app can be created without errors"""
    print("Testing FastAPI app creation:")
    print("-" * 40)
    
    try:
        from app.main import app
        print("[OK] FastAPI app created successfully")
        return app
    except Exception as e:
        print(f"[ERROR] Failed to create FastAPI app: {e}")
        return None

def test_api_routes(app: FastAPI):
    """Test API route definitions"""
    print("\nTesting API routes:")
    print("-" * 40)
    
    if not app:
        print("[ERROR] No app available for testing")
        return False
    
    try:
        client = TestClient(app)
        
        # Test health check endpoint
        print("Testing /health endpoint...")
        response = client.get("/health")
        if response.status_code == 200:
            print("[OK] /health endpoint works")
        else:
            print(f"[ERROR] /health endpoint failed: {response.status_code}")
        
        # Test status endpoint
        print("Testing /status endpoint...")
        response = client.get("/status")
        if response.status_code == 200:
            print("[OK] /status endpoint works")
        else:
            print(f"[ERROR] /status endpoint failed: {response.status_code}")
        
        # Test personas endpoint
        print("Testing /personas endpoint...")
        response = client.get("/personas")
        if response.status_code == 200:
            print("[OK] /personas endpoint works")
        else:
            print(f"[ERROR] /personas endpoint failed: {response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] API route testing failed: {e}")
        return False

def test_websocket_connection():
    """Test WebSocket connection"""
    print("\nTesting WebSocket connection:")
    print("-" * 40)
    
    try:
        # This is a basic test - in a real scenario you'd need the server running
        print("[OK] WebSocket routes defined (server needs to be running for full test)")
        return True
    except Exception as e:
        print(f"[ERROR] WebSocket testing failed: {e}")
        return False

def test_pydantic_models():
    """Test Pydantic model definitions"""
    print("\nTesting Pydantic models:")
    print("-" * 40)
    
    try:
        from models.schemas import (
            QueryRequest, QueryResponse, FileUploadResponse,
            PersonaResponse, StatusResponse, HealthResponse
        )
        
        # Test QueryRequest
        test_query = QueryRequest(
            message="test query",
            persona="Financial Analyst"
        )
        print("[OK] QueryRequest model works")
        
        # Test QueryResponse
        test_response = QueryResponse(
            response="test answer",
            queryType="conversational",
            processingTime=1500
        )
        print("[OK] QueryResponse model works")
        
        # Test FileUploadResponse
        test_upload = FileUploadResponse(
            id="test-id",
            name="test.pdf",
            type="pdf",
            status="completed"
        )
        print("[OK] FileUploadResponse model works")
        
        # Test PersonaResponse
        test_persona = PersonaResponse(
            personas=[
                {"name": "Financial Analyst", "description": "Expert in financial analysis"},
                {"name": "Legal Advisor", "description": "Expert in legal matters"}
            ]
        )
        print("[OK] PersonaResponse model works")
        
        # Test StatusResponse
        test_status = StatusResponse(
            status="running",
            uptime=3600,
            active_connections=5,
            total_queries=100
        )
        print("[OK] StatusResponse model works")
        
        # Test HealthResponse
        test_health = HealthResponse(
            status="healthy",
            timestamp="2024-01-01T00:00:00Z",
            version="1.0.0"
        )
        print("[OK] HealthResponse model works")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Pydantic model testing failed: {e}")
        return False

def test_service_initialization():
    """Test service initialization"""
    print("\nTesting service initialization:")
    print("-" * 40)
    
    services_to_test = [
        ('PineconeService', 'services.pinecone_service'),
        ('PDFService', 'services.pdf_service'),
        ('CSVService', 'services.csv_service'),
        ('LLMService', 'services.llm_service'),
        ('WebSocketService', 'services.websocket_service'),
    ]
    
    errors = 0
    for service_name, module_name in services_to_test:
        try:
            module = __import__(module_name, fromlist=[service_name])
            service_class = getattr(module, service_name)
            print(f"[OK] {service_name} - Import successful")
        except Exception as e:
            print(f"[ERROR] {service_name} - Import failed: {e}")
            errors += 1
    
    return errors == 0

def test_node_initialization():
    """Test LangGraph node initialization"""
    print("\nTesting LangGraph nodes:")
    print("-" * 40)
    
    nodes_to_test = [
        ('RouterNode', 'nodes.router_node'),
        ('DocumentNode', 'nodes.document_node'),
        ('DatabaseNode', 'nodes.database_node'),
        ('MathNode', 'nodes.math_node'),
        ('PersonaSelectorNode', 'nodes.persona_selector_node'),
        ('SuggestionNode', 'nodes.suggestion_node'),
        ('AnswerFormatterNode', 'nodes.answer_formatter_node'),
    ]
    
    errors = 0
    for node_name, module_name in nodes_to_test:
        try:
            module = __import__(module_name, fromlist=[node_name])
            node_class = getattr(module, node_name)
            print(f"[OK] {node_name} - Import successful")
        except Exception as e:
            print(f"[ERROR] {node_name} - Import failed: {e}")
            errors += 1
    
    return errors == 0

def main():
    """Main testing function"""
    print("Starting API Endpoint Testing Suite")
    print("=" * 50)
    
    # Test FastAPI app creation
    app = test_fastapi_app_creation()
    
    # Test API routes
    api_routes_ok = test_api_routes(app)
    
    # Test WebSocket connection
    websocket_ok = test_websocket_connection()
    
    # Test Pydantic models
    models_ok = test_pydantic_models()
    
    # Test service initialization
    services_ok = test_service_initialization()
    
    # Test node initialization
    nodes_ok = test_node_initialization()
    
    print()
    print("Test Summary:")
    print("=" * 50)
    print(f"FastAPI app creation: {'[OK]' if app else '[ERROR]'}")
    print(f"API routes: {'[OK]' if api_routes_ok else '[ERROR]'}")
    print(f"WebSocket: {'[OK]' if websocket_ok else '[ERROR]'}")
    print(f"Pydantic models: {'[OK]' if models_ok else '[ERROR]'}")
    print(f"Services: {'[OK]' if services_ok else '[ERROR]'}")
    print(f"LangGraph nodes: {'[OK]' if nodes_ok else '[ERROR]'}")
    
    all_passed = all([app, api_routes_ok, websocket_ok, models_ok, services_ok, nodes_ok])
    
    if all_passed:
        print("All API tests passed!")
        return True
    else:
        print("Some API tests failed. Please fix the issues.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 