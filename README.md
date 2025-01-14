# Redbaez Business Management System

A comprehensive business management system built with React, TypeScript, and Supabase, featuring CRM capabilities, task management, and business analytics.

## Core Features

### 1. CRM Dashboard
- Client management with detailed profiles
- Revenue tracking and forecasting
- Task and next steps management
- Client interaction history

### 2. Priority Actions
- Task management system
- Urgent tasks highlighting
- Due date tracking
- Category-based organization (Marketing, Product Development, Partnerships, Business Admin)

### 3. Business Analytics
- Revenue summaries and forecasts
- Client status tracking
- Performance metrics
- Interactive charts and visualizations

## Technical Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Backend & Authentication**: Supabase
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/
│   ├── crm/                    # CRM-related components
│   │   ├── client-details/     # Client profile components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── priority-actions/   # Task management components
│   │   └── revenue-summary/    # Revenue tracking components
│   └── ui/                     # Reusable UI components
├── integrations/
│   └── supabase/              # Supabase configuration and types
├── pages/                     # Main route components
└── hooks/                     # Custom React hooks
```

## Database Schema

### Key Tables
- `clients`: Main client information
- `client_next_steps`: Client-related tasks and follow-ups
- `general_tasks`: System-wide task management
- `client_forecasts`: Revenue forecasting data
- `calendar_events`: Client meeting and event tracking

## Getting Started

1. **Clone the Repository**
```bash
git clone <repository-url>
cd redbaez-business-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start Development Server**
```bash
npm run dev
```

## Key Features Documentation

### Client Management
- Create and manage client profiles
- Track client interactions and meetings
- Manage client-specific tasks and next steps
- Monitor revenue and forecasts per client

### Task Management
- Create and track tasks across different categories
- Priority-based task organization
- Due date tracking and urgent task highlighting
- Task completion workflow

### Revenue Tracking
- Monthly revenue summaries
- Forecast vs. actual revenue tracking
- Client-specific revenue monitoring
- Annual revenue projections

## Authentication and Authorization

The application uses Supabase for authentication and implements row-level security (RLS) policies for data access control. Users must be authenticated to access the system's features.

## Deployment

The application can be deployed using any static hosting service that supports single-page applications (SPAs). Current deployment is handled through Lovable's built-in deployment system.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## Support

For support and questions, please contact the development team or refer to the internal documentation.