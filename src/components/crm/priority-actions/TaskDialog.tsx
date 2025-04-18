
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from './TaskForm';

interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: any | null;
  onSaved: () => void;
  defaultCategory?: string;
}

export const TaskDialog = ({ 
  isOpen, 
  onOpenChange, 
  task, 
  onSaved,
  defaultCategory 
}: TaskDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <TaskForm 
          task={task} 
          onSaved={onSaved} 
          onCancel={() => onOpenChange(false)}
          defaultCategory={defaultCategory}
        />
      </DialogContent>
    </Dialog>
  );
};
