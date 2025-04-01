
import { useState, useCallback, useEffect } from 'react';
import { useTaskData } from './useTaskData';
import { useTaskMutations } from './useTaskMutations';
import { Task } from '@/types/task';
import logger from '@/utils/logger';

interface UseTaskListOptions {
  category?: string;
  showCompleted?: boolean;
}

export const useTaskList = ({ 
  category, 
  showCompleted = false 
}: UseTaskListOptions) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [completionConfirmTask, setCompletionConfirmTask] = useState<Task | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  // Get task data with the specified filters
  const { 
    data: tasks = [], 
    isLoading, 
    error, 
    refetch 
  } = useTaskData(category, showCompleted);

  // Get mutation functions for tasks
  const {
    isProcessing,
    updateCompletion,
    updateUrgency,
    deleteTask,
    invalidateTaskQueries
  } = useTaskMutations();

  // Apply category filtering if needed (secondary filtering beyond what the query does)
  useEffect(() => {
    logger.info('TaskList useEffect running for filtering with refreshKey:', refreshKey);
    logger.info('Current tasks count:', tasks.length);
    
    if (tasks.length === 0) {
      setFilteredTasks([]);
      return;
    }
    
    // Apply additional filtering if needed
    let filtered = [...tasks];
    
    if (category && category !== 'All') {
      // Additional client-side filtering if needed
      filtered = filtered.filter(task => {
        return task.category?.toLowerCase().includes(category.toLowerCase());
      });
    }
    
    logger.info(`Tasks filtered by category "${category}": ${filtered.length} of ${tasks.length}`);
    setFilteredTasks(filtered);
  }, [tasks, category, refreshKey]);

  // Handle refresh button
  const handleRefresh = useCallback(async () => {
    logger.info('Manual refresh requested');
    await invalidateTaskQueries();
    const result = await refetch();
    logger.info('Manual refresh completed with', result.data?.length, 'tasks');
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

  // Handle deletion
  const handleTaskDelete = useCallback((task: Task) => {
    deleteTask(task);
  }, [deleteTask]);

  // Confirm task completion
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
