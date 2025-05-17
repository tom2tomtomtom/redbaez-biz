# Red Baez Business Suite

A comprehensive business management platform built to streamline operations, boost productivity, and leverage AI for strategic growth.

## Overview

Red Baez Business Suite is an all-in-one solution designed for small to medium businesses that integrates:

- **CRM & Client Management**: Track clients, contacts, and revenue
- **Task & Priority Management**: Organize tasks across different business functions
- **AI-Powered News & Content**: Generate LinkedIn posts and newsletters from AI news
- **Strategic Planning Tools**: Develop marketing, product, and partnership strategies
- **AI Idea Generation**: Create actionable business ideas for various departments

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Auth, Edge Functions)
- **State Management**: React Query with optimized caching
- **AI Integration**: OpenAI GPT-4o-mini, Perplexity API

## Core Features

### CRM System
- Client profiles with contact management
- Revenue tracking and visualization
- Task assignment linked to clients
- Relationship timeline and history

### Task Management
- Cross-department task prioritization
- Due date and urgency tracking
- Category-based filtering
- Completion confirmation and history

### AI News Aggregator
- Automated AI industry news collection
- LinkedIn post generation from news articles
- AI newsletter creation
- Content categorization and filtering

### Strategic Planning
- Department-specific dashboards
- AI-assisted idea generation
- Task conversion from ideas
- Strategy implementation tracking

## Setup Requirements

### Environment Variables
Use `.env.example` as a template for your own `.env` file. Important variables include:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_OPENAI_API_KEY`: For AI content generation
- `VITE_PERPLEXITY_API_KEY`: For AI news curation
- `VITE_ENABLE_AI_FEATURES`: Toggle AI-powered features
- `VITE_DEBUG_MODE`: Enable verbose debug output
- `VITE_ENABLE_PERFORMANCE_MONITORING`: Record performance metrics
- `VITE_ENABLE_CODE_SPLITTING`: Enable dynamic code splitting
- `VITE_ENABLE_PREFETCHING`: Prefetch assets for faster navigation
- `VITE_APP_NAME`: Name displayed in the interface
- `VITE_API_TIMEOUT`: API request timeout in milliseconds
- `VITE_ALLOWED_EMAILS`: Comma-separated list of allowed user emails

### Database Tables
- `clients`: Client information and revenue tracking
- `tasks`: Unified task management system
- `ai_news`: AI industry news articles

### Edge Functions
- `fetch-ai-news`: Collect and store recent AI news
- `generate-linkedin-article`: Create professional posts
- `generate-newsletter`: Compile newsletters from news
- `generate-strategy-ideas`: Create business ideas for specific departments

## Development

```bash
# Clone repository
git clone https://github.com/your-org/redbaez-biz.git

# Install dependencies
cd redbaez-biz
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Continuous Integration

A GitHub Actions workflow automatically runs `npm run lint` and `npm run build`
on every push and pull request to ensure the project remains stable.

## Simplified Task System

For quick personal task tracking you can use the `/simple-tasks` route which relies only on local storage.
This lightweight page lets you add items, mark them complete and clear finished tasks without any backend.

## Best Practices

- Use the task system to track all priority actions
- Generate ideas first, then convert to tasks with due dates
- Refresh the dashboard regularly to stay updated
- Generate LinkedIn content from the most relevant news
- Use category filters to focus on specific areas of the business

## License

MIT