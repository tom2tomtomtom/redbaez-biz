import logger from '@/utils/logger';

import { useTasksQuery } from './useTasksQuery';
import { useTasksMutations } from './useTasksMutations';
import { useQueryManager } from '@/hooks/useQueryManager';
import { Task } from './taskTypes';

export type { Task } from './taskTypes';

export const useTasks = (category?: string, showCompleted = false) => {
  const { 
    data: tasks = [], 
    isLoading, 
    refetch, 
    error 
  } = useTasksQuery(category, showCompleted);
  
  const { 
    isUpdating, 
    isDeleting, 
    updateCompletion, 
    updateUrgency, 
    deleteTask 
  } = useTasksMutations();
  
  const { invalidateTaskQueries } = useQueryManager();
  
  // Helper function to force a global refresh
  const forceRefresh = async () => {
    logger.info('Force refreshing all task data');
    
    // Use our centralized cache manager
    await invalidateTaskQueries();
    
    // Then force a refetch
    return refetch();
  };

  // If we encountered an error, log it
  if (error) {
    logger.error('Error in useTasks:', error);
  }

  return {
    tasks,
    isLoading,
    isUpdating,
    isDeleting,
    updateCompletion,
    updateUrgency,
    deleteTask,
    refetch: forceRefresh,
    error
  };
};
