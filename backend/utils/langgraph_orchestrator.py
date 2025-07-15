"""
LangGraph Orchestrator for Node Execution Management
Phase 4: LangGraph Architecture Implementation
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

# Nodes and services will be imported lazily to avoid circular dependencies
from models.schemas import QueryRequest, QueryResponse, QueryTrace

logger = logging.getLogger(__name__)


class LangGraphOrchestrator:
    """Orchestrator for managing LangGraph node execution flow"""
    
    def __init__(self):
        # Initialize nodes lazily to avoid circular imports
        self.nodes = {}
        self._nodes_initialized = False
        
        # Define node execution order based on dependencies
        self.execution_graph = {
            "router": [],  # No dependencies
            "persona_selector": ["router"],
            "document": ["router"],
            "database": ["router"],
            "math": ["database"],
            "suggestion": ["persona_selector"],
            "answer_formatter": ["persona_selector", "suggestion", "document", "database", "math"]
        }
        
        self.current_session = None
    
    def _initialize_nodes(self):
        """Initialize all nodes with lazy imports to avoid circular dependencies"""
        if self._nodes_initialized:
            return
        
        # Lazy import all node classes
        from nodes.router_node import RouterNode
        from nodes.document_node import DocumentNode
        from nodes.database_node import DatabaseNode
        from nodes.math_node import MathNode
        from nodes.persona_selector_node import PersonaSelectorNode
        from nodes.suggestion_node import SuggestionNode
        from nodes.answer_formatter_node import AnswerFormatterNode
        
        # Initialize all nodes
        self.nodes = {
            "router": RouterNode(),
            "document": DocumentNode(),
            "database": DatabaseNode(),
            "math": MathNode(),
            "persona_selector": PersonaSelectorNode(),
            "suggestion": SuggestionNode(),
            "answer_formatter": AnswerFormatterNode()
        }
        
        self._nodes_initialized = True
    
    async def process_query(self, request: QueryRequest, client_id: Optional[str] = None) -> QueryResponse:
        """Process query through the LangGraph pipeline"""
        
        # Initialize nodes if not already done
        self._initialize_nodes()
        
        # Start WebSocket session if client provided
        if client_id:
            from services.websocket_service import websocket_service
            self.current_session = await websocket_service.start_query_session(
                client_id, request.message, request.persona, "unknown"
            )
        
        try:
            # Initialize processing data
            processing_data = {
                "query": request.message,
                "persona": request.persona,
                "files": request.files or [],
                "start_time": datetime.now()
            }
            
            logger.info(f"Starting LangGraph processing for query: {request.message[:50]}...")
            
            # 1. Execute the Router Node first to get the routing path
            router_node = self.nodes["router"]
            router_result = await router_node.execute(processing_data)
            processing_data.update(router_result)
            
            # 2. Get the execution order from the router's result
            execution_order = processing_data.get("routing_path")
            if not execution_order:
                raise ValueError("Router did not return a valid 'routing_path'.")
            
            logger.info(f"Execution order determined by router: {execution_order}")

            # 3. Execute the remaining nodes in the determined order
            for node_name in execution_order:
                # The router has already been run
                if node_name == "router":
                    continue

                node = self.nodes[node_name]
                
                # Update WebSocket with node progress
                if self.current_session:
                    from services.websocket_service import websocket_service
                    trace = QueryTrace(
                        id=f"{node_name}_trace",
                        step=node.get_query_trace().step,
                        status="processing",
                        timestamp=datetime.now(),
                        duration=0
                    )
                    await websocket_service.update_query_progress(self.current_session, trace)
                
                # Execute node
                result = await node.execute(processing_data)
                
                # Update processing data with results
                processing_data.update(result)
                
                # Update WebSocket with completion
                if self.current_session:
                    from services.websocket_service import websocket_service
                    trace = node.get_query_trace()
                    await websocket_service.update_query_progress(self.current_session, trace)
                
                logger.info(f"Completed {node_name} node in {node.processing_time}ms")
            
            # Extract final response
            final_response = processing_data.get("final_response")
            
            if not final_response:
                raise ValueError("No final response generated")
            
            # Complete WebSocket session
            if self.current_session:
                from services.websocket_service import websocket_service
                await websocket_service.complete_query_session(
                    self.current_session, 
                    final_response.response
                )
            
            logger.info(f"LangGraph processing completed in {final_response.processingTime}ms")
            return final_response
            
        except Exception as e:
            logger.error(f"LangGraph processing failed: {str(e)}")
            
            # Handle error in WebSocket session
            if self.current_session:
                from services.websocket_service import websocket_service
                await websocket_service.error_query_session(self.current_session, str(e))
            
            # Return error response
            return QueryResponse(
                response=f"I apologize, but I encountered an error while processing your request: {str(e)}",
                queryType="conversational",
                citations=[],
                suggestedQueries=[],
                processingTrace=[],
                processingTime=1000
            )
    
    def _determine_execution_order(self, processing_data: Dict[str, Any]) -> List[str]:
        """
        DEPRECATED: This method is no longer used for determining execution order.
        The router node is now responsible for this logic.
        Keeping the method for now to avoid breaking other parts of the system that might reference it.
        """
        logger.warning("'_determine_execution_order' is deprecated and should not be relied upon.")
        # Fallback logic, though it shouldn't be used in the main query processing flow anymore.
        return ["router", "persona_selector", "document", "suggestion", "answer_formatter"]
    
    async def execute_node_parallel(self, node_names: List[str], processing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute multiple nodes in parallel"""
        
        # Initialize nodes if not already done
        self._initialize_nodes()
        
        # Create tasks for parallel execution
        tasks = []
        for node_name in node_names:
            if node_name in self.nodes:
                node = self.nodes[node_name]
                task = asyncio.create_task(node.execute(processing_data))
                tasks.append((node_name, task))
        
        # Wait for all tasks to complete
        results = {}
        for node_name, task in tasks:
            try:
                result = await task
                results[node_name] = result
            except Exception as e:
                logger.error(f"Error in parallel execution of {node_name}: {str(e)}")
                results[node_name] = {"error": str(e)}
        
        return results
    
    def validate_execution_dependencies(self, execution_order: List[str]) -> bool:
        """Validate that execution order respects node dependencies"""
        
        executed = set()
        
        for node_name in execution_order:
            if node_name not in self.execution_graph:
                logger.warning(f"Unknown node in execution order: {node_name}")
                continue
            
            # Check if all dependencies are satisfied
            dependencies = self.execution_graph[node_name]
            for dep in dependencies:
                if dep not in executed:
                    logger.error(f"Dependency violation: {node_name} requires {dep} but it hasn't been executed")
                    return False
            
            executed.add(node_name)
        
        return True
    
    def get_node_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all nodes"""
        self._initialize_nodes()
        status = {}
        
        for node_name, node in self.nodes.items():
            status[node_name] = {
                "node_type": node.node_type,
                "node_id": node.node_id,
                "status": node.status,
                "processing_time": node.processing_time,
                "error_message": node.error_message
            }
        
        return status
    
    def reset_nodes(self):
        """Reset all nodes to idle state"""
        self._initialize_nodes()
        for node in self.nodes.values():
            node.reset()
    
    def get_execution_graph(self) -> Dict[str, List[str]]:
        """Get the execution graph showing node dependencies"""
        return self.execution_graph.copy()
    
    def get_available_nodes(self) -> List[str]:
        """Get list of available node names"""
        self._initialize_nodes()
        return list(self.nodes.keys())
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all nodes"""
        self._initialize_nodes()
        health_status = {
            "orchestrator": "healthy",
            "nodes": {},
            "total_nodes": len(self.nodes),
            "healthy_nodes": 0,
            "timestamp": datetime.now().isoformat()
        }
        
        for node_name, node in self.nodes.items():
            try:
                # Simple health check - ensure node can be initialized
                node_health = {
                    "status": "healthy" if node.status != "error" else "error",
                    "node_type": node.node_type,
                    "last_processing_time": node.processing_time,
                    "error_message": node.error_message
                }
                
                if node_health["status"] == "healthy":
                    health_status["healthy_nodes"] += 1
                
                health_status["nodes"][node_name] = node_health
                
            except Exception as e:
                health_status["nodes"][node_name] = {
                    "status": "error",
                    "error": str(e)
                }
        
        # Overall health
        if health_status["healthy_nodes"] == health_status["total_nodes"]:
            health_status["orchestrator"] = "healthy"
        elif health_status["healthy_nodes"] > 0:
            health_status["orchestrator"] = "degraded"
        else:
            health_status["orchestrator"] = "unhealthy"
        
        return health_status


# Global orchestrator instance (lazy initialization)
_orchestrator_instance = None

def get_orchestrator():
    """Get the global orchestrator instance (lazy initialization)"""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = LangGraphOrchestrator()
    return _orchestrator_instance 