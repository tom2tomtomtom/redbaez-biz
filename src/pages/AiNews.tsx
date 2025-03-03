
import { NewsHeader } from "../components/ai-news/NewsHeader";
import { NewsContent } from "../components/ai-news/NewsContent";
import { GenerationDialogs } from "../components/ai-news/GenerationDialogs";
import { useNewsOperations } from "../components/ai-news/hooks/useNewsOperations";

export const AiNews = () => {
  const {
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
  } = useNewsOperations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <div className="container mx-auto px-4 py-8">
        <NewsHeader
          onRefresh={refreshNews}
          onGenerateNewsletter={generateNewsletter}
          isGenerating={isGeneratingNewsletter}
          isRefreshing={isRefreshing}
          hasNewsItems={!!newsItems?.length}
        />

        <NewsContent
          isLoading={isLoading}
          newsItems={newsItems}
          onShare={shareNews}
          onGenerateLinkedInArticle={generateLinkedInArticle}
          isGeneratingArticle={isGeneratingArticle}
          selectedNewsItem={selectedNewsItem}
        />

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
