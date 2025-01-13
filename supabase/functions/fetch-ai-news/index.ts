import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

// Define types for better validation
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

const SYSTEM_PROMPT = `You are an AI news curator. Generate exactly 5 recent AI news items.

Your response MUST be a valid JSON string matching this EXACT structure:
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

Be precise and factual. Return EXACTLY 5 items.`;

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
            content: 'Generate 5 recent AI news items.'
          }
        ],
        temperature: 0.05, // Lower temperature for more consistent formatting
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Perplexity API error:', error)
      throw new Error('Failed to fetch AI news from Perplexity')
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
      // Parse and validate the response
      newsItems = JSON.parse(content)
      
      if (!newsItems?.news || !Array.isArray(newsItems.news)) {
        console.error('Invalid news format:', content)
        throw new Error('Response must contain a "news" array')
      }

      if (newsItems.news.length !== 5) {
        console.error('Wrong number of news items:', newsItems.news.length)
        throw new Error('Response must contain exactly 5 news items')
      }

      // Validate each news item
      newsItems.news.forEach((item, index) => {
        const validCategories = ['tools', 'training', 'innovation', 'ethics']
        if (!item.headline || typeof item.headline !== 'string') {
          throw new Error(`Invalid headline in item ${index}`)
        }
        if (!item.summary || typeof item.summary !== 'string') {
          throw new Error(`Invalid summary in item ${index}`)
        }
        if (!item.source || typeof item.source !== 'string') {
          throw new Error(`Invalid source in item ${index}`)
        }
        if (!item.category || !validCategories.includes(item.category)) {
          throw new Error(`Invalid category in item ${index}`)
        }
        if (!item.link || typeof item.link !== 'string' || !item.link.startsWith('http')) {
          throw new Error(`Invalid link in item ${index}`)
        }
      })

      console.log('Successfully validated news items:', newsItems)
    } catch (e) {
      console.error('Failed to parse or validate news items:', e)
      console.error('Raw content that failed validation:', content)
      throw new Error(`Invalid news format: ${e.message}`)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Storing news items in database...')

    // Insert each news item into the database
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