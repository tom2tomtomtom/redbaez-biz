import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useClientUpdate = (clientId: string | number, onSuccess?: () => void) => {
  // Convert clientId to number if it's a string
  const numericClientId = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;

  return useMutation({
    mutationFn: async ({ formData, contacts }: { formData: any; contacts: any[] }) => {
      // Save next steps to history if they exist
      if (formData.nextSteps) {
        const { error: historyError } = await supabase
          .from('client_next_steps')
          .insert({
            client_id: numericClientId,
            notes: formData.nextSteps,
            due_date: formData.nextDueDate || null
          });

        if (historyError) {
          throw historyError;
        }
      }

      // Update client
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...formData,
          additional_contacts: contacts
        })
        .eq('id', numericClientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client information updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client information",
        variant: "destructive",
      });
    }
  });
};