
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityActionItemProps {
  item: Task;
  onUrgentChange: (checked: boolean) => void;
}

export const PriorityActionItem = ({ item, onUrgentChange }: PriorityActionItemProps) => {
  // Get title from task data
  const title = item.title || item.notes || 'No details';

  // Get description from task data
  const description = item.description || '';

  // Get client name if available
  const clientName = item.client?.name || item.client_name || null;

  // Get due date
  const dueDate = item.due_date || item.next_due_date || null;

  // Get urgent status
  const urgent = item.urgent ?? item.priority === 'urgent';
  
  const toggleUrgent = () => {
    onUrgentChange(!urgent);
  };

  // Determine background color based on type or category
  const getBackgroundColorClass = () => {
    if (item.client_id) {
      return 'bg-[#FEC6A1]/30 hover:bg-[#FEC6A1]/50';
    }

    if (item.category) {
      const category = item.category.toLowerCase();
      
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
        {clientName && <span className="text-sm text-gray-600 ml-1">({clientName})</span>}
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
