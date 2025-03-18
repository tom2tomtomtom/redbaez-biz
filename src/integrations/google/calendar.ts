
import { supabase } from '@/integrations/supabase/client';
import { CalendarEventInsert, CalendarEventRow } from '@/integrations/supabase/types/calendar-events.types';
import logger from '@/utils/logger';

export interface Meeting {
  id: string;
  clientId: number;
  googleEventId: string;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export interface MeetingInput {
  clientId: number;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export const CalendarService = {
  async getClientMeetings(clientId: number): Promise<Meeting[]> {
    logger.info('Fetching meetings for client:', { clientId });
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('client_id', clientId);

      if (error) {
        logger.error('Error fetching meetings:', { error, clientId });
        throw error;
      }

      if (!data) return [];

      return data.map(event => ({
        id: event.id,
        clientId: event.client_id,
        googleEventId: event.google_event_id,
        summary: event.summary || '',
        description: event.description || '',
        startTime: new Date(event.start_time || new Date()),
        endTime: new Date(event.end_time || new Date())
      }));
    } catch (error) {
      logger.error('Exception in getClientMeetings:', { error, clientId });
      throw error;
    }
  },

  async createMeeting(data: MeetingInput): Promise<Meeting> {
    logger.info('Creating meeting:', { data });
    
    try {
      // Validate input data
      if (!data.clientId) {
        throw new Error('Client ID is required');
      }
      
      if (!data.summary) {
        throw new Error('Meeting summary is required');
      }
      
      if (!data.startTime || !data.endTime) {
        throw new Error('Meeting start and end times are required');
      }
      
      // Prepare data for insertion
      const insertData: CalendarEventInsert = {
        client_id: data.clientId,
        summary: data.summary,
        description: data.description,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString()
      };
      
      const { data: event, error } = await supabase
        .from('calendar_events')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating meeting:', { error, data });
        throw error;
      }

      if (!event) {
        throw new Error('Failed to create meeting: No data returned');
      }

      return {
        id: event.id,
        clientId: event.client_id || data.clientId,
        googleEventId: event.google_event_id || '',
        summary: event.summary || data.summary,
        description: event.description || data.description,
        startTime: new Date(event.start_time || data.startTime),
        endTime: new Date(event.end_time || data.endTime)
      };
    } catch (error) {
      logger.error('Exception in createMeeting:', { error, meetingData: data });
      throw error;
    }
  },
  
  async deleteMeeting(meetingId: string): Promise<boolean> {
    logger.info('Deleting meeting:', { meetingId });
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', meetingId);

      if (error) {
        logger.error('Error deleting meeting:', { error, meetingId });
        throw error;
      }

      return true;
    } catch (error) {
      logger.error('Exception in deleteMeeting:', { error, meetingId });
      throw error;
    }
  }
};
