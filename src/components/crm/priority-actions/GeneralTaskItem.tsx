import { cn } from '@/lib/utils';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { Card } from "@/components/ui/card";
import { Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface GeneralTaskItemProps {
  task: GeneralTaskRow;
  onDeleted?: () => void;
}

const getCategoryColor = (task: GeneralTaskRow, isClientTask: boolean) => {
  console.log('Task category:', task.category);
  console.log('Is client task:', isClientTask);
  
  // If it's a client task, a strategic idea connected to a client, or a next step for a client
  // always return orange colors
  if (isClientTask || task.client_id) {
    console.log('Returning client color');
    return 'bg-[#FEC6A1]/50 hover:bg-[#FEC6A1]';
  }
  
  if (!task.category) {
    console.log('No category, returning default color');
    return 'bg-[#F1F0FB]/50 hover:bg-[#F1F0FB]';
  }
  
  const categoryColor = (() => {
    switch (task.category.toLowerCase()) {
      case 'marketing':
        console.log('Marketing task, returning pink');
        return 'bg-[#FFDEE2]/50 hover:bg-[#FFDEE2]';
      case 'product development':
        return 'bg-[#D3E4FD]/50 hover:bg-[#D3E4FD]';
      case 'partnerships':
        return 'bg-[#F2FCE2]/50 hover:bg-[#F2FCE2]';
      case 'business admin':
        return 'bg-[#F1F0FB]/50 hover:bg-[#F1F0FB]';
      default:
        console.log('Default case, category:', task.category.toLowerCase());
        return 'bg-[#FDE1D3]/50 hover:bg-[#FDE1D3]';
    }
  })();
  
  console.log('Returning color:', categoryColor);
  return categoryColor;
};

export const GeneralTaskItem = ({ task, onDeleted }: GeneralTaskItemProps) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(
    task.next_due_date ? new Date(task.next_due_date).toISOString().split('T')[0] : ''
  );
  const [isConverting, setIsConverting] = useState(false);
  const queryClient = useQueryClient();

  // Parse the title to extract client name and task description
  const isClientTask = task.title.includes(']') && task.title.includes('[');
  let clientName = '';
  let taskDescription = isClientTask ? (task.description || '') : task.description;
  let displayTitle = task.title;

  if (isClientTask) {
    const matches = task.title.match(/\[(.*?)\]/g);
    if (matches && matches.length >= 2) {
      clientName = matches[0].replace(/[\[\]]/g, '').trim();
      displayTitle = clientName;
    }
  }

  const handleDateChange = async (newDate: string) => {
    try {
      const { error } = await supabase
        .from('general_tasks')
        .update({ 
          next_due_date: newDate ? new Date(newDate).toISOString() : null,
          status: 'in_progress'
        })
        .eq('id', task.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      
      toast({
        title: "Task updated",
        description: "The task has been converted and due date set.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingDate(false);
      setIsConverting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('general_tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      onDeleted?.();
      
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-300",
        getCategoryColor(task, isClientTask),
        task.urgent && "bg-red-50/50"
      )}
    >
      <div className="flex flex-col space-y-3">
        <div className="flex items-start space-x-3">
          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {clientName ? clientName.charAt(0).toUpperCase() : task.title.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 flex-1">
            <span className={cn("font-medium", isClientTask && "font-bold")}>
              {displayTitle}
            </span>
            {taskDescription && (
              <p className="text-sm text-gray-600">{taskDescription}</p>
            )}
          </div>
        </div>
        
        <div 
          className="text-sm flex items-center gap-2 text-gray-500"
          onClick={(e) => {
            e.stopPropagation();
            if (task.next_due_date || isConverting) {
              setIsEditingDate(true);
            }
          }}
        >
          <Calendar size={14} />
          {(isEditingDate || isConverting) ? (
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              onBlur={(e) => {
                e.stopPropagation();
                handleDateChange(dateValue);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  handleDateChange(dateValue);
                } else if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsEditingDate(false);
                  setIsConverting(false);
                  setDateValue(task.next_due_date ? new Date(task.next_due_date).toISOString().split('T')[0] : '');
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-40 h-7 px-2"
              autoFocus
            />
          ) : (
            <span className="cursor-pointer hover:text-gray-700">
              {task.next_due_date 
                ? `Due ${new Date(task.next_due_date).toLocaleDateString()}` 
                : 'Click to set due date'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!task.next_due_date && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsConverting(true)}
            >
              Convert to Task
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};