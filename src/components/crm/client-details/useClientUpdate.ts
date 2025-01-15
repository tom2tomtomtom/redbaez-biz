import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Contact } from './ContactInfoCard';

interface UpdateClientData {
  formData: any;
  contacts: Contact[];
}

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const numericId = clientId ? parseInt(clientId, 10) : undefined;

  if (!numericId || isNaN(numericId)) {
    throw new Error('Invalid client ID');
  }

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      const { primaryContact, additionalContacts } = formatContacts(contacts);
      
      const clientData = {
        ...formData,
        name: formData.name,
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        additional_contacts: additionalContacts,
      };

      console.log('Updating client with data:', clientData);
      
      const { error, data } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', numericId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['client', numericId] });

      // Snapshot the previous value
      const previousClient = queryClient.getQueryData(['client', numericId]);

      // Optimistically update the cache
      queryClient.setQueryData(['client', numericId], (old: any) => ({
        ...old,
        ...variables.formData,
      }));

      return { previousClient };
    },
    onError: (error, variables, context) => {
      console.error('Error updating client:', error);
      // Revert back to the previous value if there's an error
      if (context?.previousClient) {
        queryClient.setQueryData(['client', numericId], context.previousClient);
      }
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Update both the individual client and the clients list
      queryClient.setQueryData(['client', numericId], data);
      queryClient.invalidateQueries({ queryKey: ['client', numericId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      
      if (onSuccess) onSuccess();
    }
  });
};

const formatContacts = (contacts: Contact[]) => {
  const [primaryContact, ...additionalContacts] = contacts;
  return {
    primaryContact,
    additionalContacts: additionalContacts.length > 0 ? additionalContacts : null
  };
};