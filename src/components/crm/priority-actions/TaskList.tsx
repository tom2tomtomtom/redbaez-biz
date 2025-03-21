
import { useEffect, useState, useRef } from 'react';
import { TaskItem } from './TaskItem';
import { useTaskData } from './hooks/useTaskData';
import { useTaskMutations } from './hooks/useTaskMutations';
import { PriorityActionsSkeleton } from './PriorityActionsSkeleton';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  // Log component rendering for debugging
  console.log(`TaskList rendering with category: ${category}, showCompleted: ${showCompleted}, refreshKey: ${refreshKey}`);
  
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
    console.log(`TaskList useEffect running with refreshKey: ${refreshKey}`);
    console.log(`Current tasks count: ${tasks.length}`);
    
    refetch().then(result => {
      console.log(`Refetch completed with ${result.data?.length || 0} tasks`);
    }).catch(err => {
      console.error("Error refreshing tasks:", err);
    });
    
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      console.log("Initial load complete, setting up periodic refresh");
      
      // Set up periodic refresh every 2 minutes
      refreshIntervalRef.current = window.setInterval(() => {
        console.log("Periodic task refresh triggered");
        refetch().catch(err => {
          console.error("Error in periodic refresh:", err);
        });
      }, 120000); // 2 minutes
    }
    
    // Clean up the interval when component unmounts
    return () => {
      if (refreshIntervalRef.current !== null) {
        console.log("Cleaning up refresh interval");
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      // Clear the completed tasks set when component unmounts
      completedTaskIds.current.clear();
    };
  }, [category, showCompleted, refetch, refreshKey]);

  const handleRefresh = async () => {
    console.log("Manual refresh requested");
    
    toast({
      title: "Refreshing tasks",
      description: "Fetching latest task data..."
    });
    
    try {
      await invalidateTaskQueries();
      const result = await refetch();
      console.log(`Manual refresh completed with ${result.data?.length || 0} tasks`);
      
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
    // First, optimistically remove the task from the local UI state
    // This makes the task disappear immediately
    completedTaskIds.current.add(task.id);
    
    // Force an immediate re-render to remove the task from view
    setRefreshKey(prev => prev + 1);
    
    // Then actually delete it from the database
    const success = await deleteTask(task);
    
    if (!success) {
      // If deletion failed, remove it from the local tracking and show it again
      completedTaskIds.current.delete(task.id);
      setRefreshKey(prev => prev + 1);
      
      toast({
        title: "Error",
        description: "Failed to delete task. The task has been restored.",
        variant: "destructive",
      });
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
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Error loading tasks: {error.message || "Unknown error"}
          </AlertDescription>
        </Alert>
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

  console.log(`Rendering TaskList with ${filteredTasks.length} tasks after filtering`);

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
