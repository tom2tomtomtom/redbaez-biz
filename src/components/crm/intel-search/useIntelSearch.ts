import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIntelSearch = (query: string) => {
  return useQuery({
    queryKey: ["intel-search", query],
    queryFn: async () => {
      if (!query.trim()) return null;
      
      const { data, error } = await supabase.functions.invoke('search-intel', {
        body: { query }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!query.trim(),
  });
};