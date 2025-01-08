import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MonthlyForecast, ForecastUpdate } from '@/types/forecast';

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
    mutationFn: async ({ month, amount }: ForecastUpdate) => {
      console.log('Updating forecast:', { clientId, month, amount });
      
      // First update the forecast
      const { error: forecastError } = await supabase
        .from('client_forecasts')
        .upsert({
          client_id: clientId,
          month,
          amount,
        }, {
          onConflict: 'client_id,month'
        });

      if (forecastError) throw forecastError;

      // Then calculate and update the annual revenue forecast
      const { data: allForecasts, error: fetchError } = await supabase
        .from('client_forecasts')
        .select('amount')
        .eq('client_id', clientId);

      if (fetchError) throw fetchError;

      const totalForecast = allForecasts.reduce((sum, forecast) => sum + Number(forecast.amount), 0);

      // Update the client's annual revenue forecast
      const { error: updateError } = await supabase
        .from('clients')
        .update({ annual_revenue_forecast: totalForecast })
        .eq('id', clientId);

      if (updateError) throw updateError;

      return { forecasts: allForecasts, totalForecast };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-forecasts', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
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