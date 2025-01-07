import { ClientRow, ClientInsert, ClientUpdate } from './client-types';
import { MessageRow, MessageInsert, MessageUpdate } from './messages.types';
import { ProfileRow, ProfileInsert, ProfileUpdate } from './profiles.types';

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: ClientRow
        Insert: ClientInsert
        Update: ClientUpdate
      }
      messages: {
        Row: MessageRow
        Insert: MessageInsert
        Update: MessageUpdate
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}