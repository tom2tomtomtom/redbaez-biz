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
The application reads the following variables from `src/config/env.ts`:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key for client requests
- `VITE_OPENAI_API_KEY`: API key for OpenAI
- `VITE_PERPLEXITY_API_KEY`: API key for Perplexity
- `VITE_ENABLE_AI_FEATURES`: Toggle AI features (`true` or `false`)
- `VITE_DEBUG_MODE`: Enable verbose logging (`true` or `false`)
- `VITE_ENABLE_PERFORMANCE_MONITORING`: Enable performance metrics (`true` or `false`)
- `VITE_ENABLE_CODE_SPLITTING`: Enable bundler code splitting (`true` or `false`)
- `VITE_ENABLE_PREFETCHING`: Enable data prefetching (`true` or `false`)
- `VITE_APP_NAME`: Application display name
- `VITE_API_TIMEOUT`: API request timeout in milliseconds

### Database Tables
- `clients`: Client information and revenue tracking
- `tasks`: Unified task management system
- `ai_news`: AI industry news articles

### Edge Functions
- `fetch-ai-news`: Collect and store recent AI news
- `generate-linkedin-article`: Create professional posts
- `generate-newsletter`: Compile newsletters from news
- `generate-strategy-ideas`: Create business ideas for specific departments

### Running Supabase Functions Locally

```bash
# Start the local Supabase stack
supabase start

# Serve a specific function
supabase functions serve fetch-ai-news --env-file .env.production

# Invoke the function
curl http://localhost:54321/functions/v1/fetch-ai-news
```

### Deploying Functions

```bash
supabase functions deploy fetch-ai-news
```

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

GitHub Actions checks defined in `.github/workflows/ci.yml` run `npm run lint` and
`npm run build` on every push and pull request.

## Best Practices

- Use the task system to track all priority actions
- Generate ideas first, then convert to tasks with due dates
- Refresh the dashboard regularly to stay updated
- Generate LinkedIn content from the most relevant news
- Use category filters to focus on specific areas of the business

## License

MIT