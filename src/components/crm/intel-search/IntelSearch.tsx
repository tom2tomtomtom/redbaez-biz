import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send } from 'lucide-react';

interface IntelSearchProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
}

export const IntelSearch = ({ searchInput, onSearchInputChange }: IntelSearchProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Intel Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Search for intel..."
            className="transition-all duration-300"
          />
          <Button className="transition-all duration-300">
            <Send size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};