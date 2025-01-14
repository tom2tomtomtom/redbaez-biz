import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ClientAnalysisData {
  clientData: any;
  recommendations: Array<{
    type: string;
    priority: string;
    suggestion: string;
    category: string;
  }>;
}

const deleteExistingRecommendations = async (clientId: number) => {
  const { error } = await supabase
    .from('client_recommendations')
    .delete()
    .eq('client_id', clientId);
    
  if (error) {
    console.error('Error deleting existing recommendations:', error);
    throw error;
  }
};

const fetchClientAnalysisData = async (clientId: number) => {
  const { data, error } = await supabase
    .rpc('get_client_analysis_data', { p_client_id: clientId });
  
  if (error) {
    console.error('Error fetching client analysis data:', error);
    throw error;
  }
  
  return data;
};

const analyzeClientData = async (clientData: any) => {
  const response = await supabase.functions.invoke('analyze-client', {
    body: { clientData }
  });

  if (response.error) {
    console.error('Error from analyze-client function:', response.error);
    throw response.error;
  }

  if (!response.data?.recommendations || !Array.isArray(response.data.recommendations)) {
    throw new Error('Invalid recommendations format received');
  }

  return response.data.recommendations;
};

const insertNewRecommendations = async (clientId: number, recommendations: any[]) => {
  const { error } = await supabase
    .from('client_recommendations')
    .insert(recommendations.map(rec => ({
      client_id: clientId,
      type: rec.type.toLowerCase(),
      priority: rec.priority.toLowerCase(),
      suggestion: rec.suggestion,
      category: rec.category || 'general' // Add default category
    })));
    
  if (error) {
    console.error('Error inserting recommendations:', error);
    throw error;
  }
};

export const useRecommendations = (clientId: number) => {
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', clientId],
    queryFn: async () => {
      // First, get all recommendations for this client
      const { data: allRecommendations, error } = await supabase
        .from('client_recommendations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Create a map to store the latest recommendation for each type
      const latestRecommendations = new Map();
      
      allRecommendations?.forEach(rec => {
        // Only store if it's the first (latest) occurrence of this type
        if (!latestRecommendations.has(rec.type)) {
          latestRecommendations.set(rec.type, rec);
        }
      });

      // Convert map values back to array
      return Array.from(latestRecommendations.values());
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting client analysis for ID:', clientId);
      
      // Immediately clear recommendations in UI
      queryClient.setQueryData(['recommendations', clientId], []);
      
      // Execute analysis process
      await deleteExistingRecommendations(clientId);
      const clientData = await fetchClientAnalysisData(clientId);
      console.log('Retrieved client data:', clientData);
      
      const recommendations = await analyzeClientData(clientData);
      console.log('Received recommendations:', recommendations);
      
      await insertNewRecommendations(clientId, recommendations);
      return recommendations;
    },
    onSuccess: (newRecommendations) => {
      queryClient.setQueryData(['recommendations', clientId], newRecommendations);
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
      queryClient.invalidateQueries({ queryKey: ['recommendations', clientId] });
    }
  });

  return {
    recommendations,
    isLoading,
    analyzeMutation
  };
};