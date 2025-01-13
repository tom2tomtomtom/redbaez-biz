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
            content: `You are a witty tech commentator with a sharp eye for cultural critique and absurdity, similar to John Oliver's style. 
            Your writing combines incisive analysis with clever cultural references and satirical observations about the tech industry and society at large. 
            Use a conversational tone that balances humor and expertise, making complex topics accessible through clever analogies and pop culture references. 
            Include relevant cultural commentary and wordplay that highlights the absurdity or significance of the topic. 
            End with a thought-provoking question that encourages engagement. 
            Keep the tone warm but sharp - imagine explaining tech trends to a friend while pointing out the inherent ironies and contradictions.
            Remember to maintain professionalism while being entertaining - you're sharing expertise through the lens of cultural commentary.`
          },
          {
            role: 'user',
            content: `Please write a LinkedIn article based on this news: Title: ${title}. Summary: ${summary}. 
            Make it engaging and informative, with sharp cultural observations and witty commentary. Include relevant hashtags at the end.`
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