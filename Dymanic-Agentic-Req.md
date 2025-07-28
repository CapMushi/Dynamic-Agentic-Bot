
Dynamic Agentic Systems 

Overview
This system enables:
Querying across documents (e.g. legal, financial) and structured databases (e.g. stock prices)
Dynamic selection between different AI personas
Accurate responses with citations (page numbers and screenshots)
Suggested follow-up queries to sustain conversational flow
Scalable architecture for adding more knowledge bases and LLMs in the frontend

Core Functionalities
1. Multi-Knowledge Base Integration
Document Knowledge Base: Legal and financial documents (PDFs)
Database Knowledge Base: Year-long stock market data (CSV or SQL DB)

2. AI Personas
Domain-specific LLM agents:
Financial Analyst (for math, stocks)
Legal Advisor (for compliance, contracts)
General Assistant (mixed queries)
Each persona is backed by a selected LLM provider (e.g., OpenAI, Claude, DeepSeek)

3. Query Types
Mathematical: Stock price trends, moving averages, thresholds
Factual: Specific document-based questions
Conversational: Multi-step, suggestion-driven dialogs

4. Accuracy-Driven RAG
Vector DB (Pinecone) stores:
Chunk content
Metadata (page number, image of chunk, title, section)
On match, response includes:
-Answer
-Exact page number
-Screenshot (from PDF render)

5. Speed and Precision
Mathematical operations offloaded to dedicated Python nodes (not LLMs)
Document-based queries served from indexed vector stores
LangGraph routes query to the appropriate processing pipeline

[LangGraph Architecture]
graph TD
	UI[User Interface]
	RouterNode[Router Node]
	DocNode[Document RAG Node]
	DBNode[Database Node]
	MathNode[Math Execution Node]
	PersonaSelector[Persona Selector Node]
	SuggestionNode[Suggested Queries Generator]
	AnswerFormatter[Answer + Metadata Formatter]

	UI --> PersonaSelector
	PersonaSelector --> RouterNode
	RouterNode --> DocNode
	RouterNode --> DBNode
	RouterNode --> MathNode
	RouterNode --> SuggestionNode

	DocNode --> AnswerFormatter
	DBNode --> MathNode
	MathNode --> AnswerFormatter
	SuggestionNode --> UI
	AnswerFormatter --> UI

Node Responsibilities
Router Node: Routes queries to the correct node(s) based on intent classification
Doc Node: Uses Pinecone and OCR to retrieve documents with page number and image
DB Node: Runs SQL queries for historical data like prices
Math Node: Handles computation-heavy queries such as moving average calculations
Persona Selector: Routes the request to the appropriate LLM or persona backend
Suggestion Node: Generates follow-up query suggestions to maintain flow
Answer Formatter: Adds metadata and screenshot into the final answer

Frontend Interface Requirements
Key features:
Upload or attach:PDFs, CSV files, SQL/NoSQL DB connections
Select LLM provider per persona
Live test queries and trace the answer pipeline
Visual flow of query processing for debugging
Add new LLMs via API keys

UI Layout
Left Panel: Knowledge base sources and persona management
Center Panel: Chat interface, answer display, and suggested queries
Right Panel: Metadata display and PDF page preview

Dynamic Expansion Handling
Adding a New Database:
Adds a new DBNode instance
Automatically connects to RouterNode through intent mapping
Adding a New Document:
-Document gets chunked and indexed in Pinecone
-DocNode automatically runs vector search across updated corpus
Adding a New LLM/Persona:
-Update PersonaSelector node
-UI updates with new persona toggle

Sample Query Flow
Query: "Tell me the Moving Average of MSFT from March to May 2024"
-Router → DBNode → MathNode → AnswerFormatter → UI
-Suggested Follow-up: "When did MSFT cross its 200-day MA in 2024?"

Query: "What clause handles data breach retention?"
-Router → DocNode → AnswerFormatter → UI
-Response includes page number and screenshot
-Suggested Follow-up: "Are there penalties for breach of NDA clauses?"

Backend Stack
LangGraph (agent orchestration)
Pinecone (vector store)
No DB
OCR (PDF screenshot extraction)
FastAPI 

Frontend Stack
Next.js (React framework)
Tailwind CSS / ShadCN UI library
WebSocket for live query tracing
