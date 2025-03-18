
import { useQuery } from '@tanstack/react-query';
import { CalendarService, Meeting } from '@/integrations/google/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import logger from '@/utils/logger';

interface CalendarViewProps {
  clientId: string;  // Keep as string since it comes from URL params
}

export const CalendarView = ({ clientId }: CalendarViewProps) => {
  const { data: meetings, isLoading, error } = useQuery({
    queryKey: ['meetings', clientId],
    queryFn: () => {
      logger.info('Fetching calendar events', { clientId });
      return CalendarService.getClientMeetings(Number(clientId));
    },
    retry: 1,
    meta: {
      errorHandler: (error: Error) => {
        logger.error('Failed to fetch calendar events', { error, clientId });
      }
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState 
            variant="skeleton" 
            count={2} 
            height="60px" 
          />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load calendar events. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary fallback={
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Something went wrong displaying calendar events.
        </AlertDescription>
      </Alert>
    }>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming meetings</p>
            ) : (
              meetings?.map((meeting: Meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{meeting.summary}</h4>
                    <p className="text-sm text-muted-foreground">{meeting.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
