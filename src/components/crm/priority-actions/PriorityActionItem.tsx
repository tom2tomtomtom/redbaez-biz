
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import { PriorityItem } from './hooks/usePriorityData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PriorityActionItemProps {
  item: PriorityItem;
  onUrgentChange: (checked: boolean) => Promise<void>;
}

export const PriorityActionItem = ({ item, onUrgentChange }: PriorityActionItemProps) => {
  const isTask = item.type === 'task';
  const isNextStep = item.type === 'next_step';
  
  const title = isTask ? item.data.title : 
               isNextStep ? `Next Step: ${item.data.notes || 'No details'} - ${item.data.client_name || 'Unknown Client'}` : 
               'Unknown Item';
  
  const description = isTask ? item.data.description : 
                      isNextStep ? `Client: ${item.data.client_name || 'Unknown'}` : 
                      '';
  
  const dueDate = isTask ? item.data.next_due_date : 
                  isNextStep ? item.data.due_date : 
                  null;
  
  const urgent = (isTask || isNextStep) && 'urgent' in item.data ? item.data.urgent : false;
  
  const toggleUrgent = async () => {
    await onUrgentChange(!urgent);
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="font-medium flex items-center gap-2">
        {title}
        {urgent && (
          <Badge variant="destructive" className="ml-2 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Urgent
          </Badge>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar size={14} />
          {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className={urgent ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-700"}
          onClick={toggleUrgent}
        >
          {urgent ? 'Remove Urgent' : 'Mark Urgent'}
        </Button>
      </div>
    </div>
  );
};
