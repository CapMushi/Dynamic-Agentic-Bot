# Frontend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build and preview
npm run preview
```

## Project Structure

- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Utilities and API layer
- `hooks/` - Custom React hooks
- `styles/` - Global styles

## Key Features

✅ **Phase 1 Complete:**
- Three-panel responsive layout
- File upload system
- Chat interface
- Persona selector
- Mock API integration
- TypeScript support

## Backend Integration

The frontend is ready for backend integration:

1. **API Layer**: Mock functions in `lib/api.ts` can be replaced with real endpoints
2. **Types**: All TypeScript interfaces align with backend schemas
3. **Environment**: Configuration ready in `env.example`
4. **WebSocket**: Prepared for real-time query tracing

## Development Notes

- Uses mock data for development
- All TODO comments mark backend integration points
- Follows established component patterns
- Maintains accessibility compliance

## Next Steps

- Phase 2: Enhanced mock data and query visualization
- Phase 3: WebSocket simulation and advanced UI features
- Phase 4: Backend integration with LangGraph system 