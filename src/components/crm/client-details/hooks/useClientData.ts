import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientData = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      console.log('Fetching client data for ID:', id);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Client not found');
      
      console.log('Received client data:', data);
      return data;
    },
  });
};