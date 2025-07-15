# Dynamic Agentic Systems Backend

Phase 4: LangGraph Architecture Implementation

## Overview

This backend implements a sophisticated LangGraph-based system for processing queries across documents and structured data using AI personas. The system features 8 specialized nodes that work together to provide accurate responses with citations and suggested follow-up queries.

## Architecture

### 8-Node LangGraph System

1. **Router Node** - Routes queries to appropriate processing nodes based on intent classification
2. **Document Node** - Handles document retrieval using Pinecone vector search with OCR screenshots
3. **Database Node** - Processes CSV data queries and structured data operations
4. **Math Node** - Performs mathematical operations like moving averages and trend analysis
5. **Persona Selector Node** - Routes requests to appropriate LLM personas (Financial Analyst, Legal Advisor, General Assistant)
6. **Suggestion Node** - Generates follow-up query suggestions to maintain conversational flow
7. **Answer Formatter Node** - Assembles final responses with metadata and citations

### Key Features

- **Multi-Knowledge Base Integration**: PDFs and CSV files stored in folders (no traditional database)
- **AI Personas**: Domain-specific LLM agents for different use cases
- **Accuracy-Driven RAG**: Vector search with page numbers and PDF screenshots
- **Real-time WebSocket Communication**: Live query processing updates
- **Mathematical Operations**: Dedicated Python nodes for calculations
- **File-based Storage**: Simple folder structure for uploaded files

## Installation

### Prerequisites

- Python 3.8+
- pip or conda
- (Optional) API keys for OpenAI, Anthropic, DeepSeek
- (Optional) Pinecone API key for vector storage

### Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

3. **Install Tesseract OCR** (for PDF processing)
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - macOS: `brew install tesseract`
   - Linux: `sudo apt-get install tesseract-ocr`

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# API Keys for LLM Providers
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=dynamic-agentic-systems

# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_DIR=uploads

# OCR Configuration
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe

# WebSocket Configuration
WEBSOCKET_HOST=localhost
WEBSOCKET_PORT=8001
```

## Running the Server

### Method 1: Using the startup script
```bash
cd backend
python start_server.py
```

### Method 2: Direct uvicorn
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Method 3: Using Python module
```bash
cd backend
python -m app.main
```

## API Endpoints

### Core Endpoints

- `POST /api/query` - Process queries through LangGraph pipeline
- `POST /api/upload` - Upload and process PDF/CSV files
- `GET /api/health` - Health check for all system components
- `GET /api/status` - Detailed system status and node information

### Persona Management

- `GET /api/personas` - List available personas
- `GET /api/personas/{name}` - Get persona information
- `POST /api/personas/{name}/update` - Update persona configuration

### File Management

- `GET /api/files` - List uploaded files
- File storage: `uploads/pdfs/` and `uploads/csvs/`

### WebSocket Endpoints

- `ws://localhost:8000/ws` - General WebSocket connection
- `ws://localhost:8000/ws/query` - Real-time query processing
- `ws://localhost:8000/ws/system` - System monitoring

## Usage Examples

### Query Processing

```python
import requests

# Process a mathematical query
response = requests.post("http://localhost:8000/api/query", json={
    "message": "Tell me the Moving Average of MSFT from March to May 2024",
    "persona": "Financial Analyst"
})

# Process a document query
response = requests.post("http://localhost:8000/api/query", json={
    "message": "What clause handles data breach retention?",
    "persona": "Legal Advisor"
})
```

### File Upload

```python
import requests

# Upload a PDF file
with open("document.pdf", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/upload",
        files={"file": f}
    )

# Upload a CSV file
with open("data.csv", "rb") as f:
    response = requests.post(
        "http://localhost:8000/api/upload", 
        files={"file": f}
    )
```

### WebSocket Real-time Query

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/query');

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'query',
        data: {
            message: 'Calculate the trend for AAPL stock',
            persona: 'Financial Analyst'
        }
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
```

## System Architecture

### Node Execution Flow

1. **Router Node** analyzes query intent and determines required processing nodes
2. **Persona Selector Node** routes to appropriate LLM based on selected persona
3. **Document Node** searches vector database for relevant document chunks (if needed)
4. **Database Node** queries CSV files for structured data (if needed)
5. **Math Node** performs calculations on retrieved data (if needed)
6. **Suggestion Node** generates follow-up queries using LLM
7. **Answer Formatter Node** assembles final response with all metadata

### File Processing

- **PDF Files**: Chunked, OCR processed for screenshots, indexed in Pinecone
- **CSV Files**: Loaded into pandas DataFrames for querying and analysis
- **Storage**: Simple folder structure in `uploads/pdfs/` and `uploads/csvs/`

### Real-time Communication

- WebSocket connections provide live updates during query processing
- Each node reports progress and completion status
- Clients receive real-time traces of the processing pipeline

## Development

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── api_routes.py        # REST API endpoints
│   └── websocket_routes.py  # WebSocket endpoints
├── models/
│   ├── __init__.py
│   └── schemas.py           # Pydantic models
├── nodes/
│   ├── __init__.py
│   ├── base_node.py         # Base node class
│   ├── router_node.py       # Query routing
│   ├── document_node.py     # Document processing
│   ├── database_node.py     # CSV processing
│   ├── math_node.py         # Mathematical operations
│   ├── persona_selector_node.py  # LLM routing
│   ├── suggestion_node.py   # Query suggestions
│   └── answer_formatter_node.py  # Response formatting
├── services/
│   ├── __init__.py
│   ├── pinecone_service.py  # Vector database
│   ├── pdf_service.py       # PDF processing
│   ├── csv_service.py       # CSV processing
│   ├── llm_service.py       # LLM management
│   └── websocket_service.py # WebSocket management
├── utils/
│   ├── __init__.py
│   └── langgraph_orchestrator.py  # Node orchestration
├── uploads/
│   ├── pdfs/               # PDF file storage
│   └── csvs/               # CSV file storage
├── requirements.txt
├── env.example
├── start_server.py
└── README.md
```

### Adding New Nodes

1. Create new node class inheriting from `BaseNode`
2. Implement the `process` method
3. Add to orchestrator's execution graph
4. Update routing logic in `RouterNode`

### Testing

```bash
# Run health check
curl http://localhost:8000/api/health

# Test query processing
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"message": "Test query", "persona": "General Assistant"}'
```

## Troubleshooting

### Common Issues

1. **Tesseract not found**: Install Tesseract OCR and update `TESSERACT_PATH` in `.env`
2. **API key errors**: Ensure all required API keys are set in `.env`
3. **Pinecone connection issues**: Verify Pinecone API key and environment
4. **File upload errors**: Check file size limits and upload directory permissions

### Logs

- Application logs: `backend.log`
- Console output: Real-time logging to stdout
- Log level: Configurable via environment

## Performance Considerations

- **File Processing**: Large PDFs are processed in chunks
- **Vector Search**: Pinecone provides fast similarity search
- **Mathematical Operations**: Offloaded to dedicated Python nodes
- **Caching**: CSV files are cached in memory for faster access
- **Concurrency**: FastAPI handles multiple concurrent requests

## Security

- **API Keys**: Stored in environment variables
- **File Uploads**: Size limits and type validation
- **CORS**: Configured for frontend origins
- **WebSocket**: Connection management and cleanup

## Contributing

1. Follow the existing code structure
2. Add proper error handling and logging
3. Update documentation for new features
4. Test with various file types and query patterns

## License

This project is part of the Dynamic Agentic Systems implementation. 