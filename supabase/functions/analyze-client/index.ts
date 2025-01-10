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

const PARTNERSHIPS_PROMPT = `
Imagine you're the Head of Partnerships at RedBaez, an innovative AI consultancy. Your mission is to identify and develop strategic partnerships that enhance RedBaez's market position and service offerings.

Consider the following:
• Target Partners: Tech companies, AI startups, enterprise software providers, and digital agencies
• Core Strengths: AI expertise, creative solutions, operational excellence
• Goals: Expand service offerings, increase market reach, and create mutual value

Focus on RedBaez's partnership opportunities:
1. Technology Integration: Partnerships with AI tool providers and platforms
2. Service Enhancement: Collaborations that expand our capabilities
3. Market Access: Strategic alliances for new market entry

Partnership Types and Value Ranges:
- Technology Integration Partnerships ($50,000-$200,000 annual value)
- Co-Marketing Initiatives ($25,000-$100,000 per campaign)
- Joint Service Offerings ($100,000-$500,000 potential revenue)
- Channel Partnerships ($50,000-$250,000 annual revenue)
`;

const PRODUCT_DEVELOPMENT_PROMPT = `
Imagine you're the Chief Product Officer at RedBaez, leading the development of cutting-edge AI products and services. Your focus is on creating innovative solutions that solve real business problems.

Consider the following:
• Target Market: Mid to large enterprises, agencies, and tech companies
• Core Technology: AI/ML, automation, content generation
• Goals: Build scalable products, drive innovation, create recurring revenue

Focus on RedBaez's product opportunities:
1. AI-Powered Solutions: Tools that enhance business operations
2. Custom Development: Tailored solutions for specific industries
3. Platform Integration: Solutions that work with existing tech stacks

Product Categories and Pricing:
- AI Content Platform ($5,000-$20,000/month)
- Custom AI Solutions ($50,000-$200,000)
- Integration Services ($25,000-$100,000)
- Managed AI Services ($10,000-$50,000/month)
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
      ` : `Create 3 strategic ${category} recommendations for RedBaez`;

      const strategyPrompt = `${userPromptAnalysis}

      Company Context:
      ${contextPrompt}
      
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
      3. Actionable ideas that leverage current events
      4. Ways to establish thought leadership through timely insights
      5. Opportunities specific to the ${category} sector`;

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
              content: `You are a ${category} strategist with deep knowledge of current tech events and industry developments. Create highly specific recommendations that reference actual events, announcements, or developments. Include concrete details and statistics when possible.`
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