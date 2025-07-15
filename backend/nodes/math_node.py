"""
Math Node for Mathematical Operations and Calculations
Phase 4: LangGraph Architecture Implementation
"""

import logging
from typing import Dict, Any, List
import numpy as np  # type: ignore
import pandas as pd  # type: ignore

from .base_node import BaseNode

from models.schemas import MathOperation

logger = logging.getLogger(__name__)


class MathNode(BaseNode):
    """Math node that handles mathematical operations and calculations"""
    
    def __init__(self):
        super().__init__("math")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process mathematical operations on data"""
        
        # Validate input
        self.validate_input(input_data, ["query"])
        
        query = input_data["query"]
        database_results = input_data.get("database_results", {})
        
        self.log_processing_step("Starting mathematical analysis", f"Query: {query[:50]}...")
        
        # Add processing delay for realism
        await self.simulate_processing_delay(100, 300)
        
        # Analyze mathematical requirements
        math_requirements = self._analyze_math_requirements(query)
        
        # Execute mathematical operations
        math_results = await self._execute_math_operations(query, database_results, math_requirements)
        
        # Format results
        formatted_results = self._format_math_results(math_results)
        
        self.log_processing_step("Mathematical analysis complete", f"Performed {len(math_results)} operations")
        
        return {
            **input_data,
            "math_results": formatted_results,
            "mathematical_analysis": {
                "operations_performed": [r["operation"] for r in math_results],
                "calculations_summary": self._create_calculations_summary(math_results),
                "data_insights": self._generate_data_insights(math_results)
            }
        }
    
    def _analyze_math_requirements(self, query: str) -> Dict[str, Any]:
        """Analyze query to determine mathematical requirements"""
        query_lower = query.lower()
        
        operations = []
        parameters = {}
        
        # Moving average
        if "moving average" in query_lower or "ma" in query_lower:
            operations.append("moving_average")
            # Extract window size if specified
            window = 20  # default
            if "day" in query_lower:
                if "200" in query_lower:
                    window = 200
                elif "50" in query_lower:
                    window = 50
                elif "20" in query_lower:
                    window = 20
            parameters["window"] = window
        
        # Trend analysis
        if any(term in query_lower for term in ["trend", "direction", "increasing", "decreasing"]):
            operations.append("trend_analysis")
            parameters["period"] = 30  # default period
        
        # Threshold checks
        if any(term in query_lower for term in ["above", "below", "threshold", "cross"]):
            operations.append("threshold_check")
            # Try to extract threshold value
            threshold = self._extract_threshold_value(query)
            parameters["threshold"] = threshold
        
        # General calculations
        if any(term in query_lower for term in ["calculate", "compute", "sum", "average", "mean"]):
            operations.append("calculation")
        
        # Default to calculation if no specific operation identified
        if not operations:
            operations.append("calculation")
        
        return {
            "operations": operations,
            "parameters": parameters,
            "data_column": self._identify_data_column(query)
        }
    
    def _extract_threshold_value(self, query: str) -> float:
        """Extract threshold value from query"""
        import re
        
        # Look for numbers in the query
        numbers = re.findall(r'\d+\.?\d*', query)
        
        if numbers:
            return float(numbers[0])
        
        # Default threshold
        return 100.0
    
    def _identify_data_column(self, query: str) -> str:
        """Identify which data column to use for calculations"""
        query_lower = query.lower()
        
        if "price" in query_lower:
            return "price"
        elif "volume" in query_lower:
            return "volume"
        elif "value" in query_lower:
            return "value"
        else:
            return "price"  # default
    
    async def _execute_math_operations(self, query: str, database_results: Dict[str, Any], requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute mathematical operations"""
        results = []
        
        # Get data for calculations
        data = self._extract_data_for_calculations(database_results)
        
        if not data:
            return [{
                "operation": "error",
                "result": {"error": "No data available for calculations"},
                "success": False
            }]
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(data)
        
        # Execute each operation
        for operation in requirements["operations"]:
            try:
                math_op = MathOperation(
                    operation_type=operation,
                    data_source="database_results",
                    parameters={
                        **requirements["parameters"],
                        "column": requirements["data_column"]
                    },
                    result=None
                )
                
                if operation == "moving_average":
                    result = await self._calculate_moving_average(df, math_op.parameters)
                elif operation == "trend_analysis":
                    result = await self._analyze_trend(df, math_op.parameters)
                elif operation == "threshold_check":
                    result = await self._check_threshold(df, math_op.parameters)
                elif operation == "calculation":
                    result = await self._perform_calculation(df, math_op.parameters)
                else:
                    result = {"error": f"Unknown operation: {operation}"}
                
                results.append({
                    "operation": operation,
                    "result": result,
                    "success": "error" not in result
                })
                
            except Exception as e:
                logger.error(f"Error in math operation {operation}: {str(e)}")
                results.append({
                    "operation": operation,
                    "result": {"error": str(e)},
                    "success": False
                })
        
        return results
    
    def _extract_data_for_calculations(self, database_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract data from database results for calculations"""
        if not database_results or "data" not in database_results:
            # Return mock data if no real data available
            return self._generate_mock_data()
        
        return database_results["data"]
    
    def _generate_mock_data(self) -> List[Dict[str, Any]]:
        """Generate mock data for calculations"""
        import random
        from datetime import datetime, timedelta
        
        data = []
        base_price = 150.0
        
        for i in range(100):
            date = datetime.now() - timedelta(days=100-i)
            price = base_price + random.uniform(-10, 10)
            base_price = price  # Make it somewhat trending
            
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": round(price, 2),
                "volume": random.randint(1000000, 10000000),
                "symbol": "MSFT"
            })
        
        return data
    
    async def _calculate_moving_average(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate moving average"""
        try:
            column = params.get("column", "price")
            window = params.get("window", 20)
            
            if column not in df.columns:
                return {"error": f"Column '{column}' not found in data"}
            
            # Calculate moving average
            ma = df[column].rolling(window=window).mean()
            
            # Get latest values
            latest_value = ma.iloc[-1] if not ma.empty else None
            current_price = df[column].iloc[-1] if not df.empty else None
            
            return {
                "operation": "moving_average",
                "window": window,
                "column": column,
                "latest_ma": round(latest_value, 2) if latest_value else None,
                "current_value": round(current_price, 2) if current_price else None,
                "signal": "above" if current_price and latest_value and current_price > latest_value else "below",
                "ma_values": [round(x, 2) for x in ma.dropna().tail(10).tolist()]
            }
            
        except Exception as e:
            return {"error": f"Moving average calculation failed: {str(e)}"}
    
    async def _analyze_trend(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze trend in data"""
        try:
            column = params.get("column", "price")
            period = params.get("period", 30)
            
            if column not in df.columns:
                return {"error": f"Column '{column}' not found in data"}
            
            # Get recent data
            recent_data = df[column].tail(period)
            
            if len(recent_data) < 2:
                return {"error": "Insufficient data for trend analysis"}
            
            # Calculate trend
            start_value = recent_data.iloc[0]
            end_value = recent_data.iloc[-1]
            change = end_value - start_value
            change_percent = (change / start_value) * 100 if start_value != 0 else 0
            
            # Determine trend direction
            if change_percent > 1:
                trend = "strongly_increasing"
            elif change_percent > 0:
                trend = "increasing"
            elif change_percent < -1:
                trend = "strongly_decreasing"
            elif change_percent < 0:
                trend = "decreasing"
            else:
                trend = "stable"
            
            return {
                "operation": "trend_analysis",
                "period": period,
                "column": column,
                "trend": trend,
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "start_value": round(start_value, 2),
                "end_value": round(end_value, 2)
            }
            
        except Exception as e:
            return {"error": f"Trend analysis failed: {str(e)}"}
    
    async def _check_threshold(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Check threshold conditions"""
        try:
            column = params.get("column", "price")
            threshold = params.get("threshold", 100.0)
            
            if column not in df.columns:
                return {"error": f"Column '{column}' not found in data"}
            
            # Check current value against threshold
            current_value = df[column].iloc[-1]
            
            # Count values above/below threshold
            above_count = len(df[df[column] > threshold])
            below_count = len(df[df[column] <= threshold])
            
            return {
                "operation": "threshold_check",
                "column": column,
                "threshold": threshold,
                "current_value": round(current_value, 2),
                "current_status": "above" if current_value > threshold else "below",
                "above_threshold_count": above_count,
                "below_threshold_count": below_count,
                "total_records": len(df)
            }
            
        except Exception as e:
            return {"error": f"Threshold check failed: {str(e)}"}
    
    async def _perform_calculation(self, df: pd.DataFrame, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform general calculations"""
        try:
            column = params.get("column", "price")
            
            if column not in df.columns:
                return {"error": f"Column '{column}' not found in data"}
            
            # Basic statistics
            data = df[column]
            
            return {
                "operation": "calculation",
                "column": column,
                "mean": round(data.mean(), 2),
                "median": round(data.median(), 2),
                "std": round(data.std(), 2),
                "min": round(data.min(), 2),
                "max": round(data.max(), 2),
                "count": len(data)
            }
            
        except Exception as e:
            return {"error": f"Calculation failed: {str(e)}"}
    
    def _format_math_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format mathematical results"""
        successful_results = [r for r in results if r["success"]]
        failed_results = [r for r in results if not r["success"]]
        
        return {
            "calculations": [r["result"] for r in successful_results],
            "total_operations": len(results),
            "successful_operations": len(successful_results),
            "failed_operations": len(failed_results),
            "operations_performed": [r["operation"] for r in successful_results]
        }
    
    def _create_calculations_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create summary of calculations"""
        return {
            "total_calculations": len(results),
            "successful": len([r for r in results if r["success"]]),
            "failed": len([r for r in results if not r["success"]]),
            "operations": list(set(r["operation"] for r in results))
        }
    
    def _generate_data_insights(self, results: List[Dict[str, Any]]) -> List[str]:
        """Generate insights from mathematical results"""
        insights = []
        
        for result in results:
            if result["success"]:
                operation = result["operation"]
                data = result["result"]
                
                if operation == "moving_average":
                    if "signal" in data:
                        insights.append(f"Current price is {data['signal']} the {data['window']}-day moving average")
                
                elif operation == "trend_analysis":
                    if "trend" in data:
                        insights.append(f"Price trend over {data['period']} days: {data['trend']} ({data['change_percent']}%)")
                
                elif operation == "threshold_check":
                    if "current_status" in data:
                        insights.append(f"Current value is {data['current_status']} threshold of {data['threshold']}")
        
        return insights
    
    def get_math_summary(self) -> Dict[str, Any]:
        """Get summary of mathematical processing"""
        return {
            "node_type": self.node_type,
            "node_id": self.node_id,
            "status": self.status,
            "processing_time": self.processing_time,
            "capabilities": [
                "Moving average calculations",
                "Trend analysis",
                "Threshold checking",
                "Statistical calculations"
            ]
        } 