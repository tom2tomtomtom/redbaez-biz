import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  category: 'tools' | 'training' | 'innovation' | 'ethics';
  link: string;
}

interface NewsResponse {
  news: NewsItem[];
}

const getSystemPrompt = (topic?: string) => `You are an AI news curator. Generate exactly 5 recent AI news items from THIS WEEK ONLY${topic ? ` related to "${topic}"` : ''}.

Your response MUST be a valid JSON string matching this EXACT structure:
{
  "news": [
    {
      "headline": "string",
      "summary": "string",
      "source": "string",
      "category": "tools" | "training" | "innovation" | "ethics",
      "link": "string"
    }
  ]
}

Focus on:
- AI tools and platforms
- AI training and education
- AI innovation and research
- AI ethics and safety

Be precise and factual. Return EXACTLY 5 items.
VERY IMPORTANT: Only include news from the past 7 days.
Search broadly across multiple reliable sources.
Do not include any text before or after the JSON.`;

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!perplexityKey) {
      console.error('Missing Perplexity API key');
      throw new Error('Configuration error: Missing Perplexity API key')
    }

    const { topic } = await req.json().catch(() => ({}));
    console.log('Fetching news from Perplexity API...', topic ? `for topic: ${topic}` : 'for general AI news');
    
    try {
      console.log('Making request to Perplexity API with system prompt...');
      const systemPrompt = getSystemPrompt(topic);
      console.log('System prompt:', systemPrompt);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Generate 5 recent AI news items from this week only${topic ? ` about ${topic}` : ''}, searching across multiple sources.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          search_domain_filter: [],
          search_recency_filter: 'week',
          frequency_penalty: 0.5
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error response:', errorText);
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Perplexity API response:', JSON.stringify(data, null, 2));

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }

      const content = data.choices[0].message.content.trim();
      console.log('Raw content:', content);
      
      let newsItems: NewsResponse;
      try {
        newsItems = JSON.parse(content);
        
        if (!newsItems?.news || !Array.isArray(newsItems.news)) {
          console.error('Invalid news format:', content);
          throw new Error('Response must contain a "news" array');
        }

        if (newsItems.news.length !== 5) {
          console.error('Wrong number of news items:', newsItems.news.length);
          throw new Error('Response must contain exactly 5 news items');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Storing news items in database...');

        // First, clear existing news items to avoid duplicates
        const { error: deleteError } = await supabase
          .from('ai_news')
          .delete()
          .neq('id', 0); // Delete all records
        
        if (deleteError) {
          console.error('Error clearing existing news:', deleteError);
          throw deleteError;
        }

        // Store each news item
        for (const item of newsItems.news) {
          const { error } = await supabase
            .from('ai_news')
            .insert({
              title: item.headline,
              summary: item.summary,
              source: item.source,
              category: item.category,
              url: item.link,
            });
          
          if (error) {
            console.error('Error inserting news item:', error);
            throw error;
          }
        }

        console.log('Successfully stored news items');

        return new Response(JSON.stringify({ success: true, data: newsItems }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('Failed to parse or validate news items:', e);
        console.error('Raw content that failed validation:', content);
        throw new Error(`Invalid news format: ${e.message}`);
      }
    } catch (apiError) {
      console.error('Error fetching from Perplexity API:', apiError);
      throw new Error(`Failed to fetch from Perplexity API: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});