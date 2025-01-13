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
            content: `You are a brilliant technology newsletter writer with the wit of David Mitchell, 
            the eloquence of Stephen Fry, and the passionate enthusiasm of Brian Cox. 
            Your writing style should be sophisticated yet accessible, combining intellectual depth with playful observations. 
            Imagine you're hosting a fascinating dinner party where you're explaining the latest AI developments to engaged guests. 
            Use clever analogies, occasional dry humor, and maintain an air of delighted fascination with the subject matter. 
            Your goal is to make complex AI topics both entertaining and comprehensible, while occasionally pointing out 
            the wonderful absurdities and implications of these technological advances.`
          },
          {
            role: 'user',
            content: `Please create an engaging newsletter from these AI news items:\n${newsContent}\n
            Organize it by categories, add witty transitions between sections, and include a clever introduction 
            and conclusion. Make it feel like a delightful conversation about the latest in AI.`
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