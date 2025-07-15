"""
WebSocket Service for Real-time Communication
Phase 4: LangGraph Architecture Implementation
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

from fastapi import WebSocket, WebSocketDisconnect
from models.schemas import WebSocketMessage, QueryTrace

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manager for WebSocket connections and real-time communication"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str = None) -> str:
        """Accept WebSocket connection"""
        await websocket.accept()
        
        # Generate client ID if not provided
        if not client_id:
            client_id = str(uuid.uuid4())
        
        # Store connection
        self.active_connections[client_id] = websocket
        self.connection_metadata[client_id] = {
            "connected_at": datetime.now(),
            "last_activity": datetime.now()
        }
        
        logger.info(f"WebSocket client {client_id} connected")
        
        # Send welcome message
        await self.send_message(client_id, {
            "type": "connection_established",
            "client_id": client_id,
            "timestamp": datetime.now().isoformat()
        })
        
        return client_id
    
    def disconnect(self, client_id: str):
        """Disconnect WebSocket client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            del self.connection_metadata[client_id]
            logger.info(f"WebSocket client {client_id} disconnected")
    
    async def send_message(self, client_id: str, data: Dict[str, Any]):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                websocket = self.active_connections[client_id]
                
                # Create WebSocket message
                message = WebSocketMessage(
                    id=str(uuid.uuid4()),
                    type=data.get("type", "message"),
                    data=data,
                    timestamp=datetime.now()
                )
                
                # Send message
                await websocket.send_text(message.json())
                
                # Update last activity
                self.connection_metadata[client_id]["last_activity"] = datetime.now()
                
            except Exception as e:
                logger.error(f"Failed to send message to client {client_id}: {str(e)}")
                self.disconnect(client_id)
    
    async def broadcast_message(self, data: Dict[str, Any], exclude_client: Optional[str] = None):
        """Broadcast message to all connected clients"""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            if exclude_client and client_id == exclude_client:
                continue
            
            try:
                # Create WebSocket message
                message = WebSocketMessage(
                    id=str(uuid.uuid4()),
                    type=data.get("type", "broadcast"),
                    data=data,
                    timestamp=datetime.now()
                )
                
                # Send message
                await websocket.send_text(message.json())
                
                # Update last activity
                self.connection_metadata[client_id]["last_activity"] = datetime.now()
                
            except Exception as e:
                logger.error(f"Failed to send broadcast to client {client_id}: {str(e)}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def send_query_start(self, client_id: str, query: str, persona: str, query_type: str):
        """Send query start notification"""
        await self.send_message(client_id, {
            "type": "query_start",
            "query": query,
            "persona": persona,
            "query_type": query_type,
            "timestamp": datetime.now().isoformat()
        })
    
    async def send_node_progress(self, client_id: str, trace: QueryTrace):
        """Send node progress update"""
        await self.send_message(client_id, {
            "type": "node_progress",
            "trace": trace.dict(),
            "timestamp": datetime.now().isoformat()
        })
    
    async def send_query_complete(self, client_id: str, response: str, traces: List[QueryTrace]):
        """Send query completion notification"""
        await self.send_message(client_id, {
            "type": "query_complete",
            "response": response,
            "traces": [trace.dict() for trace in traces],
            "timestamp": datetime.now().isoformat()
        })
    
    async def send_error(self, client_id: str, error: str, error_type: str = "general"):
        """Send error notification"""
        await self.send_message(client_id, {
            "type": "error",
            "error": error,
            "error_type": error_type,
            "timestamp": datetime.now().isoformat()
        })
    
    def get_connected_clients(self) -> List[str]:
        """Get list of connected client IDs"""
        return list(self.active_connections.keys())
    
    def get_connection_info(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Get connection information for specific client"""
        return self.connection_metadata.get(client_id)
    
    async def ping_clients(self):
        """Send ping to all connected clients"""
        await self.broadcast_message({
            "type": "ping",
            "timestamp": datetime.now().isoformat()
        })
    
    async def handle_client_message(self, client_id: str, message: str):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "pong":
                # Update last activity
                self.connection_metadata[client_id]["last_activity"] = datetime.now()
            
            elif message_type == "subscribe":
                # Handle subscription to specific events
                await self.send_message(client_id, {
                    "type": "subscription_confirmed",
                    "subscribed_to": data.get("events", [])
                })
            
            elif message_type == "unsubscribe":
                # Handle unsubscription
                await self.send_message(client_id, {
                    "type": "unsubscription_confirmed",
                    "unsubscribed_from": data.get("events", [])
                })
            
            else:
                logger.warning(f"Unknown message type from client {client_id}: {message_type}")
        
        except Exception as e:
            logger.error(f"Failed to handle client message: {str(e)}")
            await self.send_error(client_id, f"Failed to process message: {str(e)}", "message_processing")


class WebSocketService:
    """Service for managing WebSocket operations"""
    
    def __init__(self):
        self.manager = WebSocketManager()
        self.query_sessions: Dict[str, Dict[str, Any]] = {}
    
    async def start_query_session(self, client_id: str, query: str, persona: str, query_type: str) -> str:
        """Start a new query processing session"""
        session_id = str(uuid.uuid4())
        
        # Store session info
        self.query_sessions[session_id] = {
            "client_id": client_id,
            "query": query,
            "persona": persona,
            "query_type": query_type,
            "start_time": datetime.now(),
            "traces": [],
            "status": "processing"
        }
        
        # Notify client
        await self.manager.send_query_start(client_id, query, persona, query_type)
        
        return session_id
    
    async def update_query_progress(self, session_id: str, trace: QueryTrace):
        """Update query processing progress"""
        if session_id in self.query_sessions:
            session = self.query_sessions[session_id]
            session["traces"].append(trace)
            
            # Notify client
            await self.manager.send_node_progress(session["client_id"], trace)
    
    async def complete_query_session(self, session_id: str, response: str):
        """Complete query processing session"""
        if session_id in self.query_sessions:
            session = self.query_sessions[session_id]
            session["status"] = "completed"
            session["response"] = response
            session["end_time"] = datetime.now()
            
            # Notify client
            await self.manager.send_query_complete(
                session["client_id"], 
                response, 
                session["traces"]
            )
    
    async def error_query_session(self, session_id: str, error: str):
        """Handle query processing error"""
        if session_id in self.query_sessions:
            session = self.query_sessions[session_id]
            session["status"] = "error"
            session["error"] = error
            session["end_time"] = datetime.now()
            
            # Notify client
            await self.manager.send_error(session["client_id"], error, "query_processing")
    
    async def cleanup_old_sessions(self, max_age_hours: int = 24):
        """Clean up old query sessions"""
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session in self.query_sessions.items():
            session_age = current_time - session["start_time"]
            if session_age.total_seconds() > max_age_hours * 3600:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self.query_sessions[session_id]
        
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired query sessions")
    
    def get_active_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Get active query sessions"""
        return {
            session_id: session 
            for session_id, session in self.query_sessions.items()
            if session["status"] == "processing"
        }
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session information"""
        return self.query_sessions.get(session_id)


# Global service instance
websocket_service = WebSocketService() 