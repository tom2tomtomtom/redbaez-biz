import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Check, Trash2 } from 'lucide-react';
import { useItemStatusChange } from '../../priority-actions/hooks/useItemStatusChange';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface DueItem {
  id: string;
  type: 'task' | 'next-step' | 'idea';
  dueDate: string;
  title?: string;
  notes?: string;
  description?: string;
  urgent?: boolean;
  client_id?: number;
}

interface DueItemsSectionProps {
  items: DueItem[];
  isLoading: boolean;
}

export const DueItemsSection = ({ items, isLoading }: DueItemsSectionProps) => {
  const { handleCompletedChange, handleDelete } = useItemStatusChange();

  if (isLoading) return <div>Loading items...</div>;

  const onComplete = async (item: DueItem) => {
    try {
      if (item.type === 'task') {
        const taskItem = {
          type: 'task' as const,
          date: item.dueDate,
          data: {
            id: item.id,
            client_id: item.client_id || null,
            title: item.title || '',
            description: item.description || '',
            category: 'general',
            status: 'incomplete',
            next_due_date: item.dueDate,
            urgent: item.urgent || false,
            created_at: null,
            updated_at: null,
            created_by: null,
            updated_by: null
          }
        };
        await handleCompletedChange(taskItem, true);
        toast({
          title: "Task completed",
          description: "The task has been marked as complete.",
        });
      } else if (item.type === 'next-step') {
        const nextStepItem = {
          type: 'next_step' as const,
          date: item.dueDate,
          data: {
            id: item.id,
            client_id: item.client_id || null,
            notes: item.notes || '',
            due_date: item.dueDate,
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            urgent: item.urgent || false,
            created_by: '',
            category: 'general'
          }
        };
        await handleCompletedChange(nextStepItem, true);
        toast({
          title: "Next step completed",
          description: "The next step has been marked as complete.",
        });
      }
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
      if (item.type === 'task') {
        const taskItem = {
          type: 'task' as const,
          date: item.dueDate,
          data: {
            id: item.id,
            client_id: item.client_id || null,
            title: item.title || '',
            description: item.description || '',
            category: 'general',
            status: 'incomplete',
            next_due_date: item.dueDate,
            urgent: item.urgent || false,
            created_at: null,
            updated_at: null,
            created_by: null,
            updated_by: null
          }
        };
        await handleDelete(taskItem);
        toast({
          title: "Task deleted",
          description: "The task has been deleted successfully.",
        });
      } else if (item.type === 'next-step') {
        const nextStepItem = {
          type: 'next_step' as const,
          date: item.dueDate,
          data: {
            id: item.id,
            client_id: item.client_id || null,
            notes: item.notes || '',
            due_date: item.dueDate,
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            urgent: item.urgent || false,
            created_by: '',
            category: 'general'
          }
        };
        await handleDelete(nextStepItem);
        toast({
          title: "Next step deleted",
          description: "The next step has been deleted successfully.",
        });
      }
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
                  {item.type === 'task' ? 'Task' : item.type === 'next-step' ? 'Next Step' : 'Strategic Idea'}
                </Badge>
                {item.urgent && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
              <h4 className="font-medium">
                {item.type === 'task' ? item.title : 
                 item.type === 'next-step' ? item.notes :
                 item.description}
              </h4>
              {item.description && item.type === 'task' && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarDays className="h-4 w-4 mr-1" />
                {new Date(item.dueDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                {(item.type === 'task' || item.type === 'next-step') && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};