"""
Answer Formatter Node for Final Response Assembly
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any, List
from datetime import datetime

from .base_node import BaseNode
from models.schemas import QueryResponse, Citation, SuggestedQuery, QueryTrace
from services.llm_service import llm_service

logger = logging.getLogger(__name__)


class AnswerFormatterNode(BaseNode):
    """Answer formatter node that assembles the final response with metadata and citations"""
    
    def __init__(self):
        super().__init__("answer_formatter")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process final answer formatting by building a structured message list and calling the LLM."""
        
        # Validate input
        self.validate_input(input_data, ["query", "system_message"])
        
        self.log_processing_step("Starting final response generation")
        
        # Log the components that will be used to build the messages
        system_prompt = input_data.get("system_message", """You are a helpful AI assistant specialized in analyzing documents and providing accurate, well-structured responses. Your goal is to:

1. Carefully analyze the provided document context
2. Extract relevant information that directly answers the user's query
3. Synthesize the information into a clear, comprehensive response
4. Use specific details and facts from the documents
5. Maintain accuracy and cite relevant sources when possible

Guidelines:
- Focus on information that directly relates to the user's question
- Provide specific details, numbers, and facts from the context
- If the context doesn't contain sufficient information, clearly state this
- Structure your response in a logical, easy-to-follow format
- Use bullet points or numbered lists when appropriate for clarity""")
        
        query = input_data.get("query", "")
        retrieved_chunks = input_data.get("retrieved_content", [])

        # DETAILED LOGGING: Document context analysis
        logger.info(f"=== ANSWER FORMATTER DEBUG START ===")
        logger.info(f"Answer Formatter - System Prompt Length: {len(system_prompt)} characters")
        logger.info(f"Answer Formatter - User Query: '{query}'")
        logger.info(f"Answer Formatter - Retrieved Chunks Count: {len(retrieved_chunks)}")
        
        # Log each chunk separately for detailed analysis
        for i, chunk in enumerate(retrieved_chunks):
            logger.info(f"Answer Formatter - Chunk {i+1}: {chunk[:200]}..." if len(chunk) > 200 else f"Answer Formatter - Chunk {i+1}: {chunk}")
            logger.info(f"Answer Formatter - Chunk {i+1} Length: {len(chunk)} characters")

        # Construct messages for the LLM
        context_str = "\n\n".join(retrieved_chunks)
        
        # DETAILED LOGGING: Context string analysis
        logger.info(f"Answer Formatter - Combined Context Length: {len(context_str)} characters")
        logger.info(f"Answer Formatter - Context Preview (first 500 chars): {context_str[:500]}...")
        logger.info(f"Answer Formatter - Context Empty: {len(context_str.strip()) == 0}")
        
        if len(context_str.strip()) == 0:
            logger.error("CRITICAL: Context string is empty! No document content available for LLM.")
        
        print("=== CONTEXT STRING DEBUG ===")
        print(f"Context string length: {len(context_str)}")
        print(f"Context string: {context_str}")
        print("=== END CONTEXT STRING DEBUG ===")
        
        # Enhanced user prompt structure
        user_prompt = f"""I need you to answer a question based on the provided document context. Please follow these instructions:

DOCUMENT CONTEXT:
--- CONTEXT START ---
{context_str}
--- CONTEXT END ---

USER QUESTION: {query}

INSTRUCTIONS:
1. Analyze the provided context carefully
2. Extract information that directly answers the user's question
3. Provide a comprehensive response using specific details from the documents
4. If the context contains relevant information, structure your answer clearly
5. If the context doesn't contain sufficient information to answer the question, state this clearly

Please provide your response now:"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # DETAILED LOGGING: Final message structure
        logger.info(f"Answer Formatter - Final Messages Count: {len(messages)}")
        logger.info(f"Answer Formatter - System Message Length: {len(messages[0]['content'])} characters")
        logger.info(f"Answer Formatter - User Message Length: {len(messages[1]['content'])} characters")
        logger.info(f"Answer Formatter - User Message Preview: {messages[1]['content'][:300]}...")
        
        # Log the final messages payload
        logger.info(f"Final messages being sent to LLM service: {messages}")
        
        print("=== MESSAGES TO LLM DEBUG ===")
        print(f"System message: {messages[0]['content'][:200]}...")
        print(f"User message: {messages[1]['content'][:500]}...")
        print("=== END MESSAGES TO LLM DEBUG ===")
        logger.info(f"=== ANSWER FORMATTER DEBUG END ===")

        try:
            # Generate response from messages
            logger.info("Answer Formatter - Calling LLM service...")
            final_response_text = await llm_service.generate_response_from_messages(messages)
            logger.info(f"Answer Formatter - LLM Response Received: {len(final_response_text)} characters")
            logger.info(f"Answer Formatter - LLM Response Preview: {final_response_text[:300]}...")
            
            print("=== LLM RESPONSE DEBUG ===")
            print(f"LLM response: {final_response_text}")
            print("=== END LLM RESPONSE DEBUG ===")
        
            input_data["llm_response"] = final_response_text
        
            # Extract and format response components
            formatted_response = self._format_main_response(input_data)
            formatted_citations = self._format_citations(input_data)
            processing_trace = self._create_processing_trace(input_data)
        
            # Calculate total processing time
            total_processing_time = self._calculate_total_processing_time(processing_trace)
        
            # Create final query response (suggestions will be added later by suggestion node)
            query_response = QueryResponse(
                response=formatted_response,
                queryType=input_data.get("query_type", "conversational"),
                citations=formatted_citations,
                suggestedQueries=[],  # Will be populated by suggestion node
                processingTrace=processing_trace,
                processingTime=total_processing_time
            )
            print("query_response is ",query_response)
        
            self.log_processing_step("Answer formatting complete", f"Total processing time: {total_processing_time}ms")
        
            return {
                **input_data,
                "final_response": query_response,
                "formatting_metadata": {
                    "response_length": len(formatted_response),
                    "citations_count": len(formatted_citations),
                    "suggestions_count": 0,  # Will be updated by suggestion node
                    "processing_nodes": len(processing_trace)
                }
            }
        except Exception as e:
            logger.error(f"Error during final response generation: {e}")
            raise
    
    def _build_final_messages(self, input_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Build the final, structured message list for the LLM."""
        system_message = input_data.get("system_message", "You are a helpful assistant.")
        query = input_data.get("query", "")
        
        context_parts = []
        
        # Add document context
        if "document_context" in input_data:
            doc_context = input_data["document_context"]
            if doc_context.get("retrieved_content"):
                context_str = "\n---\n".join(doc_context["retrieved_content"])
                context_parts.append(f"**Retrieved Document Content:**\n{context_str}")
                
        # Add other contexts (database, math) if they exist
        if "database_results" in input_data:
            db_context = input_data["database_results"]
            if db_context.get("processing_summary"):
                summary = db_context["processing_summary"]
                if summary.get("successful", 0) > 0:
                    context_parts.append(f"**Database Context:** Analyzed {summary['successful']} data sources successfully.")
        
        if "math_results" in input_data:
            math_context = input_data["math_results"]
            if math_context.get("total_operations") > 0:
                context_parts.append(f"**Mathematical Context:** Performed {math_context['total_operations']} calculations.")
        
        if "routing_path" in input_data:
            query_type = input_data.get("query_type", "unknown")
            context_parts.append(f"**Query Type:** Classified as {query_type} query.")
        
        if "selected_persona" in input_data:
            persona_name = input_data["selected_persona"]["name"]
            context_parts.append(f"**Persona:** Acting as {persona_name}.")
        
        context_str = "\n\n".join(context_parts)
        
        user_content = (
            f"Please answer the user's query based on the provided context.\n\n"
            f"**Context:**\n{context_str if context_parts else 'No relevant context found.'}\n\n"
            f"**User's Query:**\n{query}"
        )
        
        return [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_content}
        ]
    
    def _format_main_response(self, input_data: Dict[str, Any]) -> str:
        """Format the main response text"""
        base_response = input_data.get("llm_response", "I apologize, but I couldn't generate a response.")
        
        # Add data insights if available
        if "mathematical_analysis" in input_data:
            math_analysis = input_data["mathematical_analysis"]
            if "data_insights" in math_analysis and math_analysis["data_insights"]:
                insights = "\n\n**Data Insights:**\n" + "\n".join(f"• {insight}" for insight in math_analysis["data_insights"])
                base_response += insights
        
        # Add document context if available
        if "document_context" in input_data:
            doc_context = input_data["document_context"]
            if doc_context.get("summary") and doc_context["summary"] != "No relevant documents found":
                base_response += f"\n\n**Document Analysis:** {doc_context['summary']}"
        
        # Add data summary if available
        if "data_context" in input_data:
            data_context = input_data["data_context"]
            if data_context.get("processing_summary"):
                summary = data_context["processing_summary"]
                if summary.get("successful", 0) > 0:
                    base_response += f"\n\n**Data Processing:** Analyzed {summary['successful']} data sources successfully."
        
        return base_response
    
    def _format_citations(self, input_data: Dict[str, Any]) -> List[Citation]:
        """Format citations for the response"""
        citations = input_data.get("citations", [])
        
        # Ensure all citations are properly formatted
        formatted_citations = []
        for citation in citations:
            if isinstance(citation, Citation):
                formatted_citations.append(citation)
            elif isinstance(citation, dict):
                # Convert dict to Citation object
                formatted_citation = Citation(
                    title=citation.get("title", "Unknown"),
                    page=citation.get("page", 0),
                    section=citation.get("section", "Unknown"),
                    content=citation.get("content"),
                    screenshot=citation.get("screenshot"),
                    confidence=citation.get("confidence", 0.5)
                )
                formatted_citations.append(formatted_citation)
        
        return formatted_citations
    
    def _format_suggestions(self, input_data: Dict[str, Any]) -> List[SuggestedQuery]:
        """Format suggested queries for the response"""
        suggestions = input_data.get("suggested_queries", [])
        
        # Ensure all suggestions are properly formatted
        formatted_suggestions = []
        for suggestion in suggestions:
            if isinstance(suggestion, SuggestedQuery):
                formatted_suggestions.append(suggestion)
            elif isinstance(suggestion, dict):
                # Convert dict to SuggestedQuery object
                formatted_suggestion = SuggestedQuery(
                    id=suggestion.get("id", f"suggestion_{len(formatted_suggestions)}"),
                    text=suggestion.get("text", ""),
                    category=suggestion.get("category", "conversational"),
                    confidence=suggestion.get("confidence", 0.5)
                )
                formatted_suggestions.append(formatted_suggestion)
        
        return formatted_suggestions
    
    def _create_processing_trace(self, input_data: Dict[str, Any]) -> List[QueryTrace]:
        """Create processing trace from input data"""
        traces = []
        
        # Add router trace
        if "routing_path" in input_data:
            traces.append(QueryTrace(
                id="router_trace",
                step="Router Node",
                status="completed",
                timestamp=datetime.now(),
                duration=200,
                details=f"Classified as {input_data.get('query_type', 'unknown')} query"
            ))
        
        # Add persona selector trace
        if "selected_persona" in input_data:
            traces.append(QueryTrace(
                id="persona_trace",
                step="Persona Selector",
                status="completed",
                timestamp=datetime.now(),
                duration=150,
                details=f"Selected {input_data['selected_persona']['name']} persona"
            ))
        
        # Add document trace
        if "citations" in input_data:
            traces.append(QueryTrace(
                id="document_trace",
                step="Document Node",
                status="completed",
                timestamp=datetime.now(),
                duration=600,
                details=f"Found {len(input_data['citations'])} relevant documents"
            ))
        
        # Add database trace
        if "database_results" in input_data:
            traces.append(QueryTrace(
                id="database_trace",
                step="Database Node",
                status="completed",
                timestamp=datetime.now(),
                duration=400,
                details=f"Processed {input_data['database_results'].get('total_records', 0)} records"
            ))
        
        # Add math trace
        if "math_results" in input_data:
            traces.append(QueryTrace(
                id="math_trace",
                step="Math Node",
                status="completed",
                timestamp=datetime.now(),
                duration=300,
                details=f"Performed {input_data['math_results'].get('total_operations', 0)} calculations"
            ))
        
        # Add suggestion trace
        if "suggested_queries" in input_data:
            traces.append(QueryTrace(
                id="suggestion_trace",
                step="Suggestion Node",
                status="completed",
                timestamp=datetime.now(),
                duration=250,
                details=f"Generated {len(input_data['suggested_queries'])} suggestions"
            ))
        
        # Add answer formatter trace
        traces.append(QueryTrace(
            id="formatter_trace",
            step="Answer Formatter",
            status="completed",
            timestamp=datetime.now(),
            duration=self.processing_time,
            details="Assembled final response with metadata"
        ))
        
        return traces
    
    def _calculate_total_processing_time(self, traces: List[QueryTrace]) -> int:
        """Calculate total processing time from traces"""
        total_time = sum(trace.duration for trace in traces if trace.duration)
        return total_time if total_time > 0 else 1500  # Default fallback
    
    def get_formatter_summary(self) -> Dict[str, Any]:
        """Get summary of answer formatting"""
        return {
            "node_type": self.node_type,
            "node_id": self.node_id,
            "status": self.status,
            "processing_time": self.processing_time,
            "capabilities": [
                "Response formatting",
                "Citation assembly",
                "Suggestion formatting",
                "Processing trace creation"
            ]
        } 