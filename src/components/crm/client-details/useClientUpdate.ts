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

      // Transform contacts to a JSON-compatible format
      const formattedAdditionalContacts = additionalContacts ? additionalContacts.map(contact => ({
        ...contact
      })) : null;

      // Ensure monthly forecasts are properly formatted and calculate total annual revenue
      const monthlyForecasts = formData.monthly_revenue_forecasts 
        ? Array.isArray(formData.monthly_revenue_forecasts) 
          ? formData.monthly_revenue_forecasts.map((forecast: any) => ({
              month: String(forecast.month),
              amount: Number(forecast.amount)
            }))
          : []
        : [];

      // Calculate total annual revenue from monthly forecasts
      const calculatedAnnualRevenue = monthlyForecasts.reduce((total, forecast) => 
        total + Number(forecast.amount), 0
      );

      console.log('Calculated annual revenue from forecasts:', calculatedAnnualRevenue);

      const clientData = {
        name: formData.name,
        type: formData.type,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        status: formData.status || 'prospect',
        annual_revenue: calculatedAnnualRevenue, // Use calculated total from monthly forecasts
        project_revenue: formData.project_revenue ? Number(formData.project_revenue) : null,
        website: formData.website || null,
        notes: formData.notes,
        background: formData.background || null,
        likelihood: formData.likelihood ? Number(formData.likelihood) : null,
        next_due_date: formData.next_due_date || null,
        contact_name: `${primaryContact.firstName} ${primaryContact.lastName}`.trim(),
        contact_email: primaryContact.email,
        contact_phone: primaryContact.phone,
        additional_contacts: formattedAdditionalContacts,
        project_revenue_signed_off: Boolean(formData.project_revenue_signed_off),
        project_revenue_forecast: Boolean(formData.project_revenue_forecast),
        annual_revenue_signed_off: Number(formData.annual_revenue_signed_off || 0),
        annual_revenue_forecast: Number(formData.annual_revenue_forecast || 0),
        monthly_revenue_forecasts: monthlyForecasts,
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