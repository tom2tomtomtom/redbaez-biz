
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Check, Trash2 } from 'lucide-react';
import { useItemStatusChange } from '../../priority-actions/hooks/useItemStatusChange';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Task } from '@/hooks/useTaskDeletion';

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

  if (isLoading) return <div>Loading items...</div>;

  const onComplete = async (item: DueItem) => {
    try {
      const taskItem = {
        type: 'task' as const,
        date: item.dueDate,
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
      
      // Invalidate relevant queries to update UI
      queryClient.invalidateQueries({ queryKey: ['client-items'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      
      toast({
        title: "Task completed",
        description: "The task has been marked as complete.",
      });
    } catch (error) {
      console.error('Error completing item:', error);
      toast({
        title: "Error",
        description: "Failed to complete the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onDelete = async (item: DueItem) => {
    try {
      const taskItem = {
        type: 'task' as const,
        date: item.dueDate,
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
      
      await handleDelete(taskItem);
      
      // Invalidate relevant queries to update UI
      queryClient.invalidateQueries({ queryKey: ['client-items'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
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
                  onClick={() => onDelete(item)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
