
import { useCompletionStatus } from './useCompletionStatus';
import { useUrgencyStatus } from './useUrgencyStatus';
import { useItemDeletion } from './useItemDeletion';
import { useQueryCacheManager } from './useQueryCacheManager';

export const useItemStatusChange = () => {
  const { handleCompletedChange } = useCompletionStatus();
  const { handleUrgentChange } = useUrgencyStatus();
  const { handleDelete } = useItemDeletion();
  const { invalidateQueries } = useQueryCacheManager();

  return {
    handleCompletedChange,
    handleUrgentChange,
    handleDelete,
    refreshAllTaskData: invalidateQueries
  };
};
