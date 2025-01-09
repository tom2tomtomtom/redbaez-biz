import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientData = (clientId: number | null) => {
  if (!clientId || isNaN(clientId)) {
    throw new Error('Invalid client ID');
  }

  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      console.log('Fetching client data for ID:', clientId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Client not found');
      
      console.log('Received client data:', data);
      return data;
    },
  });
};