
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import { PriorityItem } from './hooks/usePriorityData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityActionItemProps {
  item: PriorityItem;
  onUrgentChange: (checked: boolean) => void; // Changed from Promise<void> to void
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

  // Determine background color based on type or category
  const getBackgroundColorClass = () => {
    if (isNextStep || (isTask && item.data.client_id)) {
      return 'bg-[#FEC6A1]/30 hover:bg-[#FEC6A1]/50';
    }
    
    if (isTask && item.data.category) {
      const category = item.data.category.toLowerCase();
      
      if (category === 'business admin') {
        return 'bg-gray-100 hover:bg-gray-200';
      }
      
      if (category === 'marketing') {
        return 'bg-[#F0D4FA]/30 hover:bg-[#F0D4FA]/50';
      }
      
      if (category === 'product development') {
        return 'bg-blue-100/50 hover:bg-blue-100';
      }
      
      if (category === 'partnerships') {
        return 'bg-green-100/50 hover:bg-green-100';
      }
    }
    
    return 'bg-gray-50 hover:bg-gray-100';
  };

  return (
    <div className={cn(
      "flex flex-col space-y-1 p-4 rounded-lg transition-colors", 
      getBackgroundColorClass(),
      urgent && "ring-2 ring-red-400"
    )}>
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
