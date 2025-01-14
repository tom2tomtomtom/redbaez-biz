import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: ['generalTasks', category, refreshTrigger],
    queryFn: async () => {
      console.log('Fetching tasks for category:', category); // Debug log

      const { data, error } = await supabase
        .from('general_tasks')
        .select('*, clients(name)')  // Also fetch client name if linked
        .eq('category', category.toLowerCase())
        .neq('status', 'completed')  // Only fetch uncompleted tasks
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Fetched tasks:', data); // Debug log
      return data;
    }
  });
};