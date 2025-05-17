import logger from '../_shared/logger.ts';

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface NewsItem {
  title: string;
  summary: string | null;
  category: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { newsItems } = await req.json()
    
    if (!Array.isArray(newsItems) || newsItems.length === 0) {
      throw new Error('No news items provided')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI newsletter writer who creates concise, informative, and engaging newsletters about recent AI news. 
            
Your newsletters should:
1. Have a professional but friendly tone
2. Begin with a compelling introduction summarizing key trends
3. Group news items by category (Tools, Training, Innovation, Ethics)
4. Provide brief but insightful commentary for each item
5. End with a forward-looking conclusion
6. Format the newsletter with markdown for readability
7. Keep it under 1000 words
8. Include a catchy title at the beginning
`
          },
          {
            role: 'user',
            content: `Create a professional AI newsletter using these recent news items:
            
${JSON.stringify(newsItems, null, 2)}

Organize them by category and add insightful commentary.`
          }
        ],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    })

    const result = await response.json()
    logger.info('OpenAI API Response:', result)

    return new Response(
      JSON.stringify({ newsletter: result.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    logger.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
