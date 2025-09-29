# Tech Stack

> Created: 2025-01-30
> Environment: Development/Production
> Status: Stable Foundation

## Frontend Architecture

### Core Framework
- **React**: 18.3.1 (Latest stable with concurrent features)
- **TypeScript**: 5.5.3 (Strict type safety)
- **Vite**: 5.4.1 (Fast development and optimized builds)

### State Management
- **React Query (@tanstack/react-query)**: 5.56.2
  - Optimized caching with 5-minute stale time
  - Smart retry logic for error handling
  - Background refetching in production only
- **React Hook Form**: 7.53.0 with Zod validation

### UI Framework
- **Tailwind CSS**: 3.4.11 (Utility-first styling)
- **Radix UI**: Complete set of accessible primitives
  - @radix-ui/react-* components for all interactive elements
- **shadcn/ui**: Pre-built component system with customization
- **Lucide React**: 0.462.0 (Icon system)
- **next-themes**: 0.3.0 (Dark/light mode support)

### Routing & Navigation
- **React Router DOM**: 6.26.2 (Client-side routing)
- **Lazy Loading**: Code-splitting for all major components

## Backend & Database

### Database Platform
- **Supabase**: PostgreSQL-based backend-as-a-service
- **Real-time subscriptions**: Live data updates
- **Row Level Security (RLS)**: Fine-grained access control
- **Edge Functions**: Serverless API endpoints

### Authentication
- **Supabase Auth**: Built-in user management
- **@supabase/auth-helpers-react**: 0.5.0
- **@supabase/auth-ui-react**: 0.4.7 (Pre-built auth components)

### API Integration
- **Supabase Client**: 2.47.10 (JavaScript client library)
- **RESTful APIs**: Standard HTTP methods for data operations
- **Real-time Updates**: WebSocket connections for live data

## AI & External Services

### AI Providers
- **OpenAI API**: GPT-4o-mini integration for content generation
- **Perplexity API**: AI news curation and analysis
- **Claude Integration**: Planned for advanced agent workflows

### Content Generation
- **LinkedIn Post Generation**: Automated from AI news articles
- **Newsletter Creation**: AI-compiled content from news sources  
- **Strategy Idea Generation**: Department-specific business ideas

### Planned Integrations
- **Google Calendar API**: Two-way task and event synchronization
- **Apple Reminders**: Native iOS/macOS task management bridge
- **Email APIs**: Task creation from email content

## Development Tools

### Code Quality
- **ESLint**: 9.9.0 with TypeScript-specific rules
- **TypeScript ESLint**: 8.0.1 (Advanced TypeScript linting)
- **Prettier**: Code formatting (configured via ESLint)

### Build & Development
- **Vite Config**: Optimized for React with SWC
- **PostCSS**: 8.4.47 with Autoprefixer
- **Tailwind Typography**: 0.5.15 for content styling

### Testing Strategy
- **Current**: Manual testing during development
- **Planned**: Jest + React Testing Library for unit tests
- **Future**: Cypress for E2E testing

## Deployment & Infrastructure

### Hosting Platform
- **Current**: Development environment
- **Planned**: Netlify or Vercel for frontend hosting
- **Backend**: Supabase managed infrastructure

### Environment Configuration
- **Environment Variables**:
  - `SUPABASE_URL`: Project database URL
  - `SUPABASE_ANON_KEY`: Public API key
  - `OPENAI_API_KEY`: AI content generation
  - `PERPLEXITY_API_KEY`: News curation

### Build Process
- **Development**: `npm run dev` (Vite dev server)
- **Production**: `npm run build` (Optimized static build)
- **Preview**: `npm run preview` (Local production testing)

## Key Dependencies Analysis

### Critical Production Dependencies
- **@supabase/supabase-js**: Core backend integration
- **@tanstack/react-query**: State management and caching
- **react-router-dom**: Application routing
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation and formatting
- **recharts**: Data visualization and charts
- **zod**: Runtime type validation

### UI Component Dependencies  
- **Radix UI Primitives**: 20+ accessible component primitives
- **cmdk**: Command palette functionality
- **sonner**: Toast notification system
- **vaul**: Mobile-optimized drawer components

## Performance Optimizations

### React Query Configuration
```typescript
{
  staleTime: 1000 * 60 * 5,     // 5 minutes fresh data
  gcTime: 1000 * 60 * 30,       // 30 minutes cache retention
  retry: (failureCount, error) => failureCount < 3,
  refetchOnWindowFocus: import.meta.env.PROD
}
```

### Code Splitting
- Lazy-loaded page components
- Suspense boundaries with loading skeletons
- Dynamic imports for heavy components

### Bundle Optimization
- Tree-shaking enabled via ES modules
- Vite's built-in optimization
- Asset optimization and compression

## Future Technical Considerations

### Planned Migrations
- **Enhanced RLS**: More sophisticated database security rules
- **Custom AI Models**: Training on user data for better predictions
- **Mobile App**: React Native or Flutter for native experience
- **Real-time Collaboration**: WebRTC or enhanced WebSocket features

### Scalability Preparations
- **CDN Integration**: Asset delivery optimization
- **Database Indexing**: Query performance optimization
- **Caching Layers**: Redis for session and computation caching
- **API Rate Limiting**: Prevent abuse and ensure service stability

### Security Enhancements
- **Content Security Policy (CSP)**: XSS protection
- **API Key Rotation**: Automated credential management  
- **Data Encryption**: Sensitive user data protection
- **Audit Logging**: User action tracking and compliance