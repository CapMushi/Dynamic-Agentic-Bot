"""
Suggestion Node for Follow-up Query Generation
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any, List

from .base_node import BaseNode

from models.schemas import SuggestedQuery

logger = logging.getLogger(__name__)


class SuggestionNode(BaseNode):
    """Suggestion node that generates follow-up query suggestions"""
    
    def __init__(self):
        super().__init__("suggestion")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process suggestion generation"""
        
        # Validate input
        self.validate_input(input_data, ["query", "persona"])
        
        query = input_data["query"]
        persona = input_data["persona"]
        query_type = input_data.get("query_type", "conversational")
        
        self.log_processing_step("Starting suggestion generation", f"Query type: {query_type}")
        
        # Add processing delay for realism
        await self.simulate_processing_delay(100, 250)
        
        # Prepare context for suggestion generation
        context = self._prepare_suggestion_context(input_data)
        
        # Generate suggestions using LLM (lazy import to avoid circular dependency)
        from services.llm_service import llm_service
        suggestions = await llm_service.generate_suggested_queries(persona, query, context)
        
        # Enhance suggestions with additional context
        enhanced_suggestions = self._enhance_suggestions(suggestions, input_data)
        
        self.log_processing_step("Suggestion generation complete", f"Generated {len(enhanced_suggestions)} suggestions")
        
        # Update the final response with suggestions (since we now run after answer_formatter)
        final_response = input_data.get("final_response")
        if final_response:
            final_response.suggestedQueries = enhanced_suggestions
            # Update formatting metadata if it exists
            if "formatting_metadata" in input_data:
                input_data["formatting_metadata"]["suggestions_count"] = len(enhanced_suggestions)
        
        return {
            **input_data,
            "suggested_queries": enhanced_suggestions,
            "suggestion_context": {
                "original_query": query,
                "persona_used": persona,
                "total_suggestions": len(enhanced_suggestions),
                "suggestion_categories": self._categorize_suggestions(enhanced_suggestions)
            }
        }
    
    def _prepare_suggestion_context(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare context for suggestion generation"""
        context = {}
        
        # Add query results context - use final response if available, otherwise use raw LLM response
        if "final_response" in input_data and input_data["final_response"]:
            context["current_response"] = input_data["final_response"].response[:200] + "..."
        elif "llm_response" in input_data:
            context["current_response"] = input_data["llm_response"][:200] + "..."
        
        # Add data context
        if "database_results" in input_data:
            db_results = input_data["database_results"]
            context["data_available"] = {
                "has_data": bool(db_results.get("data")),
                "record_count": db_results.get("total_records", 0),
                "files": db_results.get("files_processed", [])
            }
        
        # Add document context
        if "citations" in input_data:
            context["documents_available"] = {
                "has_documents": bool(input_data["citations"]),
                "document_count": len(input_data["citations"]),
                "sources": list(set(c.title for c in input_data["citations"]))
            }
        
        # Add math context
        if "math_results" in input_data:
            math_results = input_data["math_results"]
            context["calculations_performed"] = {
                "has_calculations": bool(math_results.get("calculations")),
                "operations": math_results.get("operations_performed", [])
            }
        
        return context
    
    def _enhance_suggestions(self, suggestions: List[SuggestedQuery], input_data: Dict[str, Any]) -> List[SuggestedQuery]:
        """Enhance suggestions with additional context and relevance scoring"""
        enhanced = []
        
        for suggestion in suggestions:
            # Adjust confidence based on available data
            confidence = suggestion.confidence
            
            # Boost confidence if we have relevant data
            if self._has_relevant_data_for_suggestion(suggestion, input_data):
                confidence = min(confidence + 0.2, 1.0)
            
            # Create enhanced suggestion
            enhanced_suggestion = SuggestedQuery(
                id=suggestion.id,
                text=suggestion.text,
                category=suggestion.category,
                confidence=confidence
            )
            
            enhanced.append(enhanced_suggestion)
        
        # Sort by confidence
        enhanced.sort(key=lambda x: x.confidence, reverse=True)
        
        return enhanced
    
    def _has_relevant_data_for_suggestion(self, suggestion: SuggestedQuery, input_data: Dict[str, Any]) -> bool:
        """Check if we have relevant data for a suggestion"""
        suggestion_lower = suggestion.text.lower()
        
        # Check for document relevance
        if "citations" in input_data and input_data["citations"]:
            if any(word in suggestion_lower for word in ["document", "page", "section", "clause"]):
                return True
        
        # Check for data relevance
        if "database_results" in input_data and input_data["database_results"].get("data"):
            if any(word in suggestion_lower for word in ["data", "price", "trend", "average", "calculate"]):
                return True
        
        # Check for math relevance
        if "math_results" in input_data and input_data["math_results"].get("calculations"):
            if any(word in suggestion_lower for word in ["moving", "average", "trend", "threshold"]):
                return True
        
        return False
    
    def _categorize_suggestions(self, suggestions: List[SuggestedQuery]) -> Dict[str, int]:
        """Categorize suggestions by type"""
        categories = {}
        
        for suggestion in suggestions:
            category = suggestion.category
            categories[category] = categories.get(category, 0) + 1
        
        return categories
    
    def get_suggestion_summary(self) -> Dict[str, Any]:
        """Get summary of suggestion processing"""
        return {
            "node_type": self.node_type,
            "node_id": self.node_id,
            "status": self.status,
            "processing_time": self.processing_time,
            "capabilities": [
                "LLM-based suggestion generation",
                "Context-aware suggestions",
                "Relevance scoring",
                "Category-based organization"
            ]
        } 