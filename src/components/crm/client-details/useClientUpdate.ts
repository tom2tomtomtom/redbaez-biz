import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: any) => {
      if (!clientId) throw new Error('Client ID is required');

      const primaryContact = contacts[0];
      console.log('Updating client with primary contact:', primaryContact);

      const dataToUpdate = {
        ...formData,
        // Store primary contact details directly in the client record
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

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Client updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['client'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error updating client:', error);
    }
  });
};