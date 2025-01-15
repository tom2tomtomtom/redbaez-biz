import { NewsCard } from "./NewsCard";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_date: string | null;
  category: string | null;
}

interface NewsContentProps {
  isLoading: boolean;
  newsItems: NewsItem[] | undefined;
  onShare: (item: NewsItem) => void;
  onGenerateLinkedInArticle: (item: NewsItem) => void;
  isGeneratingArticle: boolean;
  selectedNewsItem: NewsItem | null;
}

export const NewsContent = ({
  isLoading,
  newsItems,
  onShare,
  onGenerateLinkedInArticle,
  isGeneratingArticle,
  selectedNewsItem,
}: NewsContentProps) => {
  return (
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
            onShare={onShare}
            onGenerateLinkedInArticle={onGenerateLinkedInArticle}
            isGenerating={isGeneratingArticle}
            selectedNewsItem={selectedNewsItem}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No news items available. Click refresh to fetch the latest updates.</p>
        </div>
      )}
    </div>
  );
};