
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-render
  const queryClient = useQueryClient();
  const { allItems, isLoading, error, refetch } = usePriorityData(category, refreshKey);

  console.log('Priority Actions - all items:', allItems.length); // Debug log

  // Force refresh when component mounts and every 30 seconds
  useEffect(() => {
    // Initial refresh
    const refreshData = () => {
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
      setRefreshKey(prev => prev + 1);
      refetch();
    };
    
    refreshData();
    
    // Set up interval for periodic refreshes
    const intervalId = setInterval(refreshData, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [queryClient, refetch]);

  const handleTaskSaved = useCallback(() => {
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
    
    // Force refresh after task is saved
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
    // Force refresh after task update or delete
    console.log('Task updated, refreshing data...');
    queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    setRefreshKey(prev => prev + 1);
    refetch();
  }, [queryClient, refetch]);

  if (isLoading) {
    return <PriorityActionsSkeleton />;
  }

  if (error) {
    console.error('Priority Actions error:', error); // Debug log
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-red-50 rounded-lg">
            Error loading priority actions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>
          {category 
            ? `${category} Tasks` 
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
        <div>
          <PriorityItemsList 
            key={refreshKey} // Force re-render on refreshKey change
            items={allItems}
            onTaskClick={handleTaskClick}
            onTaskUpdated={handleTaskUpdated}
          />
        </div>
      </CardContent>

      <TaskDialog
        key={`dialog-${refreshKey}`} // Force re-render dialog too
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSaved={handleTaskSaved}
        defaultCategory={category}
      />
    </Card>
  );
};
