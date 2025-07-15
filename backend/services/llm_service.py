"""
LLM Service for Managing AI Providers and Personas
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any, Optional, List, Literal
from datetime import datetime
from pydantic import SecretStr

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage

from app.config import settings
from models.schemas import PersonaConfig, SuggestedQuery

logger = logging.getLogger(__name__)


class LLMService:
    """Service for managing LLM providers and personas"""
    
    def __init__(self):
        self.providers = {}
        
        # Base prompt with universal rules for all personas
        self._base_prompt = """CRITICAL CITATION REQUIREMENT: You MUST use the format [Document X] to cite ANY information you use from the provided documents. This is mandatory for all document-based answers.
            
        CITATION STRATEGY:
        - For specific queries (e.g., "What does the Architecture section say?"), cite ONLY the single most relevant document that contains the exact information requested.
        - For general/summary queries (e.g., "What is this document about?"), you may cite multiple relevant documents.
        - Always prioritize citing the document that contains the most specific and relevant information for the query.
        
        DOCUMENT/SECTION QUERY GUIDELINES:
        - When users ask about CRUD operations, API endpoints, supported actions, or similar structured lists, search for the relevant section or heading in ANY provided document.
        - If a section or heading is found, enumerate ALL items/operations listed under that heading.
        - Do NOT just answer with the first item you find—list all relevant operations.
        - When citing, always cite the full section or heading, not just a single line or snippet.
        - If the document is structured with headings, prefer to cite the heading and the entire section content.

        When documents are provided, only cite them if you actually use information from them to answer the question."""

        # Persona-specific prompts, containing only role-specific instructions
        self.personas = {
            "Financial Analyst": {
                "system_prompt": """You are a professional financial advisor with expertise in:
                - Stock market analysis and investment strategies
                - Financial planning and portfolio management
                - Economic trends and market indicators
                - Risk assessment and mitigation
                - Regulatory compliance and financial regulations
                - Data analysis and CSV/stock data interpretation
                
                IMPORTANT: When CSV computation results are provided in the context, use them directly to answer questions. 
                Do not provide vague responses - give specific, concrete answers based on the data provided.
                
                For example:
                - If asked "what's the max price of X", look for the "max" value in the CSV statistics and state it directly
                - If asked about averages, use the "mean" values from the data
                - If asked about moving averages, use the specific MA values provided
                
                Always cite the specific data values when answering questions about stock prices, statistics, or trends.
                Provide clear, actionable financial advice with appropriate disclaimers.
                Always consider risk factors and recommend consulting with licensed professionals for specific investment decisions.
                Use data-driven analysis when available and cite sources when possible.""",
                "preferred_provider": "OpenAI"
            },
            "Legal Advisor": {
                "system_prompt": """You are a legal advisor with expertise in:
                - Contract law and legal document analysis
                - Corporate law and business regulations
                - Intellectual property and compliance
                - Risk assessment and legal implications
                - Regulatory frameworks and legal precedents
                
                Provide general legal information and guidance, but always recommend consulting with qualified legal professionals for specific legal matters.
                Clarify that you are not providing legal advice and that users should seek professional legal counsel for their specific situations.""",
                "preferred_provider": "Claude"
            },
            "General Assistant": {
                "system_prompt": """You are a knowledgeable assistant with broad expertise in:
                - General knowledge and research
                - Problem-solving and analysis
                - Writing and communication
                - Technology and tools
                - Best practices and recommendations
                - Data analysis and CSV/stock data interpretation
                
                IMPORTANT: When CSV computation results are provided in the context, use them directly to answer questions. 
                Do not provide vague responses - give specific, concrete answers based on the data provided.
                
                For example:
                - If asked "what's the max price of X", look for the "max" value in the CSV statistics and state it directly
                - If asked about averages, use the "mean" values from the data
                - If asked about moving averages, use the specific MA values provided
                
                Always cite the specific data values when answering questions about stock prices, statistics, or trends.
                Be conversational yet professional, and always aim to be helpful and informative.""",
                "preferred_provider": "DeepSeek"
            }
        }
        self._initialize_providers()

    def get_full_system_prompt(self, persona: str) -> Optional[str]:
        """
        Constructs the full system prompt by combining the base prompt
        with the persona-specific prompt.
        """
        persona_config = self.personas.get(persona)
        if not persona_config:
            return None
        
        specific_prompt = persona_config.get("system_prompt", "")
        
        # Combine base prompt with the specific persona prompt
        return f"{self._base_prompt}\n\n{specific_prompt}"

    def _initialize_providers(self):
        """Initialize LLM providers"""
        try:
            # Initialize OpenAI
            if settings.openai_api_key:
                self.providers["OpenAI"] = ChatOpenAI(
                    api_key=SecretStr(settings.openai_api_key),
                    model="gpt-4",
                    temperature=0.7
                )
                logger.info("OpenAI provider initialized")
            
            # Initialize Anthropic
            if settings.anthropic_api_key:
                self.providers["Claude"] = ChatAnthropic(
                    api_key=SecretStr(settings.anthropic_api_key),
                    model="claude-3-sonnet-20240229",
                    temperature=0.7
                )
                logger.info("Anthropic provider initialized")
            
            # Initialize DeepSeek (using OpenAI-compatible API)
            if settings.deepseek_api_key:
                self.providers["DeepSeek"] = ChatOpenAI(
                    api_key=SecretStr(settings.deepseek_api_key),
                    model="deepseek-chat",
                    temperature=0.7,
                    base_url="https://api.deepseek.com/v1"
                )
                logger.info("DeepSeek provider initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize LLM providers: {str(e)}")
    
    async def generate_response(self, persona: str, query: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate response using specified persona"""
        try:
            # Get the full, combined system prompt
            system_prompt = self.get_full_system_prompt(persona)
            if not system_prompt:
                raise ValueError(f"Unknown persona: {persona}")
            
            # Get LLM provider
            persona_config = self.personas.get(persona, {})
            provider_name = persona_config.get("preferred_provider")
            provider = self.providers.get(provider_name)
            
            if not provider:
                # Fallback to any available provider
                provider = next(iter(self.providers.values())) if self.providers else None
                if not provider:
                    raise ValueError("No LLM providers available")
            
            # Add context if provided
            if context:
                context_str = self._format_context(context)
                system_prompt += f"\n\nContext:\n{context_str}"
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=query)
            ]
            
            # Generate response
            response = await provider.agenerate([messages])
            
            return response.generations[0][0].text
            
        except Exception as e:
            logger.error(f"Failed to generate response: {str(e)}")
            return f"I apologize, but I encountered an error while processing your request: {str(e)}"

    async def generate_response_from_messages(self, messages: List[Dict[str, str]]) -> str:
        """Generate a response directly from a list of message dictionaries."""
        try:
            # DETAILED LOGGING: LLM Service analysis
            logger.info("=== LLM SERVICE DEBUG START ===")
            logger.info(f"LLM Service - Input Messages Count: {len(messages)}")
            
            # Use the first available provider as a default
            if not self.providers:
                logger.error("No LLM providers available.")
                return "Error: LLM service not available."
            
            provider = next(iter(self.providers.values()))
            provider_name = next(iter(self.providers.keys()))
            
            logger.info(f"LLM Service - Using Provider: {provider_name}")
            logger.info(f"LLM Service - Provider Type: {type(provider)}")

            # Convert message dictionaries to LangChain message objects
            langchain_messages = [
                SystemMessage(content=msg["content"]) if msg["role"] == "system" else HumanMessage(content=msg["content"])
                for msg in messages
            ]
            
            # DETAILED LOGGING: Message conversion
            logger.info(f"LLM Service - LangChain Messages Count: {len(langchain_messages)}")
            for i, msg in enumerate(langchain_messages):
                logger.info(f"LLM Service - Message {i+1} Type: {type(msg).__name__}")
                logger.info(f"LLM Service - Message {i+1} Content Length: {len(msg.content)} characters")
                logger.info(f"LLM Service - Message {i+1} Content Preview: {msg.content[:200]}...")
            
            print("=== LLM SERVICE CALL DEBUG ===")
            print(f"Provider: {provider_name}")
            print(f"Messages being sent to OpenAI:")
            for i, msg in enumerate(langchain_messages):
                print(f"Message {i+1} ({type(msg).__name__}): {msg.content[:300]}...")
            print("=== END LLM SERVICE CALL DEBUG ===")
            
            # Generate response
            logger.info("LLM Service - Making API call to provider...")
            response = await provider.agenerate([langchain_messages])
            
            # DETAILED LOGGING: Response analysis
            logger.info(f"LLM Service - API Response Received")
            logger.info(f"LLM Service - Response Type: {type(response)}")
            logger.info(f"LLM Service - Response Generations Count: {len(response.generations)}")
            
            if response.generations and len(response.generations) > 0:
                first_generation = response.generations[0]
                logger.info(f"LLM Service - First Generation Count: {len(first_generation)}")
                
                if len(first_generation) > 0:
                    final_text = first_generation[0].text
                    logger.info(f"LLM Service - Final Response Length: {len(final_text)} characters")
                    logger.info(f"LLM Service - Final Response Preview: {final_text[:300]}...")
                    
                    print("=== LLM SERVICE RESPONSE DEBUG ===")
                    print(f"Raw OpenAI response: {final_text}")
                    print("=== END LLM SERVICE RESPONSE DEBUG ===")
                    
                    logger.info("=== LLM SERVICE DEBUG END ===")
                    return final_text
                else:
                    logger.error("LLM Service - No generations in first generation list")
                    return "Error: No response generated from LLM."
            else:
                logger.error("LLM Service - No generations in response")
                return "Error: No response generated from LLM."

        except Exception as e:
            logger.error(f"LLM Service - Exception occurred: {str(e)}")
            logger.error(f"LLM Service - Exception type: {type(e)}")
            import traceback
            logger.error(f"LLM Service - Full traceback: {traceback.format_exc()}")
            
            print("=== LLM SERVICE ERROR DEBUG ===")
            print(f"Error: {str(e)}")
            print(f"Error type: {type(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            print("=== END LLM SERVICE ERROR DEBUG ===")
            
            return f"Error: Could not generate response from the provided messages. {str(e)}"
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context for LLM prompt"""
        formatted_context = []
        
        # Add citations if available
        if "citations" in context:
            formatted_context.append("Relevant Documents:")
            for citation in context["citations"]:
                formatted_context.append(f"- {citation.get('title', 'Unknown')} (Page {citation.get('page', 'N/A')})")
        
        # Add data if available
        if "data" in context:
            formatted_context.append("Data Context:")
            formatted_context.append(str(context["data"]))
        
        # Add math results if available
        if "math_results" in context:
            formatted_context.append("Mathematical Analysis:")
            formatted_context.append(str(context["math_results"]))
        
        return "\n".join(formatted_context)

    async def generate_suggested_queries(self, persona: str, current_query: str, context: Optional[Dict[str, Any]] = None) -> List[SuggestedQuery]:
        """Generate suggested follow-up queries"""
        try:
            # Get the full, combined system prompt
            system_prompt = self.get_full_system_prompt(persona)
            if not system_prompt:
                return []
            
            # Get LLM provider
            persona_config = self.personas.get(persona, {})
            provider_name = persona_config.get("preferred_provider")
            provider = self.providers.get(provider_name)
            
            if not provider:
                provider = next(iter(self.providers.values())) if self.providers else None
                if not provider:
                    return []
            
            # Create prompt for generating suggestions
            suggestion_prompt = f"""
            Based on the current query: "{current_query}"
            
            Generate 3 relevant follow-up questions that would be helpful for the user.
            Format each suggestion as a single line question.
            Focus on {persona.lower()} related topics.
            
            Suggestions:
            """
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=suggestion_prompt)
            ]
            
            # Generate suggestions
            response = await provider.agenerate([messages])
            suggestions_text = response.generations[0][0].text
            
            # Parse suggestions
            suggestions = []
            lines = suggestions_text.strip().split('\n')
            
            for i, line in enumerate(lines):
                line = line.strip()
                if line and not line.startswith('Suggestions:'):
                    # Clean up the line
                    line = line.lstrip('1234567890.-').strip()
                    
                    if line:
                        suggestion = SuggestedQuery(
                            id=f"suggestion_{i}",
                            text=line,
                            category=self._classify_query_type(line),
                            confidence=0.8
                        )
                        suggestions.append(suggestion)
            
            return suggestions[:3]  # Return max 3 suggestions
            
        except Exception as e:
            logger.error(f"Failed to generate suggested queries: {str(e)}")
            return []
    
    def _classify_query_type(self, query: str) -> Literal["mathematical", "factual", "conversational"]:
        """Classify query type for suggestions"""
        query_lower = query.lower()
        
        # Mathematical keywords
        math_keywords = ["calculate", "average", "trend", "price", "moving", "percentage", "growth"]
        if any(keyword in query_lower for keyword in math_keywords):
            return "mathematical"
        
        # Factual keywords
        factual_keywords = ["what", "when", "where", "who", "which", "clause", "section", "document"]
        if any(keyword in query_lower for keyword in factual_keywords):
            return "factual"
        
        # Default to conversational
        return "conversational"
    
    async def classify_query_intent(self, query: str) -> Dict[str, Any]:
        """Classify query intent and type"""
        try:
            logger.info("--- Query Intent Classification START ---")
            logger.info(f"Classifying query: '{query}'")
            query_lower = query.lower()

            # Define keywords for clarity and debugging
            math_keywords = ["calculate", "average", "trend", "moving", "math"]
            factual_keywords = ["what", "clause", "section", "document", "page", "describe"]

            # Determine query type
            if any(keyword in query_lower for keyword in math_keywords):
                query_type = "mathematical"
                logger.info(f"Classification result: 'mathematical' (matched one of: {math_keywords}).")
            elif any(keyword in query_lower for keyword in factual_keywords):
                query_type = "factual"
                logger.info(f"Classification result: 'factual' (matched one of: {factual_keywords}).")
            else:
                query_type = "conversational"
                logger.info(f"Classification result: 'conversational' (no specific keywords matched in '{math_keywords}' or '{factual_keywords}').")
            
            # Determine required nodes
            required_nodes = ["router", "persona_selector", "answer_formatter"]
            
            if query_type == "mathematical":
                required_nodes.extend(["database", "math"])
            elif query_type == "factual":
                required_nodes.append("document")
            
            # Always add suggestion node
            required_nodes.append("suggestion")

            logger.info(f"Determined query_type: '{query_type}', required_nodes: {required_nodes}")
            logger.info("--- Query Intent Classification END ---")
            
            return {
                "query_type": query_type,
                "required_nodes": required_nodes,
                "confidence": 0.8,
                "estimated_duration": self._estimate_processing_time(required_nodes)
            }
            
        except Exception as e:
            logger.error(f"Failed to classify query intent: {str(e)}")
            return {
                "query_type": "conversational",
                "required_nodes": ["router", "persona_selector", "answer_formatter", "suggestion"],
                "confidence": 0.5,
                "estimated_duration": 2000
            }
    
    def _estimate_processing_time(self, required_nodes: List[str]) -> int:
        """Estimate processing time based on required nodes"""
        base_time = 1000  # 1 second base time
        
        node_times = {
            "router": 200,
            "persona_selector": 100,
            "document": 800,
            "database": 600,
            "math": 400,
            "suggestion": 300,
            "answer_formatter": 200
        }
        
        total_time = base_time
        for node in required_nodes:
            total_time += node_times.get(node, 200)
        
        return total_time
    
    async def update_persona_config(self, persona: str, config: PersonaConfig) -> bool:
        """Update persona configuration"""
        try:
            if persona in self.personas:
                # Update system prompt if provided
                if hasattr(config, 'system_prompt'):
                    self.personas[persona]["system_prompt"] = config.system_prompt
                
                # Update preferred provider if provided
                if hasattr(config, 'provider'):
                    self.personas[persona]["preferred_provider"] = config.provider
                
                logger.info(f"Updated persona configuration for {persona}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to update persona config: {str(e)}")
            return False
    
    def get_available_providers(self) -> List[str]:
        """Get list of available LLM providers"""
        return list(self.providers.keys())
    
    def get_persona_info(self, persona: str) -> Optional[Dict[str, Any]]:
        """Get persona information"""
        return self.personas.get(persona)


# Global service instance
llm_service = LLMService() 