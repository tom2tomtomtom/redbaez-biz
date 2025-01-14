import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ClientSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a client name",
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
    <Card className="flex-1 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Find Client</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search clients..."
            className="h-8 text-sm"
            disabled={isSearching}
          />
          <Button 
            size="sm"
            className="transition-all duration-300" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};