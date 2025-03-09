
import { useTasksQuery } from './useTasksQuery';
import { useTasksMutations } from './useTasksMutations';
import { useQueryCacheManager } from './useQueryCacheManager';
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
  
  const { invalidateQueries } = useQueryCacheManager();
  
  // Helper function to force a global refresh
  const forceRefresh = async () => {
    console.log('Force refreshing all task data');
    
    // Use our centralized cache manager
    await invalidateQueries();
    
    // Then force a refetch
    return refetch();
  };

  // If we encountered an error, log it
  if (error) {
    console.error('Error in useTasks:', error);
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
