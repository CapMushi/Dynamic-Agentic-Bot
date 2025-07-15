# Frontend-Backend Integration Testing Guide

## Pre-Testing Setup

### 1. Environment Configuration
```bash
# In frontend directory
cp env.local.example .env.local
# File should contain:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 2. Start Backend Server
```bash
cd backend
python start_server.py
# Should start on http://localhost:8000
```

### 3. Start Frontend Server
```bash
cd frontend
npm run dev
# Should start on http://localhost:3000
```

## Integration Tests

### 1. Health Check Test
- **Test**: Backend connectivity
- **How**: Navigate to frontend, check browser console for connection logs
- **Expected**: No connection errors in console
- **API**: `GET /api/health`

### 2. Query Processing Test
- **Test**: End-to-end query processing through LangGraph
- **How**: Send a query like "What is the moving average of MSFT?"
- **Expected**: 
  - Real-time node progress visualization
  - Backend response with citations
  - Suggested follow-up queries
- **API**: `POST /api/query`
- **WebSocket**: Real-time trace updates

### 3. File Upload Test
- **Test**: File upload and processing
- **How**: Upload a PDF or CSV file
- **Expected**:
  - File shows "processing" status initially
  - File status updates to "completed" or "error"
  - File metadata populated from backend
- **API**: `POST /api/upload`

### 4. Persona Management Test
- **Test**: Persona configuration sync
- **How**: Switch between personas
- **Expected**:
  - Persona selection reflected in backend
  - Different LLM providers used for different personas
- **API**: `PUT /api/personas/{id}`

### 5. Real-time WebSocket Test
- **Test**: WebSocket connection and real-time updates
- **How**: Send a query and watch the processing visualization
- **Expected**:
  - Node progress updates in real-time
  - WebSocket connection stable
  - Query trace matches backend processing
- **WebSocket**: `/ws`

## Testing Scenarios

### Query Types
1. **Mathematical Query**: "Calculate moving average of MSFT"
2. **Factual Query**: "What does this contract say about data privacy?"
3. **Conversational Query**: "Tell me about the financial outlook"

### File Types
1. **PDF**: Financial reports, legal documents
2. **CSV**: Stock market data, financial metrics
3. **Error Cases**: Invalid files, oversized files

### Error Scenarios
1. **Backend Down**: Stop backend server, test error handling
2. **Network Issues**: Simulate network errors
3. **Invalid API Keys**: Test authentication errors
4. **Rate Limiting**: Test rate limit handling

## Success Criteria

### ✅ Connection Success
- Frontend connects to backend without errors
- WebSocket connection established
- Health check returns successful response

### ✅ Query Processing Success
- Queries processed through complete LangGraph pipeline
- Real-time node progress displayed
- Backend responses properly formatted and displayed

### ✅ File Upload Success
- Files upload successfully to backend
- Processing status updates correctly
- File metadata populated from backend response

### ✅ Persona Management Success
- Persona switches sync with backend
- Different LLM providers used correctly
- Persona configurations persisted

### ✅ Error Handling Success
- Backend errors handled gracefully
- User-friendly error messages displayed
- Retry mechanisms work correctly

## Debugging Tips

### Common Issues
1. **CORS Errors**: Check backend CORS configuration
2. **WebSocket Errors**: Verify WebSocket URL and backend WebSocket server
3. **API Key Errors**: Ensure backend has valid API keys configured
4. **Port Conflicts**: Verify backend running on port 8000

### Console Logs
- Check browser console for connection logs
- Check backend logs for processing details
- Look for WebSocket connection messages

### Network Tab
- Verify API calls reaching backend
- Check response status codes
- Monitor WebSocket messages

## Test Checklist

- [ ] Backend server starts successfully
- [ ] Frontend connects to backend
- [ ] Health check endpoint works
- [ ] Query processing works end-to-end
- [ ] File upload works correctly
- [ ] Persona management syncs with backend
- [ ] WebSocket connection works
- [ ] Real-time updates display correctly
- [ ] Error handling works properly
- [ ] All major features functional

## Next Steps After Testing

1. **Performance Testing**: Test with large files and many queries
2. **Security Testing**: Verify API key security and data protection
3. **Scalability Testing**: Test with multiple concurrent users
4. **Integration Testing**: Test all components working together
5. **User Acceptance Testing**: Test from end-user perspective 