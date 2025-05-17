import logger from '../_shared/logger.ts';

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateRecommendations } from "./openAiApi.ts";
import { MARKETING_PROMPT, PARTNERSHIPS_PROMPT, PRODUCT_DEVELOPMENT_PROMPT } from "./prompts.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Extract request data with validation
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      logger.error("Failed to parse request JSON:", e);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          recommendations: getFallbackRecommendations("marketing") 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { clientData, category = "marketing", prompt, type = "strategy" } = requestData;
    logger.info('Received request:', { category, type, prompt, clientData });
    
    // Check if OpenAI API key is available
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      logger.error('OpenAI API key not configured in Supabase Edge Function Secrets');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured', 
          recommendations: getFallbackRecommendations(category)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let recommendations;
    
    if (type === 'strategy') {
      // Select appropriate context prompt based on category
      let contextPrompt = MARKETING_PROMPT;
      if (category === 'partnerships') {
        contextPrompt = PARTNERSHIPS_PROMPT;
      } else if (category === 'product development') {
        contextPrompt = PRODUCT_DEVELOPMENT_PROMPT;
      }

      // Build prompt for generating recommendations
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

      logger.info('Sending request to OpenAI API with prompt:', strategyPrompt);

      try {
        recommendations = await generateRecommendations(strategyPrompt, apiKey);
        logger.info('Processed recommendations:', recommendations);
      } catch (aiError) {
        logger.error('Error generating AI recommendations:', aiError);
        recommendations = getFallbackRecommendations(category);
      }
    } else {
      // Handle client analysis
      if (!clientData) {
        logger.error('Client data is required for analysis but was not provided');
        return new Response(
          JSON.stringify({ 
            error: 'Client data is required for analysis',
            recommendations: getFallbackRecommendations("general")
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logger.info('Analyzing client data:', clientData);

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

      logger.info('Sending client analysis request to OpenAI API');
      try {
        recommendations = await generateRecommendations(analysisPrompt, apiKey);
        logger.info('Generated client recommendations:', recommendations);
      } catch (aiError) {
        logger.error('Error generating client recommendations:', aiError);
        recommendations = getFallbackRecommendations("client");
      }
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Error in analyze-client function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the Edge Function logs for more information',
        recommendations: getFallbackRecommendations("general")
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback recommendations when API calls fail
function getFallbackRecommendations(category: string) {
  if (category === "marketing") {
    return [
      {
        type: "engagement",
        priority: "high",
        suggestion: "Launch a weekly AI industry newsletter summarizing key developments and providing actionable insights for marketing teams"
      },
      {
        type: "opportunity",
        priority: "medium",
        suggestion: "Develop a content series on 'AI Marketing Success Stories' featuring case studies and implementation strategies"
      },
      {
        type: "revenue",
        priority: "medium",
        suggestion: "Create a specialized workshop for marketing teams on integrating AI tools into their existing workflows"
      }
    ];
  } else if (category === "partnerships") {
    return [
      {
        type: "opportunity",
        priority: "high",
        suggestion: "Identify and approach 5 complementary AI services companies for potential partnership on bundled service offerings"
      },
      {
        type: "revenue",
        priority: "medium",
        suggestion: "Develop a referral program with existing clients to incentivize introductions to their industry partners"
      },
      {
        type: "engagement",
        priority: "medium",
        suggestion: "Host a quarterly virtual roundtable for potential partners to discuss industry trends and collaboration opportunities"
      }
    ];
  } else if (category === "product development") {
    return [
      {
        type: "opportunity",
        priority: "high",
        suggestion: "Conduct a competitive analysis of current AI development tools to identify market gaps for potential new products"
      },
      {
        type: "engagement",
        priority: "medium",
        suggestion: "Implement a customer feedback system for existing products to prioritize feature development"
      },
      {
        type: "risk",
        priority: "high",
        suggestion: "Create a regular technical debt assessment process to maintain product quality and performance"
      }
    ];
  } else if (category === "client") {
    return [
      {
        type: "engagement",
        priority: "high",
        suggestion: "Schedule a strategic planning session to align on upcoming initiatives and identify new opportunities"
      },
      {
        type: "revenue",
        priority: "medium",
        suggestion: "Present an expanded service proposal based on the client's recent business developments"
      },
      {
        type: "opportunity",
        priority: "medium",
        suggestion: "Identify cross-selling opportunities by analyzing current service utilization patterns"
      }
    ];
  } else {
    return [
      {
        type: "opportunity",
        priority: "high",
        suggestion: "Conduct a comprehensive business review to identify growth opportunities across all departments"
      },
      {
        type: "risk",
        priority: "medium",
        suggestion: "Develop a contingency plan for potential market disruptions in the AI industry"
      },
      {
        type: "engagement",
        priority: "medium",
        suggestion: "Implement a structured knowledge sharing program across teams to leverage collective expertise"
      }
    ];
  }
}
