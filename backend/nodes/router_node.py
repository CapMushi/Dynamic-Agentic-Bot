"""
Router Node for Query Intent Classification and Routing
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any, List

from .base_node import BaseNode

logger = logging.getLogger(__name__)


class RouterNode(BaseNode):
    """Router node that classifies query intent and determines processing path"""
    
    def __init__(self):
        super().__init__("router")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process query routing based on intent classification"""
        
        # Validate input
        self.validate_input(input_data, ["query", "persona"])
        
        query = input_data["query"]
        persona = input_data["persona"]
        
        self.log_processing_step("Starting query analysis", f"Query: {query[:50]}...")
        
        # Classify query intent (lazy import to avoid circular dependency)
        from services.llm_service import llm_service
        intent_analysis = await llm_service.classify_query_intent(query)
        
        query_type = intent_analysis["query_type"]
        required_nodes = intent_analysis["required_nodes"]
        confidence = intent_analysis["confidence"]
        estimated_duration = intent_analysis["estimated_duration"]
        
        self.log_processing_step("Query classification complete", f"Type: {query_type}, Confidence: {confidence}")
        
        # Determine routing path
        routing_path = self._determine_routing_path(query_type, required_nodes)
        
        # Add processing delay for realism
        await self.simulate_processing_delay(100, 300)
        
        return {
            "query": query,
            "persona": persona,
            "query_type": query_type,
            "confidence": confidence,
            "estimated_duration": estimated_duration,
            "routing_path": routing_path,
            "required_nodes": required_nodes,
            "router_analysis": {
                "intent_keywords": self._extract_intent_keywords(query),
                "complexity_score": self._calculate_complexity_score(query),
                "data_sources_needed": self._identify_data_sources(query, query_type)
            }
        }
    
    def _determine_routing_path(self, query_type: str, required_nodes: List[str]) -> List[str]:
        """Determine the optimal routing path for the query"""
        
        # Base path always includes persona selector
        base_path = ["persona_selector"]
        
        # Add processing nodes based on query type
        if query_type == "mathematical":
            base_path.extend(["database", "math"])
        elif query_type == "factual":
            base_path.append("document")
        elif query_type == "conversational":
            # For conversational queries, we might need both document and database
            base_path.extend(["document", "database"])
        
        # Add answer formatter to generate the response first
        base_path.append("answer_formatter")
        
        # Then add suggestion generation based on the response
        base_path.append("suggestion")
        
        # Remove duplicates while preserving order
        seen = set()
        routing_path = []
        for node in base_path:
            if node not in seen:
                routing_path.append(node)
                seen.add(node)
        
        return routing_path
    
    def _extract_intent_keywords(self, query: str) -> List[str]:
        """Extract keywords that indicate intent"""
        query_lower = query.lower()
        
        # Define keyword categories
        math_keywords = ["calculate", "average", "moving", "trend", "percentage", "growth", "sum", "mean"]
        factual_keywords = ["what", "when", "where", "who", "which", "clause", "section", "document", "page"]
        conversational_keywords = ["how", "why", "explain", "tell me", "describe", "compare"]
        
        found_keywords = []
        
        # Check for mathematical keywords
        for keyword in math_keywords:
            if keyword in query_lower:
                found_keywords.append(f"math:{keyword}")
        
        # Check for factual keywords
        for keyword in factual_keywords:
            if keyword in query_lower:
                found_keywords.append(f"factual:{keyword}")
        
        # Check for conversational keywords
        for keyword in conversational_keywords:
            if keyword in query_lower:
                found_keywords.append(f"conversational:{keyword}")
        
        return found_keywords
    
    def _calculate_complexity_score(self, query: str) -> float:
        """Calculate complexity score based on query characteristics"""
        
        # Base complexity
        complexity = 0.3
        
        # Add complexity based on length
        word_count = len(query.split())
        if word_count > 20:
            complexity += 0.3
        elif word_count > 10:
            complexity += 0.2
        
        # Add complexity based on special characters and numbers
        if any(char.isdigit() for char in query):
            complexity += 0.2
        
        # Add complexity based on question words
        question_words = ["what", "when", "where", "who", "why", "how", "which"]
        question_count = sum(1 for word in question_words if word in query.lower())
        complexity += question_count * 0.1
        
        # Add complexity based on mathematical terms
        math_terms = ["calculate", "average", "trend", "moving", "percentage"]
        math_count = sum(1 for term in math_terms if term in query.lower())
        complexity += math_count * 0.2
        
        # Cap complexity at 1.0
        return min(complexity, 1.0)
    
    def _identify_data_sources(self, query: str, query_type: str) -> List[str]:
        """Identify which data sources are needed for the query"""
        data_sources = []
        query_lower = query.lower()
        
        # Check for document-related terms
        doc_terms = ["document", "page", "section", "clause", "contract", "agreement", "policy"]
        if any(term in query_lower for term in doc_terms) or query_type == "factual":
            data_sources.append("documents")
        
        # Check for data-related terms
        data_terms = ["price", "stock", "data", "trend", "average", "calculate", "analysis"]
        if any(term in data_terms for term in query_lower) or query_type == "mathematical":
            data_sources.append("structured_data")
        
        # If no specific data source identified, assume both might be needed
        if not data_sources:
            data_sources = ["documents", "structured_data"]
        
        return data_sources
    
    def get_routing_summary(self) -> Dict[str, Any]:
        """Get summary of routing decisions"""
        return {
            "node_type": self.node_type,
            "node_id": self.node_id,
            "status": self.status,
            "processing_time": self.processing_time,
            "capabilities": [
                "Query intent classification",
                "Routing path determination", 
                "Complexity analysis",
                "Data source identification"
            ]
        } 