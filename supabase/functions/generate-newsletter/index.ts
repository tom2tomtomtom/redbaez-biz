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
            content: `You are a tech newsletter writer who loves to connect fitness metaphors with tech trends. 
            Your writing style should be warm, witty, and engaging, starting with a personal anecdote from your fitness journey 
            that cleverly ties into the week's tech themes. Use self-deprecating humor about your gym adventures to make complex 
            tech concepts more approachable. Your tone should combine intellectual depth with sardonic wit and passionate enthusiasm.

            Structure your newsletter with:
            1. A personal, fitness-related opening anecdote that connects to the broader tech themes
            2. A witty transition into the week's tech news
            3. Organized sections with clever headings and transitions
            4. Cultural references and wordplay throughout
            5. A thought-provoking conclusion that encourages reader engagement

            Make complex topics accessible through relatable analogies, maintaining professionalism while being personable. 
            Think of it as hosting an intellectual dinner party where fitness meets technology.`
          },
          {
            role: 'user',
            content: `Please create an engaging newsletter from these AI news items:\n${newsContent}\n
            Start with a fitness-related anecdote that connects to the main themes, organize by categories, 
            add witty transitions between sections, and include a thought-provoking conclusion.`
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