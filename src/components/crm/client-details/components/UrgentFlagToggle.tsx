import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface UrgentFlagToggleProps {
  clientId: number;
  isUrgent: boolean;
}

export const UrgentFlagToggle = ({ clientId, isUrgent }: UrgentFlagToggleProps) => {
  const queryClient = useQueryClient();

  const handleUrgentChange = async (checked: boolean) => {
    try {
      // Update client urgent status
      const { error: clientError } = await supabase
        .from('clients')
        .update({ urgent: checked })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Update all active next steps for this client to match urgent status
      const { error: nextStepsError } = await supabase
        .from('client_next_steps')
        .update({ urgent: checked })
        .eq('client_id', clientId)
        .is('completed_at', null);

      if (nextStepsError) throw nextStepsError;

      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['client-next-steps'] });
      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['nextSteps'] });

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

  return (
    <div className="flex items-center gap-4">
      {isUrgent && (
        <AlertTriangle className="h-5 w-5 text-red-500" />
      )}
      <div className="flex items-center space-x-2">
        <Switch
          id="urgent"
          checked={isUrgent}
          onCheckedChange={handleUrgentChange}
        />
        <Label htmlFor="urgent">Mark as Urgent Priority</Label>
      </div>
    </div>
  );
};