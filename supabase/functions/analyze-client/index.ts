import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUSINESS_CONTEXT = `
RedBaez is an AI-powered agency focusing on:
1. AI-Powered Creativity for innovative campaigns
2. Optimization Mastery across platforms (Meta, TikTok, YouTube, Snap)
3. Operational Excellence for productivity

Key Services:
- AI-Centric Creative Campaigns ($15,000-$50,000)
- Scaled Content Execution ($15,000-$40,000)
- AI Optimization Consultation ($15,000-$50,000)
- AI Tools Training ($10,000-$20,000)

Target Market: Companies with 100+ employees seeking process optimization and enhanced digital content strategy.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, prompt, type } = await req.json();
    
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('Perplexity API key not configured in Supabase Edge Function Secrets');
    }

    console.log('Processing request for category:', category, 'type:', type);

    // If it's a strategy request, use a different prompt
    if (type === 'strategy') {
      const strategyPrompt = `As a strategic marketing advisor for ${category}, analyze our business context and provide 3 specific, actionable recommendations.

      Business Context:
      ${BUSINESS_CONTEXT}
      
      ${prompt ? `Additional context or constraints: ${prompt}` : ''}
      
      Return ONLY a JSON array in this exact format, with no additional text:
      [
        {
          "type": "revenue" | "engagement" | "risk" | "opportunity",
          "priority": "high" | "medium" | "low",
          "suggestion": "specific actionable step"
        }
      ]
      
      Focus on:
      1. Immediate actionable steps aligned with our service offerings
      2. Measurable outcomes within our price ranges
      3. Industry best practices for ${category}
      4. Current market trends in AI and digital marketing
      5. Competitive advantages based on our SWOT analysis`;

      console.log('Sending request to Perplexity API with prompt:', strategyPrompt);

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
              content: 'You are a strategic business advisor. Return ONLY a JSON array with exactly 3 specific, actionable recommendations.'
            },
            {
              role: 'user',
              content: strategyPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from Perplexity API:', errorText);
        throw new Error(`Failed to get response from Perplexity API: ${errorText}`);
      }

      const aiResponse = await response.json();
      console.log('Received AI response:', aiResponse);

      if (!aiResponse?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from AI');
      }

      let recommendations = [];
      try {
        const content = aiResponse.choices[0].message.content;
        recommendations = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
      } catch (error) {
        console.error('Error parsing AI response:', error);
        throw new Error(`Failed to parse AI recommendations: ${error.message}`);
      }

      return new Response(
        JSON.stringify({ recommendations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle other types of requests (if any)
    throw new Error('Invalid request type');
    
  } catch (error) {
    console.error('Error in analyze-client function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Please check the Edge Function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});