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

const formatContacts = (contacts: Contact[]) => {
  const [primaryContact, ...additionalContacts] = contacts;
  return {
    primaryContact,
    additionalContacts: additionalContacts.length > 0 ? additionalContacts : null
  };
};

export const useClientUpdate = (clientId: string | undefined, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      if (!clientId) throw new Error('Client ID is required');
      
      const { primaryContact, additionalContacts } = formatContacts(contacts);

      // Ensure all revenue fields are properly typed and transformed
      const clientData = {
        ...formData,
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        additional_contacts: additionalContacts,
        project_revenue: formData.projectRevenue ? Number(formData.projectRevenue) : null,
        annual_revenue: formData.annualRevenue ? Number(formData.annualRevenue) : null,
        project_revenue_signed_off: Boolean(formData.project_revenue_signed_off),
        project_revenue_forecast: Boolean(formData.project_revenue_forecast),
        annual_revenue_signed_off: Number(formData.annual_revenue_signed_off || 0),
        annual_revenue_forecast: Number(formData.annual_revenue_forecast || 0),
      };

      console.log('Updating client with data:', clientData);
      
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId);

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