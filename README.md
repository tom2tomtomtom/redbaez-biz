
# AI News and LinkedIn Post Generator

This project provides a comprehensive solution for fetching AI news articles and generating LinkedIn posts and newsletters based on those articles.

## Features

- Fetch and display the latest AI news articles
- Generate professional LinkedIn posts from any news article
- Create comprehensive newsletters from multiple news items
- Share news articles to social media or copy links
- Filter news by category

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4o-mini, Perplexity API

## Prerequisites

1. Supabase account and project
2. OpenAI API key
3. Perplexity API key

## Setup Instructions

### 1. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.ai_news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  category TEXT,
  image_url TEXT,
  published_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policy to make the table accessible to everyone
ALTER TABLE public.ai_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to ai_news" ON public.ai_news
  FOR ALL USING (true);
```

### 2. Supabase Secrets

Set up the following secrets in your Supabase project (Settings > API > Edge Function Secrets):

- `OPENAI_API_KEY`: Your OpenAI API key
- `PERPLEXITY_API_KEY`: Your Perplexity API key

### 3. Deploy Edge Functions

Deploy the following Edge Functions:
- `fetch-ai-news`
- `generate-linkedin-article`
- `generate-newsletter`

### 4. Frontend Setup

1. Update the Supabase URL and anon key in `src/lib/supabase.ts`
2. Install dependencies:

```bash
npm install @supabase/supabase-js @tanstack/react-query date-fns lucide-react sonner tailwind-merge clsx class-variance-authority
```

3. Add the necessary UI components from shadcn/ui (button, card, dialog, badge, scroll-area)

4. Include the AI News page in your router

## Usage

1. Navigate to the AI News page
2. Click "Refresh News" to fetch the latest AI news
3. Use the LinkedIn button on any news card to generate a LinkedIn post
4. Use "Generate Newsletter" to create a comprehensive newsletter from all news items

## Dependencies

- `@supabase/supabase-js`: For Supabase client
- `@tanstack/react-query`: For data fetching and caching
- `date-fns`: For date formatting
- `lucide-react`: For icons
- `sonner`: For toast notifications
- `tailwind-merge` and `clsx`: For class utilities
- `class-variance-authority`: For UI component variants

## License

MIT
