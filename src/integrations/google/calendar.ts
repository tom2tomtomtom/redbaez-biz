import { supabase } from '@/integrations/supabase/client';

export interface Meeting {
  id: string;
  clientId: number;  // Changed from string to number to match DB schema
  googleEventId: string;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export interface MeetingInput {
  clientId: number;  // Changed from string to number
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export const CalendarService = {
  async getClientMeetings(clientId: number): Promise<Meeting[]> {  // Changed parameter type to number
    console.log('Fetching meetings for client:', clientId);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }

    if (!data) return [];

    return data.map(event => ({
      id: event.id,
      clientId: event.client_id,
      googleEventId: event.google_event_id,
      summary: event.summary,
      description: event.description,
      startTime: new Date(event.start_time),
      endTime: new Date(event.end_time)
    }));
  },

  async createMeeting(data: MeetingInput): Promise<Meeting> {
    console.log('Creating meeting:', data);
    
    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert({
        client_id: data.clientId,
        summary: data.summary,
        description: data.description,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }

    if (!event) {
      throw new Error('Failed to create meeting');
    }

    return {
      id: event.id,
      clientId: event.client_id,
      googleEventId: event.google_event_id,
      summary: event.summary,
      description: event.description,
      startTime: new Date(event.start_time),
      endTime: new Date(event.end_time)
    };
  }
};