# Technical Stack

> Last Updated: 2025-07-30
> Version: 1.0.0

## Application Framework
**React 18.3.1** with TypeScript 5.5.3

## Database System
**Supabase** - PostgreSQL with real-time subscriptions, Edge Functions, and managed authentication

## JavaScript Framework
**React** with Vite 5.4.1 for development and build optimization

## Import Strategy
**Node.js modules** - npm package management with modern ES module syntax

## CSS Framework
**Tailwind CSS 3.4.11** with PostCSS integration

## UI Component Library
**shadcn/ui** with Radix UI primitives for accessible, composable components

## Fonts Provider
**System fonts** with next-themes for dark/light mode support

## Icon Library
**Lucide React 0.462.0** - Modern, customizable icon library

## Application Hosting
**Planned for Netlify/Vercel** - Static site deployment with serverless function support

## Database Hosting
**Supabase** - Managed PostgreSQL infrastructure with global CDN

## Asset Hosting
**Planned for CDN integration** - Optimized asset delivery with Supabase Storage

## Deployment Solution
**Netlify** with Supabase Edge Functions for serverless AI processing

## Code Repository URL
**Local development** (no remote repository configured yet)

## Additional Technologies

### State Management
- **React Query 5.56.2** - Server state management with intelligent caching
- **React Hook Form 7.53.0** - Form state management with Zod validation
- **Zustand** (via next-themes) - Client-side theme state

### AI & External Services
- **OpenAI GPT-4o-mini** - Content generation and analysis
- **Perplexity API** - AI news curation and intelligence gathering
- **Google Calendar API** - Calendar integration for scheduled work blocks

### Development Tools
- **TypeScript 5.5.3** - Type safety and enhanced developer experience
- **ESLint 9.9.0** - Code linting with React-specific rules
- **Vite 5.4.1** - Fast development server and optimized production builds
- **React Router DOM 6.26.2** - Client-side routing

### Testing & Quality
- **TypeScript Strict Mode** - Enhanced type checking
- **ESLint React Hooks** - React-specific linting rules
- **lovable-tagger** - Component tagging for development

### Key Dependencies
- **@supabase/supabase-js 2.47.10** - Supabase client integration
- **@tanstack/react-query 5.56.2** - Advanced server state management
- **date-fns 3.6.0** - Date manipulation and formatting
- **recharts 2.12.7** - Business intelligence charting
- **zod 3.23.8** - Runtime type validation
- **clsx & tailwind-merge** - Conditional CSS class handling

## Architecture Decisions

### Frontend Architecture
- **Component-First Design**: All UI elements built as reusable, typed components
- **Server State Separation**: React Query manages all server interactions
- **Type Safety**: Comprehensive TypeScript coverage including database types
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Backend Architecture
- **Supabase Edge Functions**: Serverless functions for AI processing and external API integration
- **Real-time Subscriptions**: Live data updates for collaborative features
- **Row Level Security**: Database-level security for multi-tenant data isolation
- **Optimistic Updates**: Immediate UI updates with server reconciliation

### Performance Optimizations
- **Code Splitting**: Lazy loading of route components
- **React Query Caching**: Intelligent data caching with background updates
- **Bundle Optimization**: Vite-based build optimization
- **Image Optimization**: Planned CDN integration for media assets