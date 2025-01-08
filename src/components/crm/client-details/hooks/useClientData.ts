import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientData = (id: string | undefined) => {
  const numericId = id ? parseInt(id, 10) : undefined;
  
  if (!numericId || isNaN(numericId)) {
    throw new Error('Invalid client ID');
  }
  
  return useQuery({
    queryKey: ['client', numericId],
    queryFn: async () => {
      console.log('Fetching client data for ID:', numericId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', numericId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Client not found');
      
      console.log('Received client data:', data);
      return data;
    },
  });
};