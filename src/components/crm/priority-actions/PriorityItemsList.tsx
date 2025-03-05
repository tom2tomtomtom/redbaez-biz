
import { useState, useEffect } from 'react';
import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { CompletionDialog } from './components/CompletionDialog';
import { PriorityListItem } from './components/PriorityListItem';
import { useItemStatusChange } from './hooks/useItemStatusChange';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: GeneralTaskRow) => void;
}

export const PriorityItemsList = ({ items, onTaskClick }: PriorityItemsListProps) => {
  const [itemToComplete, setItemToComplete] = useState<PriorityItem | null>(null);
  const [localItems, setLocalItems] = useState<PriorityItem[]>(items);
  const { handleCompletedChange, handleUrgentChange, handleDelete } = useItemStatusChange();

  // Update localItems when items prop changes
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const activeItems = localItems.filter(item => {
    if (item.type === 'task') {
      return item.data.status !== 'completed';
    }
    if (item.type === 'next_step') {
      return !item.data.completed_at;
    }
    return true;
  });

  const handleItemDelete = async (item: PriorityItem) => {
    const success = await handleDelete(item);
    if (success) {
      // Remove the item from local state to give immediate feedback
      setLocalItems(prevItems => 
        prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
      );
    }
  };

  const handleComplete = async (item: PriorityItem) => {
    const success = await handleCompletedChange(item, true);
    if (success) {
      // Remove the item from local state to give immediate feedback
      setLocalItems(prevItems => 
        prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
      );
    }
    setItemToComplete(null);
  };

  if (activeItems.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-600 text-center">No priority actions found</p>
      </div>
    );
  }

  return (
    <>
      <CompletionDialog
        itemToComplete={itemToComplete}
        onOpenChange={() => setItemToComplete(null)}
        onComplete={handleComplete}
      />

      <div className="space-y-6">
        {activeItems.map((item, index) => (
          <PriorityListItem
            key={`${item.type}-${item.data.id}-${index}`}
            item={item}
            index={index}
            onTaskClick={onTaskClick}
            onComplete={() => setItemToComplete(item)}
            onUrgentChange={(checked) => handleUrgentChange(item, checked)}
            onDelete={() => handleItemDelete(item)}
          />
        ))}
      </div>
    </>
  );
};
