export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      email_drafts: {
        Row: {
          action_type: string
          content: string
          created_at: string
          id: string
          occasion: string | null
          original_email: string | null
          recipient: string | null
          subject: string | null
          topic: string | null
        }
        Insert: {
          action_type: string
          content: string
          created_at?: string
          id?: string
          occasion?: string | null
          original_email?: string | null
          recipient?: string | null
          subject?: string | null
          topic?: string | null
        }
        Update: {
          action_type?: string
          content?: string
          created_at?: string
          id?: string
          occasion?: string | null
          original_email?: string | null
          recipient?: string | null
          subject?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      ideas: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_team_project: boolean | null
          status: string
          student_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_team_project?: boolean | null
          status?: string
          student_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_team_project?: boolean | null
          status?: string
          student_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount: number | null
          category_id: string | null
          created_at: string
          currency: string | null
          date: string | null
          description: string | null
          id: string
          image_url: string | null
          items: Json | null
          raw_text: string | null
          status: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          created_at?: string
          currency?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          items?: Json | null
          raw_text?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          created_at?: string
          currency?: string | null
          date?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          items?: Json | null
          raw_text?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "receipt_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      research_history: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          query: string
          research_type: string
          result: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          query: string
          research_type?: string
          result: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          query?: string
          research_type?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_history_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          email: string | null
          grade: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          grade?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          grade?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          idea_id: string | null
          priority: string | null
          status: string
          student_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          idea_id?: string | null
          priority?: string | null
          status?: string
          student_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          idea_id?: string | null
          priority?: string | null
          status?: string
          student_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
