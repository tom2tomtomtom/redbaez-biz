import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRecommendations } from './hooks/useRecommendations';
import { RecommendationAlert } from './components/RecommendationAlert';

interface Recommendation {
  id: string;
  client_id: number;
  type: 'revenue' | 'engagement' | 'risk' | 'opportunity';
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  implemented: boolean;
}

interface StrategicRecommendationsProps {
  clientId: number;
  clientName: string;
}

export const StrategicRecommendations: React.FC<StrategicRecommendationsProps> = ({ 
  clientId,
  clientName 
}) => {
  const { recommendations, isLoading, analyzeMutation } = useRecommendations(clientId);

  // Get only the latest 3 recommendations
  const latestRecommendations = recommendations?.slice(0, 3) || [];

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
        ) : !latestRecommendations.length ? (
          <div className="text-center text-muted-foreground p-4">
            No recommendations yet. Click "Generate New Analysis" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {latestRecommendations.map((rec: Recommendation) => (
              <RecommendationAlert
                key={rec.id}
                type={rec.type}
                priority={rec.priority}
                suggestion={rec.suggestion}
                clientId={clientId}
                clientName={clientName}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};