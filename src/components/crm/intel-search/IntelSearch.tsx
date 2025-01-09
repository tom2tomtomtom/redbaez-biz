import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useIntelSearch } from './useIntelSearch';
import { useToast } from '@/components/ui/use-toast';

interface IntelSearchProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}

export const IntelSearch = ({ searchInput, onSearchInputChange }: IntelSearchProps) => {
  const [query, setQuery] = useState('');
  const { data: insight, isLoading, error } = useIntelSearch(query);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchInput.trim()) {
      toast({
        title: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    setQuery(searchInput);
  };

  const formatInsight = (text: string) => {
    // Split by bullet points or numbered lists
    const points = text.split(/(?:\r?\n|\r)(?:[-•*]|\d+\.)\s+/).filter(Boolean);
    
    // Remove any remaining bullet points or numbers from the beginning of each point
    return points.map(point => point.trim().replace(/^[-•*]\s*|\d+\.\s*/, ''));
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Intel Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Search for intel..."
            className="transition-all duration-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button 
            className="transition-all duration-300"
            onClick={handleSearch}
            disabled={isLoading}
          >
            <Send size={18} />
          </Button>
        </div>

        {isLoading && (
          <div className="animate-pulse bg-gray-100 rounded-md p-4">
            Loading insights...
          </div>
        )}

        {error && (
          <div className="text-red-500 p-4 rounded-md bg-red-50">
            Error fetching insights. Please try again.
          </div>
        )}

        {insight && (
          <div className="space-y-3 p-4 rounded-md bg-blue-50">
            {formatInsight(insight).map((point, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 text-sm text-blue-900 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                <p>{point}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};