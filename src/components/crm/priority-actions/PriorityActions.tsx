
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
import { supabase } from '@/integrations/supabase/client';

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
  const isInitialLoadRef = useRef(true);
  
  // Ensure category is a proper string or undefined
  const sanitizedCategory = category === undefined || category === null ? undefined : String(category);
  
  console.log('PriorityActions rendering with category:', sanitizedCategory); 
  
  const { allItems, isLoading, error, refetch } = usePriorityData(sanitizedCategory, refreshKey);

  console.log('PriorityActions - rendered with items:', allItems?.length, allItems);

  // Force refresh less frequently to avoid excessive API calls
  useEffect(() => {
    // Debug check for tasks to confirm if there's data in the DB
    const checkForTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('general_tasks')
          .select('*')
          .limit(20);
        
        if (error) {
          console.error('Error checking tasks:', error);
        } else {
          console.log('Direct DB check - tasks available:', data?.length, data);
        }
      } catch (err) {
        console.error('Exception checking tasks:', err);
      }
    };
    
    if (isInitialLoadRef.current) {
      checkForTasks();
      isInitialLoadRef.current = false;
    }
    
    // Limit how often we refresh to prevent infinite loops or excessive API calls
    const refreshData = () => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;
      
      // Don't refresh if it's been less than 10 seconds since the last refresh
      if (timeSinceLastRefresh < 10000) {
        console.log('Skipping refresh, too soon since last refresh');
        return;
      }
      
      // Don't refresh if we've already refreshed too many times
      if (refreshCountRef.current > 10) {
        console.log('Limiting refreshes to prevent excessive API calls');
        return;
      }
      
      console.log('Refreshing priority actions data...');
      refreshCountRef.current += 1;
      setLastRefreshTime(now);
      
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
      setRefreshKey(prev => prev + 1);
      refetch();
    };
    
    // Initial refresh
    refreshData();
    
    // Set up interval for periodic refreshes (60 seconds instead of 30)
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setInterval(refreshData, 60000);
    
    // Clean up interval on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [queryClient, refetch, sanitizedCategory, lastRefreshTime]);

  const handleTaskSaved = useCallback(() => {
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
    
    // Reset the refresh count on deliberate user actions
    refreshCountRef.current = 0;
    
    // Force refresh after task is saved
    setLastRefreshTime(Date.now());
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    setIsDialogOpen(false);
    setEditingTask(null);
    setRefreshKey(prev => prev + 1);
    refetch();
  }, [queryClient, refetch]);

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
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    setRefreshKey(prev => prev + 1);
    refetch();
  }, [queryClient, refetch]);

  if (isLoading) {
    return <PriorityActionsSkeleton />;
  }

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
                refetch();
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
