import logger from '@/utils/logger';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
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
      logger.info('Updating client with contacts:', contacts);
      
      // Handle empty contacts array or undefined contacts
      const { primaryContact, additionalContacts } = contacts?.length 
        ? formatContacts(contacts) 
        : { primaryContact: null, additionalContacts: null };
      
      const clientData = {
        ...formData,
        name: formData.name,
        contact_name: primaryContact 
          ? `${primaryContact.firstName} ${primaryContact.lastName}`.trim() 
          : formData.contact_name,
        contact_email: primaryContact?.email || formData.contact_email,
        contact_phone: primaryContact?.phone || formData.contact_phone,
        additional_contacts: additionalContacts || formData.additional_contacts,
      };

      logger.info('Updating client with data:', clientData);
      
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
      await queryClient.cancelQueries({ queryKey: ['client', numericId] });
      const previousClient = queryClient.getQueryData(['client', numericId]);
      
      queryClient.setQueryData(['client', numericId], (old: any) => ({
        ...old,
        ...variables.formData,
      }));

      return { previousClient };
    },
    onError: (error, variables, context) => {
      logger.error('Error updating client:', error);
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
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return {
      primaryContact: null,
      additionalContacts: null
    };
  }

  const [primaryContact, ...additionalContacts] = contacts;
  return {
    primaryContact,
    additionalContacts: additionalContacts.length > 0 ? additionalContacts : null
  };
};
