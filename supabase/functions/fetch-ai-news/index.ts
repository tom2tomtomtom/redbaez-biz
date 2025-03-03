
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  category: 'tools' | 'training' | 'innovation' | 'ethics';
  link: string;
}

interface NewsResponse {
  news: NewsItem[];
}

const SYSTEM_PROMPT = `You are an AI news curator. Generate exactly 5 recent AI news items from THIS WEEK ONLY.

Your response must be a valid JSON string with NO TRAILING COMMAS and must exactly match this structure:
{
  "news": [
    {
      "headline": "string",
      "summary": "string",
      "source": "string",
      "category": "tools" | "training" | "innovation" | "ethics",
      "link": "string"
    }
  ]
}

Focus on:
- AI tools and platforms
- AI training and education
- AI innovation and research
- AI ethics and safety

Rules:
1. Return EXACTLY 5 items
2. Only include news from the past 7 days
3. Ensure each item has all required fields
4. Use ONLY the specified categories
5. Ensure valid JSON format with NO trailing commas
6. Do not include any text before or after the JSON
7. Keep summaries under 500 characters
8. Each news item MUST be from a different source
9. Use reputable tech news sources`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!perplexityKey) {
      throw new Error('Missing Perplexity API key')
    }

    console.log('Fetching news from Perplexity API...')
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: 'Generate 5 recent AI news items from this week only, each from a different reputable source.'
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        frequency_penalty: 1,
        presence_penalty: 1,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: [], 
        search_recency_filter: 'week',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Perplexity API error:', error)
      throw new Error(`Perplexity API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    console.log('Perplexity API response:', JSON.stringify(data, null, 2))

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response structure:', data)
      throw new Error('Invalid API response structure')
    }

    const content = data.choices[0].message.content.trim()
    console.log('Raw content:', content)
    
    let newsItems: NewsResponse
    try {
      newsItems = JSON.parse(content)
      
      if (!newsItems?.news || !Array.isArray(newsItems.news)) {
        console.error('Invalid news format:', content)
        throw new Error('Response must contain a "news" array')
      }

      if (newsItems.news.length !== 5) {
        console.error('Wrong number of news items:', newsItems.news.length)
        throw new Error('Response must contain exactly 5 news items')
      }

      // Verify source diversity
      const sources = new Set(newsItems.news.map(item => item.source))
      if (sources.size !== newsItems.news.length) {
        console.error('Duplicate sources found:', sources)
        throw new Error('Each news item must be from a different source')
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials')
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      console.log('Storing news items in database...')

      // Clear existing news items first
      const { error: deleteError } = await supabase
        .from('ai_news')
        .delete()
        .neq('id', 0) // Delete all records
      
      if (deleteError) {
        console.error('Error clearing existing news:', deleteError)
        throw deleteError
      }

      // Store each news item
      for (const item of newsItems.news) {
        const { error } = await supabase
          .from('ai_news')
          .insert({
            title: item.headline,
            summary: item.summary,
            source: item.source,
            category: item.category,
            url: item.link,
          })
        
        if (error) {
          console.error('Error inserting news item:', error)
          throw error
        }
      }

      console.log('Successfully stored news items')

      return new Response(JSON.stringify({ success: true, data: newsItems }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (e) {
      console.error('Failed to parse or validate news items:', e)
      console.error('Raw content that failed validation:', content)
      throw new Error(`Invalid news format: ${e.message}`)
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
