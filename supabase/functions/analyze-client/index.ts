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
    const { category, prompt, type, clientData } = await req.json();
    
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      throw new Error('Perplexity API key not configured in Supabase Edge Function Secrets');
    }

    // If it's a strategy request, use a different prompt
    if (type === 'strategy') {
      const strategyPrompt = `As a strategic business advisor, analyze and provide 3 specific, actionable recommendations for the ${category} category.
      
      ${prompt ? `Additional context or constraints: ${prompt}` : ''}
      
      Return ONLY a JSON array in this exact format, with no additional text or explanations:
      [
        {
          "type": "revenue",
          "priority": "high",
          "suggestion": "specific actionable step"
        }
      ]
      
      Valid types are ONLY: "revenue", "engagement", "risk", "opportunity"
      Valid priorities are ONLY: "high", "medium", "low"
      
      Focus on:
      1. Immediate actionable steps
      2. Measurable outcomes
      3. Industry best practices
      4. Current market trends
      5. Competitive advantages`;

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
    } else {
      // Handle client analysis
      console.log('Analyzing client data:', clientData);

      // First, let's get relevant news about the client
      const newsPrompt = `Search for and summarize the latest business news, developments, and market trends related to ${clientData?.name || 'Unknown'} in the ${clientData?.industry || 'Unknown'} industry. Focus on news from the last 3 months that could impact their marketing and AI needs.`;

      // Get news context first
      const newsResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
              content: 'You are a business analyst. Provide a brief, factual summary of recent news and developments.'
            },
            {
              role: 'user',
              content: newsPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!newsResponse.ok) {
        const errorText = await newsResponse.text();
        console.error('Error from Perplexity API (news):', errorText);
        throw new Error(`Failed to get news from Perplexity API: ${errorText}`);
      }

      const newsData = await newsResponse.json();
      const newsContext = newsData.choices[0].message.content;
      console.log('Retrieved news context:', newsContext);

      const clientPrompt = `You are a strategic business advisor for RedBaez, an AI-focused creative and marketing solutions company. Analyze this client data and recent news to provide exactly 3 specific, actionable recommendations that align with RedBaez's service offerings and can be implemented within the next 30 days.

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

Example Actions to Consider:
Building Rapport:
- Schedule casual coffee chats or virtual calls
- Send personalized follow-up emails
- Engage with their content on social platforms
- Congratulate on achievements
- Make relevant introductions

Showcasing Value:
- Share relevant case studies
- Offer free demonstrations
- Provide mini-audits
- Present before/after comparisons
- Share success metrics

Demonstrating Expertise:
- Share whitepapers or trend reports
- Invite to workshops
- Create custom ROI analysis
- Offer interactive consultations
- Provide tailored case studies

Personalized Engagement:
- Create branded microsites
- Offer pilot projects
- Generate AI creative mockups
- Host live brainstorming sessions
- Transform static assets

Building Internal Advocacy:
- Help create internal pitches
- Develop leadership presentations
- Invite to co-creation sessions
- Share compliance examples
- Provide stakeholder materials

Creating Urgency:
- Highlight upcoming deadlines
- Offer limited-time packages
- Mention limited availability
- Frame tools as competitive necessity
- Emphasize market opportunities

Recent News and Market Context:
${newsContext}

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
8. Recent news and market developments that could impact strategy

Focus recommendations on:
1. Immediate revenue opportunities through RedBaez's service offerings
2. Strategic engagement points based on client's industry and size
3. Risk mitigation and relationship strengthening
4. Specific, measurable actions with clear next steps
5. Opportunities identified from recent news and market developments`;

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
              content: clientPrompt
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