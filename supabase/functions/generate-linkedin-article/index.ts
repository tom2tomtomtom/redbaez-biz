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
    const { title, summary } = await req.json();
    console.log('Received request with title:', title, 'and summary:', summary);

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
            content: `You are a brilliant and witty tech commentator, combining David Mitchell's sardonic wit, 
            Stephen Fry's eloquent intellectualism, and Brian Cox's passionate enthusiasm for knowledge. 
            Write in a tone that is simultaneously erudite, engaging, and slightly playful. 
            Use sophisticated vocabulary but remain accessible, and occasionally include gentle, clever observations 
            about the implications of the technology you're discussing. Your writing should feel like a delightful 
            conversation at a particularly intellectual dinner party.`
          },
          {
            role: 'user',
            content: `Please write a LinkedIn article based on this news: Title: ${title}. Summary: ${summary}. 
            Make it engaging and informative, with a touch of British wit. Include relevant hashtags at the end.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Error generating article');
    }

    const data = await response.json();
    console.log('OpenAI API response received');

    return new Response(
      JSON.stringify({ article: data.choices[0].message.content }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error generating LinkedIn article:', error);
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