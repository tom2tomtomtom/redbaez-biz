import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MARKETING_PROMPT = `
Imagine you're the CMO of a cutting-edge AI consultancy, RedBaez, revolutionizing how businesses operate and market themselves. Your mission is to craft unique, impactful marketing strategies that establish RedBaez as the go-to expert for AI-driven creativity, content scaling, and operational excellence.

Consider the following:
• Audience: Businesses with 100+ employees, agencies, and marketers keen on optimizing processes or boosting digital marketing strategies.
• Core Strengths: AI-powered campaign innovation, scaled content creation, and workflow optimization.
• Goals: Build brand awareness, generate leads, and establish thought leadership in the AI space.

Focus on RedBaez's unique selling points:
1. Efficiency Meets Creativity: Showcase how AI transforms operations while fueling innovative marketing campaigns.
2. Scalable Solutions: Emphasize AI's ability to generate diverse, targeted content at scale.
3. Thought Leadership: Position RedBaez as a visionary in AI adoption.

Services and Pricing:
- AI-Centric Creative Campaigns ($15,000-$50,000)
- Scaled Content Execution ($15,000-$40,000)
- AI Optimization Consultation ($15,000-$50,000)
- AI Tools Training ($10,000-$20,000)
`;

serve(async (req) => {
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

    if (type === 'strategy') {
      const userPromptAnalysis = prompt ? `
        Create 3 highly specific content recommendations based on this user input: "${prompt}"
        
        Consider:
        1. How can we tie this specific topic to RedBaez's AI expertise?
        2. What unique angles or insights can we offer?
        3. How can we make this content stand out in the current conversation?
        
        Format each recommendation to be immediately actionable and tied to current trends/discussions.
      ` : 'Create 3 strategic marketing recommendations for RedBaez';

      const strategyPrompt = `${userPromptAnalysis}

      Company Context:
      ${MARKETING_PROMPT}
      
      Return ONLY a JSON array in this exact format, with no additional text:
      [
        {
          "type": "revenue" | "engagement" | "risk" | "opportunity",
          "priority": "high" | "medium" | "low",
          "suggestion": "specific actionable step"
        }
      ]
      
      Focus recommendations on:
      1. Creative marketing initiatives that showcase our AI expertise
      2. Lead generation tactics within our service price ranges
      3. Thought leadership opportunities in ${category}
      4. Content formats: Blog series, case studies, interactive tools, webinars, social campaigns
      5. Engagement channels: LinkedIn, YouTube, Meta, TikTok, and events`;

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
              content: 'You are a strategic content advisor. Create highly specific, actionable recommendations that directly address the user\'s input topic. Each suggestion should be unique and tied to current trends.'
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