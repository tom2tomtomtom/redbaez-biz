
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
  const previousItemsLengthRef = useRef(0);

  // Unique identifier for items to assist with tracking
  const getItemKey = useCallback((item: PriorityItem) => {
    return `${item.type}-${item.data.id}`;
  }, []);

  // Create a memoized filtering function to avoid re-rendering loops
  const filterDeletedItems = useCallback((itemsToFilter: PriorityItem[]) => {
    if (!Array.isArray(itemsToFilter)) return [];
    
    return itemsToFilter.filter(item => {
      const itemId = getItemKey(item);
      return !deletedItemIds.has(itemId);
    });
  }, [deletedItemIds, getItemKey]);

  // Update localItems when items prop changes, but only if the length changed
  // This prevents unnecessary re-renders caused by object reference changes
  useEffect(() => {
    if (Array.isArray(items)) {
      // Log incoming items for debugging
      console.log('PriorityItemsList received items:', items.length, items);
      
      // Only update if the number of items changed or first load
      if (items.length !== previousItemsLengthRef.current || localItems.length === 0) {
        console.log('PriorityItemsList updating local items:', items.length);
        
        // Filter out any items that are in our deletedItemIds set
        const filteredItems = filterDeletedItems(items);
        
        console.log('PriorityItemsList filtered items:', filteredItems.length, 'removed:', items.length - filteredItems.length);
        previousItemsLengthRef.current = items.length;
        setLocalItems(filteredItems);
      }
    } else {
      console.log('PriorityItemsList received non-array items, setting empty array');
      setLocalItems([]);
      previousItemsLengthRef.current = 0;
    }
  }, [items, filterDeletedItems, localItems.length, getItemKey]);

  const handleItemDelete = async (item: PriorityItem) => {
    // Skip if another operation is in progress
    if (operationInProgressRef.current) {
      console.log('Another operation is in progress. Skipping this delete request.');
      return;
    }
    
    const itemId = getItemKey(item);
    
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
    
    // Remove from local state immediately for UI update
    setLocalItems(prevItems => {
      return prevItems.filter(i => getItemKey(i) !== itemId);
    });
    
    try {
      // Actually perform the delete
      console.log(`Attempting to delete item ${itemId}`);
      const success = await handleDelete(item);
      
      if (success) {
        console.log(`Successfully deleted item ${itemId}`);
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
        
        // Notify parent component that task was updated
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        console.log(`Delete operation failed for item ${itemId}`);
        
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
    
    const itemId = getItemKey(item);
    
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
    
    // Remove the item from local state for immediate feedback
    setLocalItems(prevItems => {
      return prevItems.filter(i => getItemKey(i) !== itemId);
    });
    
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
    // Skip if another operation is in progress
    if (operationInProgressRef.current) {
      console.log('Another operation is in progress. Skipping this urgent change request.');
      return;
    }
    
    const itemId = getItemKey(item);
    
    // Check if this item is already being processed
    if (processingItems.has(itemId)) {
      console.log(`Already processing urgent change for item ${itemId}, ignoring duplicate request`);
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
    
    try {
      // Update local state immediately for responsive UI
      setLocalItems(prevItems => {
        return prevItems.map(i => {
          if (getItemKey(i) === itemId) {
            if (i.type === 'task') {
              return {
                ...i,
                data: {
                  ...i.data,
                  urgent: checked
                }
              } as PriorityItem;
            } else {
              return {
                ...i,
                data: {
                  ...i.data,
                  urgent: checked
                }
              } as PriorityItem;
            }
          }
          return i;
        });
      });
      
      const success = await handleUrgentChange(item, checked);
      
      if (success) {
        toast({
          title: "Success",
          description: checked ? "Item marked as urgent" : "Item urgency removed",
        });
        
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        // Revert the local state change if server update failed
        setLocalItems(prevItems => {
          return prevItems.map(i => {
            if (getItemKey(i) === itemId) {
              if (i.type === 'task') {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: !checked // Revert to previous state
                  }
                } as PriorityItem;
              } else {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: !checked // Revert to previous state
                  }
                } as PriorityItem;
              }
            }
            return i;
          });
        });
        
        toast({
          title: "Error",
          description: "Failed to update urgent status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating urgent status:', error);
      toast({
        title: "Error",
        description: "Failed to update urgent status",
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
            key={`${getItemKey(item)}-${index}`}
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
