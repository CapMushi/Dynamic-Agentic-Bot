#!/usr/bin/env python3
"""
Setup script for Pinecone connection
This script helps configure the environment variables needed for Pinecone connection
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create a .env file with Pinecone configuration"""
    env_content = """# API Keys for LLM Providers
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=agent

# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_DIR=uploads

# OCR Configuration
TESSERACT_PATH=tesseract

# WebSocket Configuration
WEBSOCKET_HOST=localhost
WEBSOCKET_PORT=8001
"""
    
    env_path = Path(".env")
    if env_path.exists():
        print("⚠️  .env file already exists")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("Skipping .env file creation")
            return
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file")
    print("📝 Please edit the .env file and add your actual API keys")

def main():
    print("🚀 Setting up Pinecone connection for Dynamic Agentic Systems")
    print("=" * 60)
    
    print("\n📋 Configuration Summary:")
    print("- Index Name: agent")
    print("- Environment: us-east-1")
    print("- Host: https://agent-1vaaxdl.svc.aped-4627-b74a.pinecone.io")
    print("- Embedding Model: text-embedding-3-small")
    print("- Dimensions: 512")
    
    print("\n🔧 Required Steps:")
    print("1. Get your Pinecone API key from: https://app.pinecone.io/")
    print("2. Set up your environment variables")
    print("3. Install/upgrade dependencies")
    print("4. Test the connection")
    
    # Create .env file
    create_env_file()
    
    print("\n📦 To install/upgrade dependencies, run:")
    print("pip install -r requirements.txt")
    
    print("\n🧪 To test the connection, run:")
    print("python test_pinecone.py")
    
    print("\n⚠️  Important Notes:")
    print("- Your index 'agent' already exists in Pinecone")
    print("- The backend will connect to this existing index")
    print("- Make sure your API key has access to the 'agent' index")
    print("- The index uses 512 dimensions (text-embedding-3-small)")

if __name__ == "__main__":
    main() 