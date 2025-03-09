import { useState, useEffect, useRef } from 'react';
import { PriorityActionItem } from './PriorityActionItem';
import { PriorityItem } from './hooks/usePriorityData';
import { useItemStatusChange } from './hooks/useItemStatusChange';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { CompletionConfirmDialog } from './components/CompletionConfirmDialog';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onItemRemoved?: () => void;
  onItemUpdated?: () => void;
  onItemSelected?: (item: PriorityItem) => void;
  category?: string;
  showCompleted?: boolean;
}

export const PriorityItemsList = ({ 
  items, 
  onItemRemoved, 
  onItemUpdated,
  onItemSelected,
  category,
  showCompleted = false
}: PriorityItemsListProps & { showCompleted?: boolean }) => {
  const [localItems, setLocalItems] = useState<PriorityItem[]>([]);
  const [openAlertDialogId, setOpenAlertDialogId] = useState<string | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);
  const { handleCompletedChange, handleDelete, handleUrgentChange } = useItemStatusChange();
  
  const [completionConfirmItem, setCompletionConfirmItem] = useState<PriorityItem | null>(null);
  const deletedItemIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    deletedItemIds.current = new Set<string>();
    console.log('Deleted items set reset on component mount');
  }, []);

  useEffect(() => {
    if (!items) return;
    
    console.log('PriorityItemsList received items:', items.length, items);
    console.log('showCompleted flag:', showCompleted);
    console.log('Deleted items count:', deletedItemIds.current.size);
    
    if (deletedItemIds.current.size > 0) {
      console.log('Currently deleted items:', [...deletedItemIds.current]);
    }

    const validItems = items.filter(item => {
      if (!item || !item.data || !item.data.id) {
        console.log('Filtering out invalid item:', item);
        return false;
      }
      
      const uniqueId = `${item.type}-${item.data.id}`;
      const isDeleted = deletedItemIds.current.has(uniqueId);
      
      if (isDeleted) {
        console.log(`Filtering out deleted item: ${uniqueId}`);
      }
      
      return !isDeleted;
    });
    
    console.log('PriorityItemsList filtered valid items:', validItems.length);

    let filteredItems;
    
    if (showCompleted) {
      filteredItems = validItems.filter(item => {
        const isCompleted = (item.type === 'task' && item.data.status === 'completed') || 
          (item.type === 'next_step' && item.data.completed_at !== null);
        return isCompleted;
      });
      console.log('Filtered for completed items:', filteredItems.length);
    } else {
      filteredItems = validItems.filter(item => {
        const isIncomplete = (item.type === 'task' && item.data.status !== 'completed') || 
          (item.type === 'next_step' && item.data.completed_at === null);
        return isIncomplete;
      });
      console.log('Filtered for active items:', filteredItems.length);
    }
    
    setLocalItems(filteredItems);
  }, [items, showCompleted]);

  const confirmDelete = (item: PriorityItem) => {
    if (!item || !item.data || !item.data.id) {
      console.error('Invalid item for deletion:', item);
      return;
    }
    setOpenAlertDialogId(item.data.id);
  };

  const closeDialog = () => {
    setOpenAlertDialogId(null);
  };

  const proceedWithDelete = async (item: PriorityItem) => {
    if (isProcessingDelete) return;
    
    try {
      setIsProcessingDelete(true);
      const itemId = item.data.id;
      const uniqueItemId = `${item.type}-${itemId}`;
      
      console.log(`Deleting item ${uniqueItemId}`);

      deletedItemIds.current.add(uniqueItemId);
      console.log(`Added ${uniqueItemId} to deletedItemIds set`, [...deletedItemIds.current]);
      
      setLocalItems(prevItems => {
        const filtered = prevItems.filter(i => !(i.type === item.type && i.data.id === itemId));
        console.log(`Removed item from localItems, before: ${prevItems.length}, after: ${filtered.length}`);
        return filtered;
      });
      
      const success = await handleDelete(item);
      
      if (success) {
        console.log(`${item.type} deleted successfully:`, itemId);
        
        toast({
          title: "Success",
          description: `${item.type === 'task' ? 'Task' : 'Next step'} deleted successfully`,
        });
        
        if (onItemRemoved) {
          console.log('Calling onItemRemoved callback');
          onItemRemoved();
        }
      } else {
        console.error(`Failed to delete ${item.type}:`, itemId);
        
        toast({
          title: "Error",
          description: `Failed to delete ${item.type === 'task' ? 'task' : 'next step'}. Please try again later.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in deletion process:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDelete(false);
      closeDialog();
    }
  };

  const handleCompletionStatusChange = async (item: PriorityItem, checked: boolean) => {
    if (isProcessingUpdate) return;
    
    if (checked) {
      setCompletionConfirmItem(item);
    } else {
      processCompletionChange(item, checked);
    }
  };

  const processCompletionChange = async (item: PriorityItem, checked: boolean) => {
    if (isProcessingUpdate) return;
    
    try {
      setIsProcessingUpdate(true);
      
      if (item.type === 'task') {
        setLocalItems(prevItems => 
          prevItems.map(i => {
            if (i.type === 'task' && i.data.id === item.data.id) {
              return {
                ...i,
                data: {
                  ...i.data,
                  status: checked ? 'completed' : 'incomplete'
                }
              } as PriorityItem;
            }
            return i;
          })
        );
      } else if (item.type === 'next_step') {
        setLocalItems(prevItems => 
          prevItems.map(i => {
            if (i.type === 'next_step' && i.data.id === item.data.id) {
              return {
                ...i,
                data: {
                  ...i.data,
                  completed_at: checked ? new Date().toISOString() : null
                }
              } as PriorityItem;
            }
            return i;
          })
        );
      }
      
      const success = await handleCompletedChange(item, checked);
      
      if (success && checked && !showCompleted) {
        setLocalItems(prevItems => prevItems.filter(i => 
          !(i.data.id === item.data.id && i.type === item.type)
        ));
      }
      
      if (success) {
        console.log('Task updated, refreshing data...');
        toast({
          title: "Success",
          description: `${item.type === 'task' ? 'Task' : 'Next step'} marked as ${checked ? 'completed' : 'active'}`,
        });
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        console.error('Failed to update task completion status');
        if (item.type === 'task') {
          setLocalItems(prevItems => 
            prevItems.map(i => {
              if (i.type === 'task' && i.data.id === item.data.id) {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    status: checked ? 'incomplete' : 'completed'
                  }
                } as PriorityItem;
              }
              return i;
            })
          );
        } else if (item.type === 'next_step') {
          setLocalItems(prevItems => 
            prevItems.map(i => {
              if (i.type === 'next_step' && i.data.id === item.data.id) {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    completed_at: checked ? null : new Date().toISOString()
                  }
                } as PriorityItem;
              }
              return i;
            })
          );
        }
      }
    } catch (error) {
      console.error('Error handling completion status change:', error);
    } finally {
      setIsProcessingUpdate(false);
    }
  };

  const handleUrgentStatusChange = async (item: PriorityItem, checked: boolean) => {
    if (isProcessingUpdate) return;
    
    try {
      setIsProcessingUpdate(true);
      
      if (item.type === 'task') {
        setLocalItems(prevItems => 
          prevItems.map(i => {
            if (i.type === 'task' && i.data.id === item.data.id) {
              return {
                ...i,
                data: {
                  ...i.data,
                  urgent: checked
                }
              } as PriorityItem;
            }
            return i;
          })
        );
      } else if (item.type === 'next_step') {
        setLocalItems(prevItems => 
          prevItems.map(i => {
            if (i.type === 'next_step' && i.data.id === item.data.id) {
              return {
                ...i,
                data: {
                  ...i.data,
                  urgent: checked
                }
              } as PriorityItem;
            }
            return i;
          })
        );
      }
      
      const success = await handleUrgentChange(item, checked);
      
      if (success) {
        console.log('Urgent status updated successfully');
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        console.error('Failed to update urgent status');
        if (item.type === 'task') {
          setLocalItems(prevItems => 
            prevItems.map(i => {
              if (i.type === 'task' && i.data.id === item.data.id) {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: !checked
                  }
                } as PriorityItem;
              }
              return i;
            })
          );
        } else if (item.type === 'next_step') {
          setLocalItems(prevItems => 
            prevItems.map(i => {
              if (i.type === 'next_step' && i.data.id === item.data.id) {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: !checked
                  }
                } as PriorityItem;
              }
              return i;
            })
          );
        }
      }
    } catch (error) {
      console.error('Error handling urgent status change:', error);
    } finally {
      setIsProcessingUpdate(false);
    }
  };

  const handleItemClick = (item: PriorityItem) => {
    if (onItemSelected) {
      onItemSelected(item);
    }
  };

  if (!localItems.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No {showCompleted ? "completed" : "priority"} items found{category ? ` for category: ${category}` : ''}.
        {!showCompleted && (
          <div className="mt-2">
            <p>Try switching to the "Completed" tab to see completed items.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {localItems.map((item) => {
        const itemId = item.data.id;
        const uniqueItemId = `${item.type}-${itemId}`;
        
        if (deletedItemIds.current.has(uniqueItemId)) {
          console.log(`Skipping deleted item ${uniqueItemId}`);
          return null;
        }
        
        return (
          <div 
            key={uniqueItemId} 
            className="flex items-start gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onItemSelected && onItemSelected(item)}
          >
            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
              <Checkbox 
                checked={
                  item.type === 'task' 
                    ? item.data.status === 'completed' 
                    : item.data.completed_at !== null
                } 
                onCheckedChange={(checked) => {
                  if (handleCompletionStatusChange) {
                    handleCompletionStatusChange(item, checked as boolean);
                  }
                }}
                disabled={isProcessingUpdate}
              />
            </div>
            
            <div className="flex-1" onClick={(e) => e.stopPropagation()}>
              <PriorityActionItem 
                item={item} 
                onUrgentChange={(checked) => {
                  handleUrgentStatusChange(item, checked);
                }}
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(item);
              }}
              disabled={isProcessingDelete}
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
            </Button>
            
            <AlertDialog open={openAlertDialogId === itemId}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this {item.type === 'task' ? 'task' : 'next step'}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => proceedWithDelete(item)}
                    disabled={isProcessingDelete}
                  >
                    {isProcessingDelete ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}

      {completionConfirmItem && (
        <CompletionConfirmDialog
          open={!!completionConfirmItem}
          onOpenChange={(open) => {
            if (!open) setCompletionConfirmItem(null);
          }}
          onConfirm={() => {
            const item = completionConfirmItem;
            setCompletionConfirmItem(null);
            if (processCompletionChange) {
              processCompletionChange(item, true);
            }
          }}
          itemType={completionConfirmItem.type}
        />
      )}
    </div>
  );
};
