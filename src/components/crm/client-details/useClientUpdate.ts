import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

interface UpdateClientData {
  formData: any;
  contacts: Contact[];
}

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      if (!clientId) throw new Error('Client ID is required');

      const [primaryContact, ...additionalContacts] = contacts;
      console.log('Updating client with primary contact:', primaryContact);
      console.log('Additional contacts:', additionalContacts);

      const dataToUpdate = {
        ...formData,
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        additional_contacts: additionalContacts.length > 0 ? additionalContacts : null
      };

      console.log('Updating client with data:', dataToUpdate);

      const { error } = await supabase
        .from('clients')
        .update(dataToUpdate)
        .eq('id', clientId);

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      console.log('Client updated successfully');
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