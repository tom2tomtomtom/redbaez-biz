import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Check, Trash2 } from 'lucide-react';
import { useItemStatusChange } from '../../priority-actions/hooks/useItemStatusChange';
import { Button } from '@/components/ui/button';

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
  const { handleComplete, handleDelete } = useItemStatusChange();

  if (isLoading) return <div>Loading items...</div>;

  const onComplete = async (item: DueItem) => {
    if (item.type === 'task') {
      await handleComplete(item.id, 'task', item.client_id);
    } else if (item.type === 'next-step') {
      await handleComplete(item.id, 'next-step', item.client_id);
    } else if (item.type === 'idea') {
      await handleComplete(item.id, 'idea', item.client_id);
    }
  };

  const onDelete = async (item: DueItem) => {
    if (item.type === 'task') {
      await handleDelete(item.id, 'task', item.client_id);
    } else if (item.type === 'next-step') {
      await handleDelete(item.id, 'next-step', item.client_id);
    } else if (item.type === 'idea') {
      await handleDelete(item.id, 'idea', item.client_id);
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
                {format(new Date(item.dueDate), 'MMM d, yyyy')}
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