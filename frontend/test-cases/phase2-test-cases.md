# Phase 2 Test Cases - Dynamic Agentic Systems

## Overview
This document contains comprehensive test cases for Phase 2: Mock Data Integration & Query Processing Visualization features.

## Test Environment Setup

### Prerequisites
1. Frontend application running on `http://localhost:3000`
2. All Phase 2 components implemented
3. Mock data system active

### Test Data
- Financial_Report_Q3.pdf (mock)
- Legal_Contract_2024.pdf (mock)
- Stock_Prices_2024.csv (mock)

---

## Test Suite 1: Enhanced Mock API Responses

### Test Case 1.1: Financial Analyst Mathematical Queries
**Objective**: Test mathematical query processing with Financial Analyst persona

**Steps**:
1. Select "Financial Analyst" persona
2. Enter query: "Tell me the moving average of MSFT from March to May 2024"
3. Click Send

**Expected Results**:
- Query type detected as "mathematical"
- Processing trace shows: Router Node → Database Node → Math Node → Answer Formatter
- Response includes specific MSFT moving average data with dates and percentages
- Citations reference Stock_Prices_2024.csv
- Processing time displayed
- Suggested queries appear for financial analysis

**Pass Criteria**:
- ✅ Correct query type detection
- ✅ Accurate processing node sequence
- ✅ Detailed financial data in response
- ✅ Proper citations with page numbers
- ✅ Suggested queries relevant to financial analysis

### Test Case 1.2: Legal Advisor Factual Queries
**Objective**: Test factual query processing with Legal Advisor persona

**Steps**:
1. Select "Legal Advisor" persona
2. Enter query: "What clause handles data breach retention?"
3. Click Send

**Expected Results**:
- Query type detected as "factual"
- Processing trace shows: Router Node → Document Node → Answer Formatter
- Response includes specific contract sections and compliance details
- Citations reference Legal_Contract_2024.pdf with page numbers
- Legal-specific suggested queries appear

**Pass Criteria**:
- ✅ Correct query type detection
- ✅ Document-focused processing flow
- ✅ Detailed legal information in response
- ✅ Accurate document citations
- ✅ Legal-specific suggested queries

### Test Case 1.3: General Assistant Conversational Queries
**Objective**: Test conversational query processing with General Assistant persona

**Steps**:
1. Select "General Assistant" persona
2. Enter query: "What can you help me with?"
3. Click Send

**Expected Results**:
- Query type detected as "conversational"
- Processing trace shows: Router Node → Persona Selector → Answer Formatter
- Response includes capability overview and general assistance options
- General-purpose suggested queries appear

**Pass Criteria**:
- ✅ Correct query type detection
- ✅ Persona-focused processing flow
- ✅ Comprehensive capability overview
- ✅ General-purpose suggested queries

---

## Test Suite 2: Query Processing Visualization

### Test Case 2.1: Real-time Processing Visualization
**Objective**: Test real-time query processing visualization

**Steps**:
1. Select any persona
2. Enter a complex query (e.g., "Calculate revenue growth and show compliance issues")
3. Observe processing visualization during query execution

**Expected Results**:
- Query processing visualization appears immediately
- Progress bar shows real-time progress
- Node icons and colors display correctly
- Processing steps update in real-time
- Elapsed time counter works
- Completion percentage accurate

**Pass Criteria**:
- ✅ Immediate visualization appearance
- ✅ Real-time progress updates
- ✅ Correct node icons and colors
- ✅ Accurate timing information
- ✅ Smooth progress animations

### Test Case 2.2: Node Status Indicators
**Objective**: Test processing node status indicators

**Steps**:
1. Send any query
2. Observe node status changes during processing
3. Check final completion status

**Expected Results**:
- Nodes show "processing" status with pulsing animation
- Completed nodes show green checkmark
- Processing duration displayed for each node
- Total processing time calculated correctly
- Node sequence follows logical flow

**Pass Criteria**:
- ✅ Correct status indicators
- ✅ Proper animations
- ✅ Accurate timing data
- ✅ Logical node sequence

### Test Case 2.3: Query Type Badge Display
**Objective**: Test query type detection and badge display

**Steps**:
1. Test mathematical query: "Calculate 50-day moving average"
2. Test factual query: "What section covers termination?"
3. Test conversational query: "Hello, how are you?"

**Expected Results**:
- Mathematical queries show orange badge
- Factual queries show green badge
- Conversational queries show blue badge
- Badge colors match query type consistently

**Pass Criteria**:
- ✅ Correct query type detection
- ✅ Proper badge colors
- ✅ Consistent badge display

---

## Test Suite 3: Enhanced Metadata Display

### Test Case 3.1: File Processing Information
**Objective**: Test enhanced file metadata display

**Steps**:
1. Upload a PDF file
2. Wait for processing completion
3. Click on document citation to view metadata

**Expected Results**:
- File processing details displayed (chunks, indexed status)
- Processing time shown
- Extracted sections listed
- File status indicators working
- Document preview available

**Pass Criteria**:
- ✅ Complete processing information
- ✅ Accurate chunk count
- ✅ Correct indexing status
- ✅ Processing time display
- ✅ Section extraction results

### Test Case 3.2: Chunk Information Display
**Objective**: Test chunk-level metadata display

**Steps**:
1. Send query that returns document citations
2. Click on citation to view metadata
3. Check chunk information section

**Expected Results**:
- Chunk ID displayed
- Vector similarity score shown
- Confidence level indicated
- Chunk details accessible

**Pass Criteria**:
- ✅ Chunk ID present
- ✅ Similarity score accurate
- ✅ Confidence level display
- ✅ Detailed chunk information

### Test Case 3.3: Knowledge Base Overview
**Objective**: Test knowledge base file listing

**Steps**:
1. Upload multiple files (PDF, CSV)
2. View metadata panel
3. Check knowledge base section

**Expected Results**:
- All uploaded files listed
- File types correctly identified
- Processing status for each file
- Current document highlighted
- File count badge accurate

**Pass Criteria**:
- ✅ Complete file listing
- ✅ Correct file type detection
- ✅ Accurate status indicators
- ✅ Current document highlighting
- ✅ Accurate file count

---

## Test Suite 4: Intelligent Suggested Queries

### Test Case 4.1: Persona-Specific Suggestions
**Objective**: Test persona-specific query suggestions

**Steps**:
1. Switch between different personas
2. Observe suggested queries for each persona
3. Test suggested query execution

**Expected Results**:
- Financial Analyst: Financial and mathematical queries
- Legal Advisor: Legal and compliance queries
- General Assistant: General-purpose queries
- Suggestions grouped by category
- Confidence scores displayed

**Pass Criteria**:
- ✅ Persona-specific suggestions
- ✅ Appropriate query categories
- ✅ Confidence score display
- ✅ Functional query execution

### Test Case 4.2: Contextual Query Suggestions
**Objective**: Test contextual query generation

**Steps**:
1. Send initial query
2. Observe suggested follow-up queries
3. Test suggested query relevance

**Expected Results**:
- Follow-up queries relevant to initial query
- Suggestions update based on context
- Query categories appropriate
- Confidence levels accurate

**Pass Criteria**:
- ✅ Contextual relevance
- ✅ Dynamic suggestion updates
- ✅ Appropriate categories
- ✅ Accurate confidence levels

### Test Case 4.3: Quick Action Buttons
**Objective**: Test quick action functionality

**Steps**:
1. Click "Get Help" quick action
2. Click "Summarize" quick action
3. Verify responses

**Expected Results**:
- Quick actions execute immediately
- Appropriate responses generated
- No processing delays
- Correct persona context maintained

**Pass Criteria**:
- ✅ Immediate execution
- ✅ Appropriate responses
- ✅ No delays
- ✅ Context maintenance

---

## Test Suite 5: Processing State Management

### Test Case 5.1: Concurrent Query Handling
**Objective**: Test system behavior with multiple queries

**Steps**:
1. Send first query
2. Attempt to send second query while first is processing
3. Observe system behavior

**Expected Results**:
- Second query blocked until first completes
- Clear indication of processing state
- No system conflicts
- Proper queue management

**Pass Criteria**:
- ✅ Proper query queuing
- ✅ Clear processing indicators
- ✅ No system conflicts
- ✅ Smooth state transitions

### Test Case 5.2: Error Handling
**Objective**: Test error handling during processing

**Steps**:
1. Simulate network error (disconnect internet)
2. Send query
3. Observe error handling

**Expected Results**:
- Error status displayed in processing visualization
- Appropriate error message shown
- System remains stable
- Recovery possible after reconnection

**Pass Criteria**:
- ✅ Error status indication
- ✅ Appropriate error messages
- ✅ System stability
- ✅ Recovery capability

### Test Case 5.3: Processing Trace Persistence
**Objective**: Test processing trace data persistence

**Steps**:
1. Send multiple queries
2. Observe trace history
3. Check trace data accuracy

**Expected Results**:
- Previous traces accessible
- Trace data accurate
- Performance metrics preserved
- Historical comparison possible

**Pass Criteria**:
- ✅ Trace history available
- ✅ Data accuracy maintained
- ✅ Metrics preservation
- ✅ Historical access

---

## Test Suite 6: File Upload and Processing

### Test Case 6.1: Enhanced File Upload Feedback
**Objective**: Test enhanced file upload processing feedback

**Steps**:
1. Upload PDF file
2. Observe processing feedback
3. Check completion status

**Expected Results**:
- Real-time processing progress
- Chunk creation feedback
- Indexing status updates
- Section extraction results
- Processing time tracking

**Pass Criteria**:
- ✅ Real-time progress
- ✅ Chunk creation feedback
- ✅ Indexing updates
- ✅ Section extraction
- ✅ Time tracking

### Test Case 6.2: Multiple File Types
**Objective**: Test processing of different file types

**Steps**:
1. Upload PDF file
2. Upload CSV file
3. Compare processing results

**Expected Results**:
- Different processing approaches for each type
- Appropriate section extraction
- Correct chunk counts
- Proper indexing for each type

**Pass Criteria**:
- ✅ Type-specific processing
- ✅ Appropriate extraction
- ✅ Correct chunk counts
- ✅ Proper indexing

---

## Performance Test Cases

### Test Case P.1: Response Time Validation
**Objective**: Validate query response times

**Steps**:
1. Send various query types
2. Measure response times
3. Compare with expected durations

**Expected Results**:
- Mathematical queries: 2-3 seconds
- Factual queries: 1-2 seconds
- Conversational queries: 1-1.5 seconds
- Times consistent with estimates

**Pass Criteria**:
- ✅ Response times within expected ranges
- ✅ Consistent performance
- ✅ Accurate time estimates

### Test Case P.2: Large File Processing
**Objective**: Test processing of large files

**Steps**:
1. Upload large PDF (>5MB)
2. Monitor processing performance
3. Verify completion

**Expected Results**:
- Processing completes successfully
- Reasonable processing time
- Accurate chunk count
- Proper indexing

**Pass Criteria**:
- ✅ Successful completion
- ✅ Reasonable timing
- ✅ Accurate results
- ✅ Proper indexing

---

## Regression Test Cases

### Test Case R.1: Phase 1 Functionality
**Objective**: Ensure Phase 1 features still work

**Steps**:
1. Test basic three-panel layout
2. Test persona switching
3. Test file upload
4. Test basic chat functionality

**Expected Results**:
- All Phase 1 features operational
- No regression in basic functionality
- Enhanced features don't break existing ones

**Pass Criteria**:
- ✅ Phase 1 features working
- ✅ No functional regression
- ✅ Smooth integration

### Test Case R.2: UI Responsiveness
**Objective**: Test UI responsiveness with new features

**Steps**:
1. Test on different screen sizes
2. Test panel resizing
3. Test component interactions

**Expected Results**:
- Responsive design maintained
- New components scale properly
- No layout issues

**Pass Criteria**:
- ✅ Responsive design
- ✅ Proper scaling
- ✅ No layout problems

---

## Test Execution Checklist

### Before Testing
- [ ] Frontend application running
- [ ] All Phase 2 components implemented
- [ ] Mock data system active
- [ ] Test environment clean

### During Testing
- [ ] Document all test results
- [ ] Capture screenshots for failures
- [ ] Note performance metrics
- [ ] Record any unexpected behavior

### After Testing
- [ ] Compile test results
- [ ] Create bug reports for failures
- [ ] Verify all pass criteria met
- [ ] Document any recommendations

---

## Expected Test Results Summary

### Phase 2 Features to Validate:
1. ✅ Enhanced mock API responses for all query types
2. ✅ Real-time query processing visualization
3. ✅ Comprehensive metadata display system
4. ✅ Intelligent suggested queries generation
5. ✅ Advanced processing state management
6. ✅ Enhanced file upload feedback

### Success Criteria:
- All test cases pass with 95%+ success rate
- No critical bugs identified
- Performance within acceptable ranges
- User experience smooth and intuitive
- Ready for Phase 3 development

### Known Limitations:
- Mock data responses (will be replaced in Phase 4)
- Simulated processing times
- Limited file type support
- No real backend integration

This comprehensive test suite ensures Phase 2 implementation meets all requirements and is ready for Phase 3 development. 