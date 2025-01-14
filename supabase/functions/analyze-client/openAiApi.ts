export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function generateRecommendations(prompt: string, apiKey: string) {
  console.log('Generating recommendations with prompt:', prompt);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `You are a strategic marketing advisor specializing in AI technology marketing. 
          Your expertise includes LinkedIn strategy, content marketing, thought leadership, and event marketing.
          Create highly specific recommendations that reference actual events, trends, and case studies.
          Focus on innovative ideas that blend entertainment with education and drive engagement.
          Return ONLY a valid JSON array with type, priority, and suggestion fields.
          Do not include any additional text or formatting.`
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
    
    // Ensure we're returning the recommendations array
    return parsed.recommendations || [];
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error(`Failed to parse AI recommendations: ${error.message}`);
  }
}