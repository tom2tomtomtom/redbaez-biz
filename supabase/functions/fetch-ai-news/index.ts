import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

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
    const hfKey = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    
    if (!perplexityKey || !hfKey) {
      throw new Error('Missing API keys')
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
        temperature: 0.05,
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
      newsItems = JSON.parse(content)
      
      if (!newsItems?.news || !Array.isArray(newsItems.news)) {
        console.error('Invalid news format:', content)
        throw new Error('Response must contain a "news" array')
      }

      if (newsItems.news.length !== 5) {
        console.error('Wrong number of news items:', newsItems.news.length)
        throw new Error('Response must contain exactly 5 news items')
      }

      // Initialize Hugging Face client
      const hf = new HfInference(hfKey)

      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials')
      }

      const supabase = createClient(supabaseUrl, supabaseKey)
      console.log('Storing news items in database...')

      // Process each news item and generate an image
      for (const item of newsItems.news) {
        console.log('Generating image for:', item.headline)
        
        try {
          // Verify Hugging Face token before attempting image generation
          try {
            console.log('Verifying Hugging Face token...')
            const testResponse = await fetch('https://huggingface.co/api/whoami', {
              headers: {
                'Authorization': `Bearer ${hfKey}`
              }
            });
            
            if (!testResponse.ok) {
              console.error('Invalid Hugging Face token:', await testResponse.text())
              throw new Error('Invalid Hugging Face token - please check your API key')
            }
          } catch (error) {
            console.error('Error verifying Hugging Face token:', error)
            // Store the news item without an image
            const { error: dbError } = await supabase
              .from('ai_news')
              .insert({
                title: item.headline,
                summary: item.summary,
                source: item.source,
                category: item.category,
                url: item.link,
              })
            
            if (dbError) throw dbError
            continue // Skip image generation for this item
          }

          const image = await hf.textToImage({
            inputs: `${item.headline} - ${item.summary.substring(0, 100)}`,
            model: 'black-forest-labs/FLUX.1-schnell',
          })

          // Convert the blob to a base64 string
          const arrayBuffer = await image.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          const imageUrl = `data:image/png;base64,${base64}`

          const { error } = await supabase
            .from('ai_news')
            .insert({
              title: item.headline,
              summary: item.summary,
              source: item.source,
              category: item.category,
              url: item.link,
              image_url: imageUrl,
            })
          
          if (error) {
            console.error('Error inserting news item:', error)
            throw error
          }
        } catch (error) {
          console.error('Error generating image:', error)
          // Continue with other items even if image generation fails
          const { error: dbError } = await supabase
            .from('ai_news')
            .insert({
              title: item.headline,
              summary: item.summary,
              source: item.source,
              category: item.category,
              url: item.link,
            })
          
          if (dbError) {
            console.error('Error inserting news item:', dbError)
            throw dbError
          }
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