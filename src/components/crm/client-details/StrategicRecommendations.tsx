import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Recommendation {
  id: string;
  client_id: number;
  type: 'revenue' | 'engagement' | 'risk' | 'opportunity';
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  implemented: boolean;
}

export const StrategicRecommendations: React.FC<{ clientId: number }> = ({ clientId }) => {
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
      return data as Recommendation[];
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting client analysis for ID:', clientId);
      
      // First, get client analysis data
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
      
      // Insert the recommendations
      const { error: insertError } = await supabase
        .from('client_recommendations')
        .insert(response.data.recommendations.map((rec: any) => ({
          client_id: clientId,
          ...rec
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Strategic Recommendations</CardTitle>
        <Button 
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : 'Generate New Analysis'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !recommendations?.length ? (
          <div className="text-center text-muted-foreground p-4">
            No recommendations yet. Click "Generate New Analysis" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Alert key={rec.id} className="relative">
                <AlertTitle className="flex items-center gap-2">
                  {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                  <Badge variant={getPriorityColor(rec.priority) as any}>
                    {rec.priority}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  {rec.suggestion}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};