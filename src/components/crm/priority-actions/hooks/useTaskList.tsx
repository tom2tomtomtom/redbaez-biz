
import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { useTaskData } from './useTaskData';
import { useTaskMutations } from './useTaskMutations';
import logger from '@/utils/logger';

interface UseTaskListProps {
  category?: string;
  showCompleted?: boolean;
}

export const useTaskList = ({ category, showCompleted = false }: UseTaskListProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [completionConfirmTask, setCompletionConfirmTask] = useState<Task | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  // Fetch tasks with useTaskData hook
  const { 
    data: tasks = [], 
    isLoading, 
    error, 
    refetch 
  } = useTaskData(category, showCompleted);
  
  // Get task mutations
  const { 
    isProcessing,
    updateCompletion,
    updateUrgency,
    deleteTask,
    invalidateTaskQueries
  } = useTaskMutations();

  // Process and filter tasks based on props
  useEffect(() => {
    logger.info(`TaskList useEffect running for filtering with refreshKey: ${refreshKey}`);
    logger.info(`Current tasks count: ${tasks.length}`);
    
    // Apply any additional client-side filtering if needed
    const filtered = [...tasks];
    logger.info(`Filtered task list has ${filtered.length} tasks after filtering`);
    setFilteredTasks(filtered);
  }, [tasks, category, showCompleted, refreshKey]);

  // Handle explicit refresh with cache invalidation
  const handleRefresh = useCallback(async () => {
    logger.info('Manual refresh requested');
    
    // First invalidate caches
    await invalidateTaskQueries();
    
    // Then force refetch with new refreshKey
    const result = await refetch();
    logger.info(`Manual refresh completed with ${result.data?.length} tasks`);
    
    // Update refresh key to trigger re-render
    setRefreshKey(prev => prev + 1);
    
    return result;
  }, [refetch, invalidateTaskQueries]);

  // Handle completion status change with confirmation for important tasks
  const handleCompletionChange = useCallback((task: Task, completed: boolean) => {
    if (completed && task.urgent) {
      // Show confirmation dialog for urgent tasks
      setCompletionConfirmTask(task);
    } else {
      // For non-urgent tasks or unmarking as completed, proceed directly
      updateCompletion(task, completed);
    }
  }, [updateCompletion]);

  // Handle task deletion
  const handleTaskDelete = useCallback((task: Task) => {
    deleteTask(task);
  }, [deleteTask]);

  // Handle confirmation of task completion
  const confirmTaskCompletion = useCallback(() => {
    if (completionConfirmTask) {
      updateCompletion(completionConfirmTask, true);
      setCompletionConfirmTask(null);
    }
  }, [completionConfirmTask, updateCompletion]);

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
