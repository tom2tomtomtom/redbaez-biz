import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IntelSearchProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}

export const IntelSearch = ({ searchInput, onSearchInputChange }: IntelSearchProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select()
        .ilike('name', `%${searchInput}%`)
        .limit(1);

      if (error) throw error;

      if (clients && clients.length > 0) {
        navigate(`/client/${clients[0].id}`);
      } else {
        toast({
          title: "No Results",
          description: "No clients found matching your search",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for clients",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search size={18} />
          Intel Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for clients..."
            className="transition-all duration-300"
            disabled={isSearching}
          />
          <Button 
            className="transition-all duration-300" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            <Send size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};