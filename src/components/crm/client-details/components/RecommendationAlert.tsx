import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface RecommendationAlertProps {
  type: 'revenue' | 'engagement' | 'risk' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  clientId: number;
  clientName: string;
}

export const RecommendationAlert = ({
  type,
  priority,
  suggestion,
  clientId,
  clientName
}: RecommendationAlertProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isUrgent, setIsUrgent] = useState(false);

  const handleImplement = async () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }

    try {
      // First mark the recommendation as implemented
      const { error: recommendationError } = await supabase
        .from('client_recommendations')
        .update({ implemented: true })
        .eq('client_id', clientId)
        .eq('type', type)
        .eq('suggestion', suggestion);

      if (recommendationError) throw recommendationError;

      // Create a task with proper formatting
      const taskTitle = `Strategic Recommendation for ${clientName}`;
      const taskDescription = `${suggestion}\n\nType: ${type}\nPriority: ${priority}`;

      const { error } = await supabase
        .from('general_tasks')
        .insert({
          title: taskTitle,
          description: taskDescription,
          category: type,
          next_due_date: date.toISOString(),
          urgent: isUrgent,
          status: 'in_progress',
          client_id: clientId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recommendation implemented and task created",
      });
    } catch (error) {
      console.error('Error implementing recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to implement recommendation",
        variant: "destructive",
      });
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'revenue':
        return <AlertCircle className="h-4 w-4" />;
      case 'engagement':
        return <Info className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'revenue':
        return 'default';
      case 'engagement':
        return 'info';
      case 'risk':
        return 'destructive';
      case 'opportunity':
        return 'success';
    }
  };

  return (
    <Alert variant={getVariant()}>
      <div className="flex items-start gap-4">
        {getIcon()}
        <div className="flex-1">
          <AlertTitle className="mb-2">{type.charAt(0).toUpperCase() + type.slice(1)} Recommendation</AlertTitle>
          <AlertDescription>
            <div className="space-y-4">
              <p>{suggestion}</p>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isUrgent}
                    onCheckedChange={setIsUrgent}
                  />
                  <span className="text-sm">Mark as urgent</span>
                </div>
                <Button onClick={handleImplement} className="ml-auto">
                  Implement <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};