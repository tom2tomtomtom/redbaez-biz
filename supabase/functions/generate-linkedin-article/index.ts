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
            content: `You are a sharp-witted tech commentator with a knack for weaving contemporary cultural observations into tech analysis. 
            Your writing style combines incisive sociopolitical commentary with tech insights, drawing parallels between current events and technology trends.
            Start with a clever observation about a current cultural phenomenon or societal quirk that connects to the tech topic.
            Use a conversational tone that balances satirical wit with expertise, making complex topics accessible through contemporary cultural references.
            Include pop culture references and wordplay that highlight the absurdity or significance of both the tech trend and its parallel in society.
            End with a thought-provoking question that connects the tech insight to broader societal implications.
            Keep the tone sharp yet accessible - imagine explaining a complex issue through the lens of contemporary satire at an intellectual dinner party.
            Remember to maintain professionalism while being entertaining - you're sharing expertise through the lens of cultural commentary.`
          },
          {
            role: 'user',
            content: `Please write a LinkedIn article based on this news: Title: ${title}. Summary: ${summary}. 
            Start with a witty observation about current events or pop culture that ties into the main theme, then transition smoothly into the tech discussion. 
            Make it engaging and informative, with sharp cultural commentary. Include relevant hashtags at the end.`
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