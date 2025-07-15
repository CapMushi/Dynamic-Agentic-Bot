"""
Pinecone Vector Database Service
Phase 4: LangGraph Architecture Implementation
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

from app.config import settings
from models.schemas import DocumentChunk, Citation

logger = logging.getLogger(__name__)


def _sanitize_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Remove keys with None values from metadata dictionary."""
    return {k: v for k, v in metadata.items() if v is not None}

class PineconeService:
    """Service for managing Pinecone vector database operations"""
    
    def __init__(self):
        self.pc = None
        self.index = None
        self.embeddings = None
        self.vectorstore = None
        self._initialize_pinecone()
    
    def _initialize_pinecone(self):
        """Initialize Pinecone connection"""
        try:
            if not settings.pinecone_api_key:
                logger.warning("Pinecone API key not configured")
                return
            
            # Initialize Pinecone using new API (version 7.3.0)
            self.pc = Pinecone(api_key=settings.pinecone_api_key)
            
            # Connect to existing index
            self.index = self.pc.Index(settings.pinecone_index_name)
            
            # Initialize embeddings
            if settings.openai_api_key:
                self.embeddings = OpenAIEmbeddings(
                    openai_api_key=settings.openai_api_key,
                    model="text-embedding-3-small"  # 512 dimensions to match index
                )
                self.vectorstore = PineconeVectorStore(
                    index=self.index,
                    embedding=self.embeddings,
                    text_key="content"
                )
            
            logger.info("Pinecone service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {str(e)}")
    
    async def store_document_chunks(self, chunks: List[DocumentChunk]) -> bool:
        """Store document chunks in Pinecone"""
        try:
            if not self.vectorstore:
                logger.error("Pinecone vectorstore not initialized")
                return False
            
            # Prepare documents for storage
            texts = [chunk.content for chunk in chunks]
            metadatas = [
                _sanitize_metadata({
                    "chunk_id": chunk.id,
                    "title": chunk.title,
                    "page": chunk.page,
                    "section": chunk.section,
                    **chunk.metadata
                })
                for chunk in chunks
            ]
            
            # Store in Pinecone
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.vectorstore.add_texts(
                    texts=texts,
                    metadatas=metadatas,
                    ids=[chunk.id for chunk in chunks]
                )
            )
            
            logger.info(f"Stored {len(chunks)} document chunks in Pinecone")
            return True
            
        except Exception as e:
            logger.error(f"Failed to store document chunks: {str(e)}")
            return False
    
    async def search_documents(self, query: str, top_k: int = 5) -> List[Citation]:
        """Search documents and return citations"""
        try:
            # DETAILED LOGGING: Pinecone search analysis
            logger.info("=== PINECONE SERVICE DEBUG START ===")
            logger.info(f"Pinecone Service - Search Query: '{query}'")
            logger.info(f"Pinecone Service - Top K: {top_k}")
            logger.info(f"Pinecone Service - Query Length: {len(query)} characters")
            
            if not self.vectorstore:
                logger.error("Pinecone vectorstore not initialized")
                return []
            
            logger.info("Pinecone Service - Vectorstore is initialized")
            logger.info(f"Pinecone Service - Vectorstore type: {type(self.vectorstore)}")
            
            # Perform similarity search
            logger.info("Pinecone Service - Performing similarity search...")
            results = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.vectorstore.similarity_search_with_score(
                    query=query,
                    k=top_k
                )
            )
            
            # DETAILED LOGGING: Raw results
            logger.info(f"Pinecone Service - Raw results count: {len(results)}")
            for i, (doc, score) in enumerate(results):
                logger.info(f"Pinecone Service - Raw Result {i+1}: Score={score}")
                logger.info(f"Pinecone Service - Raw Result {i+1} Content Length: {len(doc.page_content)} characters")
                logger.info(f"Pinecone Service - Raw Result {i+1} Content Preview: {doc.page_content[:200]}...")
                logger.info(f"Pinecone Service - Raw Result {i+1} Metadata: {doc.metadata}")
            
            # Convert results to citations
            citations = []
            for i, (doc, score) in enumerate(results):
                confidence = 1.0 - score  # Convert distance to confidence
                
                citation = Citation(
                    title=doc.metadata.get("title", "Unknown"),
                    page=doc.metadata.get("page", 0),
                    section=doc.metadata.get("section", "Unknown"),
                    content=doc.page_content,
                    screenshot=doc.metadata.get("screenshot"),
                    confidence=confidence
                )
                
                # DETAILED LOGGING: Citation creation
                logger.info(f"Pinecone Service - Citation {i+1} Created:")
                logger.info(f"  - Title: '{citation.title}'")
                logger.info(f"  - Page: {citation.page}")
                logger.info(f"  - Section: '{citation.section}'")
                logger.info(f"  - Content Length: {len(citation.content) if citation.content else 0} characters")
                logger.info(f"  - Content Preview: {citation.content[:200] if citation.content else 'NO CONTENT'}...")
                logger.info(f"  - Confidence: {citation.confidence}")
                logger.info(f"  - Original Score: {score}")
                
                citations.append(citation)
            
            logger.info(f"Pinecone Service - Final citations count: {len(citations)}")
            logger.info("=== PINECONE SERVICE DEBUG END ===")
            
            logger.info(f"Found {len(citations)} relevant documents for query")
            return citations
            
        except Exception as e:
            logger.error(f"Pinecone Service - Exception occurred: {str(e)}")
            logger.error(f"Pinecone Service - Exception type: {type(e)}")
            import traceback
            logger.error(f"Pinecone Service - Full traceback: {traceback.format_exc()}")
            
            print("=== PINECONE SERVICE ERROR DEBUG ===")
            print(f"Error: {str(e)}")
            print(f"Error type: {type(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            print("=== END PINECONE SERVICE ERROR DEBUG ===")
            
            logger.error(f"Failed to search documents: {str(e)}")
            return []
    
    async def get_document_by_id(self, chunk_id: str) -> Optional[DocumentChunk]:
        """Get specific document chunk by ID"""
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return None
            
            # Fetch document by ID
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.index.fetch(ids=[chunk_id])
            )
            
            if chunk_id not in result.vectors:
                return None
            
            vector_data = result.vectors[chunk_id]
            metadata = vector_data.metadata
            
            return DocumentChunk(
                id=chunk_id,
                content=metadata.get("content", ""),
                title=metadata.get("title", "Unknown"),
                page=metadata.get("page", 0),
                section=metadata.get("section", "Unknown"),
                screenshot=metadata.get("screenshot"),
                embedding=vector_data.values,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Failed to get document by ID: {str(e)}")
            return None
    
    async def delete_document_chunks(self, chunk_ids: List[str]) -> bool:
        """Delete document chunks from Pinecone"""
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return False
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.index.delete(ids=chunk_ids)
            )
            
            logger.info(f"Deleted {len(chunk_ids)} document chunks from Pinecone")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document chunks: {str(e)}")
            return False
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """Get Pinecone index statistics"""
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return {}
            
            stats = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.index.describe_index_stats()
            )
            
            return {
                "total_vectors": stats.total_vector_count,
                "dimension": stats.dimension,
                "index_fullness": stats.index_fullness,
                "namespaces": stats.namespaces
            }
            
        except Exception as e:
            logger.error(f"Failed to get index stats: {str(e)}")
            return {}


# Global service instance
pinecone_service = PineconeService() 