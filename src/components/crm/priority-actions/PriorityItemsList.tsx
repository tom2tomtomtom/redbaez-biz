import logger from '@/utils/logger';

import { useEffect, useRef, useState } from 'react';
import { PriorityActionItem } from './PriorityActionItem';
import { useItemStatusChange } from './hooks/useItemStatusChange';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

interface PriorityItemsListProps {
  items: Task[];
  onItemRemoved?: () => void;
  onItemUpdated?: () => void;
  onItemSelected?: (item: Task) => void;
  category?: string;
  showCompleted?: boolean;
}

const getReopenedStatus = (status: TaskStatus): TaskStatus => {
  if (status === 'completed') {
    return 'incomplete';
  }
  return status;
};

export const PriorityItemsList = ({
  items,
  onItemRemoved,
  onItemUpdated,
  onItemSelected,
  category,
  showCompleted = false
}: PriorityItemsListProps) => {
  const [localItems, setLocalItems] = useState<Task[]>([]);
  const [itemPendingDelete, setItemPendingDelete] = useState<Task | null>(null);
  const [itemPendingCompletion, setItemPendingCompletion] = useState<Task | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);

  const { handleCompletedChange, handleUrgentChange, handleDelete } = useItemStatusChange();
  const previousItemsRef = useRef<Task[]>([]);

  useEffect(() => {
    if (!items || !Array.isArray(items)) {
      logger.info('PriorityItemsList received invalid items array');
      setLocalItems([]);
      return;
    }

    logger.info('PriorityItemsList received items:', items.length);
    const filtered = items.filter(item =>
      showCompleted ? item.status === 'completed' : item.status !== 'completed'
    );

    setLocalItems(filtered);
  }, [items, showCompleted]);

  const updateLocalTask = (taskId: string, updates: Partial<Task>) => {
    setLocalItems(prev => prev.map(task => (task.id === taskId ? { ...task, ...updates } : task)));
  };

  const processCompletionChange = async (task: Task, completed: boolean) => {
    if (isProcessingUpdate) return;

    setIsProcessingUpdate(true);
    const previousStatus = task.status;
    const newStatus: TaskStatus = completed ? 'completed' : getReopenedStatus(previousStatus);

    logger.info('Processing completion change', { taskId: task.id, completed });

    updateLocalTask(task.id, { status: newStatus });

    if (!showCompleted && completed) {
      setLocalItems(prev => prev.filter(item => item.id !== task.id));
    }

    const success = await handleCompletedChange({ ...task, status: newStatus }, completed);

    if (!success) {
      logger.info('Completion update failed, reverting local state');
      updateLocalTask(task.id, { status: previousStatus });

      if (!showCompleted && completed) {
        setLocalItems(prev => [...prev, task]);
      }
    } else {
      onItemUpdated?.();
    }

    setIsProcessingUpdate(false);
  };

  const handleCompletionToggle = (task: Task, completed: boolean) => {
    if (completed) {
      setItemPendingCompletion(task);
    } else {
      processCompletionChange(task, completed);
    }
  };

  const handleUrgentToggle = async (task: Task, checked: boolean) => {
    if (isProcessingUpdate) return;

    setIsProcessingUpdate(true);
    const previousUrgent = task.urgent ?? false;
    const previousPriority = task.priority;
    const updatedPriority: TaskPriority = checked
      ? 'urgent'
      : previousPriority === 'urgent'
        ? 'normal'
        : previousPriority;

    updateLocalTask(task.id, { urgent: checked, priority: updatedPriority });

    const success = await handleUrgentChange(task, checked);
    if (!success) {
      logger.info('Urgent update failed, reverting local state');
      updateLocalTask(task.id, { urgent: previousUrgent, priority: previousPriority });
    } else {
      onItemUpdated?.();
    }

    setIsProcessingUpdate(false);
  };

  const confirmDelete = (task: Task) => {
    setItemPendingDelete(task);
  };

  const closeDeleteDialog = () => {
    setItemPendingDelete(null);
  };

  const proceedWithDelete = async () => {
    if (!itemPendingDelete) return;

    if (isProcessingDelete) {
      logger.info('Already processing a delete request, ignoring');
      return;
    }

    setIsProcessingDelete(true);
    previousItemsRef.current = localItems;
    setLocalItems(prev => prev.filter(item => item.id !== itemPendingDelete.id));

    const success = await handleDelete(itemPendingDelete);
    if (!success) {
      logger.info('Delete failed, restoring previous items');
      setLocalItems(previousItemsRef.current);
    } else {
      onItemRemoved?.();
    }

    setIsProcessingDelete(false);
    setItemPendingDelete(null);
  };

  const renderEmptyState = () => (
    <div className="p-4 text-center text-gray-500">
      No {showCompleted ? 'completed' : 'priority'} items found{category ? ` for category: ${category}` : ''}.
      {!showCompleted && (
        <div className="mt-2">
          <p>Try switching to the "Completed" tab to see completed items.</p>
        </div>
      )}
    </div>
  );

  if (!localItems.length) {
    return renderEmptyState();
  }

  return (
    <div className="space-y-2">
      {localItems.map(task => (
        <div
          key={task.id}
          className="flex items-start gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer group"
          onClick={() => onItemSelected?.(task)}
        >
          <div className="pt-1" onClick={event => event.stopPropagation()}>
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={checked => handleCompletionToggle(task, Boolean(checked))}
              disabled={isProcessingUpdate}
            />
          </div>

          <div className="flex-1" onClick={event => event.stopPropagation()}>
            <PriorityActionItem
              item={task}
              onUrgentChange={checked => handleUrgentToggle(task, checked)}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={event => {
              event.stopPropagation();
              confirmDelete(task);
            }}
            disabled={isProcessingDelete}
          >
            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
          </Button>
        </div>
      ))}

      <AlertDialog open={!!itemPendingDelete} onOpenChange={open => !open && closeDeleteDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithDelete} disabled={isProcessingDelete}>
              {isProcessingDelete ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {itemPendingCompletion && (
        <CompletionConfirmDialog
          open={!!itemPendingCompletion}
          onOpenChange={open => {
            if (!open) setItemPendingCompletion(null);
          }}
          onConfirm={() => {
            const task = itemPendingCompletion;
            setItemPendingCompletion(null);
            processCompletionChange(task, true);
          }}
        />
      )}
    </div>
  );
};
