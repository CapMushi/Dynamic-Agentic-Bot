"""
Main FastAPI Application
Phase 4: LangGraph Architecture Implementation
"""

import logging
import sys
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from fastapi.middleware.gzip import GZipMiddleware  # type: ignore
from utils.logger import system_logger

from app.config import settings
from app.api_routes import api_router
from app.websocket_routes import websocket_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('backend.log')
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    start_time = time.time()
    
    # Startup
    system_logger.startup("1.0.0", {
        "host": settings.host,
        "port": settings.port,
        "debug": settings.debug
    })
    
    # Initialize services
    await startup_services()
    
    startup_duration = time.time() - start_time
    system_logger.logger.info(f"Backend startup completed in {startup_duration:.2f}s", "SYSTEM")
    
    yield
    
    # Shutdown
    system_logger.shutdown("Application shutdown")
    
    # Cleanup services
    await shutdown_services()
    
    system_logger.logger.info("Backend shutdown completed", "SYSTEM")


async def startup_services():
    """Initialize all services on startup"""
    try:
        # Initialize Pinecone service
        from services.pinecone_service import pinecone_service
        logger.info("Pinecone service initialized")
        
        # Initialize LLM service
        from services.llm_service import llm_service
        logger.info("LLM service initialized")
        
        # Initialize WebSocket service
        from services.websocket_service import websocket_service
        logger.info("WebSocket service initialized")
        
        # Initialize orchestrator
        from utils.langgraph_orchestrator import get_orchestrator
        orchestrator = get_orchestrator()
        health_status = await orchestrator.health_check()
        logger.info(f"LangGraph orchestrator initialized - Health: {health_status['orchestrator']}")
        
        # Create upload directories
        from app.config import get_pdf_upload_path, get_csv_upload_path
        import os
        os.makedirs(get_pdf_upload_path(), exist_ok=True)
        os.makedirs(get_csv_upload_path(), exist_ok=True)
        logger.info("Upload directories created")
        
    except Exception as e:
        logger.error(f"Error during service startup: {str(e)}")
        raise


async def shutdown_services():
    """Cleanup services on shutdown"""
    try:
        # Cleanup WebSocket connections
        from services.websocket_service import websocket_service
        await websocket_service.cleanup_old_sessions(0)  # Cleanup all sessions
        logger.info("WebSocket connections cleaned up")
        
        # Reset orchestrator nodes
        from utils.langgraph_orchestrator import get_orchestrator
        orchestrator = get_orchestrator()
        orchestrator.reset_nodes()
        logger.info("Orchestrator nodes reset")
        
    except Exception as e:
        logger.error(f"Error during service shutdown: {str(e)}")


# Create FastAPI application
app = FastAPI(
    title="Dynamic Agentic Systems Backend",
    description="LangGraph-based backend for document processing and AI query handling",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(api_router)
app.include_router(websocket_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Dynamic Agentic Systems Backend",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "api": "/api",
            "websocket": "/ws",
            "docs": "/docs",
            "health": "/api/health"
        }
    }


@app.get("/ping")
async def ping():
    """Simple ping endpoint for health checks"""
    system_logger.health_check("ok", time.time(), 0)
    return {"status": "ok", "message": "pong"}


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found",
            "status_code": 404
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(exc)}")
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An internal server error occurred",
            "status_code": 500
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting server on {settings.host}:{settings.port}")
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    ) 