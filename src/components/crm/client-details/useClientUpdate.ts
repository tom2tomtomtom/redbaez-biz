import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UpdateClientData {
  formData: any;
  contacts: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    title?: string;
    address?: string;
  }>;
}

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      if (!clientId) throw new Error('Client ID is required');

      const primaryContact = contacts[0];
      console.log('Updating client with primary contact:', primaryContact);

      const dataToUpdate = {
        ...formData,
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        contact_title: primaryContact.title,
        contact_address: primaryContact.address
      };

      console.log('Updating client with data:', dataToUpdate);

      const { data, error } = await supabase
        .from('clients')
        .update(dataToUpdate)
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Client updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['client'] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    }
  });
};