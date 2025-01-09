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
    const { clientData } = await req.json();
    console.log('Analyzing client data:', clientData);

    const prompt = `You are a strategic business advisor. Your task is to analyze the client data and provide exactly 3 strategic recommendations.

Return ONLY a JSON array in this exact format, with no additional text, markdown, or explanations:
[
  {
    "type": "revenue|engagement|risk|opportunity",
    "priority": "high|medium|low",
    "suggestion": "detailed actionable suggestion"
  }
]

Client Data:
Revenue Trends: ${JSON.stringify(clientData.revenue_trends)}
Recent Interactions: ${JSON.stringify(clientData.interaction_history)}
Upcoming Revenue: ${JSON.stringify(clientData.forecasts)}
Next Steps: ${JSON.stringify(clientData.next_steps)}`;

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    console.log('Sending request to Perplexity API');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a strategic business advisor. Return ONLY a JSON array with exactly 3 recommendations. No additional text or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    const aiResponse = await response.json();
    console.log('Received AI response:', aiResponse);

    let recommendations = [];
    try {
      const content = aiResponse.choices[0].message.content;
      // Remove any markdown formatting and clean up the response
      const cleanedContent = content
        .replace(/```json\n?|\n?```/g, '')  // Remove markdown code blocks
        .replace(/^[\s\S]*?\[/, '[')        // Remove any text before the array
        .replace(/\][\s\S]*$/, ']')         // Remove any text after the array
        .trim();
      
      recommendations = JSON.parse(cleanedContent);
      
      // Validate the structure of each recommendation
      if (!Array.isArray(recommendations) || recommendations.length !== 3) {
        throw new Error('Invalid recommendations format: must be an array of exactly 3 items');
      }
      
      recommendations.forEach((rec, index) => {
        if (!rec.type || !rec.priority || !rec.suggestion) {
          throw new Error(`Invalid recommendation format at index ${index}`);
        }
      });
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI recommendations');
    }

    console.log('Formatted recommendations:', recommendations);
    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-client function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});