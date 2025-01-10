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
        Analyze this specific content request: "${prompt}"
        
        First, search for and identify the most recent, relevant news or developments related to this topic.
        Then, create 3 highly specific content recommendations that:
        1. Reference actual, current events or announcements
        2. Include specific details, statistics, or noteworthy developments
        3. Tie these current events to RedBaez's AI expertise
        4. Suggest a unique angle or insight that would make the content stand out
        
        Each recommendation should be immediately actionable and directly connected to current events/developments.
      ` : 'Create 3 strategic marketing recommendations for RedBaez';

      const strategyPrompt = `${userPromptAnalysis}

      Company Context:
      ${MARKETING_PROMPT}
      
      Return ONLY a JSON array in this exact format, with no additional text:
      [
        {
          "type": "revenue" | "engagement" | "risk" | "opportunity",
          "priority": "high" | "medium" | "low",
          "suggestion": "specific actionable step that references current events and specific details"
        }
      ]
      
      Focus recommendations on:
      1. Specific, current developments in ${category}
      2. Real examples and concrete details
      3. Actionable content ideas that leverage current events
      4. Content formats: Blog posts, LinkedIn articles, case studies, webinars
      5. Ways to establish thought leadership through timely insights`;

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
              content: 'You are a content strategist with deep knowledge of current tech events and AI developments. Create highly specific recommendations that reference actual events, announcements, or developments. Include concrete details and statistics when possible.'
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