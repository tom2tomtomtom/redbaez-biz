import logger from '@/utils/logger';
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

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
  const queryClient = useQueryClient();

  const { data: newsItems, isLoading, refetch } = useQuery({
    queryKey: ['ai-news'],
    queryFn: async () => {
      logger.info('Fetching AI news from database...');
      const { data, error } = await supabase
        .from('ai_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        logger.error('Error fetching news:', error);
        throw error;
      }
      logger.info('Successfully fetched news items:', data?.length);
      return data as NewsItem[];
    },
    staleTime: 0, // Don't cache results for news
    gcTime: 0,    // Don't keep old results
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const refreshNews = async () => {
    try {
      setIsRefreshing(true);
      logger.info('Starting news refresh...');
      
      // Ensure cache is invalidated
      queryClient.invalidateQueries({ queryKey: ['ai-news'] });
      
      const { error } = await supabase.functions.invoke('fetch-ai-news');
      if (error) {
        logger.error('Error invoking fetch-ai-news function:', error);
        throw error;
      }
      
      logger.info('Successfully invoked fetch-ai-news function, refetching data...');
      
      // Force short delay to allow the edge function to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then refetch
      await refetch();
      
      toast({
        title: "Success",
        description: "News refreshed successfully",
      });
    } catch (error) {
      logger.error('Error refreshing news:', error);
      toast({
        title: "Error",
        description: "Failed to refresh news",
        variant: "destructive",
      });
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
      }).catch((error) => logger.info('Error sharing:', error));
    } else if (item.url) {
      navigator.clipboard.writeText(item.url);
      toast({
        title: "Success",
        description: "Link copied to clipboard",
      });
    }
  };

  const generateLinkedInArticle = async (item: NewsItem) => {
    setIsGeneratingArticle(true);
    setSelectedNewsItem(item);
    
    try {
      logger.info('Invoking generate-linkedin-article with:', {
        title: item.title,
        summary: item.summary,
      });
      
      const { data, error } = await supabase.functions.invoke('generate-linkedin-article', {
        body: {
          title: item.title,
          summary: item.summary,
        },
      });

      if (error) {
        logger.error('Error from invoke:', error);
        throw error;
      }
      
      if (data?.article) {
        logger.info('Successfully generated LinkedIn article');
        setGeneratedArticle(data.article);
        setShowArticleDialog(true);
      } else {
        logger.error('No article in response data:', data);
        throw new Error('No article generated');
      }
    } catch (error) {
      logger.error('Error generating LinkedIn article:', error);
      toast({
        title: "Error",
        description: "Failed to generate LinkedIn article",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const generateNewsletter = async () => {
    if (!newsItems?.length) {
      toast({
        title: "Error",
        description: "No news items available",
        variant: "destructive",
      });
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
      logger.error('Error generating newsletter:', error);
      toast({
        title: "Error",
        description: "Failed to generate newsletter",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingNewsletter(false);
    }
  };

  const copyArticle = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast({
      title: "Success",
      description: "Article copied to clipboard",
    });
  };

  const copyNewsletter = () => {
    navigator.clipboard.writeText(generatedNewsletter);
    toast({
      title: "Success",
      description: "Newsletter copied to clipboard",
    });
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
    refreshNews,
    shareNews,
    generateLinkedInArticle,
    generateNewsletter,
    copyArticle,
    copyNewsletter,
  };
};
