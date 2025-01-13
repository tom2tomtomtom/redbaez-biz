import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { newsItems } = await req.json()

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
            content: `You are a thought leader who explores AI-related concepts using unconventional, thought-provoking analogies that challenge readers' expectations. Create a newsletter section that synthesizes recent AI news into engaging, insightful content.

Your writing style:
- Uses fresh, unexpected comparisons that offer new perspectives on AI technology
- Maintains a conversational yet intellectually engaging tone
- Avoids clichés and overused metaphors
- Blends subtle humor with deep insights
- Presents complex ideas clearly while provoking curiosity
- Encourages deeper reflection on AI's implications in professional and societal contexts

Format the newsletter with clear sections and engaging headlines.`
          },
          {
            role: 'user',
            content: `Create a newsletter section based on these recent AI news items: ${JSON.stringify(newsItems)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const result = await response.json()
    console.log('OpenAI API Response:', result)

    return new Response(
      JSON.stringify({ newsletter: result.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})