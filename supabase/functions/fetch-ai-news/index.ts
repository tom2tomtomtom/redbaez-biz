import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsItem {
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_date: string | null;
  category: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // This is where we'll implement the news fetching logic
    // For now, let's add some sample data
    const sampleNews: NewsItem[] = [
      {
        title: "OpenAI Announces GPT-5",
        source: "AI Weekly",
        summary: "OpenAI has announced their latest language model, GPT-5, promising unprecedented capabilities in natural language processing and understanding.",
        url: "https://example.com/gpt5-announcement",
        published_date: new Date().toISOString(),
        category: "Language Models"
      },
      // Add more sample items as needed
    ];

    // Insert the news items
    const { error } = await supabaseClient
      .from('ai_news')
      .insert(sampleNews);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'News items added successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})