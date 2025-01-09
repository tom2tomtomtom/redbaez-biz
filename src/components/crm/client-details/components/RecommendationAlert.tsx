import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface RecommendationAlertProps {
  type: string;
  priority: string;
  suggestion: string;
}

export const RecommendationAlert: React.FC<RecommendationAlertProps> = ({
  type,
  priority,
  suggestion
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Alert className="relative">
      <AlertTitle className="flex items-center gap-2">
        {type.charAt(0).toUpperCase() + type.slice(1)}
        <Badge variant={getPriorityColor(priority)}>
          {priority}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        {suggestion}
      </AlertDescription>
    </Alert>
  );
};