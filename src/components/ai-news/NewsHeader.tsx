import { Newspaper, RefreshCw, FileText, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewsHeaderProps {
  onRefresh: () => void;
  onGenerateNewsletter: () => void;
  isGenerating: boolean;
  isRefreshing: boolean;
  hasNewsItems: boolean;
  searchTopic: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export const NewsHeader = ({
  onRefresh,
  onGenerateNewsletter,
  isGenerating,
  isRefreshing,
  hasNewsItems,
  searchTopic,
  onSearchChange,
  onSearch,
}: NewsHeaderProps) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Newspaper className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI News & Insights</h1>
          <p className="text-gray-600">Stay updated with the latest developments in artificial intelligence</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search news by topic..."
            value={searchTopic}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-[200px]"
          />
          <Button 
            onClick={onSearch}
            variant="outline"
            className="gap-2"
            disabled={isRefreshing}
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
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
        <Button 
          onClick={onGenerateNewsletter} 
          variant="outline" 
          className="gap-2"
          disabled={isGenerating || !hasNewsItems}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Generate Newsletter
        </Button>
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          className="gap-2"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh News
        </Button>
      </div>
    </div>
  );
};