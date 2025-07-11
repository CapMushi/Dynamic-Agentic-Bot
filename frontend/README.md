# Dynamic Agentic Systems - Frontend

This is the frontend repository for the Dynamic Agentic Systems project, implementing a sophisticated AI-powered document and database querying system with multiple personas.

## 🏗️ Architecture Overview

The frontend implements a three-panel layout supporting:
- **Left Panel**: Knowledge base sources and persona management
- **Center Panel**: Chat interface with AI personas
- **Right Panel**: Metadata display and PDF page preview

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation
```bash
npm install --legacy-peer-deps
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ui/               # Reusable UI components (ShadCN)
│   ├── chat-panel.tsx    # Center panel - Chat interface
│   ├── knowledge-panel.tsx # Left panel - File upload & personas
│   ├── metadata-panel.tsx # Right panel - Document preview
│   └── dashboard-layout.tsx # Main layout coordinator
├── hooks/                # Custom React hooks
│   ├── use-query-processing.ts # Query lifecycle management
│   └── use-mobile.tsx    # Mobile detection
├── lib/                  # Utilities and configurations
│   ├── api.ts           # API service layer (mock for now)
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # Utility functions
└── styles/              # Global styles
```

## 🎯 Current Phase: Phase 1 - Frontend Foundation

### ✅ Completed Features
- Three-panel responsive layout
- File upload system (PDF, CSV, Database)
- Basic chat interface with message history
- Persona selector (Financial Analyst, Legal Advisor, General Assistant)
- Mock data infrastructure
- TypeScript interfaces for all data structures

### 🔄 Mock Data System
Currently using mock APIs that simulate:
- Query processing through 8-node LangGraph system
- File upload and indexing
- Document citations with page numbers
- Real-time query tracing

## 🧩 AI Personas

Three specialized AI personas as defined in the project document:

1. **Financial Analyst** - Math-heavy queries, stock analysis
2. **Legal Advisor** - Compliance, contract analysis  
3. **General Assistant** - Mixed-domain queries

Each persona can be configured with different LLM providers (OpenAI, Claude, DeepSeek).

## 🔧 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/ui (Radix UI primitives)
- **State Management**: React hooks (Zustand planned for Phase 2)
- **File Upload**: Native HTML5 with drag-and-drop
- **Icons**: Lucide React

## 🚧 Future Phases

### Phase 2: Mock Data Integration (Next)
- [ ] Enhanced mock responses for all query types
- [ ] Query processing flow visualization
- [ ] Suggested queries generation
- [ ] Processing state management

### Phase 3: Advanced UI Features
- [ ] WebSocket simulation for real-time query tracing
- [ ] LLM provider selection interface
- [ ] Query history and persistence
- [ ] Advanced error handling

### Phase 4: Backend Integration
- [ ] Replace mock APIs with real LangGraph endpoints
- [ ] Implement WebSocket for real-time communication
- [ ] Add authentication and security
- [ ] Integrate with Pinecone vector database

## 🔗 Backend Integration Notes

The frontend is designed for easy backend integration:

- **API Layer**: `lib/api.ts` contains mock functions that can be replaced with real endpoints
- **Type Safety**: All interfaces in `lib/types.ts` align with planned backend schemas
- **Environment Switching**: Ready for environment-based API switching
- **WebSocket Ready**: Prepared for real-time query tracing

### Key Integration Points
1. Replace `mockApi` functions in `lib/api.ts` with actual endpoints
2. Implement WebSocket connection for real-time trace updates
3. Add authentication middleware
4. Connect file upload to actual document processing pipeline

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow the established component patterns
- Add TODO comments for future backend integration points
- Maintain accessibility compliance

### Component Structure
- Keep components focused and reusable
- Use proper TypeScript interfaces
- Implement error boundaries for production readiness
- Follow the three-panel layout architecture

### API Integration
- All API calls go through the `lib/api.ts` service layer
- Use proper error handling and loading states
- Implement retry logic for failed requests
- Add proper TypeScript types for all API responses

## 🎨 Design System

The application uses a dark theme with:
- **Primary Color**: #00FF99 (Bright Green)
- **Background**: #0C0C0C (Dark)
- **Panels**: #1A1F1C (Dark Green)
- **Borders**: #2C2C2C (Gray)
- **Text**: #FFFFFF (White) / #B0B0B0 (Light Gray)

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## 📝 Contributing

When adding new features:
1. Follow the established patterns in existing components
2. Add appropriate TypeScript types
3. Include TODO comments for backend integration
4. Test responsiveness across devices
5. Maintain accessibility standards

## 🔒 Security Notes

- API keys are handled securely (to be implemented in Phase 4)
- File uploads are validated on the client side
- No sensitive data is stored in local storage
- All user inputs are sanitized

---

This frontend is ready for Phase 1 completion and prepared for seamless integration with the backend LangGraph system in Phase 4. 