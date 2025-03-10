
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriorityItem } from '../hooks/usePriorityData';
import { cn } from '@/lib/utils';

interface ItemControlsProps {
  item: PriorityItem;
  onComplete: () => void;
  onUrgentChange: (checked: boolean) => void;
  onDelete: () => void;
}

export const ItemControls = ({ 
  item, 
  onComplete, 
  onUrgentChange, 
  onDelete 
}: ItemControlsProps) => {
  const taskIsCompleted = item.data.status === 'completed';
  const urgent = item.data.urgent || false;

  const handleUrgentToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUrgentChange(!urgent);
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  // Don't show completion button for completed items
  const showCompleteButton = !taskIsCompleted;

  return (
    <div 
      className={cn(
        "absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10",
        "bg-white/80 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {showCompleteButton && (
        <Button 
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
          onClick={handleComplete}
          title="Mark as completed"
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      )}
      
      <Button 
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          urgent 
            ? "text-red-600 hover:text-red-700 hover:bg-red-100" 
            : "text-gray-500 hover:text-red-600 hover:bg-red-100"
        )}
        onClick={handleUrgentToggle}
        title={urgent ? "Remove urgent flag" : "Mark as urgent"}
      >
        <AlertCircle className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-100"
        onClick={handleDelete}
        title="Delete"
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};
