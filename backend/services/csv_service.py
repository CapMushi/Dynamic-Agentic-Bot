"""
CSV Processing Service
Phase 4: LangGraph Architecture Implementation
"""

import os
import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

from app.config import settings, get_csv_upload_path
from models.schemas import DatabaseQuery, MathOperation, FileUploadResponse

logger = logging.getLogger(__name__)


class CSVService:
    """Service for processing CSV files and handling database queries"""
    
    def __init__(self):
        self.upload_path = get_csv_upload_path()
        self.loaded_files = {}  # Cache for loaded DataFrames
    
    async def process_csv_file(self, file_path: str, file_name: str) -> FileUploadResponse:
        """Process uploaded CSV file"""
        try:
            start_time = datetime.now()
            
            # Load and validate CSV
            df = pd.read_csv(file_path)
            
            # Store in cache
            self.loaded_files[file_name] = df
            
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Extract column information
            columns = df.columns.tolist()
            
            return FileUploadResponse(
                id=str(uuid.uuid4()),
                name=file_name,
                type="csv",
                status="completed",
                chunks=len(df),
                indexed=True,
                processingTime=processing_time,
                extractedSections=columns
            )
            
        except Exception as e:
            logger.error(f"Failed to process CSV file: {str(e)}")
            return FileUploadResponse(
                id=str(uuid.uuid4()),
                name=file_name,
                type="csv",
                status="error",
                chunks=0,
                indexed=False,
                processingTime=0,
                extractedSections=[]
            )
    
    async def execute_database_query(self, query: DatabaseQuery) -> Dict[str, Any]:
        """Execute database query on CSV data"""
        try:
            file_name = os.path.basename(query.file_path)
            
            # Load DataFrame if not cached
            if file_name not in self.loaded_files:
                df = pd.read_csv(query.file_path)
                self.loaded_files[file_name] = df
            else:
                df = self.loaded_files[file_name]
            
            # Execute query based on type
            if query.query_type == "select":
                result = await self._execute_select_query(df, query.query_params)
            elif query.query_type == "filter":
                result = await self._execute_filter_query(df, query.query_params)
            elif query.query_type == "aggregate":
                result = await self._execute_aggregate_query(df, query.query_params)
            elif query.query_type == "join":
                result = await self._execute_join_query(df, query.query_params)
            else:
                raise ValueError(f"Unsupported query type: {query.query_type}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute database query: {str(e)}")
            return {"error": str(e)}
    
    async def _execute_select_query(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute SELECT query"""
        try:
            columns = params.get("columns", [])
            limit = params.get("limit", None)
            
            # Select columns
            if columns:
                result_df = df[columns]
            else:
                result_df = df
            
            # Apply limit
            if limit:
                result_df = result_df.head(limit)
            
            return {
                "data": result_df.to_dict("records"),
                "columns": result_df.columns.tolist(),
                "rows": len(result_df)
            }
            
        except Exception as e:
            logger.error(f"Failed to execute SELECT query: {str(e)}")
            return {"error": str(e)}
    
    async def _execute_filter_query(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute FILTER query"""
        try:
            conditions = params.get("conditions", [])
            
            # Apply conditions
            filtered_df = df.copy()
            for condition in conditions:
                column = condition.get("column")
                operator = condition.get("operator")
                value = condition.get("value")
                
                if operator == "eq":
                    filtered_df = filtered_df[filtered_df[column] == value]
                elif operator == "ne":
                    filtered_df = filtered_df[filtered_df[column] != value]
                elif operator == "gt":
                    filtered_df = filtered_df[filtered_df[column] > value]
                elif operator == "lt":
                    filtered_df = filtered_df[filtered_df[column] < value]
                elif operator == "gte":
                    filtered_df = filtered_df[filtered_df[column] >= value]
                elif operator == "lte":
                    filtered_df = filtered_df[filtered_df[column] <= value]
                elif operator == "contains":
                    filtered_df = filtered_df[filtered_df[column].str.contains(value, na=False)]
            
            return {
                "data": filtered_df.to_dict("records"),
                "columns": filtered_df.columns.tolist(),
                "rows": len(filtered_df)
            }
            
        except Exception as e:
            logger.error(f"Failed to execute FILTER query: {str(e)}")
            return {"error": str(e)}
    
    async def _execute_aggregate_query(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute AGGREGATE query"""
        try:
            group_by = params.get("group_by", [])
            aggregations = params.get("aggregations", [])
            
            # Group data
            if group_by:
                grouped = df.groupby(group_by)
            else:
                grouped = df
            
            # Apply aggregations
            results = {}
            for agg in aggregations:
                column = agg.get("column")
                function = agg.get("function")
                
                if function == "sum":
                    results[f"{column}_sum"] = grouped[column].sum()
                elif function == "mean":
                    results[f"{column}_mean"] = grouped[column].mean()
                elif function == "count":
                    results[f"{column}_count"] = grouped[column].count()
                elif function == "min":
                    results[f"{column}_min"] = grouped[column].min()
                elif function == "max":
                    results[f"{column}_max"] = grouped[column].max()
                elif function == "std":
                    results[f"{column}_std"] = grouped[column].std()
            
            # Convert to DataFrame for consistent output
            result_df = pd.DataFrame(results)
            
            return {
                "data": result_df.to_dict("records"),
                "columns": result_df.columns.tolist(),
                "rows": len(result_df)
            }
            
        except Exception as e:
            logger.error(f"Failed to execute AGGREGATE query: {str(e)}")
            return {"error": str(e)}
    
    async def _execute_join_query(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute JOIN query"""
        try:
            # This is a simplified implementation
            # In a real scenario, you'd join with another DataFrame
            return {
                "data": df.to_dict("records"),
                "columns": df.columns.tolist(),
                "rows": len(df),
                "message": "JOIN operation not implemented in this version"
            }
            
        except Exception as e:
            logger.error(f"Failed to execute JOIN query: {str(e)}")
            return {"error": str(e)}
    
    async def execute_math_operation(self, operation: MathOperation) -> Dict[str, Any]:
        """Execute mathematical operation on CSV data"""
        try:
            file_name = os.path.basename(operation.data_source)
            
            # Load DataFrame if not cached
            if file_name not in self.loaded_files:
                df = pd.read_csv(operation.data_source)
                self.loaded_files[file_name] = df
            else:
                df = self.loaded_files[file_name]
            
            # Execute operation based on type
            if operation.operation_type == "moving_average":
                result = await self._calculate_moving_average(df, operation.parameters)
            elif operation.operation_type == "trend_analysis":
                result = await self._analyze_trend(df, operation.parameters)
            elif operation.operation_type == "threshold_check":
                result = await self._check_threshold(df, operation.parameters)
            elif operation.operation_type == "calculation":
                result = await self._perform_calculation(df, operation.parameters)
            else:
                raise ValueError(f"Unsupported operation type: {operation.operation_type}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute math operation: {str(e)}")
            return {"error": str(e)}
    
    async def _calculate_moving_average(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate moving average"""
        try:
            column = params.get("column")
            window = params.get("window", 20)
            
            if column not in df.columns:
                raise ValueError(f"Column '{column}' not found in data")
            
            # Calculate moving average
            ma = df[column].rolling(window=window).mean()
            
            return {
                "operation": "moving_average",
                "column": column,
                "window": window,
                "values": ma.dropna().tolist(),
                "latest_value": ma.iloc[-1] if not ma.empty else None
            }
            
        except Exception as e:
            logger.error(f"Failed to calculate moving average: {str(e)}")
            return {"error": str(e)}
    
    async def _analyze_trend(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze trend in data"""
        try:
            column = params.get("column")
            period = params.get("period", 30)
            
            if column not in df.columns:
                raise ValueError(f"Column '{column}' not found in data")
            
            # Get recent data
            recent_data = df[column].tail(period)
            
            # Calculate trend
            if len(recent_data) < 2:
                return {"error": "Insufficient data for trend analysis"}
            
            trend = "increasing" if recent_data.iloc[-1] > recent_data.iloc[0] else "decreasing"
            change = recent_data.iloc[-1] - recent_data.iloc[0]
            change_percent = (change / recent_data.iloc[0]) * 100 if recent_data.iloc[0] != 0 else 0
            
            return {
                "operation": "trend_analysis",
                "column": column,
                "period": period,
                "trend": trend,
                "change": change,
                "change_percent": change_percent,
                "start_value": recent_data.iloc[0],
                "end_value": recent_data.iloc[-1]
            }
            
        except Exception as e:
            logger.error(f"Failed to analyze trend: {str(e)}")
            return {"error": str(e)}
    
    async def _check_threshold(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Check threshold conditions"""
        try:
            column = params.get("column")
            threshold = params.get("threshold")
            operator = params.get("operator", "gt")
            
            if column not in df.columns:
                raise ValueError(f"Column '{column}' not found in data")
            
            # Check threshold
            if operator == "gt":
                matches = df[df[column] > threshold]
            elif operator == "lt":
                matches = df[df[column] < threshold]
            elif operator == "eq":
                matches = df[df[column] == threshold]
            else:
                raise ValueError(f"Unsupported operator: {operator}")
            
            return {
                "operation": "threshold_check",
                "column": column,
                "threshold": threshold,
                "operator": operator,
                "matches": len(matches),
                "total_records": len(df),
                "percentage": (len(matches) / len(df)) * 100
            }
            
        except Exception as e:
            logger.error(f"Failed to check threshold: {str(e)}")
            return {"error": str(e)}
    
    async def _perform_calculation(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform general calculation"""
        try:
            expression = params.get("expression")
            
            # This is a simplified implementation
            # In a real scenario, you'd have a more sophisticated expression parser
            
            return {
                "operation": "calculation",
                "expression": expression,
                "result": "Calculation not implemented in this version"
            }
            
        except Exception as e:
            logger.error(f"Failed to perform calculation: {str(e)}")
            return {"error": str(e)}
    
    async def save_uploaded_file(self, file_content: bytes, file_name: str) -> str:
        """Save uploaded CSV file to disk"""
        try:
            file_path = os.path.join(self.upload_path, file_name)
            
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            logger.info(f"Saved uploaded CSV file: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to save uploaded CSV file: {str(e)}")
            raise
    
    async def get_csv_info(self, file_path: str) -> Dict[str, Any]:
        """Get CSV file information"""
        try:
            df = pd.read_csv(file_path)
            
            return {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": df.columns.tolist(),
                "data_types": df.dtypes.to_dict(),
                "null_values": df.isnull().sum().to_dict(),
                "memory_usage": df.memory_usage(deep=True).sum()
            }
            
        except Exception as e:
            logger.error(f"Failed to get CSV info: {str(e)}")
            return {}


# Global service instance
csv_service = CSVService() 