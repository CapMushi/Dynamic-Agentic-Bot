"""
Server-side Logger Utility
Provides structured logging for backend with proper formatting and necessary information only
"""

import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path

class StructuredLogger:
    """Structured logger for backend operations"""
    
    def __init__(self, name: str, log_file: Optional[str] = None):
        self.name = name
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s [%(name)s] %(levelname)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler (optional)
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def _format_log(self, level: str, message: str, context: str = None, data: Dict[str, Any] = None) -> str:
        """Format log message with structured data"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "logger": self.name,
            "message": message,
            "context": context
        }
        
        if data:
            log_entry["data"] = data
            
        return json.dumps(log_entry, default=str)
    
    def info(self, message: str, context: str = None, data: Dict[str, Any] = None):
        """Log info message"""
        formatted = self._format_log("INFO", message, context, data)
        self.logger.info(formatted)
    
    def warn(self, message: str, context: str = None, data: Dict[str, Any] = None):
        """Log warning message"""
        formatted = self._format_log("WARN", message, context, data)
        self.logger.warning(formatted)
    
    def error(self, message: str, error: Exception = None, context: str = None, data: Dict[str, Any] = None):
        """Log error message"""
        if error:
            if not data:
                data = {}
            data["error_type"] = type(error).__name__
            data["error_message"] = str(error)
        
        formatted = self._format_log("ERROR", message, context, data)
        self.logger.error(formatted)
    
    def debug(self, message: str, context: str = None, data: Dict[str, Any] = None):
        """Log debug message"""
        formatted = self._format_log("DEBUG", message, context, data)
        self.logger.debug(formatted)

# API Request/Response Logging
class APILogger:
    """Specialized logger for API operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("API", "backend.log")
    
    def request(self, method: str, endpoint: str, client_ip: str = None, user_agent: str = None):
        """Log API request"""
        data = {
            "method": method,
            "endpoint": endpoint,
            "client_ip": client_ip,
            "user_agent": user_agent
        }
        self.logger.info(f"API Request: {method} {endpoint}", "API", data)
    
    def response(self, method: str, endpoint: str, status_code: int, duration: float):
        """Log API response"""
        data = {
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "duration_ms": round(duration * 1000, 2)
        }
        self.logger.info(f"API Response: {method} {endpoint} → {status_code}", "API", data)
    
    def error(self, method: str, endpoint: str, error: Exception, duration: float = None):
        """Log API error"""
        data = {
            "method": method,
            "endpoint": endpoint,
            "duration_ms": round(duration * 1000, 2) if duration else None
        }
        self.logger.error(f"API Error: {method} {endpoint}", error, "API", data)

# WebSocket Logging
class WebSocketLogger:
    """Specialized logger for WebSocket operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("WebSocket", "backend.log")
    
    def connection(self, client_id: str, client_ip: str = None):
        """Log WebSocket connection"""
        data = {"client_id": client_id, "client_ip": client_ip}
        self.logger.info(f"WebSocket connected: {client_id}", "WS", data)
    
    def disconnection(self, client_id: str, reason: str = None):
        """Log WebSocket disconnection"""
        data = {"client_id": client_id, "reason": reason}
        self.logger.info(f"WebSocket disconnected: {client_id}", "WS", data)
    
    def message(self, client_id: str, message_type: str, data_size: int = None):
        """Log WebSocket message"""
        data = {"client_id": client_id, "message_type": message_type, "data_size": data_size}
        self.logger.debug(f"WebSocket message: {message_type}", "WS", data)
    
    def error(self, client_id: str, error: Exception):
        """Log WebSocket error"""
        data = {"client_id": client_id}
        self.logger.error(f"WebSocket error for client: {client_id}", error, "WS", data)

# Query Processing Logging
class QueryLogger:
    """Specialized logger for query processing operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("Query", "backend.log")
    
    def start(self, query_id: str, message: str, persona: str, query_type: str):
        """Log query start"""
        data = {
            "query_id": query_id,
            "message_preview": message[:100] + "..." if len(message) > 100 else message,
            "persona": persona,
            "query_type": query_type
        }
        self.logger.info(f"Query started: {query_id}", "QUERY", data)
    
    def node_progress(self, query_id: str, node_name: str, status: str, duration: float = None):
        """Log node progress"""
        data = {
            "query_id": query_id,
            "node": node_name,
            "status": status,
            "duration_ms": round(duration * 1000, 2) if duration else None
        }
        self.logger.info(f"Node progress: {node_name} → {status}", "QUERY", data)
    
    def complete(self, query_id: str, success: bool, duration: float, response_length: int = None):
        """Log query completion"""
        data = {
            "query_id": query_id,
            "success": success,
            "duration_ms": round(duration * 1000, 2),
            "response_length": response_length
        }
        self.logger.info(f"Query completed: {query_id}", "QUERY", data)
    
    def error(self, query_id: str, error: Exception, node_name: str = None):
        """Log query error"""
        data = {"query_id": query_id, "node": node_name}
        self.logger.error(f"Query failed: {query_id}", error, "QUERY", data)

# File Processing Logging
class FileLogger:
    """Specialized logger for file processing operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("File", "backend.log")
    
    def upload_start(self, file_id: str, filename: str, file_size: int, file_type: str):
        """Log file upload start"""
        data = {
            "file_id": file_id,
            "filename": filename,
            "file_size": file_size,
            "file_type": file_type
        }
        self.logger.info(f"File upload started: {filename}", "FILE", data)
    
    def processing_progress(self, file_id: str, stage: str, progress: int = None):
        """Log file processing progress"""
        data = {"file_id": file_id, "stage": stage, "progress": progress}
        self.logger.info(f"File processing: {stage}", "FILE", data)
    
    def processing_complete(self, file_id: str, filename: str, chunks: int, duration: float):
        """Log file processing completion"""
        data = {
            "file_id": file_id,
            "filename": filename,
            "chunks": chunks,
            "duration_ms": round(duration * 1000, 2)
        }
        self.logger.info(f"File processing completed: {filename}", "FILE", data)
    
    def error(self, file_id: str, filename: str, error: Exception, stage: str = None):
        """Log file processing error"""
        data = {"file_id": file_id, "filename": filename, "stage": stage}
        self.logger.error(f"File processing failed: {filename}", error, "FILE", data)

# LangGraph Node Logging
class NodeLogger:
    """Specialized logger for LangGraph node operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("Node", "backend.log")
    
    def node_start(self, node_name: str, query_id: str, input_data: Dict[str, Any] = None):
        """Log node execution start"""
        data = {
            "node": node_name,
            "query_id": query_id,
            "has_input": bool(input_data)
        }
        self.logger.info(f"Node started: {node_name}", "NODE", data)
    
    def node_complete(self, node_name: str, query_id: str, duration: float, success: bool):
        """Log node execution completion"""
        data = {
            "node": node_name,
            "query_id": query_id,
            "duration_ms": round(duration * 1000, 2),
            "success": success
        }
        self.logger.info(f"Node completed: {node_name}", "NODE", data)
    
    def node_error(self, node_name: str, query_id: str, error: Exception):
        """Log node execution error"""
        data = {"node": node_name, "query_id": query_id}
        self.logger.error(f"Node failed: {node_name}", error, "NODE", data)

# System Logging
class SystemLogger:
    """Specialized logger for system operations"""
    
    def __init__(self):
        self.logger = StructuredLogger("System", "backend.log")
    
    def startup(self, version: str, config: Dict[str, Any] = None):
        """Log system startup"""
        data = {"version": version, "config": config}
        self.logger.info("System startup", "SYSTEM", data)
    
    def shutdown(self, reason: str = None):
        """Log system shutdown"""
        data = {"reason": reason}
        self.logger.info("System shutdown", "SYSTEM", data)
    
    def health_check(self, status: str, uptime: float, active_connections: int):
        """Log health check"""
        data = {
            "status": status,
            "uptime_seconds": uptime,
            "active_connections": active_connections
        }
        self.logger.info("Health check", "SYSTEM", data)
    
    def error(self, component: str, error: Exception):
        """Log system error"""
        data = {"component": component}
        self.logger.error(f"System error in {component}", error, "SYSTEM", data)

# Global logger instances
api_logger = APILogger()
ws_logger = WebSocketLogger()
query_logger = QueryLogger()
file_logger = FileLogger()
node_logger = NodeLogger()
system_logger = SystemLogger()

# Convenience function for general logging
def get_logger(name: str) -> StructuredLogger:
    """Get a logger instance by name"""
    return StructuredLogger(name, "backend.log") 