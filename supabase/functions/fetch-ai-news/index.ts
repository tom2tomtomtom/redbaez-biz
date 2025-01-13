import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const SYSTEM_PROMPT = `You are an AI news curator for a website. Your task is to find and summarize the latest AI news stories.

Format your response EXACTLY as a JSON string with this structure:
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

Return exactly 5 recent news items.`

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
        temperature: 0.1,
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
    console.log('Perplexity API response:', JSON.stringify(data))

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response structure:', data)
      throw new Error('Invalid API response structure')
    }

    const content = data.choices[0].message.content
    console.log('Raw content:', content)
    
    let newsItems
    try {
      // Try to parse the content as JSON
      newsItems = JSON.parse(content.trim())
      
      // Validate the structure
      if (!newsItems?.news || !Array.isArray(newsItems.news)) {
        console.error('Invalid news format:', content)
        throw new Error('Invalid news array format')
      }

      // Validate each news item
      newsItems.news.forEach((item, index) => {
        if (!item.headline || !item.summary || !item.source || !item.category || !item.link) {
          console.error(`Invalid news item at index ${index}:`, item)
          throw new Error(`Invalid news item format at index ${index}`)
        }
      })

      console.log('Successfully parsed news items:', newsItems)
    } catch (e) {
      console.error('Failed to parse news items:', e, 'Content:', content)
      throw new Error(`Failed to parse news items: ${e.message}`)
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
        stack: error.stack 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})