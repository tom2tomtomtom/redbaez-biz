
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
  const [deletedItemIds, setDeletedItemIds] = useState<Set<string>>(new Set());
  const { handleCompletedChange, handleUrgentChange, handleDelete } = useItemStatusChange();

  // Log items received
  console.log('PriorityItemsList received items:', Array.isArray(items) ? items.length : 'not an array', items);

  // Update localItems when items prop changes, filtering out any deleted items
  useEffect(() => {
    if (Array.isArray(items)) {
      console.log('PriorityItemsList updating local items:', items.length);
      
      // Filter out any items that are in our deletedItemIds set
      const filteredItems = items.filter(item => {
        const itemId = `${item.type}-${item.data.id}`;
        return !deletedItemIds.has(itemId);
      });
      
      console.log('PriorityItemsList filtered items:', filteredItems.length, 'removed:', items.length - filteredItems.length);
      setLocalItems([...filteredItems]); // Create a new array reference to ensure state updates
    } else {
      console.log('PriorityItemsList received non-array items, setting empty array');
      setLocalItems([]);
    }
  }, [items, deletedItemIds]);

  const handleItemDelete = async (item: PriorityItem) => {
    // Add to deleted items set immediately to prevent showing
    const itemId = `${item.type}-${item.data.id}`;
    setDeletedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    
    // Remove from local state immediately to give feedback
    setLocalItems(prevItems => 
      prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
    );
    
    // Actually perform the delete
    const success = await handleDelete(item);
    
    if (success) {
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      
      // Notify parent component that task was updated
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } else {
      // If delete failed, remove from deleted items set and restore to local state
      setDeletedItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      toast({
        title: "Error",
        description: "Failed to delete item, it will reappear after refresh",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (item: PriorityItem) => {
    // Add to deleted items set immediately to prevent showing (since completed items aren't shown)
    const itemId = `${item.type}-${item.data.id}`;
    setDeletedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    
    // Remove the item from local state to give immediate feedback
    setLocalItems(prevItems => 
      prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
    );
    
    const success = await handleCompletedChange(item, true);
    
    if (success) {
      toast({
        title: "Success",
        description: "Item marked as completed",
      });
      
      // Notify parent component that task was updated
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } else {
      // If completion failed, remove from deleted items set and restore to local state
      setDeletedItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      toast({
        title: "Error",
        description: "Failed to complete item, it will reappear after refresh",
        variant: "destructive",
      });
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
      
      // Update local state to reflect the change
      setLocalItems(prevItems => 
        prevItems.map(i => {
          if (i.type === item.type && i.data.id === item.data.id) {
            return {
              ...i,
              data: {
                ...i.data,
                urgent: checked
              }
            };
          }
          return i;
        })
      );
      
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    }
  };

  console.log('PriorityItemsList rendering localItems:', localItems.length);

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
