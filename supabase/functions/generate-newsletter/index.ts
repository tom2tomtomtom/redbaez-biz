import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsItems } = await req.json() as { newsItems: { title: string; summary: string | null; category: string | null; }[] };
    console.log('Received request with news items:', newsItems.length);

    const newsContent = newsItems.reduce((acc, item) => {
      return acc + `\n\n${item.title}\n${item.summary || ''}\nCategory: ${item.category || 'Uncategorized'}\n---`
    }, '');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a thought leader who creates engaging newsletters about AI developments using unconventional, thought-provoking analogies.
            Your writing approach:
            1. Use fresh, unexpected comparisons that offer new perspectives on AI technology
            2. Maintain a conversational yet intellectually engaging tone
            3. Avoid clichés and overused metaphors
            4. Present complex ideas clearly while provoking curiosity
            5. Connect different AI developments through innovative analogies
            6. Encourage deeper reflection on AI's implications
            
            Structure your newsletter with:
            - A compelling opening that introduces the main themes through an unexpected analogy
            - Clear sections with creative transitions
            - A thought-provoking conclusion that invites reader engagement
            
            Focus on making complex AI concepts accessible through fresh perspectives and unexpected comparisons.`
          },
          {
            role: 'user',
            content: `Please create an engaging newsletter from these AI news items:\n${newsContent}\n
            Use unexpected analogies and fresh perspectives to connect these developments and their implications.
            Organize by themes, add creative transitions, and end with a thought-provoking conclusion.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Error generating newsletter');
    }

    const data = await response.json();
    console.log('OpenAI API response received');

    return new Response(
      JSON.stringify({ newsletter: data.choices[0].message.content }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error generating newsletter:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    );
  }
});