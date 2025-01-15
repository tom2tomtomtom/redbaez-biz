import { format } from "date-fns";
import { Share2, Linkedin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_date: string | null;
  category: string | null;
}

interface NewsCardProps {
  item: NewsItem;
  onShare: (item: NewsItem) => void;
  onGenerateLinkedInArticle: (item: NewsItem) => void;
  isGenerating: boolean;
  selectedNewsItem: NewsItem | null;
}

export const NewsCard = ({
  item,
  onShare,
  onGenerateLinkedInArticle,
  isGenerating,
  selectedNewsItem,
}: NewsCardProps) => {
  const isGeneratingForThis = isGenerating && selectedNewsItem?.id === item.id;

  return (
    <Card className="transition-all hover:shadow-lg">
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
              onClick={() => onShare(item)}
              className="shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onGenerateLinkedInArticle(item)}
              disabled={isGeneratingForThis}
              className="shrink-0"
            >
              {isGeneratingForThis ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Linkedin className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.published_date && (
            <span className="text-sm text-muted-foreground">
              {format(new Date(item.published_date), 'MMM d, yyyy')}
            </span>
          )}
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
  );
};