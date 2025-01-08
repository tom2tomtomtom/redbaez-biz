import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientData = (id: string) => {
  const numericId = parseInt(id, 10);
  
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