
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Plus } from 'lucide-react';
import { Category } from './Category';
import { PriorityItemsList } from './PriorityItemsList';
import { usePriorityData } from './hooks/usePriorityData';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { Tables } from '@/integrations/supabase/types';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PriorityActionsProps {
  hideAddButton?: boolean;
  initialCategory?: string;
  onTaskClick?: (task: GeneralTaskRow) => void;
}

export const PriorityActions = ({
  hideAddButton = false,
  initialCategory,
  onTaskClick
}: PriorityActionsProps) => {
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [activeTab, setActiveTab] = useState('active');
  
  console.log('PriorityActions rendering with category:', category);
  
  const { allItems, isLoading, refetch } = usePriorityData(category, refreshKey);
  
  // Add debug logging to see what items we have
  useEffect(() => {
    if (allItems) {
      console.log('PriorityActions - all items:', allItems.length, allItems);
      console.log('PriorityActions - active tab:', activeTab);
    }
  }, [allItems, activeTab]);

  const handleRefresh = async () => {
    const now = Date.now();
    // Prevent refreshing more than once every 3 seconds
    if (now - lastRefreshTime < 3000) {
      console.log('Skipping refresh, too soon since last refresh');
      return;
    }

    try {
      setIsRefreshing(true);
      setLastRefreshTime(now);
      await refetch();
      // After refetch, increment refresh key to trigger fresh data loading
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing priority items:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCategoryChange = (newCategory: string | undefined) => {
    setCategory(newCategory);
    // Force data refresh when category changes
    setRefreshKey(prev => prev + 1);
  };

  const handleItemSelected = (item: any) => {
    if (item.type === 'task' && onTaskClick) {
      onTaskClick(item.data);
    }
  };

  console.log('PriorityActions - rendered with items:', allItems?.length, allItems);

  // Force an initial refresh when the component mounts
  useEffect(() => {
    handleRefresh();
  }, []);

  if (isLoading && !allItems?.length) {
    return <PriorityActionsSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <Category 
            active={!category} 
            onClick={() => handleCategoryChange(undefined)}
            category="All"
          >
            All
          </Category>
          <Category 
            active={category === 'Business Admin'} 
            onClick={() => handleCategoryChange('Business Admin')}
            category="Business Admin"
          >
            Business Admin
          </Category>
          <Category 
            active={category === 'Marketing'} 
            onClick={() => handleCategoryChange('Marketing')}
            category="Marketing"
          >
            Marketing
          </Category>
          <Category 
            active={category === 'Product Development'} 
            onClick={() => handleCategoryChange('Product Development')}
            category="Product Development"
          >
            Product Development
          </Category>
          <Category 
            active={category === 'Partnerships'} 
            onClick={() => handleCategoryChange('Partnerships')}
            category="Partnerships"
          >
            Partnerships
          </Category>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          {!hideAddButton && (
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <PriorityItemsList 
            items={allItems || []} 
            onItemRemoved={handleRefresh}
            onItemUpdated={handleRefresh}
            onItemSelected={handleItemSelected}
            category={category}
            showCompleted={false}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <PriorityItemsList 
            items={allItems || []} 
            onItemRemoved={handleRefresh}
            onItemUpdated={handleRefresh}
            onItemSelected={handleItemSelected}
            category={category}
            showCompleted={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
