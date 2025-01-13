import { MainNav } from "@/components/ui/main-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { NewsHeader } from "@/components/ai-news/NewsHeader";
import { NewsCard } from "@/components/ai-news/NewsCard";
import { GenerationDialogs } from "@/components/ai-news/GenerationDialogs";

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
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState("");
  const [generatedNewsletter, setGeneratedNewsletter] = useState("");
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
      
      if (data?.article) {
        setGeneratedArticle(data.article);
        setShowArticleDialog(true);
      } else {
        throw new Error('No article generated');
      }
    } catch (error) {
      console.error('Error generating LinkedIn article:', error);
      toast.error('Failed to generate LinkedIn article');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNewsletter = async () => {
    if (!newsItems?.length) {
      toast.error('No news items available');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-newsletter', {
        body: {
          newsItems: newsItems.map(item => ({
            title: item.title,
            summary: item.summary,
            category: item.category,
          })),
        },
      });

      if (error) throw error;
      
      setGeneratedNewsletter(data.newsletter);
      setShowNewsletterDialog(true);
    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast.error('Failed to generate newsletter');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyArticle = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast.success('Article copied to clipboard');
  };

  const copyNewsletter = () => {
    navigator.clipboard.writeText(generatedNewsletter);
    toast.success('Newsletter copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <NewsHeader
          onRefresh={refreshNews}
          onGenerateNewsletter={generateNewsletter}
          isGenerating={isGenerating}
          hasNewsItems={!!newsItems?.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))
          ) : newsItems?.length ? (
            newsItems.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onShare={shareNews}
                onGenerateLinkedInArticle={generateLinkedInArticle}
                isGenerating={isGenerating}
                selectedNewsItem={selectedNewsItem}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No news items available. Click refresh to fetch the latest updates.</p>
            </div>
          )}
        </div>

        <GenerationDialogs
          showArticleDialog={showArticleDialog}
          setShowArticleDialog={setShowArticleDialog}
          showNewsletterDialog={showNewsletterDialog}
          setShowNewsletterDialog={setShowNewsletterDialog}
          generatedArticle={generatedArticle}
          generatedNewsletter={generatedNewsletter}
          onCopyArticle={copyArticle}
          onCopyNewsletter={copyNewsletter}
        />
      </div>
    </div>
  );
};

export default AiNews;