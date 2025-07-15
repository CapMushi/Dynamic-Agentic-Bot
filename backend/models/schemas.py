"""
Pydantic schemas for Dynamic Agentic Systems Backend
Phase 4: LangGraph Architecture Implementation
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Literal, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar('T')


class QueryRequest(BaseModel):
    """Request model for query processing"""
    message: str = Field(..., description="The user's query message")
    persona: str = Field(..., description="Selected persona (Financial Analyst, Legal Advisor, General Assistant)")
    files: Optional[List[str]] = Field(None, description="List of file IDs to include in processing")


class Citation(BaseModel):
    """Citation model for document references"""
    title: str = Field(..., description="Document title")
    page: int = Field(..., description="Page number")
    section: str = Field(..., description="Document section")
    content: Optional[str] = Field(None, description="The actual text content of the citation chunk")
    screenshot: Optional[str] = Field(None, description="Base64 encoded screenshot")
    confidence: Optional[float] = Field(None, description="Confidence score")


class SuggestedQuery(BaseModel):
    """Suggested follow-up query model"""
    id: str = Field(..., description="Unique identifier")
    text: str = Field(..., description="Suggested query text")
    category: Literal["mathematical", "factual", "conversational"] = Field(..., description="Query category")
    confidence: float = Field(..., description="Confidence score")


class QueryTrace(BaseModel):
    """Query processing trace model"""
    id: str = Field(..., description="Trace step identifier")
    step: Literal[
        "Router Node", 
        "Document Node", 
        "Database Node", 
        "Math Node", 
        "Persona Selector", 
        "Suggestion Node", 
        "Answer Formatter"
    ] = Field(..., description="Processing step name")
    status: Literal["processing", "completed", "error"] = Field(..., description="Step status")
    timestamp: datetime = Field(..., description="Step timestamp")
    duration: Optional[int] = Field(None, description="Processing duration in milliseconds")
    details: Optional[str] = Field(None, description="Additional step details")


class QueryResponse(BaseModel):
    """Response model for query processing"""
    response: str = Field(..., description="Generated response")
    queryType: Literal["mathematical", "factual", "conversational"] = Field(..., description="Detected query type")
    citations: Optional[List[Citation]] = Field(None, description="Document citations")
    suggestedQueries: Optional[List[SuggestedQuery]] = Field(None, description="Follow-up suggestions")
    processingTrace: Optional[List[QueryTrace]] = Field(None, description="Processing trace")
    processingTime: int = Field(..., description="Total processing time in milliseconds")


class FileUploadResponse(BaseModel):
    """Response model for file upload"""
    id: str = Field(..., description="File identifier")
    name: str = Field(..., description="File name")
    type: Literal["pdf", "csv", "database"] = Field(..., description="File type")
    status: Literal["processing", "completed", "error"] = Field(..., description="Processing status")
    chunks: Optional[int] = Field(None, description="Number of chunks created")
    indexed: Optional[bool] = Field(None, description="Whether file is indexed")
    processingTime: Optional[int] = Field(None, description="Processing time in milliseconds")
    extractedSections: Optional[List[str]] = Field(None, description="Extracted document sections")


class PersonaConfig(BaseModel):
    """Persona configuration model"""
    id: str = Field(..., description="Persona identifier")
    name: Literal["Financial Analyst", "Legal Advisor", "General Assistant"] = Field(..., description="Persona name")
    provider: str = Field(..., description="LLM provider")
    active: bool = Field(..., description="Whether persona is active")
    color: str = Field(..., description="UI color")
    apiKey: Optional[str] = Field(None, description="API key for provider")
    model: Optional[str] = Field(None, description="Specific model to use")


class WebSocketMessage(BaseModel):
    """WebSocket message model"""
    id: str = Field(..., description="Message identifier")
    type: Literal["query_start", "node_progress", "query_complete", "error"] = Field(..., description="Message type")
    data: Dict[str, Any] = Field(..., description="Message data")
    timestamp: datetime = Field(..., description="Message timestamp")


class ProcessingNode(BaseModel):
    """Processing node state model"""
    node_id: str = Field(..., description="Node identifier")
    node_type: Literal[
        "router", 
        "document", 
        "database", 
        "math", 
        "persona_selector", 
        "suggestion", 
        "answer_formatter"
    ] = Field(..., description="Node type")
    status: Literal["idle", "processing", "completed", "error"] = Field(..., description="Node status")
    input_data: Optional[Dict[str, Any]] = Field(None, description="Node input data")
    output_data: Optional[Dict[str, Any]] = Field(None, description="Node output data")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    processing_time: Optional[int] = Field(None, description="Processing time in milliseconds")


class DocumentChunk(BaseModel):
    """Document chunk model for vector storage"""
    id: str = Field(..., description="Chunk identifier")
    content: str = Field(..., description="Chunk content")
    title: str = Field(..., description="Document title")
    page: int = Field(..., description="Page number")
    section: str = Field(..., description="Document section")
    screenshot: Optional[str] = Field(None, description="Base64 encoded screenshot")
    embedding: Optional[List[float]] = Field(None, description="Vector embedding")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class MathOperation(BaseModel):
    """Mathematical operation model"""
    operation_type: Literal["moving_average", "trend_analysis", "threshold_check", "calculation"] = Field(..., description="Type of math operation")
    data_source: str = Field(..., description="Data source identifier")
    parameters: Dict[str, Any] = Field(..., description="Operation parameters")
    result: Optional[Dict[str, Any]] = Field(None, description="Operation result")


class DatabaseQuery(BaseModel):
    """Database query model for CSV processing"""
    query_type: Literal["select", "filter", "aggregate", "join"] = Field(..., description="Query type")
    file_path: str = Field(..., description="CSV file path")
    query_params: Dict[str, Any] = Field(..., description="Query parameters")
    result: Optional[Dict[str, Any]] = Field(None, description="Query result")


class ApiResponse(BaseModel, Generic[T]):
    """Generic API response wrapper"""
    data: T = Field(..., description="Response data")
    success: bool = Field(..., description="Success status")
    error: Optional[str] = Field(None, description="Error message")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")


class PersonaResponse(BaseModel):
    """Response model for persona information"""
    personas: List[Dict[str, str]] = Field(..., description="List of available personas")


class StatusResponse(BaseModel):
    """Response model for system status"""
    status: str = Field(..., description="System status")
    uptime: int = Field(..., description="System uptime in seconds")
    active_connections: int = Field(..., description="Number of active connections")
    total_queries: int = Field(..., description="Total queries processed")


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str = Field(..., description="Health status")
    timestamp: str = Field(..., description="Timestamp")
    version: str = Field(..., description="API version") 