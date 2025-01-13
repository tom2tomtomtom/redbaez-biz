import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const SYSTEM_PROMPT = `You are a dynamic content generator for the Redbaez website, tasked with delivering up-to-date AI news that aligns with Redbaez's mission of AI implementation, training, and innovative solutions.

Focus on:
- AI tools for marketing and ad creation
- Innovations in AI training and education
- Emerging AI technologies impacting ecommerce and business operations
- Ethical considerations and risks in AI usage

Format each news item as a JSON object with:
- headline: A short, engaging title
- summary: 2-3 sentence synopsis highlighting key points
- relevance: How it connects to Redbaez's focus areas
- source: The publication source
- category: One of [tools, training, innovation, ethics]

Return exactly 5 relevant and recent news items.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityKey) {
      throw new Error('Missing Perplexity API key')
    }

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
            content: 'Generate 5 recent and relevant AI news items for Redbaez.'
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
      }),
    })

    const data = await response.json()
    console.log('Perplexity API response:', data)

    if (!response.ok) {
      throw new Error('Failed to fetch AI news')
    }

    // Parse the response content as JSON
    const content = data.choices[0].message.content
    let newsItems
    try {
      newsItems = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse news items:', e)
      throw new Error('Invalid response format')
    }

    // Store news items in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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

    return new Response(JSON.stringify(newsItems), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})