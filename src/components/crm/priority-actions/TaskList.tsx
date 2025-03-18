
import { useEffect, useState, useRef } from 'react';
import { TaskItem } from './TaskItem';
import { useTaskData } from './hooks/useTaskData';
import { useTaskMutations } from './hooks/useTaskMutations';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

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
  const [completionConfirmTask, setCompletionConfirmTask] = useState<any | null>(null);
  const initialLoadDone = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshIntervalRef = useRef<number | null>(null);
  const completedTaskIds = useRef<Set<string>>(new Set());
  
  // Use our task data hook with refresh key for forced updates
  const { data: tasks = [], isLoading, error, refetch } = useTaskData(category, showCompleted);
  
  // Use our simplified task mutations
  const { 
    isProcessing, 
    updateCompletion, 
    updateUrgency, 
    deleteTask,
    invalidateTaskQueries
  } = useTaskMutations();

  // Force refresh when component mounts and when refreshKey changes
  useEffect(() => {
    console.log("TaskList refreshing data with key:", refreshKey);
    refetch().catch(err => {
      console.error("Error refreshing tasks:", err);
    });
    
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      
      // Set up periodic refresh every 2 minutes
      refreshIntervalRef.current = window.setInterval(() => {
        console.log("Periodic task refresh");
        refetch().catch(err => {
          console.error("Error in periodic refresh:", err);
        });
      }, 120000); // 2 minutes
    }
    
    // Clean up the interval when component unmounts
    return () => {
      if (refreshIntervalRef.current !== null) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      // Clear the completed tasks set when component unmounts
      completedTaskIds.current.clear();
    };
  }, [category, showCompleted, refetch, refreshKey]);

  const handleRefresh = async () => {
    toast({
      title: "Refreshing tasks",
      description: "Fetching latest task data..."
    });
    
    try {
      await invalidateTaskQueries();
      await refetch();
      // Force component update by changing refresh key
      setRefreshKey(prev => prev + 1);
      // Clear the completed tasks set on manual refresh
      completedTaskIds.current.clear();
    } catch (err) {
      console.error("Error refreshing tasks:", err);
      toast({
        title: "Error refreshing tasks",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTaskDelete = async (task: any) => {
    const success = await deleteTask(task);
    if (success) {
      // Force immediate UI refresh
      setRefreshKey(prev => prev + 1);
      await refetch();
    }
  };

  const handleCompletionChange = (task: any, completed: boolean) => {
    if (completed) {
      setCompletionConfirmTask(task);
    } else {
      processCompletionChange(task, false);
    }
  };

  const processCompletionChange = async (task: any, completed: boolean) => {
    if (completed && !showCompleted) {
      // Add to completed tasks set
      completedTaskIds.current.add(task.id);
    } else {
      // Remove from completed items set if marking as incomplete
      completedTaskIds.current.delete(task.id);
    }
    
    // Call the updateCompletion function
    await updateCompletion(task, completed);
    
    // FIX: The issue is here. updateCompletion returns void, not a boolean
    // So we shouldn't be doing a comparison with boolean, just force refresh the UI
    
    // Force immediate UI refresh to remove the completed task
    if (completed && !showCompleted) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const confirmTaskCompletion = () => {
    if (completionConfirmTask) {
      processCompletionChange(completionConfirmTask, true);
      setCompletionConfirmTask(null);
    }
  };

  if (isLoading && !tasks.length) {
    return <PriorityActionsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading tasks: {error.message}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Filter out tasks that were just marked as completed if not showing completed
  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && completedTaskIds.current.has(task.id)) {
      return false;
    }
    return true;
  });

  if (!filteredTasks.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-2">
          No {showCompleted ? "completed" : "active"} tasks found{category && category !== 'All' ? ` for category: ${category}` : ''}.
        </p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-4 flex justify-end">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Tasks
        </Button>
      </div>
      
      {filteredTasks.map((task) => (
        <TaskItem
          key={`${task.id}-${refreshKey}`}
          task={task}
          onUpdateCompletion={(completed) => handleCompletionChange(task, completed)}
          onUpdateUrgency={(urgent) => updateUrgency(task, urgent)}
          onDelete={() => handleTaskDelete(task)}
          isUpdating={isProcessing}
          isDeleting={isProcessing}
          onSelect={() => onItemSelected?.(task.id)}
        />
      ))}

      <CompletionConfirmDialog
        open={!!completionConfirmTask}
        onOpenChange={(open) => {
          if (!open) setCompletionConfirmTask(null);
        }}
        onConfirm={confirmTaskCompletion}
        itemType="task"
      />
    </div>
  );
};
