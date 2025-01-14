# RedBaez Business Management System

## Overview
A comprehensive business management system built with React, TypeScript, and Supabase. The application helps manage clients, track revenue, handle tasks, and analyze business metrics.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS + Shadcn/ui
- State Management: TanStack Query (React Query)
- Backend: Supabase
- Authentication: Supabase Auth
- Database: PostgreSQL (via Supabase)

## Core Features
1. **Client Management**
   - Client profiles with detailed information
   - Revenue tracking and forecasting
   - Client status monitoring
   - Contact management

2. **Task Management**
   - Priority actions tracking
   - General task management
   - Client-specific tasks
   - Task categorization (Business Admin, Marketing, etc.)

3. **Revenue Management**
   - Monthly revenue tracking
   - Revenue forecasting
   - Annual revenue analysis
   - Client-specific revenue monitoring

4. **Business Intelligence**
   - AI-powered news aggregation
   - Strategic recommendations
   - Client analysis
   - Business metrics dashboard

## Project Structure

```
src/
├── components/
│   ├── crm/                    # Client relationship management components
│   │   ├── client-details/     # Client profile and details
│   │   ├── client-form/        # Client creation and editing
│   │   ├── dashboard/          # CRM dashboard components
│   │   ├── priority-actions/   # Priority tasks and actions
│   │   └── revenue-summary/    # Revenue tracking and analysis
│   ├── ui/                     # Reusable UI components
│   └── ai-news/               # AI news aggregation
├── pages/
│   ├── Index.tsx              # Main dashboard
│   ├── Login.tsx              # Authentication
│   ├── Marketing.tsx          # Marketing section
│   ├── Partnerships.tsx       # Partnerships management
│   ├── ProductDevelopment.tsx # Product development tracking
│   └── AiNews.tsx            # AI news feed
├── integrations/
│   └── supabase/             # Supabase integration and types
└── hooks/                    # Custom React hooks
```

## Database Schema

### Key Tables
- `clients`: Main client information
- `client_forecasts`: Revenue forecasting data
- `client_next_steps`: Client action items
- `general_tasks`: System-wide tasks
- `ai_news`: AI-aggregated news items
- `recommendations`: Business recommendations

## Authentication
The system uses Supabase Authentication with the following features:
- Email/Password authentication
- Protected routes
- User profiles
- Role-based access control

## Getting Started

1. **Prerequisites**
   - Node.js (v16+)
   - npm or yarn
   - Supabase account

2. **Installation**
   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

3. **Environment Setup**
   Create a `.env` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Key Features Documentation

### Client Management
- Create and manage client profiles
- Track client status and progress
- Manage client contacts
- Monitor client-specific tasks and deadlines

### Revenue Tracking
- Monthly revenue monitoring
- Revenue forecasting
- Annual revenue analysis
- Client-specific revenue tracking

### Task Management
- Priority actions dashboard
- Task categorization
- Due date tracking
- Task status management

### Business Intelligence
- AI-powered news aggregation
- Strategic recommendations
- Client analysis
- Business metrics tracking

## Deployment
The application can be deployed using:
- Vercel
- Netlify
- GitHub Pages
- Any static site hosting service

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
This project is proprietary and confidential.