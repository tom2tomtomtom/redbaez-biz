
import { Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from './hooks/useTasks';
import { cn } from '@/lib/utils';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onUpdateCompletion: (completed: boolean) => void;
  onUpdateUrgency: (urgent: boolean) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  onSelect?: () => void;
}

export const TaskItem = ({ 
  task, 
  onUpdateCompletion, 
  onUpdateUrgency, 
  onDelete,
  isUpdating,
  isDeleting,
  onSelect
}: TaskItemProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Determine background color based on client and category
  const getBackgroundColorClass = () => {
    // If it's a client-related task 
    if (task.client_id) {
      return 'bg-[#FEC6A1]/30 hover:bg-[#FEC6A1]/50';
    }
    
    const category = task.category?.toLowerCase() || '';
    
    if (category.includes('business admin')) {
      return 'bg-gray-100 hover:bg-gray-200';
    }
    
    if (category.includes('marketing')) {
      return 'bg-[#F0D4FA]/30 hover:bg-[#F0D4FA]/50';
    }
    
    if (category.includes('product development')) {
      return 'bg-blue-100/50 hover:bg-blue-100';
    }
    
    if (category.includes('partnerships')) {
      return 'bg-green-100/50 hover:bg-green-100';
    }
    
    return 'bg-gray-50 hover:bg-gray-100';
  };

  // Add client indicator
  const getClientIndicator = () => {
    if (task.client_id && task.client?.name) {
      return <Badge variant="outline" className="ml-2 text-xs">{task.client.name}</Badge>;
    }
    return null;
  };

  // Get the appropriate due date 
  const getDueDate = () => {
    const dueDate = task.next_due_date || task.due_date;
    return dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date';
  };

  return (
    <div className="flex items-start gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={task.status === 'completed'} 
          onCheckedChange={(checked) => onUpdateCompletion(checked as boolean)}
          disabled={isUpdating}
        />
      </div>
      
      <div 
        className={cn(
          "flex-1 flex flex-col space-y-1 p-4 rounded-lg transition-colors", 
          getBackgroundColorClass(),
          task.urgent && "ring-2 ring-red-400"
        )}
        onClick={() => onSelect?.()}
      >
        <div className="font-medium flex items-center gap-2">
          {task.title}
          {getClientIndicator()}
          {task.urgent && (
            <Badge variant="destructive" className="ml-2 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar size={14} />
            {getDueDate()}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className={task.urgent ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-700"}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateUrgency(!task.urgent);
            }}
            disabled={isUpdating}
          >
            {task.urgent ? 'Remove Urgent' : 'Mark Urgent'}
          </Button>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          setShowDeleteConfirm(true);
        }}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
      </Button>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete();
                setShowDeleteConfirm(false);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
