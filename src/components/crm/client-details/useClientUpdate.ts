import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

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
  additional_contacts: Json | null;
  notes?: string;
  next_due_date?: string;
  project_revenue_signed_off: boolean;
  project_revenue_forecast: boolean;
  annual_revenue_signed_off: number;
  annual_revenue_forecast: number;
  annual_revenue: number | null;
  project_revenue: number | null;
  [key: string]: any;
}

interface UpdateClientData {
  formData: any;
  contacts: Contact[];
}

const formatContacts = (contacts: Contact[]): { primaryContact: Contact; formattedAdditionalContacts: Json } => {
  const [primaryContact, ...additionalContacts] = contacts;
  
  const formattedAdditionalContacts = additionalContacts.map(contact => ({
    firstName: contact.firstName,
    lastName: contact.lastName,
    title: contact.title,
    email: contact.email,
    address: contact.address,
    phone: contact.phone
  }));

  return {
    primaryContact,
    formattedAdditionalContacts: formattedAdditionalContacts as Json
  };
};

const prepareClientData = async (clientId: string, formData: any, contacts: Contact[]): Promise<ClientData> => {
  const { primaryContact, formattedAdditionalContacts } = formatContacts(contacts);

  // Convert string values to numbers, handling both formats
  const projectRevenue = formData.projectRevenue ? Number(formData.projectRevenue) : null;
  const annualRevenue = formData.annualRevenue ? Number(formData.annualRevenue) : null;
  const annualRevenueSignedOff = formData.annualRevenueSignedOff ? Number(formData.annualRevenueSignedOff) : 0;
  const annualRevenueForecast = formData.annualRevenueForecast ? Number(formData.annualRevenueForecast) : 0;

  // Convert checkbox values to booleans
  const projectRevenueSignedOff = Boolean(formData.projectRevenueSignedOff);
  const projectRevenueForecast = Boolean(formData.projectRevenueForecast);

  console.log('Processing form data:', {
    projectRevenue,
    annualRevenue,
    projectRevenueSignedOff,
    projectRevenueForecast,
    annualRevenueSignedOff,
    annualRevenueForecast
  });

  const clientData = {
    ...formData,
    contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
    contact_email: primaryContact.email,
    contact_phone: primaryContact.phone,
    additional_contacts: contacts.length > 1 ? formattedAdditionalContacts : null,
    project_revenue: projectRevenue,
    annual_revenue: annualRevenue,
    project_revenue_signed_off: projectRevenueSignedOff,
    project_revenue_forecast: projectRevenueForecast,
    annual_revenue_signed_off: annualRevenueSignedOff,
    annual_revenue_forecast: annualRevenueForecast,
    likelihood: formData.likelihood ? Number(formData.likelihood) : null
  };

  console.log('Prepared client data for update:', clientData);
  return clientData;
};

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      if (!clientId) throw new Error('Client ID is required');
      
      const clientData = await prepareClientData(clientId, formData, contacts);
      
      console.log('Sending update to Supabase:', clientData);
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