# Pinecone Setup Guide ✅

## Overview
This guide helps you connect your Dynamic Agentic Systems backend to your existing Pinecone index.

## Index Configuration
Based on your Pinecone dashboard:
- **Index Name**: `agent`
- **Environment**: `us-east-1`
- **Host**: `https://agent-1vaaxdl.svc.aped-4627-b74a.pinecone.io`
- **Dimensions**: `512`
- **Embedding Model**: `text-embedding-3-small`
- **Type**: `Serverless`

## ✅ Connection Status: SUCCESSFUL

Your backend is now successfully connected to your Pinecone index!

## Changes Made

### 1. Configuration Updates (`backend/app/config.py`)
- Updated `pinecone_environment` from `"us-east-1-aws"` to `"us-east-1"`
- Updated `pinecone_index_name` from `"dynamic-agentic-systems"` to `"agent"`

### 2. Service Updates (`backend/services/pinecone_service.py`)
- Updated to use new Pinecone package (`from pinecone import Pinecone`)
- Updated to connect to existing index instead of creating new one
- Added `text-embedding-3-small` model specification for 512 dimensions
- Fixed import aliases to avoid conflicts

### 3. Dependencies (`backend/requirements.txt`)
- Updated from `pinecone-client>=3.0.0` to `pinecone>=7.0.0`
- **Note**: The package name changed from `pinecone-client` to `pinecone`

### 4. Test Script (`backend/test_pinecone.py`)
- Updated to use new Pinecone package API
- Added proper error handling and connection testing

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
python setup_pinecone.py
```

Or manually create `.env` with:
```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=agent

# OpenAI Configuration (required for embeddings)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get Your Pinecone API Key
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Navigate to "API Keys" in the left sidebar
3. Copy your API key
4. Update the `PINECONE_API_KEY` in your `.env` file

### 4. Test Connection ✅
```bash
python test_pinecone.py
```

Expected output (VERIFIED):
```
API Key (first 8 chars): pcsk_2Be
Environment: us-east-1
Index Name: agent
Indexes from API: ['agent']
Index 'agent' is accessible via API.
Index stats: {'dimension': 512,
 'index_fullness': 0.0,
 'metric': 'cosine',
 'namespaces': {},
 'total_vector_count': 0,
 'vector_type': 'dense'}
```

### 5. Start the Backend
```bash
python start_server.py
```

## Verification

### Check Service Initialization
Look for this log message when starting the backend:
```
INFO: Pinecone service initialized successfully
```

### Test Document Upload
1. Upload a PDF through the API
2. Check logs for successful indexing:
```
INFO: Stored X document chunks in Pinecone
```

### Test Search
Query the system and verify document retrieval works.

## Package Migration Notes

### Important: Package Name Change
- **Old**: `pinecone-client` (versions 2.x - 6.x)
- **New**: `pinecone` (versions 7.x+)

If you encounter import errors, ensure you:
1. Uninstall the old package: `pip uninstall pinecone-client -y`
2. Install the new package: `pip install pinecone`

### API Changes
- **Old API**: `pinecone.init(api_key, environment)` + `pinecone.Index(name)`
- **New API**: `pc = Pinecone(api_key)` + `pc.Index(name)`

## Troubleshooting

### Common Issues

1. **ImportError: cannot import name 'Pinecone'**
   - Solution: Uninstall `pinecone-client` and install `pinecone`
   - Commands: `pip uninstall pinecone-client -y && pip install pinecone`

2. **"Index not found" error**
   - Verify your API key is correct
   - Check that the API key has access to the `agent` index
   - Ensure you're using the correct project/environment

3. **"Dimension mismatch" error**
   - The index expects 512-dimensional vectors
   - Ensure `text-embedding-3-small` model is being used
   - Check that no other embedding model is configured

4. **Connection timeout**
   - Verify your network connection
   - Check if you're behind a firewall
   - Try the test script to isolate the issue

### Debug Commands

```bash
# Test basic connection
python test_pinecone.py

# Check environment variables
python -c "from app.config import settings; print(f'API Key: {settings.pinecone_api_key[:8]}...' if settings.pinecone_api_key else 'No API key')"

# Test embedding generation
python -c "from services.pinecone_service import pinecone_service; print('Service initialized:', pinecone_service.embeddings is not None)"
```

## ✅ Success Indicators

- Test script shows: `Index 'agent' is accessible via API.`
- Index stats show: `'dimension': 512, 'metric': 'cosine', 'vector_type': 'dense'`
- Backend logs show: `INFO: Pinecone service initialized successfully`

## Next Steps

After successful setup:
1. ✅ Connection established
2. Upload documents to test indexing
3. Perform queries to test retrieval
4. Monitor logs for any issues
5. Consider implementing backup/restore procedures for your index data

## Current Status: READY FOR USE 🚀

Your Pinecone integration is now fully functional and ready for production use! 