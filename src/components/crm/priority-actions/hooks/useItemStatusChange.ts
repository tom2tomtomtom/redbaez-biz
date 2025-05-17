
import { useCompletionStatus } from './useCompletionStatus';
import { useUrgencyStatus } from './useUrgencyStatus';
import { useItemDeletion } from './useItemDeletion';
import { useQueryManager } from '@/hooks/useQueryManager';

export const useItemStatusChange = () => {
  const { handleCompletedChange } = useCompletionStatus();
  const { handleUrgentChange } = useUrgencyStatus();
  const { handleDelete } = useItemDeletion();
  const { invalidateTaskQueries } = useQueryManager();

  return {
    handleCompletedChange,
    handleUrgentChange,
    handleDelete,
    refreshAllTaskData: invalidateTaskQueries
  };
};
