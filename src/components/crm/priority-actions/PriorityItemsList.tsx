import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const { handleCompletedChange, handleUrgentChange, handleDelete } = useItemStatusChange();
  const operationInProgressRef = useRef(false);

  // Log items received
  console.log('PriorityItemsList received items:', Array.isArray(items) ? items.length : 'not an array', items);

  // Create a memoized filtering function to avoid re-rendering loops
  const filterDeletedItems = useCallback((items: PriorityItem[]) => {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      const itemId = `${item.type}-${item.data.id}`;
      return !deletedItemIds.has(itemId);
    });
  }, [deletedItemIds]);

  // Update localItems when items prop changes, filtering out any deleted items
  useEffect(() => {
    if (Array.isArray(items)) {
      console.log('PriorityItemsList updating local items:', items.length);
      
      // Filter out any items that are in our deletedItemIds set
      const filteredItems = filterDeletedItems(items);
      
      console.log('PriorityItemsList filtered items:', filteredItems.length, 'removed:', items.length - filteredItems.length);
      setLocalItems(filteredItems); // Create a new array reference to ensure state updates
    } else {
      console.log('PriorityItemsList received non-array items, setting empty array');
      setLocalItems([]);
    }
  }, [items, filterDeletedItems]);

  const handleItemDelete = async (item: PriorityItem) => {
    // Skip if another delete operation is in progress
    if (operationInProgressRef.current) {
      console.log('Another operation is in progress. Skipping this delete request.');
      return;
    }
    
    const itemId = `${item.type}-${item.data.id}`;
    
    // Check if this item is already being processed
    if (processingItems.has(itemId)) {
      console.log(`Already processing delete for item ${itemId}, ignoring duplicate request`);
      return;
    }
    
    // Set operation in progress flag
    operationInProgressRef.current = true;
    
    // Mark as processing
    setProcessingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    
    // Add to deleted items set immediately to prevent showing
    setDeletedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    
    // Remove from local state immediately to give feedback
    setLocalItems(prevItems => 
      prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
    );
    
    try {
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
        // If delete failed, show toast but keep item removed from UI
        // Next refresh will restore it if needed
        console.log(`Delete operation returned false for item ${itemId}`);
        
        toast({
          title: "Warning",
          description: "Item may not have been deleted on the server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error deleting item ${itemId}:`, error);
      
      toast({
        title: "Error",
        description: "Could not delete the item",
        variant: "destructive",
      });
    } finally {
      // Remove from processing set
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      // Clear operation in progress flag
      operationInProgressRef.current = false;
    }
  };

  const handleComplete = async (item: PriorityItem) => {
    // Skip if another operation is in progress
    if (operationInProgressRef.current) {
      console.log('Another operation is in progress. Skipping this completion request.');
      return;
    }
    
    const itemId = `${item.type}-${item.data.id}`;
    
    // Check if this item is already being processed
    if (processingItems.has(itemId)) {
      console.log(`Already processing completion for item ${itemId}, ignoring duplicate request`);
      return;
    }
    
    // Set operation in progress flag
    operationInProgressRef.current = true;
    
    // Mark as processing
    setProcessingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    
    // Add to deleted items set immediately to prevent showing (since completed items aren't shown)
    setDeletedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
    
    // Remove the item from local state to give immediate feedback
    setLocalItems(prevItems => 
      prevItems.filter(i => !(i.type === item.type && i.data.id === item.data.id))
    );
    
    try {
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
        console.log(`Completion operation failed for item ${itemId}`);
        
        toast({
          title: "Warning",
          description: "Item may not have been completed on the server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error completing item ${itemId}:`, error);
      
      toast({
        title: "Error",
        description: "Could not complete the item",
        variant: "destructive",
      });
    } finally {
      // Remove from processing set
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      // Clear operation in progress flag
      operationInProgressRef.current = false;
      
      setItemToComplete(null);
    }
  };
  
  const handleUrgentStatusChange = async (item: PriorityItem, checked: boolean) => {
    try {
      const success = await handleUrgentChange(item, checked);
      
      if (success) {
        toast({
          title: "Success",
          description: checked ? "Item marked as urgent" : "Item urgency removed",
        });
        
        // Update local state immediately for responsive UI
        setLocalItems(prevItems => 
          prevItems.map(i => {
            if (i.type === item.type && i.data.id === item.data.id) {
              // Create a new item with updated urgent flag
              if (i.type === 'task') {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: checked
                  }
                };
              } else {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: checked
                  }
                };
              }
            }
            return i;
          })
        );
        
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      }
    } catch (error) {
      console.error('Error updating urgent status:', error);
      toast({
        title: "Error",
        description: "Failed to update urgent status",
        variant: "destructive",
      });
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
