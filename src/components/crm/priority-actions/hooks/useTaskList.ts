
import { useState, useRef, useEffect } from 'react';
import { useTaskData } from './useTaskData';
import { useTaskMutations } from './useTaskMutations';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

interface UseTaskListProps {
  category?: string;
  showCompleted?: boolean;
}

export const useTaskList = ({ category, showCompleted = false }: UseTaskListProps) => {
  const [completionConfirmTask, setCompletionConfirmTask] = useState<Task | null>(null);
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
      console.log("Invalidating and refetching task queries");
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

  const handleTaskDelete = async (task: Task) => {
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

  const handleCompletionChange = (task: Task, completed: boolean) => {
    if (completed) {
      setCompletionConfirmTask(task);
    } else {
      processCompletionChange(task, false);
    }
  };

  const processCompletionChange = async (task: Task, completed: boolean) => {
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

  // Filter out tasks that were just marked as completed if not showing completed
  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && completedTaskIds.current.has(task.id)) {
      return false;
    }
    return true;
  });

  console.log(`Filtered task list has ${filteredTasks.length} tasks after filtering`);

  return {
    filteredTasks,
    isLoading,
    error,
    isProcessing,
    handleRefresh,
    handleTaskDelete,
    handleCompletionChange,
    updateUrgency,
    completionConfirmTask,
    setCompletionConfirmTask,
    confirmTaskCompletion,
    refreshKey
  };
};
