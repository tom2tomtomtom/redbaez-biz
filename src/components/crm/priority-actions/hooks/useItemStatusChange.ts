
import { useCompletionStatus } from './useCompletionStatus';
import { useUrgencyStatus } from './useUrgencyStatus';
import { useItemDeletion } from './useItemDeletion';

export const useItemStatusChange = () => {
  const { handleCompletedChange } = useCompletionStatus();
  const { handleUrgentChange } = useUrgencyStatus();
  const { handleDelete } = useItemDeletion();

  return {
    handleCompletedChange,
    handleUrgentChange,
    handleDelete
  };
};
