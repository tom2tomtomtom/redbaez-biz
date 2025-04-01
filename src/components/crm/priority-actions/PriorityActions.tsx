
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskList } from './TaskList';
import { PriorityActionsFilter } from './PriorityActionsFilter';
import { TaskDialog } from './TaskDialog';
import { Task } from '@/types/task';

interface PriorityActionsProps {
  hideAddButton?: boolean;
  initialCategory?: string;
  onTaskClick?: (taskId: string) => void;
}

export const PriorityActions = ({ 
  hideAddButton = false, 
  initialCategory,
  onTaskClick
}: PriorityActionsProps) => {
  const [filter, setFilter] = useState<string>(initialCategory || 'All');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskSelected = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      setSelectedTask({ id: taskId } as Task);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PriorityActionsFilter
          filter={filter}
          onFilterChange={setFilter}
          showCompleted={showCompleted}
          onShowCompletedChange={setShowCompleted}
        />
        
        {!hideAddButton && (
          <Button onClick={() => setIsNewTaskOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      <TaskList 
        category={filter === 'All' ? undefined : filter} 
        showCompleted={showCompleted}
        onItemSelected={handleTaskSelected}
      />
      
      <TaskDialog 
        isOpen={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        task={null}
        onSaved={() => setIsNewTaskOpen(false)}
        defaultCategory={initialCategory}
      />
      
      <TaskDialog
        isOpen={!!selectedTask}
        onOpenChange={() => setSelectedTask(null)}
        task={selectedTask}
        onSaved={() => setSelectedTask(null)}
        defaultCategory={initialCategory}
      />
    </div>
  );
};
