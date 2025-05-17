import logger from '../_shared/logger.ts';
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function generateRecommendations(prompt: string, apiKey: string) {
  logger.info('Starting recommendation generation with prompt:', prompt);
  
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
          content: `You are a strategic marketing expert specializing in LinkedIn, content marketing, thought leadership, and event marketing. Your task is to generate innovative marketing ideas for Redbaez, focusing on:

1. LinkedIn Strategy:
- Executive thought leadership content
- Video-based case studies
- Industry insights and trend analysis

2. Content Marketing:
- AI implementation success stories
- ROI-focused whitepapers
- Educational video series

3. Event Marketing:
- Virtual workshops
- Industry roundtables
- Live demonstrations

Each recommendation must:
- Target CMOs, creative directors, and marketing decision-makers
- Include specific metrics or success stories from real companies
- Focus on AI's impact on marketing efficiency and creativity
- Suggest actionable, measurable marketing initiatives

Return ONLY a JSON array with type (revenue/engagement/opportunity/risk), priority (high/medium/low), and suggestion fields.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Error from Perplexity API:', errorText);
    throw new Error(`Failed to get response from Perplexity API: ${errorText}`);
  }

  const aiResponse = await response.json();
  logger.info('Received AI response:', aiResponse);

  if (!aiResponse?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from AI');
  }

  try {
    const content = aiResponse.choices[0].message.content;
    logger.info('Raw content from AI:', content);
    
    // Remove any markdown code block syntax
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    logger.info('Cleaned content:', cleanedContent);
    
    // Parse the JSON
    const parsed = JSON.parse(cleanedContent);
    logger.info('Parsed JSON:', parsed);
    
    // Clean any remaining square brackets from suggestions
    const cleaned = parsed.map((rec: any) => ({
      ...rec,
      suggestion: rec.suggestion.replace(/[\[\]]/g, '').trim(),
      type: rec.type.toLowerCase(),
      priority: rec.priority.toLowerCase()
    }));
    
    logger.info('Final cleaned recommendations:', cleaned);
    return cleaned;
  } catch (error) {
    logger.error('Error parsing AI response:', error);
    throw new Error(`Failed to parse AI recommendations: ${error.message}`);
  }
}