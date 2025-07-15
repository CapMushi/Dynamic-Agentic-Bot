"""
Configuration management for Dynamic Agentic Systems Backend
Phase 4: LangGraph Architecture Implementation
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings  # type: ignore
from pydantic import Field  # type: ignore


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # API Keys for LLM Providers
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")
    deepseek_api_key: Optional[str] = Field(None, env="DEEPSEEK_API_KEY")
    
    # Pinecone Configuration
    pinecone_api_key: Optional[str] = Field(None, env="PINECONE_API_KEY")
    pinecone_environment: str = Field("us-east-1", env="PINECONE_ENVIRONMENT")
    pinecone_index_name: str = Field("agent", env="PINECONE_INDEX_NAME")
    
    # FastAPI Configuration
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8000, env="PORT")
    debug: bool = Field(True, env="DEBUG")
    
    # File Upload Configuration
    max_file_size: str = Field("50MB", env="MAX_FILE_SIZE")
    upload_dir: str = Field("uploads", env="UPLOAD_DIR")
    
    # OCR Configuration
    tesseract_path: str = Field("tesseract", env="TESSERACT_PATH")
    
    # WebSocket Configuration
    websocket_host: str = Field("localhost", env="WEBSOCKET_HOST")
    websocket_port: int = Field(8001, env="WEBSOCKET_PORT")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings


def get_upload_path(file_type: str) -> str:
    """Get upload path for specific file type"""
    base_path = os.path.join(settings.upload_dir, file_type)
    os.makedirs(base_path, exist_ok=True)
    return base_path


def get_pdf_upload_path() -> str:
    """Get PDF upload path"""
    return get_upload_path("pdfs")


def get_csv_upload_path() -> str:
    """Get CSV upload path"""
    return get_upload_path("csvs")


def get_preview_path() -> str:
    """Get preview path for PDF images"""
    return get_upload_path("preview") 