export * from './client-types';
export * from './calendar-events.types';
export * from './client-emails.types';
export * from './client-forecasts.types';
export * from './general-tasks.types';
export * from './recommendations.types';
export * from './messages.types';
export * from './profiles.types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_events: {
        Row: import('./calendar-events.types').CalendarEventRow
        Insert: import('./calendar-events.types').CalendarEventInsert
        Update: import('./calendar-events.types').CalendarEventUpdate
      }
      client_emails: {
        Row: import('./client-emails.types').ClientEmailRow
        Insert: import('./client-emails.types').ClientEmailInsert
        Update: import('./client-emails.types').ClientEmailUpdate
      }
      client_forecasts: {
        Row: import('./client-forecasts.types').ClientForecastRow
        Insert: import('./client-forecasts.types').ClientForecastInsert
        Update: import('./client-forecasts.types').ClientForecastUpdate
      }
      clients: {
        Row: import('./client-types').ClientRow
        Insert: import('./client-types').ClientInsert
        Update: import('./client-types').ClientUpdate
      }
      general_tasks: {
        Row: import('./general-tasks.types').GeneralTaskRow
        Insert: import('./general-tasks.types').GeneralTaskInsert
        Update: import('./general-tasks.types').GeneralTaskUpdate
      }
      messages: {
        Row: import('./messages.types').MessageRow
        Insert: import('./messages.types').MessageInsert
        Update: import('./messages.types').MessageUpdate
      }
      profiles: {
        Row: import('./profiles.types').ProfileRow
        Insert: import('./profiles.types').ProfileInsert
        Update: import('./profiles.types').ProfileUpdate
      }
      recommendations: {
        Row: import('./recommendations.types').RecommendationRow
        Insert: import('./recommendations.types').RecommendationInsert
        Update: import('./recommendations.types').RecommendationUpdate
      }
      team_members: {
        Row: import('./profiles.types').TeamMemberRow
        Insert: import('./profiles.types').TeamMemberInsert
        Update: import('./profiles.types').TeamMemberUpdate
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never