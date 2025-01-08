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
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
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

    if (error) throw error;
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