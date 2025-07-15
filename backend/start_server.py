#!/usr/bin/env python3
"""
Startup script for Dynamic Agentic Systems Backend
Phase 4: LangGraph Architecture Implementation
"""

import os
import sys
import logging
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main startup function"""
    try:
        # Check if .env file exists
        env_file = backend_dir / ".env"
        if not env_file.exists():
            logger.warning("No .env file found. Copy env.example to .env and configure your API keys.")
            logger.info("The server will start but some features may not work without proper configuration.")
        
        # Import configuration and run the application
        from app.config import settings
        
        import uvicorn
        
        logger.info(f"Starting Dynamic Agentic Systems Backend on {settings.host}:{settings.port}")
        logger.info("Press Ctrl+C to stop the server")
        
        # Start the server with app import string
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 