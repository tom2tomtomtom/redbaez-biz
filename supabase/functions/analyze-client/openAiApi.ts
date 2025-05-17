
import { corsHeaders } from "../_shared/cors.ts";
import logger from "../_shared/logger.ts";

export async function generateRecommendations(prompt: string, apiKey: string) {
  logger.info('Generating recommendations with prompt:', prompt);
  
  try {
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: Must provide a non-empty string');
    }
    
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key: Must provide a valid OpenAI API key');
    }
    
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
      logger.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    logger.info('Raw OpenAI response:', data);

    try {
      // Extract the content and ensure it's valid JSON
      const content = data.choices[0].message.content;
      logger.info('Parsing content:', content);
      
      const parsed = JSON.parse(content);
      logger.info('Parsed recommendations:', parsed);
      
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response format: recommendations array is missing');
      }
      
      // Validate each recommendation object
      parsed.recommendations.forEach((rec, index) => {
        if (!rec.type || !rec.priority || !rec.suggestion) {
          throw new Error(`Invalid recommendation at index ${index}: missing required fields`);
        }
        
        if (!['revenue', 'engagement', 'risk', 'opportunity'].includes(rec.type)) {
          logger.warn(`Warning: recommendation ${index} has unusual type: ${rec.type}`);
        }
        
        if (!['high', 'medium', 'low'].includes(rec.priority)) {
          logger.warn(`Warning: recommendation ${index} has unusual priority: ${rec.priority}`);
        }
      });
      
      return parsed.recommendations;
    } catch (error) {
      logger.error('Error parsing OpenAI response:', error);
      throw new Error(`Failed to parse AI recommendations: ${error.message}`);
    }
  } catch (error) {
    logger.error('Error in OpenAI API call:', error);
    throw error;
  }
}
