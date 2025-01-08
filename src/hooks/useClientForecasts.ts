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
      const { data, error } = await supabase
        .from('client_forecasts')
        .upsert({
          client_id: clientId,
          month,
          amount,
        }, {
          onConflict: 'client_id,month'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-forecasts', clientId] });
    }
  });

  return {
    forecasts,
    isLoading,
    updateForecast
  };
}