import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, generateRecommendations } from "./openAiApi.ts";
import { MARKETING_PROMPT, PARTNERSHIPS_PROMPT, PRODUCT_DEVELOPMENT_PROMPT } from "./prompts.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientData, category, prompt, type } = await req.json();
    console.log('Received request:', { category, type, prompt, clientData });
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured in Supabase Edge Function Secrets');
    }

    let recommendations;
    
    if (type === 'strategy') {
      let contextPrompt = MARKETING_PROMPT;
      if (category === 'partnerships') {
        contextPrompt = PARTNERSHIPS_PROMPT;
      } else if (category === 'product development') {
        contextPrompt = PRODUCT_DEVELOPMENT_PROMPT;
      }

      const userPromptAnalysis = prompt ? `
        Analyze this specific content request: "${prompt}"
        
        First, search for and identify the most recent, relevant news or developments related to this topic.
        Then, create 3 highly specific content recommendations that:
        1. Reference actual, current events or announcements
        2. Include specific details, statistics, or noteworthy developments
        3. Tie these current events to RedBaez's ${category} expertise
        4. Suggest a unique angle or insight that would make the content stand out
        
        Each recommendation should be immediately actionable and directly connected to current events/developments.
        IMPORTANT: Do not use any square brackets [] in your suggestions.
      ` : `Create 3 strategic ${category} recommendations for RedBaez`;

      const strategyPrompt = `${userPromptAnalysis}

      Company Context:
      ${contextPrompt}
      
      Return ONLY a JSON array in this exact format, with no additional text or markdown:
      [
        {
          "type": "revenue" | "engagement" | "risk" | "opportunity",
          "priority": "high" | "medium" | "low",
          "suggestion": "specific actionable step that references current events and specific details"
        }
      ]
      
      IMPORTANT: Do not use any square brackets [] within the suggestion text.`;

      console.log('Sending request to OpenAI API with prompt:', strategyPrompt);

      recommendations = await generateRecommendations(strategyPrompt, apiKey);
      console.log('Processed recommendations:', recommendations);
    } else {
      // Handle client analysis
      if (!clientData) {
        throw new Error('Client data is required for analysis');
      }

      console.log('Analyzing client data:', clientData);

      const analysisPrompt = `
        Analyze this client data and generate 3 strategic recommendations:
        ${JSON.stringify(clientData, null, 2)}

        For each recommendation:
        1. Focus on revenue growth, engagement improvement, risk mitigation, or new opportunities
        2. Consider the client's current status, revenue trends, and interaction history
        3. Provide specific, actionable steps
        4. Prioritize based on potential impact and urgency

        Return ONLY a JSON array in this exact format, with no additional text or markdown:
        [
          {
            "type": "revenue" | "engagement" | "risk" | "opportunity",
            "priority": "high" | "medium" | "low",
            "suggestion": "specific actionable recommendation"
          }
        ]

        IMPORTANT: Do not use any square brackets [] within the suggestion text.
      `;

      console.log('Sending client analysis request to OpenAI API');
      recommendations = await generateRecommendations(analysisPrompt, apiKey);
      console.log('Generated client recommendations:', recommendations);
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-client function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the Edge Function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});