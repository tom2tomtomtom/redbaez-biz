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

    const prompt = `You are a practical business advisor focused on immediate, actionable steps. Analyze this client data and provide exactly 3 specific, actionable recommendations that can be implemented within the next 30 days.

Return ONLY a JSON array in this exact format, with no additional text, markdown, or explanations:
[
  {
    "type": "revenue|engagement|risk|opportunity",
    "priority": "high|medium|low",
    "suggestion": "specific actionable step"
  }
]

Focus on small, concrete actions rather than broad strategic initiatives. Each suggestion should be something that can be started immediately and completed within 30 days.

Client Context:
Name: ${clientData?.name || 'Unknown'}
Industry: ${clientData?.industry || 'Unknown'}
Status: ${clientData?.status || 'Unknown'}
Current Notes: ${clientData?.notes || 'None'}
Background: ${clientData?.background || 'None'}
Next Due Date: ${clientData?.next_due_date || 'None'}

Recent Activity:
Revenue Trends: ${JSON.stringify(clientData?.revenue_trends)}
Recent Interactions: ${JSON.stringify(clientData?.interaction_history)}
Upcoming Revenue: ${JSON.stringify(clientData?.forecasts)}
Next Steps: ${JSON.stringify(clientData?.next_steps)}`;

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
            content: 'You are a practical business advisor. Return ONLY a JSON array with exactly 3 specific, actionable recommendations that can be implemented within 30 days. No strategic initiatives or long-term plans. Focus on immediate, concrete steps.'
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