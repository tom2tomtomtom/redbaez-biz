import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskItem } from './GeneralTaskItem';
import { PriorityActionItem } from './PriorityActionItem';
import { Tables } from '@/integrations/supabase/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: Tables<'general_tasks'>) => void;
}

export const PriorityItemsList = ({ items, onTaskClick }: PriorityItemsListProps) => {
  const queryClient = useQueryClient();

  const handleUrgentChange = async (item: PriorityItem, checked: boolean) => {
    // Optimistically update the UI
    const updatedItems = items.map((i) => {
      if (i.data.id === item.data.id) {
        return {
          ...i,
          data: { ...i.data, urgent: checked }
        };
      }
      return i;
    }).sort((a, b) => {
      // Sort by urgent status first
      if (a.data.urgent && !b.data.urgent) return -1;
      if (!a.data.urgent && b.data.urgent) return 1;
      
      // Then sort by date
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Optimistically update the cache
    queryClient.setQueryData(['priorityClients'], () => updatedItems);
    queryClient.setQueryData(['generalTasks'], () => updatedItems);

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

      // Invalidate queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });

      toast({
        title: checked ? "Marked as urgent" : "Removed urgent flag",
        description: `Successfully ${checked ? 'marked' : 'unmarked'} as urgent`,
      });
    } catch (error) {
      console.error('Error updating urgent status:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      
      toast({
        title: "Error",
        description: "Failed to update urgent status",
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
            <Switch
              id={`urgent-${item.data.id}`}
              checked={'urgent' in item.data ? item.data.urgent : false}
              onCheckedChange={(checked) => handleUrgentChange(item, checked)}
            />
            <Label htmlFor={`urgent-${item.data.id}`} className="text-sm">
              Urgent
            </Label>
          </div>
          {item.type === 'task' ? (
            <div 
              onClick={() => onTaskClick(item.data as Tables<'general_tasks'>)}
              className="cursor-pointer"
            >
              <GeneralTaskItem task={item.data as Tables<'general_tasks'>} />
            </div>
          ) : (
            <PriorityActionItem client={item.data} />
          )}
        </div>
      ))}
    </div>
  );
};