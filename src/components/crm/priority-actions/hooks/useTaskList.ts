
import { useState, useCallback, useEffect } from 'react';
import { useTaskData } from './useTaskData';
import { useTaskMutations } from './useTaskMutations';
import { Task } from '@/types/task';
import logger from '@/lib/logger';

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

  // Log task data for debugging
  useEffect(() => {
    logger.info(`Tasks loaded: ${tasks.length}`, { 
      category, 
      showCompleted, 
      hasError: !!error 
    });
    
    if (tasks.length > 0) {
      logger.info('First task sample:', tasks[0]);
    }
  }, [tasks, category, showCompleted, error]);

  // Filter tasks based on category if needed
  const filteredTasks = tasks.filter(task => {
    if (!category || category === 'All') return true;
    return task.category?.includes(category);
  });

  // Handle task completion with confirmation
  const handleCompletionChange = (task: Task, completed: boolean) => {
    if (completed) {
      setCompletionConfirmTask(task);
    } else {
      updateCompletion(task, completed);
    }
  };

  // Confirm task completion after dialog
  const confirmTaskCompletion = () => {
    if (completionConfirmTask) {
      updateCompletion(completionConfirmTask, true);
      setCompletionConfirmTask(null);
    }
  };

  // Handle refresh of task list
  const handleRefresh = useCallback(async () => {
    await invalidateTaskQueries();
    await refetch();
    setRefreshKey(prev => prev + 1);
  }, [invalidateTaskQueries, refetch]);

  return {
    filteredTasks,
    isLoading,
    error,
    isProcessing,
    handleRefresh,
    handleTaskDelete: deleteTask,
    handleCompletionChange,
    updateUrgency,
    completionConfirmTask,
    setCompletionConfirmTask,
    confirmTaskCompletion,
    refreshKey
  };
};
