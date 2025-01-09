import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useRecommendations = (clientId: number) => {
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_recommendations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting client analysis for ID:', clientId);
      
      // First, delete existing recommendations
      const { error: deleteError } = await supabase
        .from('client_recommendations')
        .delete()
        .eq('client_id', clientId);
        
      if (deleteError) {
        console.error('Error deleting existing recommendations:', deleteError);
        throw deleteError;
      }
      
      // Get client analysis data
      const { data: clientData, error: analysisError } = await supabase
        .rpc('get_client_analysis_data', { p_client_id: clientId });
      
      if (analysisError) {
        console.error('Error fetching client analysis data:', analysisError);
        throw analysisError;
      }
      
      console.log('Retrieved client data:', clientData);
      
      // Call the edge function for AI analysis
      const response = await supabase.functions.invoke('analyze-client', {
        body: { clientData }
      });

      if (response.error) {
        console.error('Error from analyze-client function:', response.error);
        throw response.error;
      }
      
      console.log('Received recommendations:', response.data);
      
      if (!response.data?.recommendations || !Array.isArray(response.data.recommendations)) {
        throw new Error('Invalid recommendations format received');
      }

      // Insert the new recommendations
      const { error: insertError } = await supabase
        .from('client_recommendations')
        .insert(response.data.recommendations.map((rec: any) => ({
          client_id: clientId,
          type: rec.type.toLowerCase(),
          priority: rec.priority.toLowerCase(),
          suggestion: rec.suggestion
        })));
        
      if (insertError) {
        console.error('Error inserting recommendations:', insertError);
        throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', clientId] });
      toast({
        title: "Analysis Complete",
        description: "New recommendations have been generated.",
      });
    },
    onError: (error) => {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    recommendations,
    isLoading,
    analyzeMutation
  };
};