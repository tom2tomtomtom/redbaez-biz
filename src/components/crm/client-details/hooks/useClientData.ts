import logger from '@/utils/logger';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { queryKeys } from '@/lib/queryKeys';

export const useClientData = (clientId: number) => {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: async () => {
      logger.info('Fetching client data for ID:', clientId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Client not found');
      
      logger.info('Received client data:', data);
      return data;
    },
  });
};
