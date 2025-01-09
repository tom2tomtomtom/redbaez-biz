import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskItem } from './GeneralTaskItem';
import { PriorityActionItem } from './PriorityActionItem';
import { Tables } from '@/integrations/supabase/types';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: Tables<'general_tasks'>) => void;
}

export const PriorityItemsList = ({ items, onTaskClick }: PriorityItemsListProps) => {
  const queryClient = useQueryClient();

  const handleUrgentChange = async (item: PriorityItem, checked: boolean) => {
    try {
      if (item.type === 'task') {
        const { error } = await supabase
          .from('general_tasks')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });

      toast({
        title: checked ? "Marked as urgent" : "Removed urgent flag",
        description: `Successfully ${checked ? 'marked' : 'unmarked'} as urgent`,
      });
    } catch (error) {
      console.error('Error updating urgent status:', error);
      toast({
        title: "Error",
        description: "Failed to update urgent status",
        variant: "destructive",
      });
    }
  };

  const handleCompletedChange = async (item: PriorityItem, checked: boolean) => {
    try {
      if (item.type === 'task') {
        const { error } = await supabase
          .from('general_tasks')
          .update({ status: checked ? 'completed' : 'incomplete' })
          .eq('id', item.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .update({ status: checked ? 'completed' : 'incomplete' })
          .eq('id', item.data.id);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });

      toast({
        title: checked ? "Marked as completed" : "Marked as incomplete",
        description: `Successfully ${checked ? 'completed' : 'reopened'} the ${item.type}`,
      });
    } catch (error) {
      console.error('Error updating completion status:', error);
      toast({
        title: "Error",
        description: "Failed to update completion status",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-600 text-center">No priority actions found for this month</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.data.id} className="relative">
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`completed-${item.data.id}`}
                checked={item.data.status === 'completed'}
                onCheckedChange={(checked) => handleCompletedChange(item, checked as boolean)}
              />
              <Switch
                id={`urgent-${item.data.id}`}
                checked={'urgent' in item.data ? item.data.urgent : false}
                onCheckedChange={(checked) => handleUrgentChange(item, checked)}
              />
            </div>
          </div>
          {item.type === 'task' ? (
            <div 
              onClick={() => onTaskClick(item.data as GeneralTaskRow)}
              className="cursor-pointer"
            >
              <GeneralTaskItem task={item.data as GeneralTaskRow} />
            </div>
          ) : (
            <PriorityActionItem client={item.data} />
          )}
        </div>
      ))}
    </div>
  );
};