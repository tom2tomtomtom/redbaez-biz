
import { useCompletionStatus } from './useCompletionStatus';
import { useUrgencyStatus } from './useUrgencyStatus';
import { useItemDeletion } from './useItemDeletion';
import { useQueryClient } from '@tanstack/react-query';

export const useItemStatusChange = () => {
  const { handleCompletedChange } = useCompletionStatus();
  const { handleUrgentChange } = useUrgencyStatus();
  const { handleDelete } = useItemDeletion();
  const queryClient = useQueryClient();

  // Add a global invalidation function to ensure consistent cache updates
  const refreshAllTaskData = async (clientId?: number | null) => {
    console.log('Global task data refresh triggered');
    
    // Invalidate main task queries with various patterns to ensure all are caught
    await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    await queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
    await queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
    
    // If we have a client ID, also invalidate client-specific queries
    if (clientId) {
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client-items', clientId] });
    }
    
    return true;
  };

  return {
    handleCompletedChange,
    handleUrgentChange,
    handleDelete,
    refreshAllTaskData
  };
};
