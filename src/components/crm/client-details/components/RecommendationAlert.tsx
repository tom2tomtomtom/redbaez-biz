import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationAlertProps {
  type: string;
  suggestion: string;
  priority: string;
  clientId: number;
  clientName: string;
  onImplemented?: () => void;
}

export const RecommendationAlert = ({
  type,
  suggestion,
  priority,
  clientId,
  clientName,
  onImplemented
}: RecommendationAlertProps) => {
  const [isImplementing, setIsImplementing] = useState(false);
  const { toast } = useToast();
  const [isUrgent] = useState(priority === 'high');

  const handleImplement = async () => {
    setIsImplementing(true);

    try {
      // Get the next week's date for the task
      const date = new Date();
      date.setDate(date.getDate() + 7);

      // First update the recommendation status
      const { error: recommendationError } = await supabase
        .from('client_recommendations')
        .update({ implemented: true })
        .eq('client_id', clientId)
        .eq('suggestion', suggestion);

      if (recommendationError) throw recommendationError;

      // Then create a task for follow-up
      const { error } = await supabase
        .from('general_tasks')
        .insert({
          title: `${clientName} - Strategic Recommendation`,
          description: suggestion,
          category: 'revenue',
          next_due_date: date.toISOString(),
          urgent: isUrgent,
          status: 'in_progress',
          client_id: clientId
        });

      if (error) throw error;

      toast({
        title: 'Recommendation implemented',
        description: 'A follow-up task has been created.',
      });

      if (onImplemented) {
        onImplemented();
      }
    } catch (error) {
      console.error('Error implementing recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to implement recommendation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImplementing(false);
    }
  };

  return (
    <Alert className="my-2">
      <AlertTitle className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Strategic Recommendation
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{suggestion}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImplement}
          disabled={isImplementing}
        >
          {isImplementing ? 'Implementing...' : 'Implement'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};