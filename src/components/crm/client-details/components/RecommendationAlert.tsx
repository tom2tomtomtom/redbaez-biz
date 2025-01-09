import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';

interface RecommendationAlertProps {
  type: string;
  priority: string;
  suggestion: string;
  clientId: number;
  clientName: string;
}

export const RecommendationAlert: React.FC<RecommendationAlertProps> = ({
  type,
  priority,
  suggestion,
  clientId,
  clientName
}) => {
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const queryClient = useQueryClient();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const createTask = async () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('general_tasks')
        .insert({
          title: `[${clientName}] [${type}] ${suggestion.substring(0, 50)}...`,
          description: `Client: ${clientName}\n\nRecommendation: ${suggestion}`,
          category: type,
          next_due_date: date.toISOString(),
          urgent: isUrgent,
          status: isCompleted ? 'completed' : 'incomplete'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  return (
    <Alert className={cn(
      "relative border-l-4",
      isCompleted ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50/50"
    )}>
      <AlertTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type.charAt(0).toUpperCase() + type.slice(1)}
          <Badge variant={getPriorityColor(priority)}>
            {priority}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={isUrgent}
            onCheckedChange={setIsUrgent}
            className="data-[state=checked]:bg-orange-500"
          />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hover:bg-transparent",
              isCompleted ? "text-green-500" : "text-gray-400 hover:text-gray-600"
            )}
            onClick={() => setIsCompleted(!isCompleted)}
          >
            <CheckCircle className="h-5 w-5" />
          </Button>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Select Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button 
                  className="w-full" 
                  onClick={createTask}
                >
                  Create Task
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </AlertTitle>
      <AlertDescription className={cn(
        "mt-2",
        isCompleted ? "text-green-700" : "text-gray-700"
      )}>
        {suggestion}
      </AlertDescription>
    </Alert>
  );
};