
import { useEffect, useState, useCallback } from 'react';
import { TaskItem } from './TaskItem';
import { useTasks } from './hooks/useTasks';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useQueryCacheManager } from './hooks/useQueryCacheManager';

interface TaskListProps {
  category?: string;
  showCompleted?: boolean;
  onItemSelected?: (taskId: string) => void;
}

export const TaskList = ({ 
  category,
  showCompleted = false,
  onItemSelected
}: TaskListProps) => {
  const [completionConfirmTaskId, setCompletionConfirmTaskId] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const { invalidateQueries } = useQueryCacheManager();
  
  const {
    tasks,
    isLoading,
    updateCompletion,
    updateUrgency,
    deleteTask,
    isUpdating,
    isDeleting,
    refetch,
    error
  } = useTasks(category, showCompleted);

  // Create a memoized refresh function to prevent unnecessary re-renders
  const refreshData = useCallback(async () => {
    console.log("Forcing complete data refresh");
    
    // First invalidate all cache
    await invalidateQueries();
    
    // Then force a refetch
    await refetch();
    
    // Update the refresh timestamp
    setLastRefreshTime(Date.now());
    
    console.log("Data refresh completed");
  }, [invalidateQueries, refetch]);

  // Force an initial data fetch when component mounts and refresh periodically
  useEffect(() => {
    console.log("TaskList mounted - forcing data refresh");
    
    // Show toast notification
    toast({
      title: "Loading tasks",
      description: "Fetching latest task data..."
    });
    
    // Initial refetch
    refreshData().catch(err => {
      console.error("Error fetching task data:", err);
      toast({
        title: "Error loading tasks",
        description: "Please try refreshing.",
        variant: "destructive"
      });
    });
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      console.log("Periodic task refresh");
      refreshData();
    }, 60000); // Refresh every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [category, showCompleted, refreshData]);

  // Add a debug log to see what tasks we're getting
  useEffect(() => {
    console.log(`Current tasks in TaskList (${lastRefreshTime}):`, tasks);
  }, [tasks, lastRefreshTime]);

  const handleManualRefresh = () => {
    toast({
      title: "Refreshing tasks",
      description: "Fetching latest task data..."
    });
    
    refreshData().catch(err => {
      console.error("Error refreshing tasks:", err);
      toast({
        title: "Error refreshing tasks",
        description: "Please try again.",
        variant: "destructive"
      });
    });
  };

  if (isLoading && !tasks.length) {
    return <PriorityActionsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading tasks: {error.message}</p>
        <Button onClick={handleManualRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-2">
          No {showCompleted ? "completed" : "active"} tasks found{category && category !== 'All' ? ` for category: ${category}` : ''}.
        </p>
        <Button onClick={handleManualRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  const handleCompletionChange = (taskId: string, completed: boolean) => {
    if (completed) {
      setCompletionConfirmTaskId(taskId);
    } else {
      updateCompletion(taskId, false);
      // Force a refresh after completion
      setTimeout(() => refreshData(), 300);
    }
  };

  const confirmTaskCompletion = () => {
    if (completionConfirmTaskId) {
      updateCompletion(completionConfirmTaskId, true);
      // Force a refresh after completion
      setTimeout(() => refreshData(), 300);
      setCompletionConfirmTaskId(null);
    }
  };

  const handleUpdateUrgency = (taskId: string, urgent: boolean) => {
    updateUrgency(taskId, urgent);
    // Force a refresh after urgency change
    setTimeout(() => refreshData(), 300);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    // Force a refresh after deletion
    setTimeout(() => refreshData(), 300);
  };

  return (
    <div className="space-y-2">
      <div className="mb-4 flex justify-end">
        <Button onClick={handleManualRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Tasks
        </Button>
      </div>
      
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdateCompletion={(completed) => handleCompletionChange(task.id, completed)}
          onUpdateUrgency={(urgent) => handleUpdateUrgency(task.id, urgent)}
          onDelete={() => handleDeleteTask(task.id)}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          onSelect={() => onItemSelected?.(task.id)}
        />
      ))}

      <CompletionConfirmDialog
        open={!!completionConfirmTaskId}
        onOpenChange={(open) => {
          if (!open) setCompletionConfirmTaskId(null);
        }}
        onConfirm={confirmTaskCompletion}
        itemType="task"
      />
    </div>
  );
};
