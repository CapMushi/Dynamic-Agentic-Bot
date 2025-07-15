"""
API Routes for Dynamic Agentic Systems Backend
Phase 4: LangGraph Architecture Implementation
"""

import logging
import time
import os
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Request, Response  # type: ignore
from fastapi.responses import JSONResponse, FileResponse  # type: ignore
from utils.logger import api_logger, query_logger, file_logger

from models.schemas import (
    QueryRequest, 
    QueryResponse, 
    FileUploadResponse, 
    PersonaConfig, 
    ApiResponse
)
from utils.langgraph_orchestrator import get_orchestrator
from services.pdf_service import pdf_service
from services.csv_service import csv_service
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

# Create API router
api_router = APIRouter(prefix="/api", tags=["api"])

# Get orchestrator instance
orchestrator = get_orchestrator()


@api_router.post("/query", response_model=ApiResponse[QueryResponse])
async def process_query(request: QueryRequest, http_request: Request):
    """Process query through LangGraph pipeline"""
    start_time = time.time()
    query_id = f"query_{int(start_time * 1000)}"
    
    try:
        # Log API request
        client_ip = http_request.client.host if http_request.client else None
        user_agent = http_request.headers.get("user-agent")
        api_logger.request("POST", "/api/query", client_ip, user_agent)
        
        # Log query start
        query_logger.start(query_id, request.message, request.persona, "unknown")
        
        # Process query through orchestrator
        result = await orchestrator.process_query(request)
        
        duration = time.time() - start_time
        api_logger.response("POST", "/api/query", 200, duration)
        query_logger.complete(query_id, True, duration, len(result.response))
        
        return ApiResponse(
            data=result,
            success=True,
            timestamp=result.processingTrace[0].timestamp if result.processingTrace else None
        )
        
    except Exception as e:
        duration = time.time() - start_time
        api_logger.error("POST", "/api/query", e, duration)
        query_logger.error(query_id, e)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/upload", response_model=ApiResponse[FileUploadResponse])
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), http_request: Request = None):
    """Upload and process file (PDF or CSV)"""
    start_time = time.time()
    file_id = f"file_{int(start_time * 1000)}"
    
    try:
        # Log file upload start
        file_logger.upload_start(file_id, file.filename, file.size, file.content_type)
        
        if http_request:
            client_ip = http_request.client.host if http_request.client else None
            user_agent = http_request.headers.get("user-agent")
            api_logger.request("POST", "/api/upload", client_ip, user_agent)
        
        # Read file content
        content = await file.read()
        
        # Determine file type and process accordingly
        if file.filename.endswith('.pdf'):
            file_logger.processing_progress(file_id, "PDF processing")
            # Save PDF file
            file_path = await pdf_service.save_uploaded_file(content, file.filename)
            
            # Process PDF and index chunks synchronously
            result = await pdf_service.process_pdf_file(file_path, file.filename)
            
            # Index document chunks synchronously
            if result.status == "completed":
                await index_pdf_chunks(file_path, file.filename)
            
        elif file.filename.endswith('.csv'):
            file_logger.processing_progress(file_id, "CSV processing")
            # Save CSV file
            file_path = await csv_service.save_uploaded_file(content, file.filename)
            
            # Process CSV
            result = await csv_service.process_csv_file(file_path, file.filename)
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and CSV files are supported.")
        
        duration = time.time() - start_time
        file_logger.processing_complete(file_id, file.filename, result.chunks or 0, duration)
        
        if http_request:
            api_logger.response("POST", "/api/upload", 200, duration)
        
        return ApiResponse(
            data=result,
            success=True
        )
        
    except Exception as e:
        duration = time.time() - start_time
        file_logger.error(file_id, file.filename, e)
        
        if http_request:
            api_logger.error("POST", "/api/upload", e, duration)
        
        raise HTTPException(status_code=500, detail=str(e))


async def index_pdf_chunks(file_path: str, file_name: str):
    """Background task to index PDF chunks in Pinecone"""
    try:
        # Extract text chunks
        chunks = await pdf_service._extract_text_chunks(file_path, file_name)
        
        # Store in Pinecone (lazy import to avoid circular dependency)
        from services.pinecone_service import pinecone_service
        success = await pinecone_service.store_document_chunks(chunks)
        
        if success:
            logger.info(f"Successfully indexed {len(chunks)} chunks for {file_name}")
        else:
            logger.error(f"Failed to index chunks for {file_name}")
            
    except Exception as e:
        logger.error(f"Background indexing failed for {file_name}: {str(e)}")


@api_router.get("/personas", response_model=ApiResponse[List[str]])
async def get_personas():
    """Get available personas"""
    try:
        personas = ["Financial Analyst", "Legal Advisor", "General Assistant"]
        
        return ApiResponse(
            data=personas,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Failed to get personas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/personas/{persona_name}", response_model=ApiResponse[Dict[str, Any]])
async def get_persona_info(persona_name: str):
    """Get information about a specific persona"""
    try:
        persona_info = llm_service.get_persona_info(persona_name)
        
        if not persona_info:
            raise HTTPException(status_code=404, detail=f"Persona '{persona_name}' not found")
        
        return ApiResponse(
            data=persona_info,
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get persona info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/personas/{persona_name}/update", response_model=ApiResponse[Dict[str, str]])
async def update_persona(persona_name: str, config: PersonaConfig):
    """Update persona configuration"""
    try:
        success = await llm_service.update_persona_config(persona_name, config)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Persona '{persona_name}' not found")
        
        return ApiResponse(
            data={"message": f"Persona '{persona_name}' updated successfully"},
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update persona: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/health", response_model=ApiResponse[Dict[str, Any]])
async def health_check():
    """Health check endpoint"""
    try:
        health_status = await orchestrator.health_check()
        
        return ApiResponse(
            data=health_status,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/status", response_model=ApiResponse[Dict[str, Any]])
async def get_system_status():
    """Get system status including node information"""
    try:
        node_status = orchestrator.get_node_status()
        execution_graph = orchestrator.get_execution_graph()
        available_nodes = orchestrator.get_available_nodes()
        
        # Get Pinecone stats (lazy import to avoid circular dependency)
        from services.pinecone_service import pinecone_service
        pinecone_stats = await pinecone_service.get_index_stats()
        
        # Get LLM providers
        llm_providers = llm_service.get_available_providers()
        
        status = {
            "nodes": node_status,
            "execution_graph": execution_graph,
            "available_nodes": available_nodes,
            "pinecone_stats": pinecone_stats,
            "llm_providers": llm_providers,
            "system_health": "operational"
        }
        
        return ApiResponse(
            data=status,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Failed to get system status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/reset", response_model=ApiResponse[Dict[str, str]])
async def reset_system():
    """Reset all nodes to idle state"""
    try:
        orchestrator.reset_nodes()
        
        return ApiResponse(
            data={"message": "System reset successfully"},
            success=True
        )
        
    except Exception as e:
        logger.error(f"Failed to reset system: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/files", response_model=ApiResponse[Dict[str, Any]])
async def get_uploaded_files():
    """Get information about uploaded files"""
    try:
        import os
        from app.config import get_pdf_upload_path, get_csv_upload_path
        
        files_info = {
            "pdf_files": [],
            "csv_files": []
        }
        
        # Get PDF files
        pdf_path = get_pdf_upload_path()
        if os.path.exists(pdf_path):
            for file in os.listdir(pdf_path):
                if file.endswith('.pdf'):
                    file_path = os.path.join(pdf_path, file)
                    stat = os.stat(file_path)
                    files_info["pdf_files"].append({
                        "name": file,
                        "size": stat.st_size,
                        "modified": stat.st_mtime
                    })
        
        # Get CSV files
        csv_path = get_csv_upload_path()
        if os.path.exists(csv_path):
            for file in os.listdir(csv_path):
                if file.endswith('.csv'):
                    file_path = os.path.join(csv_path, file)
                    stat = os.stat(file_path)
                    files_info["csv_files"].append({
                        "name": file,
                        "size": stat.st_size,
                        "modified": stat.st_mtime
                    })
        
        return ApiResponse(
            data=files_info,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Failed to get uploaded files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/files/pdf/{filename}")
async def serve_pdf(filename: str):
    """Serve PDF files for preview"""
    try:
        print(f"=== PDF SERVE DEBUG ===")
        print(f"Request for PDF: {filename}")
        
        # URL decode the filename to handle spaces and special characters
        import urllib.parse
        decoded_filename = urllib.parse.unquote(filename)
        print(f"Decoded filename: {decoded_filename}")
        
        # Security: Only allow PDF files and sanitize filename
        if not decoded_filename.endswith('.pdf'):
            print(f"ERROR: Invalid file type - {decoded_filename}")
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Construct file path using decoded filename
        file_path = os.path.join("uploads", "pdfs", decoded_filename)
        print(f"Looking for file at: {file_path}")
        print(f"Absolute path: {os.path.abspath(file_path)}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"ERROR: File not found at {file_path}")
            
            # List directory contents for debugging
            uploads_dir = os.path.join("uploads", "pdfs")
            if os.path.exists(uploads_dir):
                print(f"Contents of {uploads_dir}:")
                for item in os.listdir(uploads_dir):
                    print(f"  - {item}")
            else:
                print(f"Uploads directory does not exist: {uploads_dir}")
                
            raise HTTPException(status_code=404, detail="PDF file not found")
        
        # Check file size and permissions
        file_size = os.path.getsize(file_path)
        file_permissions = oct(os.stat(file_path).st_mode)[-3:]
        print(f"File exists! Size: {file_size} bytes, Permissions: {file_permissions}")
        
        print(f"Serving PDF file: {decoded_filename}")
        print(f"=====================")
        
        # Return file response with proper headers including CORS
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=decoded_filename,
            headers={
                "Content-Disposition": f"inline; filename=\"{decoded_filename}\"",
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR serving PDF {filename}: {str(e)}")
        logger.error(f"Failed to serve PDF {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to serve PDF file")


@api_router.options("/files/pdf/{filename}")
async def serve_pdf_options(filename: str):
    """Handle OPTIONS requests for PDF files (CORS preflight)"""
    return Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )


@api_router.get("/files/preview/{filename}/{page}")
@api_router.head("/files/preview/{filename}/{page}")
async def serve_preview_image(filename: str, page: int):
    """Serve preview images for PDF pages"""
    try:
        # URL decode the filename to handle spaces and special characters
        import urllib.parse
        decoded_filename = urllib.parse.unquote(filename)
        
        # Security: Only allow PDF files and sanitize filename
        if not decoded_filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Construct preview directory path
        pdf_name = decoded_filename.replace('.pdf', '')
        preview_dir = os.path.join("uploads", "preview", pdf_name)
        image_path = os.path.join(preview_dir, f"page_{page}.png")
        
        # Check if image exists
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Preview image not found")
        
        # Return image response with proper headers
        return FileResponse(
            path=image_path,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to serve preview image {filename} page {page}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to serve preview image")


@api_router.options("/files/preview/{filename}/{page}")
async def serve_preview_image_options(filename: str, page: int):
    """Handle OPTIONS requests for preview images (CORS preflight)"""
    return Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    ) 