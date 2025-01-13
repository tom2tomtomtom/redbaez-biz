import { MainNav } from "@/components/ui/main-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  summary: string;
  url: string;
  published_date: string;
  category: string;
}

export const AiNews = () => {
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ['ai-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('type', 'ai_news')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as NewsItem[];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI News & Insights</h1>
          <p className="text-gray-600">Stay updated with the latest developments in artificial intelligence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : newsItems?.length ? (
            newsItems.map((item) => (
              <Card key={item.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.title}
                    </a>
                  </CardTitle>
                  <CardDescription>
                    {new Date(item.published_date).toLocaleDateString()} • {item.source}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <p className="text-gray-600">{item.summary}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No news items available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiNews;