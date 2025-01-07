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

interface ClientData {
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  additional_contacts: Contact[] | null;
  notes?: string;
  next_due_date?: string;
  project_revenue_signed_off: boolean;
  project_revenue_forecast: boolean;
  annual_revenue_signed_off: number;
  annual_revenue_forecast: number;
  [key: string]: any;
}

interface UpdateClientData {
  formData: any;
  contacts: Contact[];
}

const formatContacts = (contacts: Contact[]) => {
  const [primaryContact, ...additionalContacts] = contacts;
  
  return {
    primaryContact,
    formattedAdditionalContacts: additionalContacts.map(contact => ({
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title,
      email: contact.email,
      address: contact.address,
      phone: contact.phone
    }))
  };
};

const prepareClientData = async (clientId: string, formData: any, contacts: Contact[]): Promise<ClientData> => {
  const { primaryContact, formattedAdditionalContacts } = formatContacts(contacts);

  // Fetch existing client data for preserving values
  const { data: existingClient } = await supabase
    .from('clients')
    .select('notes, next_due_date')
    .eq('id', clientId)
    .single();

  return {
    ...formData,
    notes: formData.notes || existingClient?.notes,
    next_due_date: formData.next_due_date || existingClient?.next_due_date,
    contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
    contact_email: primaryContact.email,
    contact_phone: primaryContact.phone,
    additional_contacts: formattedAdditionalContacts.length > 0 ? formattedAdditionalContacts : null,
    project_revenue_signed_off: formData.project_revenue_signed_off || false,
    project_revenue_forecast: formData.project_revenue_forecast || false,
    annual_revenue_signed_off: formData.annual_revenue_signed_off || 0,
    annual_revenue_forecast: formData.annual_revenue_forecast || 0
  };
};

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      if (!clientId) throw new Error('Client ID is required');

      console.log('Updating client with contacts:', contacts);
      const clientData = await prepareClientData(clientId, formData, contacts);
      console.log('Prepared client data:', clientData);

      const { error } = await supabase
        .from('clients')
        .update(clientData)
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