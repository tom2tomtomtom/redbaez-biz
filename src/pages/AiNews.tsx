import { MainNav } from "@/components/ui/main-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Share2, RefreshCw, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_date: string | null;
  category: string | null;
  created_at: string | null;
}

export const AiNews = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState("");
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);

  const { data: newsItems, isLoading, refetch } = useQuery({
    queryKey: ['ai-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as NewsItem[];
    },
  });

  const refreshNews = async () => {
    try {
      const { error } = await supabase.functions.invoke('fetch-ai-news');
      if (error) throw error;
      
      refetch();
      toast.success('News refreshed successfully');
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast.error('Failed to refresh news');
    }
  };

  const shareNews = (item: NewsItem) => {
    if (navigator.share && item.url) {
      navigator.share({
        title: item.title,
        text: item.summary || '',
        url: item.url,
      }).catch((error) => console.log('Error sharing:', error));
    } else if (item.url) {
      navigator.clipboard.writeText(item.url);
      toast.success('Link copied to clipboard');
    }
  };

  const generateLinkedInArticle = async (item: NewsItem) => {
    setIsGenerating(true);
    setSelectedNewsItem(item);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-linkedin-article', {
        body: {
          title: item.title,
          summary: item.summary,
        },
      });

      if (error) throw error;
      
      setGeneratedArticle(data.article);
      setShowArticleDialog(true);
    } catch (error) {
      console.error('Error generating LinkedIn article:', error);
      toast.error('Failed to generate LinkedIn article');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyArticle = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast.success('Article copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI News & Insights</h1>
              <p className="text-gray-600">Stay updated with the latest developments in artificial intelligence</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tools">AI Tools</SelectItem>
                <SelectItem value="training">Training & Education</SelectItem>
                <SelectItem value="innovation">Innovation</SelectItem>
                <SelectItem value="ethics">Ethics & Risks</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={refreshNews} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh News
            </Button>
          </div>
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
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="flex-1">
                      <a 
                        href={item.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {item.title}
                      </a>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => shareNews(item)}
                        className="shrink-0"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => generateLinkedInArticle(item)}
                        disabled={isGenerating && selectedNewsItem?.id === item.id}
                        className="shrink-0"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.created_at || '').toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{item.source}</span>
                    {item.category && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="inline-block">
                          <Badge variant="secondary">{item.category}</Badge>
                        </span>
                      </>
                    )}
                  </div>
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
              <p className="text-gray-500">No news items available. Click refresh to fetch the latest updates.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated LinkedIn Article</DialogTitle>
            <DialogDescription>
              Copy and paste this article to LinkedIn
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {generatedArticle}
            </div>
            <Button onClick={copyArticle} className="w-full">
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AiNews;