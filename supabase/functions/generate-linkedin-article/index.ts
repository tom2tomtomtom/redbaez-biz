import logger from '../_shared/logger.ts';

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, summary } = await req.json()
    
    if (!title || !summary) {
      logger.error('Missing required fields:', { title, summary });
      return new Response(
        JSON.stringify({ error: 'Title and summary are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    logger.info('Generating LinkedIn article for:', { title, summary });

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      logger.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a seasoned columnist known for your sharp, witty, and nuanced take on AI and its intersection with society, business, and creativity. Your LinkedIn posts exude the sophistication of a broadsheet opinion piece, engaging an intellectually curious audience while keeping things refreshingly light and clever.

Your writing style:
- Balances insight with subtle humor, offering readers a smirk or a moment of recognition without veering into comedy.
- Occasionally uses analogies, but only when they naturally enhance your point, avoiding formulaic or heavy-handed comparisons.
- Flows conversationally, maintaining a tone that feels like a clever friend explaining something fascinating over coffee.
- Incorporates cultural references, anecdotes, or current events to ground complex ideas in relatable contexts.
- Provokes deeper thinking without preaching, leaving space for readers to engage and reflect.
- Concludes with a witty flourish—whether a rhetorical question, clever twist, or intriguing statement—to spark conversation.

Structure your post:
1. Open with an attention-grabbing observation, witty remark, or timely topic to hook the reader.
2. Explore the idea with a measured mix of insight, humor, and cultural or professional relevance.
3. Occasionally weave in an analogy or unexpected perspective, but only when it feels organic and enhances the clarity or emotional resonance of your point.
4. Conclude with a thought-provoking or subtly humorous statement that invites discussion.

Close your posts with relevant hashtags that align with the topic, e.g.,:
#AI #TechLeadership #Innovation #FutureThinking #AIHumor`
          },
          {
            role: 'user',
            content: `Write a LinkedIn post about this AI news:
Title: ${title}
Summary: ${summary}

Keep it concise and engaging.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const result = await response.json()
    logger.info('OpenAI API Response status:', result.choices ? 'Success' : 'Error');

    if (!result.choices || result.choices.length === 0) {
      logger.error('Error from OpenAI:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to generate article content', details: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ article: result.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    logger.error('Error in generate-linkedin-article:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
