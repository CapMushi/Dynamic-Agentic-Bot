"""
Base Node for LangGraph Architecture
Phase 4: LangGraph Architecture Implementation
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime

from models.schemas import ProcessingNode, QueryTrace

logger = logging.getLogger(__name__)


class BaseNode(ABC):
    """Base class for all LangGraph nodes"""
    
    def __init__(self, node_type: str, node_id: Optional[str] = None):
        self.node_type = node_type
        self.node_id = node_id or f"{node_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.status = "idle"
        self.processing_time = 0
        self.error_message = None
        
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input data and return output"""
        pass
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute node processing with error handling and timing"""
        start_time = datetime.now()
        
        try:
            # Update status
            self.status = "processing"
            self.error_message = None
            
            logger.info(f"Starting {self.node_type} node processing")
            
            # Process input
            output_data = await self.process(input_data)
            
            # Update status
            self.status = "completed"
            self.processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            logger.info(f"Completed {self.node_type} node processing in {self.processing_time}ms")
            
            return output_data
            
        except Exception as e:
            # Handle error
            self.status = "error"
            self.error_message = str(e)
            self.processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            logger.error(f"Error in {self.node_type} node: {str(e)}")
            
            # Return error response
            return {
                "error": str(e),
                "node_type": self.node_type,
                "node_id": self.node_id
            }
    
    def get_processing_node(self) -> ProcessingNode:
        """Get current processing node state"""
        # Cast to proper types for schema validation
        node_type = self.node_type if self.node_type in ["router", "document", "database", "math", "persona_selector", "suggestion", "answer_formatter"] else "router"
        status = self.status if self.status in ["idle", "processing", "completed", "error"] else "idle"
        
        return ProcessingNode(
            node_id=self.node_id,
            node_type=node_type,
            status=status,
            input_data=None,
            output_data=None,
            error_message=self.error_message,
            processing_time=self.processing_time
        )
    
    def get_query_trace(self) -> QueryTrace:
        """Get query trace for this node"""
        # Map node types to trace step names
        step_mapping = {
            "router": "Router Node",
            "document": "Document Node",
            "database": "Database Node",
            "math": "Math Node",
            "persona_selector": "Persona Selector",
            "suggestion": "Suggestion Node",
            "answer_formatter": "Answer Formatter"
        }
        
        step = step_mapping.get(self.node_type, "Router Node")
        status = "completed" if self.status == "completed" else "processing" if self.status == "processing" else "error"
        
        return QueryTrace(
            id=self.node_id,
            step=step,
            status=status,
            timestamp=datetime.now(),
            duration=self.processing_time,
            details=self.error_message if self.error_message else None
        )
    
    def reset(self):
        """Reset node state"""
        self.status = "idle"
        self.processing_time = 0
        self.error_message = None
    
    def validate_input(self, input_data: Dict[str, Any], required_fields: list) -> bool:
        """Validate input data has required fields"""
        for field in required_fields:
            if field not in input_data:
                raise ValueError(f"Missing required field: {field}")
        return True
    
    def log_processing_step(self, step: str, details: Optional[str] = None):
        """Log processing step"""
        log_message = f"[{self.node_type}] {step}"
        if details:
            log_message += f": {details}"
        logger.info(log_message)
    
    async def simulate_processing_delay(self, min_delay: int = 100, max_delay: int = 500):
        """Simulate processing delay for realistic timing"""
        import random
        delay = random.randint(min_delay, max_delay) / 1000.0
        await asyncio.sleep(delay) 