import logger from '@/utils/logger';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Check, Trash2 } from 'lucide-react';
import { useItemStatusChange } from '../../priority-actions/hooks/useItemStatusChange';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Task } from '@/integrations/supabase/types/general-tasks.types'; // Updated import
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface DueItem extends Task {
  type: 'task';
  dueDate: string;
}

interface DueItemsSectionProps {
  items: DueItem[];
  isLoading: boolean;
}

export const DueItemsSection = ({ items, isLoading }: DueItemsSectionProps) => {
  const { handleCompletedChange, handleDelete } = useItemStatusChange();
  const queryClient = useQueryClient();
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) return <div>Loading items...</div>;

  const onComplete = async (item: DueItem) => {
    try {
      const taskItem = {
        type: 'task' as const,
        data: {
          id: item.id,
          client_id: item.client_id || null,
          title: item.title || '',
          description: item.description || '',
          category: item.category || 'general',
          status: 'incomplete' as const,
          due_date: item.dueDate,
          urgent: item.urgent || false,
          created_at: item.created_at,
          updated_at: item.updated_at,
          created_by: item.created_by,
          updated_by: item.updated_by
        }
      };
      
      await handleCompletedChange(taskItem, true);
      
      // Invalidate relevant queries to update UI - fixed the query filter format
      queryClient.invalidateQueries({ queryKey: ['client-items'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: "Task completed",
        description: "The task has been marked as complete.",
      });
    } catch (error) {
      logger.error('Error completing item:', error);
      toast({
        title: "Error",
        description: "Failed to complete the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (item: DueItem) => {
    setDeletingItemId(item.id);
    setShowDeleteConfirm(true);
  };

  const onDelete = async () => {
    if (!deletingItemId || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const itemToDelete = items.find(item => item.id === deletingItemId);
      
      if (!itemToDelete) {
        throw new Error('Item not found');
      }
      
      const taskItem = {
        type: 'task' as const,
        data: {
          id: itemToDelete.id,
          client_id: itemToDelete.client_id || null,
          title: itemToDelete.title || '',
          description: itemToDelete.description || '',
          category: itemToDelete.category || 'general',
          status: 'incomplete' as const,
          due_date: itemToDelete.dueDate,
          urgent: itemToDelete.urgent || false,
          created_at: itemToDelete.created_at,
          updated_at: itemToDelete.updated_at,
          created_by: itemToDelete.created_by,
          updated_by: itemToDelete.updated_by
        }
      };
      
      logger.info('Deleting task item:', taskItem);
      const success = await handleDelete(taskItem);
      
      if (success) {
        // Invalidate relevant queries to update UI - fixed the query filter format
        queryClient.invalidateQueries({ queryKey: ['client-items'] });
        queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        
        toast({
          title: "Task deleted",
          description: "The task has been deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      logger.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
      setDeletingItemId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingItemId(null);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No due items found for this client.
        </div>
      )}
      
      {items.map((item) => (
        <Card key={`${item.type}-${item.id}`} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={item.urgent ? "destructive" : "secondary"}>
                  Task
                </Badge>
                {item.urgent && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
              <h4 className="font-medium">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarDays className="h-4 w-4 mr-1" />
                {new Date(item.dueDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onComplete(item)}
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => confirmDelete(item)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
