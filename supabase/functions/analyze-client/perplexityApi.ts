const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function generateRecommendations(prompt: string, apiKey: string) {
  console.log('Starting recommendation generation with prompt:', prompt);
  
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
          content: 'You are a strategic advisor. Create highly specific recommendations that reference actual events and developments. Return ONLY a JSON array with type and suggestion fields. Do not include any square brackets in the suggestions.'
        },
        {
          role: 'user',
          content: prompt
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
      suggestion: rec.suggestion.replace(/[\[\]]/g, '').trim()
    }));
    
    console.log('Final cleaned recommendations:', cleaned);
    return cleaned;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error(`Failed to parse AI recommendations: ${error.message}`);
  }
}

export { corsHeaders };