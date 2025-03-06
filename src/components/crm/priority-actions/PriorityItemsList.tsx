
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

  // Log items received
  console.log('PriorityItemsList received items:', items?.length, items);

  // Update localItems when items prop changes
  useEffect(() => {
    console.log('PriorityItemsList updating local items:', items?.length || 0);
    setLocalItems(items || []);
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

  console.log('PriorityItemsList rendering localItems:', localItems?.length || 0);

  // Check if items array is valid
  if (!Array.isArray(localItems) || localItems.length === 0) {
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
