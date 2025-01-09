import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

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
    const { clientData } = await req.json();
    console.log('Analyzing client data:', clientData);

    const prompt = `As a strategic business advisor, analyze this client data and provide actionable recommendations:

Revenue Analysis:
${JSON.stringify(clientData.revenue_trends, null, 2)}

Recent Interactions:
${JSON.stringify(clientData.interaction_history, null, 2)}

Pending Actions:
${JSON.stringify(clientData.next_steps, null, 2)}

Future Forecasts:
${JSON.stringify(clientData.forecasts, null, 2)}

Provide 3-5 strategic recommendations in the following JSON format:
{
  "recommendations": [
    {
      "type": "revenue|engagement|risk|opportunity",
      "suggestion": "detailed actionable suggestion",
      "priority": "high|medium|low"
    }
  ]
}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a strategic business advisor analyzing CRM data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000
      })
    });

    const aiResponse = await response.json();
    console.log('AI Response:', aiResponse);

    const suggestions = JSON.parse(aiResponse.choices[0].message.content);
    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-client function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});