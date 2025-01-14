import { useState } from "react";
import { GeneralTaskRow } from "@/integrations/supabase/types/general-tasks.types";
import { GeneralTaskItem } from "../crm/priority-actions/GeneralTaskItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskDialog } from "../crm/priority-actions/TaskDialog";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface TaskListProps {
  tasks: GeneralTaskRow[];
  isLoading: boolean;
  onTasksUpdated: () => void;
  isHistory?: boolean;
}

export const TaskList = ({ tasks, isLoading, onTasksUpdated, isHistory = false }: TaskListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});

  const handleDateChange = async (taskId: string, date: string) => {
    try {
      const { error } = await supabase
        .from('general_tasks')
        .update({ next_due_date: date ? new Date(date).toISOString() : null })
        .eq('id', taskId);

      if (error) throw error;

      // Clear the date input
      setDateInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[taskId];
        return newInputs;
      });

      toast({
        title: "Task updated",
        description: date ? "Task has been moved to active tasks." : "Date removed from task.",
      });

      onTasksUpdated();
    } catch (error) {
      console.error('Error updating task date:', error);
      toast({
        title: "Error",
        description: "Failed to update task date. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (isHistory) {
      return task.status === 'completed';
    }
    return task.status !== 'completed';
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (isHistory) {
      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    }
    
    // Sort tasks: tasks with due dates first (sorted by date), then tasks without due dates (ideas)
    const aDate = a.next_due_date ? new Date(a.next_due_date).getTime() : Infinity;
    const bDate = b.next_due_date ? new Date(b.next_due_date).getTime() : Infinity;
    
    if (aDate === Infinity && bDate === Infinity) {
      // If both are ideas (no due date), sort by creation date
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    
    return aDate - bDate;
  });

  // Separate tasks into ideas and active tasks
  const ideas = sortedTasks.filter(task => !task.next_due_date);
  const activeTasks = sortedTasks.filter(task => task.next_due_date);

  // Function to clean up idea title/description
  const cleanIdeaText = (task: GeneralTaskRow) => {
    const titleMatch = task.title.match(/Strategic Recommendation for (.+)/);
    if (titleMatch) {
      return titleMatch[1];
    }
    return task.title;
  };

  return (
    <div className="space-y-4">
      {!isHistory && (
        <div className="flex justify-end">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !filteredTasks.length ? (
        <div className="text-center text-gray-500 py-8">
          {isHistory 
            ? "No completed tasks yet"
            : "No tasks or ideas yet. Try generating some ideas!"
          }
        </div>
      ) : (
        <div className="space-y-8">
          {activeTasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-500">Active Tasks</h3>
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="relative">
                    <GeneralTaskItem 
                      task={task}
                      isClientTask={!!task.client_id}
                    />
                    {isHistory && task.updated_at && (
                      <div className="absolute top-2 right-2 text-xs text-gray-500">
                        Completed: {format(new Date(task.updated_at), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isHistory && ideas.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-500">Generated Ideas</h3>
              <div className="space-y-4">
                {ideas.map((task) => (
                  <div key={task.id} className="relative space-y-2">
                    <GeneralTaskItem 
                      task={{
                        ...task,
                        title: cleanIdeaText(task)
                      }}
                      isClientTask={!!task.client_id}
                    />
                    <div className="flex items-center gap-2 px-6">
                      <Input
                        type="date"
                        value={dateInputs[task.id] || ''}
                        onChange={(e) => {
                          setDateInputs(prev => ({
                            ...prev,
                            [task.id]: e.target.value
                          }));
                        }}
                        className="max-w-[200px]"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleDateChange(task.id, dateInputs[task.id])}
                      >
                        Set Due Date
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={null}
        onSaved={() => {
          onTasksUpdated();
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};