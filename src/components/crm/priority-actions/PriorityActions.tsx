
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Plus } from 'lucide-react';
import { Category } from './Category';
import { TaskList } from './TaskList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useTasks } from './hooks/useTasks';

interface PriorityActionsProps {
  hideAddButton?: boolean;
  initialCategory?: string;
  onTaskClick?: (taskId: string) => void;
}

export const PriorityActions = ({
  hideAddButton = false,
  initialCategory,
  onTaskClick
}: PriorityActionsProps) => {
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [activeTab, setActiveTab] = useState('active');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  
  const { refetch } = useTasks(category, activeTab === 'completed');

  const handleRefresh = async () => {
    const now = Date.now();
    // Prevent refreshing more than once every 3 seconds
    if (now - lastRefreshTime < 3000) {
      return;
    }

    try {
      setIsRefreshing(true);
      setLastRefreshTime(now);
      
      toast({
        title: "Refreshing data",
        description: "Getting the latest tasks..."
      });
      
      await refetch();
      
      // Force re-render by updating the refresh trigger
      setRefreshTrigger(Date.now());
      
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      
      toast({
        title: "Error refreshing data",
        description: "There was a problem getting the latest data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCategoryChange = (newCategory: string | undefined) => {
    setCategory(newCategory);
    // Reset refresh trigger to force data reload
    setRefreshTrigger(Date.now());
  };

  // Force an initial refresh when the component mounts
  useEffect(() => {
    console.log("PriorityActions mounted - triggering initial refresh");
    handleRefresh();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <Category 
            active={!category || category === 'All'} 
            onClick={() => handleCategoryChange('All')}
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
          <TaskList 
            key={`active-${refreshTrigger}-${category}`}
            category={category} 
            showCompleted={false}
            onItemSelected={onTaskClick}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <TaskList 
            key={`completed-${refreshTrigger}-${category}`}
            category={category} 
            showCompleted={true}
            onItemSelected={onTaskClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
