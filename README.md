# RedBaez Business Management System

## Overview
A comprehensive business management system built with React, TypeScript, and Supabase. The application helps manage clients, track revenue, handle tasks, and analyze business metrics through an intuitive interface.

## Tech Stack
- **Frontend Framework**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query) v5
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Notifications**: Sonner toast notifications

## Core Features

### 1. Client Management
- **Client Profiles**
  - Detailed client information tracking
  - Contact management with multiple contacts per client
  - Company details and background information
  - Client status monitoring and updates
  
- **Revenue Tracking**
  - Monthly and annual revenue tracking
  - Revenue forecasting with visual charts
  - Actual vs. forecast comparison
  - Client-specific revenue monitoring

### 2. Task Management
- **Priority Actions**
  - Urgent task highlighting
  - Due date tracking
  - Task categorization (Business Admin, Marketing, etc.)
  - Client-specific task association

- **Task Categories**
  - Business administration tasks
  - Marketing initiatives
  - Product development tracking
  - Partnership management

### 3. Business Intelligence
- **AI-Powered Features**
  - News aggregation relevant to business
  - Strategic recommendations
  - Client analysis
  - Market insights

- **Analytics Dashboard**
  - Revenue metrics visualization
  - Client engagement tracking
  - Task completion analytics
  - Performance indicators

## Project Structure

```
src/
├── components/
│   ├── crm/                    # Client relationship management
│   │   ├── client-details/     # Client profile components
│   │   ├── client-form/        # Client creation/editing
│   │   ├── dashboard/          # CRM dashboard
│   │   ├── priority-actions/   # Task management
│   │   └── revenue-summary/    # Revenue analytics
│   ├── ui/                     # Reusable UI components
│   └── ai-news/               # AI news aggregation
├── pages/                     # Route components
├── integrations/             # External service integrations
└── hooks/                    # Custom React hooks
```

## Database Schema

### Key Tables
1. **clients**
   - Core client information
   - Contact details
   - Revenue tracking fields
   - Status and metadata

2. **client_forecasts**
   - Monthly revenue forecasts
   - Actual revenue tracking
   - Historical data

3. **client_next_steps**
   - Action items
   - Due dates
   - Completion tracking

4. **general_tasks**
   - System-wide tasks
   - Category management
   - Priority tracking

5. **ai_news**
   - Aggregated news items
   - Relevance scoring
   - Source tracking

## Authentication
- Email/password authentication
- Protected routes
- Role-based access
- Session management
- User profiles

## Getting Started

### Prerequisites
- Node.js v16+
- npm or yarn
- Supabase account

### Installation
1. Clone the repository
```bash
git clone [repository-url]
cd redbaez-business-management
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start Development Server
```bash
npm run dev
```

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components
- Implement proper error handling
- Write meaningful component documentation
- Follow the Airbnb React/JSX Style Guide

### State Management
- Use React Query for server state
- Implement local state with useState/useReducer
- Utilize context for shared state
- Follow proper caching strategies

### Component Structure
- Create small, focused components
- Implement proper prop typing
- Use composition over inheritance
- Follow the Single Responsibility Principle

## Deployment

### Build Process
```bash
npm run build
```

### Deployment Options
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting service

### Environment Variables
Required variables for production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security Considerations
- Implement proper input validation
- Use HTTPS for all API calls
- Follow Supabase security best practices
- Regular security audits
- Proper error handling

## Performance Optimization
- Implement code splitting
- Use proper caching strategies
- Optimize images and assets
- Monitor and analyze performance

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## Support
For support, please contact [support email/channel]

## License
This project is proprietary and confidential.