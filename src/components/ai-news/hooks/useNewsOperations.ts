import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_date: string | null;
  category: string | null;
}

export const useNewsOperations = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingNewsletter, setIsGeneratingNewsletter] = useState(false);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState("");
  const [generatedNewsletter, setGeneratedNewsletter] = useState("");
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [searchTopic, setSearchTopic] = useState("");

  const { data: newsItems, isLoading, refetch } = useQuery({
    queryKey: ['ai-news'],
    queryFn: async () => {
      console.log('Fetching AI news from database...');
      const { data, error } = await supabase
        .from('ai_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }
      console.log('Successfully fetched news items:', data?.length);
      return data as NewsItem[];
    },
  });

  const refreshNews = async () => {
    try {
      setIsRefreshing(true);
      console.log('Starting news refresh...');
      const { error } = await supabase.functions.invoke('fetch-ai-news');
      if (error) {
        console.error('Error invoking fetch-ai-news function:', error);
        throw error;
      }
      
      console.log('Successfully invoked fetch-ai-news function, refetching data...');
      await refetch();
      toast.success('News refreshed successfully');
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast.error('Failed to refresh news');
    } finally {
      setIsRefreshing(false);
    }
  };

  const searchNews = async () => {
    try {
      setIsRefreshing(true);
      console.log('Searching news for topic:', searchTopic);
      const { error } = await supabase.functions.invoke('fetch-ai-news', {
        body: { topic: searchTopic }
      });
      if (error) {
        console.error('Error searching news:', error);
        throw error;
      }
      
      await refetch();
      toast.success('News updated with search results');
    } catch (error) {
      console.error('Error searching news:', error);
      toast.error('Failed to search news');
    } finally {
      setIsRefreshing(false);
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
    setIsGeneratingArticle(true);
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
      setIsGeneratingArticle(false);
    }
  };

  const generateNewsletter = async () => {
    if (!newsItems?.length) {
      toast.error('No news items available');
      return;
    }

    setIsGeneratingNewsletter(true);
    
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
      
      if (data?.newsletter) {
        setGeneratedNewsletter(data.newsletter);
        setShowNewsletterDialog(true);
      } else {
        throw new Error('No newsletter generated');
      }
    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast.error('Failed to generate newsletter');
    } finally {
      setIsGeneratingNewsletter(false);
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

  return {
    newsItems,
    isLoading,
    isRefreshing,
    isGeneratingNewsletter,
    isGeneratingArticle,
    showArticleDialog,
    setShowArticleDialog,
    showNewsletterDialog,
    setShowNewsletterDialog,
    generatedArticle,
    generatedNewsletter,
    selectedNewsItem,
    searchTopic,
    setSearchTopic,
    refreshNews,
    searchNews,
    shareNews,
    generateLinkedInArticle,
    generateNewsletter,
    copyArticle,
    copyNewsletter,
  };
};