import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Contact } from './ContactInfoCard';

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
  const numericId = clientId ? parseInt(clientId, 10) : undefined;

  return useMutation({
    mutationFn: async ({ formData, contacts }: UpdateClientData) => {
      if (!numericId) throw new Error('Client ID is required');
      
      const { primaryContact, additionalContacts } = formatContacts(contacts);

      // Transform contacts to a JSON-compatible format
      const formattedAdditionalContacts = additionalContacts ? additionalContacts.map(contact => ({
        ...contact
      })) : null;

      // Calculate total annual revenue from monthly forecasts
      const monthlyForecasts = [
        formData.forecast_jan || 0,
        formData.forecast_feb || 0,
        formData.forecast_mar || 0,
        formData.forecast_apr || 0,
        formData.forecast_may || 0,
        formData.forecast_jun || 0,
        formData.forecast_jul || 0,
        formData.forecast_aug || 0,
        formData.forecast_sep || 0,
        formData.forecast_oct || 0,
        formData.forecast_nov || 0,
        formData.forecast_dec || 0
      ];

      const calculatedAnnualRevenue = monthlyForecasts.reduce((total, amount) => 
        total + Number(amount), 0
      );

      console.log('Monthly forecasts being saved:', monthlyForecasts);
      console.log('Calculated annual revenue:', calculatedAnnualRevenue);

      const clientData = {
        name: formData.name,
        type: formData.type,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        status: formData.status || 'prospect',
        annual_revenue: calculatedAnnualRevenue,
        project_revenue: formData.project_revenue ? parseFloat(formData.project_revenue) : null,
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
        // Add individual monthly forecast columns
        forecast_jan: Number(formData.forecast_jan || 0),
        forecast_feb: Number(formData.forecast_feb || 0),
        forecast_mar: Number(formData.forecast_mar || 0),
        forecast_apr: Number(formData.forecast_apr || 0),
        forecast_may: Number(formData.forecast_may || 0),
        forecast_jun: Number(formData.forecast_jun || 0),
        forecast_jul: Number(formData.forecast_jul || 0),
        forecast_aug: Number(formData.forecast_aug || 0),
        forecast_sep: Number(formData.forecast_sep || 0),
        forecast_oct: Number(formData.forecast_oct || 0),
        forecast_nov: Number(formData.forecast_nov || 0),
        forecast_dec: Number(formData.forecast_dec || 0),
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
