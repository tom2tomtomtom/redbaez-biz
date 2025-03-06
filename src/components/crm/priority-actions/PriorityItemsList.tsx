
import { useState, useEffect } from 'react';
import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { CompletionDialog } from './components/CompletionDialog';
import { PriorityListItem } from './components/PriorityListItem';
import { useItemStatusChange } from './hooks/useItemStatusChange';
import { toast } from '@/hooks/use-toast';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: GeneralTaskRow) => void;
  onTaskUpdated?: () => void;
}

export const PriorityItemsList = ({ 
  items, 
  onTaskClick,
  onTaskUpdated 
}: PriorityItemsListProps) => {
  const [itemToComplete, setItemToComplete] = useState<PriorityItem | null>(null);
  const [localItems, setLocalItems] = useState<PriorityItem[]>([]);
  const { handleCompletedChange, handleUrgentChange, handleDelete } = useItemStatusChange();

  // Update localItems when items prop changes
  useEffect(() => {
    console.log('PriorityItemsList received new items:', items.length);
    
    // Filter out completed items before setting to local state
    const filteredItems = items.filter(item => {
      if (item.type === 'task') {
        return item.data.status !== 'completed';
      }
      if (item.type === 'next_step') {
        return !item.data.completed_at;
      }
      return true;
    });
    
    console.log('After filtering, active items:', filteredItems.length);
    setLocalItems(filteredItems);
  }, [items]);

  const handleItemDelete = async (item: PriorityItem) => {
    const success = await handleDelete(item);
    if (success) {
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      
      // Remove the item from local state to give immediate feedback
      setLocalItems(prevItems => 
        prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
      );
      
      // Notify parent component that task was updated
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    }
  };

  const handleComplete = async (item: PriorityItem) => {
    const success = await handleCompletedChange(item, true);
    if (success) {
      toast({
        title: "Success",
        description: "Item marked as completed",
      });
      
      // Remove the item from local state to give immediate feedback
      setLocalItems(prevItems => 
        prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
      );
      
      // Notify parent component that task was updated
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    }
    setItemToComplete(null);
  };
  
  const handleUrgentStatusChange = async (item: PriorityItem, checked: boolean) => {
    const success = await handleUrgentChange(item, checked);
    if (success) {
      toast({
        title: "Success",
        description: checked ? "Item marked as urgent" : "Item urgency removed",
      });
      
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    }
  };

  console.log('PriorityItemsList rendering activeItems:', localItems.length);

  if (localItems.length === 0) {
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
        {localItems.map((item, index) => (
          <PriorityListItem
            key={`${item.type}-${item.data.id}-${index}`}
            item={item}
            index={index}
            onTaskClick={onTaskClick}
            onComplete={() => setItemToComplete(item)}
            onUrgentChange={(checked) => handleUrgentStatusChange(item, checked)}
            onDelete={() => handleItemDelete(item)}
          />
        ))}
      </div>
    </>
  );
};
