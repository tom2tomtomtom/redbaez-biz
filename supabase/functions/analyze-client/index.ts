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

    // Format the data for analysis
    const prompt = `
      Analyze this client data and provide 3-4 strategic recommendations:
      
      Revenue Trends: ${JSON.stringify(clientData.revenue_trends)}
      Recent Interactions: ${JSON.stringify(clientData.interaction_history)}
      Upcoming Revenue: ${JSON.stringify(clientData.forecasts)}
      Next Steps: ${JSON.stringify(clientData.next_steps)}
      
      For each recommendation:
      1. Identify if it's a revenue, engagement, risk, or opportunity type
      2. Assign a priority (high, medium, low)
      3. Provide a specific, actionable suggestion
      
      Format as JSON array with type, priority, and suggestion fields.
    `;

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
            content: 'You are a strategic business advisor analyzing CRM data. Provide specific, actionable recommendations.'
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

    // Parse the AI response and format recommendations
    let recommendations = [];
    try {
      const content = aiResponse.choices[0].message.content;
      recommendations = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback parsing logic if the AI doesn't return perfect JSON
      const content = aiResponse.choices[0].message.content;
      // Extract recommendations from the text response
      recommendations = content.split('\n')
        .filter(line => line.trim().length > 0)
        .map((line, index) => ({
          type: 'opportunity',
          priority: 'medium',
          suggestion: line.trim()
        }));
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