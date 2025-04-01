
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskList } from './TaskList';
import { PriorityActionsFilter } from './PriorityActionsFilter';
import { TaskDialog } from './TaskDialog';

interface PriorityActionsProps {
  hideAddButton?: boolean;
}

export const PriorityActions = ({ hideAddButton = false }: PriorityActionsProps) => {
  const [filter, setFilter] = useState<string>('All');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleTaskSelected = (taskId: string) => {
    setSelectedTaskId(taskId);
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
      />
      
      <TaskDialog
        isOpen={!!selectedTaskId}
        onOpenChange={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        onSaved={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
