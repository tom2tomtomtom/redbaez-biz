import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MonthlyForecast } from './types/MonthlyForecast';

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

const monthToColumnMap: Record<string, string> = {
  'Jan': 'forecast_jan',
  'Feb': 'forecast_feb',
  'Mar': 'forecast_mar',
  'Apr': 'forecast_apr',
  'May': 'forecast_may',
  'Jun': 'forecast_jun',
  'Jul': 'forecast_jul',
  'Aug': 'forecast_aug',
  'Sep': 'forecast_sep',
  'Oct': 'forecast_oct',
  'Nov': 'forecast_nov',
  'Dec': 'forecast_dec'
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

      // Convert monthly forecasts array to individual column values
      const monthlyForecasts = formData.monthly_revenue_forecasts || [];
      const forecastColumns = Object.keys(monthToColumnMap).reduce((acc, month) => {
        const forecast = monthlyForecasts.find((f: MonthlyForecast) => f.month === month);
        const columnName = monthToColumnMap[month];
        acc[columnName] = forecast ? Number(forecast.amount) : 0;
        return acc;
      }, {} as Record<string, number>);

      // Calculate total annual revenue from monthly forecasts
      const calculatedAnnualRevenue = Object.values(forecastColumns).reduce((total, amount) => 
        total + Number(amount), 0
      );

      console.log('Monthly forecasts being saved:', forecastColumns);
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
        ...forecastColumns, // Spread the monthly forecast columns
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