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

const parseNumericValue = (value: string | number | null): number | null => {
  if (value === null || value === '') return null;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? null : parsed;
};

const prepareClientData = async (clientId: string, formData: any, contacts: Contact[]): Promise<ClientData> => {
  console.log('Preparing client data with form data:', formData);
  console.log('Revenue fields before processing:', {
    projectRevenueSignedOff: formData.project_revenue_signed_off,
    projectRevenueForecast: formData.project_revenue_forecast,
    annualRevenueSignedOff: formData.annual_revenue_signed_off,
    annualRevenueForecast: formData.annual_revenue_forecast,
    projectRevenue: formData.project_revenue,
    annualRevenue: formData.annual_revenue
  });
  
  const { primaryContact, formattedAdditionalContacts } = formatContacts(contacts);

  // Parse numeric values - IMPORTANT: Use the revenue state values directly
  const projectRevenue = parseNumericValue(formData.project_revenue);
  const annualRevenue = parseNumericValue(formData.annual_revenue);
  
  // Convert boolean values explicitly
  const projectRevenueSignedOff = Boolean(formData.project_revenue_signed_off);
  const projectRevenueForecast = Boolean(formData.project_revenue_forecast);
  
  // Parse numeric values for signed off and forecast amounts
  const annualRevenueSignedOff = parseNumericValue(formData.annual_revenue_signed_off) ?? 0;
  const annualRevenueForecast = parseNumericValue(formData.annual_revenue_forecast) ?? 0;

  console.log('Parsed values:', {
    projectRevenueSignedOff,
    projectRevenueForecast,
    annualRevenueSignedOff,
    annualRevenueForecast,
    projectRevenue,
    annualRevenue
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

  console.log('Final client data for update:', clientData);
  return clientData;
};

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      if (!clientId) throw new Error('Client ID is required');

      console.log('Raw form data received:', formData);
      console.log('Contacts:', contacts);
      
      const clientData = await prepareClientData(clientId, formData, contacts);

      console.log('Executing Supabase update with data:', clientData);
      const { error, data } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId);

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      console.log('Supabase update response:', data);
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