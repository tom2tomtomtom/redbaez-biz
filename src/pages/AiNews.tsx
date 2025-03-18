
import { MainNav } from "../components/ui/main-nav";
import { NewsHeader } from "../components/ai-news/NewsHeader";
import { NewsContent } from "../components/ai-news/NewsContent";
import { GenerationDialogs } from "../components/ai-news/GenerationDialogs";
import { useNewsOperations } from "../components/ai-news/hooks/useNewsOperations";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

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
      <MainNav />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4 mr-1" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>AI News</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
      <Toaster />
    </div>
  );
};

export default AiNews;
