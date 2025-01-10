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
    
    const prompt = `You are a strategic business advisor for RedBaez, an AI-focused creative and marketing solutions company. Analyze this client data and provide exactly 3 specific, actionable recommendations that align with RedBaez's service offerings and can be implemented within the next 30 days.

Return ONLY a JSON array in this exact format, with no additional text, markdown, or explanations:
[
  {
    "type": "revenue",
    "priority": "high",
    "suggestion": "specific actionable step"
  }
]

Valid types are ONLY: "revenue", "engagement", "risk", "opportunity"
Valid priorities are ONLY: "high", "medium", "low"

RedBaez Service Offerings:
1. AI-Centric Creative Campaigns (AUD $15,000 - $50,000)
   - AI-driven campaign concepts
   - Interactive AI experiences
   - AI-powered engagement strategies

2. Scaled Content Execution (AUD $15,000 - $40,000)
   - AI audience segmentation
   - Content template development
   - A/B testing frameworks

3. AI Optimisation Consultation (AUD $15,000 - $50,000)
   - Workflow analysis
   - AI tool recommendations
   - ROI projections

4. AI Tools Training (AUD $10,000 - $20,000)
   - Custom training programs
   - Hands-on workshops
   - Usage guidelines

Client Context:
Name: ${clientData?.name || 'Unknown'}
Industry: ${clientData?.industry || 'Unknown'}
Status: ${clientData?.status || 'Unknown'}
Company Size: ${clientData?.company_size || 'Unknown'}
Annual Revenue: ${clientData?.annual_revenue || 'Unknown'}
Current Notes: ${clientData?.notes || 'None'}
Background: ${clientData?.background || 'None'}
Next Due Date: ${clientData?.next_due_date || 'None'}

Recent Activity:
Revenue Trends: ${JSON.stringify(clientData?.revenue_trends)}
Recent Interactions: ${JSON.stringify(clientData?.interaction_history)}
Upcoming Revenue: ${JSON.stringify(clientData?.forecasts)}
Next Steps: ${JSON.stringify(clientData?.next_steps)}

Consider:
1. Client's current status and engagement level
2. Historical interaction patterns
3. Revenue potential based on company size
4. Industry-specific AI opportunities
5. Alignment with RedBaez's service offerings
6. Implementation feasibility within 30 days
7. Previous recommendations and their implementation status

Focus recommendations on:
1. Immediate revenue opportunities through RedBaez's service offerings
2. Strategic engagement points based on client's industry and size
3. Risk mitigation and relationship strengthening
4. Specific, measurable actions with clear next steps`;

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      console.error('Error: Perplexity API key not configured');
      throw new Error('Perplexity API key not configured in Supabase Edge Function Secrets');
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
            content: 'You are a strategic business advisor. Return ONLY a JSON array with exactly 3 specific, actionable recommendations. Each recommendation must have a type (revenue/engagement/risk/opportunity), priority (high/medium/low), and a specific suggestion that aligns with RedBaez\'s service offerings and pricing.'
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from Perplexity API:', errorText);
      throw new Error(`Failed to get response from Perplexity API: ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('Received AI response:', aiResponse);

    if (!aiResponse?.choices?.[0]?.message?.content) {
      console.error('Invalid response format from AI:', aiResponse);
      throw new Error('Invalid response format from AI');
    }

    let recommendations = [];
    try {
      const content = aiResponse.choices[0].message.content;
      // Remove any markdown formatting and clean up the response
      const cleanedContent = content
        .replace(/```json\n?|\n?```/g, '')  // Remove markdown code blocks
        .replace(/^[\s\S]*?\[/, '[')        // Remove any text before the array
        .replace(/\][\s\S]*$/, ']')         // Remove any text after the array
        .trim();
      
      console.log('Cleaned content:', cleanedContent);
      recommendations = JSON.parse(cleanedContent);
      
      // Validate the structure of each recommendation
      if (!Array.isArray(recommendations) || recommendations.length !== 3) {
        throw new Error('Invalid recommendations format: must be an array of exactly 3 items');
      }
      
      const validTypes = ['revenue', 'engagement', 'risk', 'opportunity'];
      const validPriorities = ['high', 'medium', 'low'];
      
      recommendations = recommendations.map((rec, index) => {
        if (!rec.type || !rec.priority || !rec.suggestion) {
          throw new Error(`Missing required fields at index ${index}`);
        }
        
        const type = rec.type.toLowerCase();
        const priority = rec.priority.toLowerCase();
        
        if (!validTypes.includes(type)) {
          throw new Error(`Invalid type "${type}" at index ${index}. Must be one of: ${validTypes.join(', ')}`);
        }
        if (!validPriorities.includes(priority)) {
          throw new Error(`Invalid priority "${priority}" at index ${index}. Must be one of: ${validPriorities.join(', ')}`);
        }
        
        return {
          ...rec,
          type,
          priority
        };
      });
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error(`Failed to parse AI recommendations: ${error.message}`);
    }

    console.log('Formatted recommendations:', recommendations);
    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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