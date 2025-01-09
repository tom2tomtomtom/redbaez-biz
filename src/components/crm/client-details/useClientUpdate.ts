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
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        additional_contacts: additionalContacts,
      };

      console.log('Updating client with data:', clientData);
      
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', numericId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
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

const formatContacts = (contacts: Contact[]) => {
  const [primaryContact, ...additionalContacts] = contacts;
  return {
    primaryContact,
    additionalContacts: additionalContacts.length > 0 ? additionalContacts : null
  };
};