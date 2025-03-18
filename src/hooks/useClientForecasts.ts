
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MonthlyForecast, ForecastUpdate } from '@/types/forecast';
import { format, parseISO } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

export function useClientForecasts(clientId: number) {
  const queryClient = useQueryClient();

  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['client-forecasts', clientId],
    queryFn: async () => {
      console.log('Fetching forecasts for client:', clientId);
      const { data, error } = await supabase
        .from('client_forecasts')
        .select('*')
        .eq('client_id', clientId)
        .order('month');
      
      if (error) throw error;
      return data as MonthlyForecast[];
    }
  });

  const updateForecast = useMutation({
    mutationFn: async ({ month, amount, isActual }: ForecastUpdate & { isActual: boolean }) => {
      console.log('Updating revenue:', { clientId, month, amount, isActual });
      
      const monthName = format(parseISO(month), 'MMM').toLowerCase();
      const columnPrefix = isActual ? 'actual' : 'forecast';
      const columnName = `${columnPrefix}_${monthName}`;
      
      // Update the monthly column in clients table
      const { error: updateError } = await supabase
        .from('clients')
        .update({ [columnName]: amount })
        .eq('id', clientId);

      if (updateError) throw updateError;

      // Calculate and update total forecast and actual revenue
      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (fetchError) throw fetchError;

      const totalForecast = Object.entries(client)
        .filter(([key]) => key.startsWith('forecast_'))
        .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);

      const totalActual = Object.entries(client)
        .filter(([key]) => key.startsWith('actual_'))
        .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);

      // Update the client's annual revenue totals
      const { error: totalUpdateError } = await supabase
        .from('clients')
        .update({ 
          annual_revenue_forecast: totalForecast,
          annual_revenue_signed_off: totalActual
        })
        .eq('id', clientId);

      if (totalUpdateError) throw totalUpdateError;

      return { totalForecast, totalActual };
    },
    onSuccess: () => {
      // Invalidate both the forecasts and client data
      queryClient.invalidateQueries({ queryKey: ['client-forecasts', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      
      toast({
        title: "Success",
        description: "Revenue updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating revenue:', error);
      toast({
        title: "Error",
        description: "Failed to update revenue",
        variant: "destructive",
      });
    }
  });

  // Calculate total forecast
  const totalForecast = forecasts?.reduce((sum, forecast) => sum + Number(forecast.amount), 0) || 0;

  return {
    forecasts,
    isLoading,
    updateForecast,
    totalForecast
  };
}
