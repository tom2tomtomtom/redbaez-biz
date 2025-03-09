
import { useTasksQuery } from './useTasksQuery';
import { useTasksMutations } from './useTasksMutations';
import { useQueryClient } from '@tanstack/react-query';
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
  
  const queryClient = useQueryClient();
  
  // Helper function to force a global refresh
  const forceRefresh = async () => {
    console.log('Force refreshing all task data');
    
    // Invalidate related queries first
    await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    await queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    await queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    
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
