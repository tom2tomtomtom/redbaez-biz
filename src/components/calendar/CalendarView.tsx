import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { CalendarService, Meeting } from '@/integrations/google/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CalendarView = () => {
  const { clientId } = useParams();
  
  const { data: meetings, isLoading, error } = useQuery({
    queryKey: ['meetings', clientId],
    queryFn: () => clientId ? CalendarService.getClientMeetings(Number(clientId)) : Promise.resolve([]),
    retry: 1,
    enabled: !!clientId, // Only run query if clientId exists
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Events {clientId ? `for Client #${clientId}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!clientId ? (
            <p className="text-muted-foreground text-sm">Select a client to view their calendar events</p>
          ) : meetings?.length === 0 ? (
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
  );
};