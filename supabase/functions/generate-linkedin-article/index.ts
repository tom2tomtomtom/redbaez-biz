import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
            content: 'You are a professional content writer specializing in LinkedIn articles. Create engaging, professional content that is informative and maintains a professional tone.'
          },
          {
            role: 'user',
            content: `Please write a LinkedIn article based on this news: Title: ${title}. Summary: ${summary}. 
            The article should be well-structured with an engaging introduction, key points, and a conclusion. 
            Include relevant hashtags at the end.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (data.error) {
      throw new Error(data.error.message || 'Error generating article');
    }

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
      JSON.stringify({ error: error.message }),
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