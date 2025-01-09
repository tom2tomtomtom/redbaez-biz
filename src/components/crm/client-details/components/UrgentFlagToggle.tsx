import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UrgentFlagToggleProps {
  clientId: number;
  isUrgent: boolean;
}

export const UrgentFlagToggle = ({ clientId, isUrgent }: UrgentFlagToggleProps) => {
  const handleUrgentChange = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ urgent: checked })
        .eq('id', clientId);

      if (error) throw error;

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