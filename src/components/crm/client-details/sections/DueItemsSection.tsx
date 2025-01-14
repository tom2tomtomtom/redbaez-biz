import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

interface DueItem {
  id: string;
  type: 'task' | 'next-step' | 'idea';
  dueDate: string;
  title?: string;
  notes?: string;
  description?: string;
  urgent?: boolean;
}

interface DueItemsSectionProps {
  items: DueItem[];
  isLoading: boolean;
}

export const DueItemsSection = ({ items, isLoading }: DueItemsSectionProps) => {
  if (isLoading) return <div>Loading items...</div>;

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
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDays className="h-4 w-4 mr-1" />
              {format(new Date(item.dueDate), 'MMM d, yyyy')}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};