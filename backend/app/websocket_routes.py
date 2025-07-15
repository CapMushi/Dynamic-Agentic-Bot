"""
WebSocket Routes for Real-time Communication
Phase 4: LangGraph Architecture Implementation
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect  # type: ignore
from fastapi.websockets import WebSocketState  # type: ignore
from utils.logger import ws_logger, query_logger

from services.websocket_service import websocket_service
from models.schemas import QueryRequest
from utils.langgraph_orchestrator import get_orchestrator

logger = logging.getLogger(__name__)

# Create WebSocket router
websocket_router = APIRouter(tags=["websocket"])


@websocket_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time communication"""
    client_id = None
    start_time = time.time()
    
    try:
        # Accept connection
        client_id = await websocket_service.manager.connect(websocket)
        client_ip = websocket.client.host if websocket.client else "unknown"
        ws_logger.connection(client_id, client_ip)
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                
                # Log message
                try:
                    message_data = json.loads(data)
                    ws_logger.message(client_id, message_data.get('type', 'unknown'), len(data))
                except:
                    ws_logger.message(client_id, 'unknown', len(data))
                
                # Handle incoming message
                await websocket_service.manager.handle_client_message(client_id, data)
                
            except WebSocketDisconnect:
                duration = time.time() - start_time
                ws_logger.disconnection(client_id, "Client disconnected")
                break
                
            except Exception as e:
                ws_logger.error(client_id, e)
                await websocket_service.manager.send_error(
                    client_id, 
                    f"Message processing error: {str(e)}", 
                    "message_error"
                )
    
    except Exception as e:
        ws_logger.error(client_id or "unknown", e)
        
    finally:
        # Clean up connection
        if client_id:
            websocket_service.manager.disconnect(client_id)


@websocket_router.websocket("/ws/query")
async def websocket_query_endpoint(websocket: WebSocket):
    """WebSocket endpoint specifically for query processing with real-time updates"""
    client_id = None
    
    try:
        # Accept connection
        client_id = await websocket_service.manager.connect(websocket)
        logger.info(f"Query WebSocket client {client_id} connected")
        
        # Send initial status
        await websocket_service.manager.send_message(client_id, {
            "type": "ready",
            "message": "Ready to process queries",
            "client_id": client_id
        })
        
        # Handle query processing
        while True:
            try:
                # Receive query request
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                if message_data.get("type") == "query":
                    # Process query with real-time updates
                    await handle_realtime_query(client_id, message_data)
                
                elif message_data.get("type") == "ping":
                    # Respond to ping
                    await websocket_service.manager.send_message(client_id, {
                        "type": "pong",
                        "timestamp": message_data.get("timestamp")
                    })
                
                else:
                    # Handle other message types
                    await websocket_service.manager.handle_client_message(client_id, data)
                
            except WebSocketDisconnect:
                logger.info(f"Query WebSocket client {client_id} disconnected")
                break
                
            except json.JSONDecodeError:
                await websocket_service.manager.send_error(
                    client_id, 
                    "Invalid JSON format", 
                    "json_error"
                )
                
            except Exception as e:
                logger.error(f"Error in query WebSocket: {str(e)}")
                await websocket_service.manager.send_error(
                    client_id, 
                    f"Query processing error: {str(e)}", 
                    "query_error"
                )
    
    except Exception as e:
        logger.error(f"Query WebSocket connection error: {str(e)}")
        
    finally:
        # Clean up connection
        if client_id:
            websocket_service.manager.disconnect(client_id)


async def handle_realtime_query(client_id: str, message_data: Dict[str, Any]):
    """Handle real-time query processing with WebSocket updates"""
    try:
        # Extract query data
        query_data = message_data.get("data", {})
        
        # Create query request
        query_request = QueryRequest(
            message=query_data.get("message", ""),
            persona=query_data.get("persona", "General Assistant"),
            files=query_data.get("files", [])
        )
        
        # Validate query request
        if not query_request.message:
            await websocket_service.manager.send_error(
                client_id, 
                "Query message is required", 
                "validation_error"
            )
            return
        
        # Process query with real-time updates
        logger.info(f"Processing real-time query for client {client_id}")
        
        # Start processing session
        session_id = await websocket_service.start_query_session(
            client_id, 
            query_request.message, 
            query_request.persona, 
            "unknown"
        )
        
        # Process query through orchestrator with WebSocket updates
        orchestrator = get_orchestrator()
        result = await orchestrator.process_query(query_request, client_id)
        
        # Send final result
        await websocket_service.manager.send_message(client_id, {
            "type": "query_result",
            "session_id": session_id,
            "result": result.dict()
        })
        
        logger.info(f"Completed real-time query for client {client_id}")
        
    except Exception as e:
        logger.error(f"Real-time query processing failed: {str(e)}")
        await websocket_service.manager.send_error(
            client_id, 
            f"Query processing failed: {str(e)}", 
            "processing_error"
        )


@websocket_router.websocket("/ws/system")
async def websocket_system_endpoint(websocket: WebSocket):
    """WebSocket endpoint for system monitoring and status updates"""
    client_id = None
    
    try:
        # Accept connection
        client_id = await websocket_service.manager.connect(websocket)
        logger.info(f"System WebSocket client {client_id} connected")
        
        # Send initial system status
        orchestrator = get_orchestrator()
        health_status = await orchestrator.health_check()
        await websocket_service.manager.send_message(client_id, {
            "type": "system_status",
            "data": health_status
        })
        
        # Start periodic status updates
        status_task = asyncio.create_task(send_periodic_status_updates(client_id))
        
        # Handle system commands
        while True:
            try:
                # Receive command from client
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                if message_data.get("type") == "get_status":
                    # Send current system status
                    await send_system_status(client_id)
                
                elif message_data.get("type") == "get_nodes":
                    # Send node information
                    await send_node_status(client_id)
                
                elif message_data.get("type") == "reset_system":
                    # Reset system
                    orchestrator.reset_nodes()
                    await websocket_service.manager.send_message(client_id, {
                        "type": "system_reset",
                        "message": "System reset successfully"
                    })
                
                elif message_data.get("type") == "subscribe_updates":
                    # Subscribe to status updates
                    await websocket_service.manager.send_message(client_id, {
                        "type": "subscription_confirmed",
                        "subscribed_to": ["system_status", "node_updates"]
                    })
                
                else:
                    # Handle other message types
                    await websocket_service.manager.handle_client_message(client_id, data)
                
            except WebSocketDisconnect:
                logger.info(f"System WebSocket client {client_id} disconnected")
                break
                
            except json.JSONDecodeError:
                await websocket_service.manager.send_error(
                    client_id, 
                    "Invalid JSON format", 
                    "json_error"
                )
                
            except Exception as e:
                logger.error(f"Error in system WebSocket: {str(e)}")
                await websocket_service.manager.send_error(
                    client_id, 
                    f"System command error: {str(e)}", 
                    "system_error"
                )
    
    except Exception as e:
        logger.error(f"System WebSocket connection error: {str(e)}")
        
    finally:
        # Clean up connection and cancel status updates
        if client_id:
            if 'status_task' in locals():
                status_task.cancel()
            websocket_service.manager.disconnect(client_id)


async def send_periodic_status_updates(client_id: str):
    """Send periodic system status updates"""
    try:
        while True:
            # Wait 30 seconds between updates
            await asyncio.sleep(30)
            
            # Check if client is still connected
            if client_id not in websocket_service.manager.active_connections:
                break
            
            # Send status update
            await send_system_status(client_id)
            
    except asyncio.CancelledError:
        logger.info(f"Periodic status updates cancelled for client {client_id}")
    except Exception as e:
        logger.error(f"Error in periodic status updates: {str(e)}")


async def send_system_status(client_id: str):
    """Send current system status to client"""
    try:
        orchestrator = get_orchestrator()
        health_status = await orchestrator.health_check()
        
        await websocket_service.manager.send_message(client_id, {
            "type": "system_status",
            "data": health_status
        })
        
    except Exception as e:
        logger.error(f"Error sending system status: {str(e)}")


async def send_node_status(client_id: str):
    """Send current node status to client"""
    try:
        orchestrator = get_orchestrator()
        node_status = orchestrator.get_node_status()
        
        await websocket_service.manager.send_message(client_id, {
            "type": "node_status",
            "data": node_status
        })
        
    except Exception as e:
        logger.error(f"Error sending node status: {str(e)}")


# Utility function to broadcast system updates
async def broadcast_system_update(update_type: str, data: Dict[str, Any]):
    """Broadcast system update to all connected clients"""
    try:
        await websocket_service.manager.broadcast_message({
            "type": update_type,
            "data": data
        })
        
    except Exception as e:
        logger.error(f"Error broadcasting system update: {str(e)}") 