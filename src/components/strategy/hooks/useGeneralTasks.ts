import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: ['generalTasks', category, refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('general_tasks')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};