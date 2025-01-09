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
        Row: {
          client_id: number | null
          created_at: string | null
          description: string | null
          end_time: string | null
          google_event_id: string | null
          id: string
          start_time: string | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: number | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          google_event_id?: string | null
          id?: string
          start_time?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: number | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          google_event_id?: string | null
          id?: string
          start_time?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_emails: {
        Row: {
          client_id: number | null
          created_at: string | null
          date: string | null
          from_email: string | null
          gmail_id: string | null
          id: string
          snippet: string | null
          subject: string | null
          thread_id: string | null
          to_emails: string[] | null
        }
        Insert: {
          client_id?: number | null
          created_at?: string | null
          date?: string | null
          from_email?: string | null
          gmail_id?: string | null
          id?: string
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails?: string[] | null
        }
        Update: {
          client_id?: number | null
          created_at?: string | null
          date?: string | null
          from_email?: string | null
          gmail_id?: string | null
          id?: string
          snippet?: string | null
          subject?: string | null
          thread_id?: string | null
          to_emails?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "client_emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_forecasts: {
        Row: {
          amount: number
          client_id: number | null
          created_at: string | null
          id: string
          month: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          client_id?: number | null
          created_at?: string | null
          id?: string
          month: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: number | null
          created_at?: string | null
          id?: string
          month?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_forecasts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_next_steps: {
        Row: {
          client_id: number | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_next_steps_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_recommendations: {
        Row: {
          client_id: number | null
          created_at: string | null
          id: string
          implemented: boolean | null
          priority: string
          suggestion: string
          type: string
        }
        Insert: {
          client_id?: number | null
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          priority: string
          suggestion: string
          type: string
        }
        Update: {
          client_id?: number | null
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          priority?: string
          suggestion?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_status_history: {
        Row: {
          client_id: number | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          client_id?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          status: string
        }
        Update: {
          client_id?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_status_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_status_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          actual_apr: number | null
          actual_aug: number | null
          actual_dec: number | null
          actual_feb: number | null
          actual_jan: number | null
          actual_jul: number | null
          actual_jun: number | null
          actual_mar: number | null
          actual_may: number | null
          actual_nov: number | null
          actual_oct: number | null
          actual_sep: number | null
          additional_contacts: Json | null
          annual_revenue: number | null
          annual_revenue_forecast: number | null
          annual_revenue_signed_off: number | null
          background: string | null
          company_size: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          forecast_apr: number | null
          forecast_aug: number | null
          forecast_dec: number | null
          forecast_feb: number | null
          forecast_jan: number | null
          forecast_jul: number | null
          forecast_jun: number | null
          forecast_mar: number | null
          forecast_may: number | null
          forecast_nov: number | null
          forecast_oct: number | null
          forecast_sep: number | null
          id: number
          industry: string | null
          likelihood: number | null
          missing_fields: string[] | null
          name: string
          next_due_date: string | null
          notes: string | null
          project_revenue: number | null
          project_revenue_forecast: boolean | null
          project_revenue_signed_off: boolean | null
          status: string | null
          type: string
          urgent: boolean | null
          website: string | null
        }
        Insert: {
          actual_apr?: number | null
          actual_aug?: number | null
          actual_dec?: number | null
          actual_feb?: number | null
          actual_jan?: number | null
          actual_jul?: number | null
          actual_jun?: number | null
          actual_mar?: number | null
          actual_may?: number | null
          actual_nov?: number | null
          actual_oct?: number | null
          actual_sep?: number | null
          additional_contacts?: Json | null
          annual_revenue?: number | null
          annual_revenue_forecast?: number | null
          annual_revenue_signed_off?: number | null
          background?: string | null
          company_size?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          forecast_apr?: number | null
          forecast_aug?: number | null
          forecast_dec?: number | null
          forecast_feb?: number | null
          forecast_jan?: number | null
          forecast_jul?: number | null
          forecast_jun?: number | null
          forecast_mar?: number | null
          forecast_may?: number | null
          forecast_nov?: number | null
          forecast_oct?: number | null
          forecast_sep?: number | null
          id?: number
          industry?: string | null
          likelihood?: number | null
          missing_fields?: string[] | null
          name: string
          next_due_date?: string | null
          notes?: string | null
          project_revenue?: number | null
          project_revenue_forecast?: boolean | null
          project_revenue_signed_off?: boolean | null
          status?: string | null
          type: string
          urgent?: boolean | null
          website?: string | null
        }
        Update: {
          actual_apr?: number | null
          actual_aug?: number | null
          actual_dec?: number | null
          actual_feb?: number | null
          actual_jan?: number | null
          actual_jul?: number | null
          actual_jun?: number | null
          actual_mar?: number | null
          actual_may?: number | null
          actual_nov?: number | null
          actual_oct?: number | null
          actual_sep?: number | null
          additional_contacts?: Json | null
          annual_revenue?: number | null
          annual_revenue_forecast?: number | null
          annual_revenue_signed_off?: number | null
          background?: string | null
          company_size?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          forecast_apr?: number | null
          forecast_aug?: number | null
          forecast_dec?: number | null
          forecast_feb?: number | null
          forecast_jan?: number | null
          forecast_jul?: number | null
          forecast_jun?: number | null
          forecast_mar?: number | null
          forecast_may?: number | null
          forecast_nov?: number | null
          forecast_oct?: number | null
          forecast_sep?: number | null
          id?: number
          industry?: string | null
          likelihood?: number | null
          missing_fields?: string[] | null
          name?: string
          next_due_date?: string | null
          notes?: string | null
          project_revenue?: number | null
          project_revenue_forecast?: boolean | null
          project_revenue_signed_off?: boolean | null
          status?: string | null
          type?: string
          urgent?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      general_tasks: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          next_due_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          urgent: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          next_due_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          urgent?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          next_due_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          type?: string
        }
        Relationships: []
      }
      next_steps_history: {
        Row: {
          client_id: number | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
        }
        Insert: {
          client_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          client_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "next_steps_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "next_steps_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          action_url: string | null
          client_id: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: number | null
          status: string | null
          type: string | null
        }
        Insert: {
          action_url?: string | null
          client_id?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          type?: string | null
        }
        Update: {
          action_url?: string | null
          client_id?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_analysis_data: {
        Args: {
          p_client_id: number
        }
        Returns: Json
      }
      insert_profile_for_authenticated_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
