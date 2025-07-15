# Logging Implementation Documentation

## Overview

Comprehensive logging has been implemented for both frontend (browser console) and backend (server-side) with structured formatting and necessary information only.

## Frontend Logging (Browser Console)

### Logger Structure
- **File**: `frontend/lib/logger.ts`
- **Format**: `[timestamp] [session_id] [context] message`
- **Levels**: DEBUG, INFO, WARN, ERROR

### Log Categories

#### API Logging
```typescript
logger.apiConnect(url)           // API connection
logger.apiRequest(method, endpoint, data)  // API request
logger.apiResponse(method, endpoint, status, duration)  // API response
logger.apiError(method, endpoint, error)   // API error
```

#### WebSocket Logging
```typescript
logger.wsConnect(url)            // WebSocket connection
logger.wsConnected()             // Connection established
logger.wsDisconnected(reason)    // Connection lost
logger.wsMessage(type, data)     // Message received
logger.wsError(error)            // WebSocket error
```

#### Query Processing Logging
```typescript
logger.queryStart(message, persona)     // Query started
logger.queryNodeProgress(node, status)  // Node progress
logger.queryComplete(duration, success) // Query completed
logger.queryError(error)                // Query failed
```

#### File Upload Logging
```typescript
logger.fileUploadStart(fileName, fileSize)    // Upload started
logger.fileUploadProgress(fileName, progress) // Upload progress
logger.fileUploadComplete(fileName, fileId)   // Upload completed
logger.fileUploadError(fileName, error)       // Upload failed
```

#### Persona Management Logging
```typescript
logger.personaSwitch(personaId, personaName)  // Persona switched
logger.personaUpdate(personaId, updates)      // Persona updated
```

### Example Log Output
```
2024-01-15T10:30:45.123Z [session_1705311045123_abc123] [API] POST /api/query
2024-01-15T10:30:45.456Z [session_1705311045123_abc123] [QUERY] Query started
2024-01-15T10:30:45.789Z [session_1705311045123_abc123] [WS] WebSocket message: node_progress
2024-01-15T10:30:46.012Z [session_1705311045123_abc123] [QUERY] Query completed
```

## Backend Logging (Server-side)

### Logger Structure
- **File**: `backend/utils/logger.py`
- **Format**: JSON structured logs
- **Output**: Console + `backend.log` file

### Log Categories

#### API Logging
```python
api_logger.request(method, endpoint, client_ip, user_agent)
api_logger.response(method, endpoint, status_code, duration)
api_logger.error(method, endpoint, error, duration)
```

#### WebSocket Logging
```python
ws_logger.connection(client_id, client_ip)
ws_logger.disconnection(client_id, reason)
ws_logger.message(client_id, message_type, data_size)
ws_logger.error(client_id, error)
```

#### Query Processing Logging
```python
query_logger.start(query_id, message, persona, query_type)
query_logger.node_progress(query_id, node_name, status, duration)
query_logger.complete(query_id, success, duration, response_length)
query_logger.error(query_id, error, node_name)
```

#### File Processing Logging
```python
file_logger.upload_start(file_id, filename, file_size, file_type)
file_logger.processing_progress(file_id, stage, progress)
file_logger.processing_complete(file_id, filename, chunks, duration)
file_logger.error(file_id, filename, error, stage)
```

#### LangGraph Node Logging
```python
node_logger.node_start(node_name, query_id, input_data)
node_logger.node_complete(node_name, query_id, duration, success)
node_logger.node_error(node_name, query_id, error)
```

#### System Logging
```python
system_logger.startup(version, config)
system_logger.shutdown(reason)
system_logger.health_check(status, uptime, active_connections)
system_logger.error(component, error)
```

### Example Log Output
```json
{
  "timestamp": "2024-01-15T10:30:45.123456",
  "level": "INFO",
  "logger": "API",
  "message": "API Request: POST /api/query",
  "context": "API",
  "data": {
    "method": "POST",
    "endpoint": "/api/query",
    "client_ip": "127.0.0.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

## Integration Points

### Frontend Integration
- **API Calls**: All `real-api.ts` methods now include logging
- **WebSocket**: All WebSocket events logged in `websocket.ts`
- **Query Processing**: Performance and progress logging in `use-query-processing.ts`
- **File Upload**: Upload progress and completion logging
- **Persona Management**: Persona switches and updates logged

### Backend Integration
- **API Routes**: Request/response logging in `api_routes.py`
- **WebSocket Routes**: Connection and message logging in `websocket_routes.py`
- **Main App**: System startup/shutdown logging in `main.py`
- **LangGraph Nodes**: Node execution logging (ready for implementation)

## Log Levels and Filtering

### Frontend
- **DEBUG**: Only in development mode
- **INFO**: General operations and successful actions
- **WARN**: Non-critical issues (reconnections, etc.)
- **ERROR**: Failures and exceptions

### Backend
- **DEBUG**: Detailed debugging information
- **INFO**: General operations and successful actions
- **WARN**: Non-critical issues
- **ERROR**: Failures and exceptions

## Performance Considerations

### Frontend
- Session-based logging to correlate related events
- Minimal data in production logs
- Performance timing for critical operations

### Backend
- Structured JSON for easy parsing
- File rotation handled by Python logging
- Async logging to avoid blocking operations

## Security and Privacy

### Frontend
- No sensitive data logged (API keys, passwords)
- Session IDs for correlation only
- User messages truncated for privacy

### Backend
- Client IPs logged for debugging
- No sensitive data in logs
- Error details sanitized

## Usage Examples

### Frontend
```typescript
import { logger } from '@/lib/logger'

// API call with logging
const response = await api.sendQuery(request)
logger.queryComplete(duration, response.success)

// WebSocket with logging
logger.wsConnect(wsUrl)
logger.wsMessage('query_trace', data)
```

### Backend
```python
from utils.logger import api_logger, query_logger

# API endpoint with logging
api_logger.request("POST", "/api/query", client_ip)
query_logger.start(query_id, message, persona)
query_logger.complete(query_id, True, duration)
```

## Configuration

### Frontend
- Environment-based logging levels
- Session ID generation for correlation
- Console output only (no file logging)

### Backend
- Console and file output
- JSON structured format
- Configurable log levels per component

## Monitoring and Debugging

### Frontend Console
- Real-time operation tracking
- Error correlation with session IDs
- Performance metrics for queries

### Backend Logs
- Structured data for analysis
- Request/response timing
- System health monitoring
- Error tracking with context

## Next Steps

1. **LangGraph Node Integration**: Add logging to individual LangGraph nodes
2. **Performance Monitoring**: Add metrics collection
3. **Log Aggregation**: Consider centralized logging solution
4. **Alerting**: Add error threshold monitoring
5. **Analytics**: Use logs for usage analytics

## Files Modified

### Frontend
- `frontend/lib/logger.ts` - New logger utility
- `frontend/lib/real-api.ts` - Added API logging
- `frontend/lib/websocket.ts` - Added WebSocket logging
- `frontend/hooks/use-query-processing.ts` - Added query logging
- `frontend/components/dashboard-layout.tsx` - Added component logging

### Backend
- `backend/utils/logger.py` - New logger utility
- `backend/app/api_routes.py` - Added API request/response logging
- `backend/app/websocket_routes.py` - Added WebSocket logging
- `backend/app/main.py` - Added system logging

This logging implementation provides comprehensive visibility into the frontend-backend integration while maintaining performance and security best practices. 