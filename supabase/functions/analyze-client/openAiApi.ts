export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function generateRecommendations(prompt: string, apiKey: string) {
  console.log('Starting recommendation generation with prompt:', prompt);
  
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
          Return ONLY a JSON array with type, priority, and suggestion fields.
          Do not include any square brackets in the suggestions.`
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
    console.error('Error from OpenAI API:', errorText);
    throw new Error(`Failed to get response from OpenAI API: ${errorText}`);
  }

  const aiResponse = await response.json();
  console.log('Received AI response:', aiResponse);

  if (!aiResponse?.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from AI');
  }

  try {
    const content = aiResponse.choices[0].message.content;
    console.log('Raw content from AI:', content);
    
    // Remove any markdown code block syntax
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    console.log('Cleaned content:', cleanedContent);
    
    // Parse the JSON
    const parsed = JSON.parse(cleanedContent);
    console.log('Parsed JSON:', parsed);
    
    // Clean any remaining square brackets from suggestions
    const cleaned = parsed.map((rec: any) => ({
      ...rec,
      suggestion: rec.suggestion.replace(/[\[\]]/g, '').trim(),
      type: rec.type.toLowerCase(),
      priority: priority.toLowerCase()
    }));
    
    console.log('Final cleaned recommendations:', cleaned);
    return cleaned;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error(`Failed to parse AI recommendations: ${error.message}`);
  }
}