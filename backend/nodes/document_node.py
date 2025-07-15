"""
Document Node for Document Retrieval and RAG
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any, List

from .base_node import BaseNode

from models.schemas import Citation

logger = logging.getLogger(__name__)


class DocumentNode(BaseNode):
    """Document node that handles document retrieval using Pinecone vector search"""
    
    def __init__(self):
        super().__init__("document")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process document retrieval based on query"""
        
        # Validate input
        self.validate_input(input_data, ["query"])
        
        query = input_data["query"]
        query_type = input_data.get("query_type", "factual")
        
        # DETAILED LOGGING: Document node analysis
        logger.info("=== DOCUMENT NODE DEBUG START ===")
        logger.info(f"Document Node - Query: '{query}'")
        logger.info(f"Document Node - Query Type: {query_type}")
        logger.info(f"Document Node - Query Length: {len(query)} characters")
        
        self.log_processing_step("Starting document search", f"Query: {query[:50]}...")
        
        # Add processing delay for realism
        await self.simulate_processing_delay(200, 600)
        
        # Search documents using Pinecone (lazy import to avoid circular dependency)
        from services.pinecone_service import pinecone_service
        logger.info("Document Node - Calling Pinecone service...")
        citations = await pinecone_service.search_documents(query, top_k=5)
        
        # DETAILED LOGGING: Pinecone results
        logger.info(f"Document Node - Pinecone returned {len(citations)} citations")
        for i, citation in enumerate(citations):
            logger.info(f"Document Node - Citation {i+1}: Title='{citation.title}', Page={citation.page}, Confidence={citation.confidence}")
            logger.info(f"Document Node - Citation {i+1} Content Length: {len(citation.content) if citation.content else 0} characters")
            logger.info(f"Document Node - Citation {i+1} Content Preview: {citation.content[:200] if citation.content else 'NO CONTENT'}...")
        
        self.log_processing_step("Document search complete", f"Found {len(citations)} relevant documents")
        
        # Process and enhance citations
        logger.info("Document Node - Enhancing citations...")
        enhanced_citations = await self._enhance_citations(citations, query)
        
        # DETAILED LOGGING: Enhanced citations
        logger.info(f"Document Node - Enhanced citations count: {len(enhanced_citations)}")
        for i, citation in enumerate(enhanced_citations):
            logger.info(f"Document Node - Enhanced Citation {i+1}: Title='{citation.title}', Page={citation.page}, Confidence={citation.confidence}")
            logger.info(f"Document Node - Enhanced Citation {i+1} Content Length: {len(citation.content) if citation.content else 0} characters")
        
        # Extract relevant context from documents
        logger.info("Document Node - Extracting document context...")
        document_context, retrieved_content = self._extract_document_context(enhanced_citations)
        
        # DETAILED LOGGING: Final context
        logger.info(f"Document Node - Retrieved content items: {len(retrieved_content)}")
        for i, content in enumerate(retrieved_content):
            logger.info(f"Document Node - Content Item {i+1} Length: {len(content)} characters")
            logger.info(f"Document Node - Content Item {i+1} Preview: {content[:200]}...")
        
        logger.info(f"Document Node - Document context summary: {document_context.get('summary', 'No summary')}")
        logger.info("=== DOCUMENT NODE DEBUG END ===")
        
        return {
            **input_data,
            "citations": enhanced_citations,
            "document_context": document_context,
            "retrieved_content": retrieved_content,
            "document_search_results": {
                "total_results": len(enhanced_citations),
                "search_query": query,
                "relevance_threshold": 0.1,
                "sources_found": list(set(c.title for c in enhanced_citations))
            }
        }
    
    async def _enhance_citations(self, citations: List[Citation], query: str) -> List[Citation]:
        """Enhance citations with additional processing"""
        enhanced = []
        
        for citation in citations:
            # Only include citations with reasonable confidence
            if citation.confidence and citation.confidence > 0.1:
                # Add query relevance score
                relevance_score = self._calculate_relevance_score(citation, query)
                
                # Create enhanced citation
                enhanced_citation = Citation(
                    title=citation.title,
                    page=citation.page,
                    section=citation.section,
                    content=citation.content,  # CRITICAL: Copy the content field
                    screenshot=citation.screenshot,
                    confidence=min(citation.confidence * relevance_score, 1.0)
                )
                
                enhanced.append(enhanced_citation)
        
        # Sort by confidence score
        enhanced.sort(key=lambda x: x.confidence or 0, reverse=True)
        
        return enhanced[:3]  # Return top 3 most relevant
    
    def _calculate_relevance_score(self, citation: Citation, query: str) -> float:
        """Calculate relevance score based on query and citation content"""
        score = 1.0
        query_lower = query.lower()
        
        # Check title relevance
        if citation.title:
            title_lower = citation.title.lower()
            common_words = set(query_lower.split()) & set(title_lower.split())
            if common_words:
                score += len(common_words) * 0.1
        
        # Check section relevance
        if citation.section:
            section_lower = citation.section.lower()
            if any(word in section_lower for word in query_lower.split()):
                score += 0.2
        
        return min(score, 1.5)
    
    def _extract_document_context(self, citations: List[Citation]) -> tuple[Dict[str, Any], list[str]]:
        """Extract context information from citations, including raw content."""
        if not citations:
            return {
                "summary": "No relevant documents found",
                "key_sources": [],
                "page_references": [],
            }, []
        
        # Extract key information
        key_sources = list(set(c.title for c in citations))
        page_references = [(c.title, c.page) for c in citations]
        retrieved_content = [f"Source: {c.title}, Page: {c.page}\nContent: {c.content}" for c in citations]
        
        # Create summary
        summary = f"Found relevant information in {len(key_sources)} document(s) across {len(citations)} sections."
        
        document_context = {
            "summary": summary,
            "key_sources": key_sources,
            "page_references": page_references,
            "total_citations": len(citations),
            "confidence_range": {
                "min": min(c.confidence for c in citations if c.confidence),
                "max": max(c.confidence for c in citations if c.confidence),
                "avg": sum(c.confidence for c in citations if c.confidence) / len(citations)
            } if citations and all(c.confidence for c in citations) else None
        }
        
        return document_context, retrieved_content
    
    def get_document_summary(self) -> Dict[str, Any]:
        """Get summary of document processing"""
        return {
            "node_type": self.node_type,
            "node_id": self.node_id,
            "status": self.status,
            "processing_time": self.processing_time,
            "capabilities": [
                "Vector-based document search",
                "Citation extraction with screenshots",
                "Relevance scoring",
                "Context summarization"
            ]
        } 