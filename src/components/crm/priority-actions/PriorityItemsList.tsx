
import { useState, useEffect } from 'react';
import { PriorityActionItem } from './PriorityActionItem';
import { PriorityItem } from './hooks/usePriorityData';
import { useItemStatusChange } from './hooks/useItemStatusChange';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onItemRemoved?: () => void;
  onItemUpdated?: () => void;
  category?: string;
}

export const PriorityItemsList = ({ 
  items, 
  onItemRemoved, 
  onItemUpdated,
  category 
}: PriorityItemsListProps) => {
  const [localItems, setLocalItems] = useState<PriorityItem[]>([]);
  const [openAlertDialogId, setOpenAlertDialogId] = useState<string | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [isProcessingUpdate, setIsProcessingUpdate] = useState(false);
  const { handleCompletedChange, handleDelete, handleUrgentChange } = useItemStatusChange();

  useEffect(() => {
    // Ensure we're only dealing with valid items
    if (!items) return;
    
    console.log('PriorityItemsList received items:', items.length, items);
    console.log('PriorityItemsList rendering localItems:', localItems.length);

    // Only update if received items are different
    if (items.length !== localItems.length || JSON.stringify(items) !== JSON.stringify(localItems)) {
      console.log('PriorityItemsList updating local items:', items.length);
      
      // Filter out any items that might not have valid ids
      const validItems = items.filter(item => item && item.data && item.data.id);
      console.log('PriorityItemsList filtered items:', validItems.length, 'removed:', items.length - validItems.length);
      
      setLocalItems(validItems);
    }
  }, [items]);

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
      
      // Immediately update local state for responsive UI
      setLocalItems(prevItems => prevItems.filter(i => i.data.id !== itemId));
      
      // Remove from database
      const success = await handleDelete(item);
      
      if (success) {
        console.log(`${item.type} deleted successfully:`, itemId);
        toast({
          title: "Success",
          description: `${item.type === 'task' ? 'Task' : 'Next step'} deleted successfully`,
        });
        
        if (onItemRemoved) {
          onItemRemoved();
        }
      } else {
        console.error(`Failed to delete ${item.type}:`, itemId);
        // If deletion failed, put the item back in the list
        setLocalItems(prevItems => {
          if (prevItems.some(i => i.data.id === itemId)) {
            return prevItems; // Item already exists
          }
          return [...prevItems, item]; // Add the item back
        });
      }
    } catch (error) {
      console.error('Error in deletion process:', error);
    } finally {
      setIsProcessingDelete(false);
      closeDialog();
    }
  };

  const handleCompletionStatusChange = async (item: PriorityItem, checked: boolean) => {
    if (isProcessingUpdate) return;
    
    try {
      setIsProcessingUpdate(true);
      
      // Update UI immediately for better responsiveness
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
              };
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
              };
            }
            return i;
          })
        );
      }
      
      // Update database
      const success = await handleCompletedChange(item, checked);
      
      if (success) {
        console.log('Task updated, refreshing data...');
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        console.error('Failed to update task completion status');
        // Revert local state if update failed
        if (item.type === 'task') {
          setLocalItems(prevItems => 
            prevItems.map(i => {
              if (i.type === 'task' && i.data.id === item.data.id) {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    status: checked ? 'incomplete' : 'completed' // Revert back
                  }
                };
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
                    completed_at: checked ? null : new Date().toISOString() // Revert back
                  }
                };
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
      
      // Update UI immediately for better responsiveness
      // We need to handle both task and next_step types properly
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
              };
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
              };
            }
            return i;
          })
        );
      }
      
      // Update database
      const success = await handleUrgentChange(item, checked);
      
      if (success) {
        console.log('Urgent status updated successfully');
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        console.error('Failed to update urgent status');
        // Revert local state if update failed
        if (item.type === 'task') {
          setLocalItems(prevItems => 
            prevItems.map(i => {
              if (i.type === 'task' && i.data.id === item.data.id) {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: !checked // Revert back
                  }
                };
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
                    urgent: !checked // Revert back
                  }
                };
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

  if (!localItems.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No priority items found{category ? ` for category: ${category}` : ''}.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {localItems.map((item) => {
        const itemId = item.data.id;
        
        return (
          <div key={`${item.type}-${itemId}`} className="flex items-start gap-2 p-2 border rounded-lg hover:bg-gray-50">
            <div className="pt-1">
              <Checkbox 
                checked={
                  item.type === 'task' 
                    ? item.data.status === 'completed' 
                    : item.data.completed_at !== null
                } 
                onCheckedChange={(checked) => handleCompletionStatusChange(item, checked as boolean)}
                disabled={isProcessingUpdate}
              />
            </div>
            
            <div className="flex-1">
              <PriorityActionItem 
                item={item} 
                onUrgentChange={(checked) => handleUrgentStatusChange(item, checked)}
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => confirmDelete(item)}
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
    </div>
  );
};
