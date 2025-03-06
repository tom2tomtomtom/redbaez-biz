
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { TaskDialog } from './TaskDialog';
import { PriorityItemsList } from './PriorityItemsList';
import { usePriorityData } from './hooks/usePriorityData';
import { toast } from '@/hooks/use-toast';

interface PriorityActionsProps {
  hideAddButton?: boolean;
  category?: string;
  onTaskClick?: (task: Tables<'general_tasks'>) => void;
}

export const PriorityActions = ({ 
  hideAddButton = false, 
  category,
  onTaskClick 
}: PriorityActionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tables<'general_tasks'> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const queryClient = useQueryClient();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshCountRef = useRef(0);
  const maxRefreshCount = 5; // Limit automatic refreshes
  
  // Ensure category is a proper string or undefined
  const sanitizedCategory = category === undefined || category === null ? undefined : String(category);
  
  console.log('PriorityActions rendering with category:', sanitizedCategory); 
  
  const { allItems, isLoading, error, refetch } = usePriorityData(sanitizedCategory, refreshKey);

  console.log('PriorityActions - rendered with items:', allItems?.length, allItems);

  // Throttled refresh function to avoid excessive API calls
  const throttledRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    
    // Enforce a minimum 5 second delay between refreshes
    if (timeSinceLastRefresh < 5000) {
      console.log('Skipping refresh, too soon since last refresh');
      return;
    }
    
    // Limit total number of automatic refreshes
    if (refreshCountRef.current >= maxRefreshCount) {
      console.log('Reached max refresh count, stopping automatic refreshes');
      return;
    }
    
    console.log('Throttled refresh triggered');
    refreshCountRef.current += 1;
    setLastRefreshTime(now);
    setRefreshKey(prev => prev + 1);
  }, [lastRefreshTime]);
  
  // Initial data load and periodic refresh setup
  useEffect(() => {
    // One initial refresh when component mounts
    throttledRefresh();
    
    // Set up timer for periodic refreshes, but with longer intervals (120 seconds)
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setInterval(() => {
      throttledRefresh();
    }, 120000); // 2 minutes
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [throttledRefresh]);

  const handleTaskSaved = useCallback(() => {
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
    
    // Reset the refresh count on deliberate user actions
    refreshCountRef.current = 0;
    
    // Force immediate refresh
    setLastRefreshTime(Date.now());
    setRefreshKey(prev => prev + 1);
    setIsDialogOpen(false);
    setEditingTask(null);
  }, []);

  const handleTaskClick = useCallback((task: Tables<'general_tasks'>) => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      setEditingTask(task);
      setIsDialogOpen(true);
    }
  }, [onTaskClick]);
  
  const handleTaskUpdated = useCallback(() => {
    // Reset the refresh count on deliberate user actions
    refreshCountRef.current = 0;
    
    // Force refresh after task update or delete
    console.log('Task updated, refreshing data...');
    setLastRefreshTime(Date.now());
    
    // Delay the refresh slightly to allow the database operations to complete
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
      setRefreshKey(prev => prev + 1);
    }, 500);
  }, [queryClient]);

  // Render loading state
  if (isLoading) {
    return <PriorityActionsSkeleton />;
  }

  // Render error state
  if (error) {
    console.error('Priority Actions error:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-red-50 rounded-lg">
            Error loading priority actions: {error.message || 'Unknown error'}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                refreshCountRef.current = 0;
                setLastRefreshTime(Date.now());
                setRefreshKey(prev => prev + 1);
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>
          {sanitizedCategory 
            ? `${sanitizedCategory} Tasks` 
            : `Priority Actions for ${new Date().toLocaleString('default', { month: 'long' })}`
          }
        </CardTitle>
        {!hideAddButton && (
          <Button onClick={() => {
            setEditingTask(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {allItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No priority actions found. Check the database or add some tasks.
          </div>
        ) : (
          <PriorityItemsList 
            key={`items-list-${refreshKey}`}
            items={allItems}
            onTaskClick={handleTaskClick}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </CardContent>

      <TaskDialog
        key={`dialog-${refreshKey}`}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSaved={handleTaskSaved}
        defaultCategory={sanitizedCategory}
      />
    </Card>
  );
};
