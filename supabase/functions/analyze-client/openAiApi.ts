
import { corsHeaders } from "../_shared/cors.ts";

export async function generateRecommendations(prompt: string, apiKey: string) {
  console.log('Generating recommendations with prompt:', prompt);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a strategic marketing advisor specializing in AI technology marketing. 
            Your expertise includes LinkedIn strategy, content marketing, thought leadership, and event marketing.
            Create highly specific recommendations that reference actual events, trends, and case studies.
            Focus on innovative ideas that blend entertainment with education and drive engagement.
            Return ONLY a valid JSON object with a recommendations array containing objects with type, priority, and suggestion fields.
            The response must be in this exact format:
            {
              "recommendations": [
                {
                  "type": "revenue" | "engagement" | "risk" | "opportunity",
                  "priority": "high" | "medium" | "low",
                  "suggestion": "specific actionable recommendation"
                }
              ]
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { "type": "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw OpenAI response:', data);

    try {
      // Extract the content and ensure it's valid JSON
      const content = data.choices[0].message.content;
      console.log('Parsing content:', content);
      
      const parsed = JSON.parse(content);
      console.log('Parsed recommendations:', parsed);
      
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response format: recommendations array is missing');
      }
      
      return parsed.recommendations;
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error(`Failed to parse AI recommendations: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    throw error;
  }
}
