"""
Database Node for CSV Data Processing and Queries
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any, List
import os

from .base_node import BaseNode

from models.schemas import DatabaseQuery
from app.config import get_csv_upload_path

logger = logging.getLogger(__name__)


class DatabaseNode(BaseNode):
    """Database node that handles CSV data queries and structured data processing"""
    
    def __init__(self):
        super().__init__("database")
        self.csv_path = get_csv_upload_path()
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process database queries on CSV data"""
        
        # Validate input
        self.validate_input(input_data, ["query"])
        
        query = input_data["query"]
        query_type = input_data.get("query_type", "conversational")
        
        self.log_processing_step("Starting database query processing", f"Query: {query[:50]}...")
        
        # Add processing delay for realism
        await self.simulate_processing_delay(150, 400)
        
        # Analyze query for data requirements
        data_requirements = self._analyze_data_requirements(query)
        
        # Execute database queries
        query_results = await self._execute_data_queries(query, data_requirements)
        
        # Process and format results
        formatted_results = self._format_query_results(query_results)
        
        self.log_processing_step("Database query complete", f"Processed {len(query_results)} queries")
        
        return {
            **input_data,
            "database_results": formatted_results,
            "data_context": {
                "query_type": query_type,
                "data_sources_used": data_requirements.get("sources", []),
                "total_queries": len(query_results),
                "processing_summary": self._create_processing_summary(query_results)
            }
        }
    
    def _analyze_data_requirements(self, query: str) -> Dict[str, Any]:
        """Analyze query to determine data requirements"""
        query_lower = query.lower()
        
        # Identify data sources needed
        sources = []
        
        # Check for stock/financial data
        if any(term in query_lower for term in ["stock", "price", "msft", "aapl", "financial", "market"]):
            sources.append("stock_data")
        
        # Check for general CSV data
        if any(term in query_lower for term in ["data", "csv", "table", "records"]):
            sources.append("csv_data")
        
        # Identify query operations
        operations = []
        if any(term in query_lower for term in ["average", "mean"]):
            operations.append("aggregate")
        if any(term in query_lower for term in ["filter", "where", "find"]):
            operations.append("filter")
        if any(term in query_lower for term in ["select", "show", "display"]):
            operations.append("select")
        
        # Default to select if no operations identified
        if not operations:
            operations.append("select")
        
        return {
            "sources": sources if sources else ["csv_data"],
            "operations": operations,
            "requires_math": any(term in query_lower for term in ["calculate", "sum", "average", "trend"])
        }
    
    async def _execute_data_queries(self, query: str, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute database queries based on requirements"""
        results = []
        
        # Get available CSV files
        csv_files = self._get_available_csv_files()
        
        for csv_file in csv_files:
            try:
                # Create database query for each relevant file
                for operation in requirements["operations"]:
                    db_query = self._create_database_query(query, csv_file, operation)
                    
                    if db_query:
                        # Lazy import to avoid circular dependency
                        from services.csv_service import csv_service
                        result = await csv_service.execute_database_query(db_query)
                        results.append({
                            "file": csv_file,
                            "operation": operation,
                            "result": result,
                            "success": "error" not in result
                        })
            
            except Exception as e:
                logger.error(f"Error querying {csv_file}: {str(e)}")
                results.append({
                    "file": csv_file,
                    "operation": "error",
                    "result": {"error": str(e)},
                    "success": False
                })
        
        return results
    
    def _get_available_csv_files(self) -> List[str]:
        """Get list of available CSV files"""
        csv_files = []
        
        try:
            if os.path.exists(self.csv_path):
                for file in os.listdir(self.csv_path):
                    if file.endswith('.csv'):
                        csv_files.append(os.path.join(self.csv_path, file))
        except Exception as e:
            logger.error(f"Error listing CSV files: {str(e)}")
        
        # Add some default mock files if none exist
        if not csv_files:
            csv_files = [
                "mock_stock_data.csv",
                "mock_financial_data.csv"
            ]
        
        return csv_files
    
    def _create_database_query(self, query: str, file_path: str, operation: str) -> DatabaseQuery:
        """Create database query object"""
        query_lower = query.lower()
        
        # Create basic query parameters based on operation
        if operation == "select":
            params = {
                "columns": [],  # Empty means all columns
                "limit": 10
            }
        elif operation == "filter":
            params = {
                "conditions": self._extract_filter_conditions(query)
            }
        elif operation == "aggregate":
            params = {
                "group_by": [],
                "aggregations": self._extract_aggregations(query)
            }
        else:
            params = {}
        
        return DatabaseQuery(
            query_type=operation,
            file_path=file_path,
            query_params=params
        )
    
    def _extract_filter_conditions(self, query: str) -> List[Dict[str, Any]]:
        """Extract filter conditions from query"""
        conditions = []
        query_lower = query.lower()
        
        # Simple pattern matching for common filters
        if "msft" in query_lower:
            conditions.append({
                "column": "symbol",
                "operator": "eq",
                "value": "MSFT"
            })
        
        if "aapl" in query_lower:
            conditions.append({
                "column": "symbol", 
                "operator": "eq",
                "value": "AAPL"
            })
        
        # Date range filters
        if "march" in query_lower:
            conditions.append({
                "column": "date",
                "operator": "contains",
                "value": "2024-03"
            })
        
        if "may" in query_lower:
            conditions.append({
                "column": "date",
                "operator": "contains", 
                "value": "2024-05"
            })
        
        return conditions
    
    def _extract_aggregations(self, query: str) -> List[Dict[str, Any]]:
        """Extract aggregation operations from query"""
        aggregations = []
        query_lower = query.lower()
        
        # Common aggregations
        if "average" in query_lower or "mean" in query_lower:
            aggregations.append({
                "column": "price",
                "function": "mean"
            })
        
        if "sum" in query_lower:
            aggregations.append({
                "column": "price",
                "function": "sum"
            })
        
        if "count" in query_lower:
            aggregations.append({
                "column": "price",
                "function": "count"
            })
        
        # Default aggregation if none specified
        if not aggregations:
            aggregations.append({
                "column": "price",
                "function": "mean"
            })
        
        return aggregations
    
    def _format_query_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format query results for response"""
        successful_results = [r for r in results if r["success"]]
        failed_results = [r for r in results if not r["success"]]
        
        # Combine successful results
        combined_data = []
        for result in successful_results:
            if "data" in result["result"]:
                combined_data.extend(result["result"]["data"])
        
        return {
            "data": combined_data[:50],  # Limit to 50 records
            "total_records": len(combined_data),
            "successful_queries": len(successful_results),
            "failed_queries": len(failed_results),
            "files_processed": list(set(r["file"] for r in results)),
            "operations_performed": list(set(r["operation"] for r in successful_results))
        }
    
    def _create_processing_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create processing summary"""
        return {
            "total_queries": len(results),
            "successful": len([r for r in results if r["success"]]),
            "failed": len([r for r in results if not r["success"]]),
            "files_accessed": list(set(r["file"] for r in results)),
            "operations": list(set(r["operation"] for r in results))
        }
    
    def get_database_summary(self) -> Dict[str, Any]:
        """Get summary of database processing"""
        return {
            "node_type": self.node_type,
            "node_id": self.node_id,
            "status": self.status,
            "processing_time": self.processing_time,
            "capabilities": [
                "CSV data querying",
                "Filter operations",
                "Aggregation operations",
                "Multi-file processing"
            ]
        } 