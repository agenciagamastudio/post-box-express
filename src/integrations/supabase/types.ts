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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      client_members: {
        Row: {
          added_at: string
          client_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          client_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          client_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          color: string
          created_at: string
          handle: string | null
          id: string
          name: string
          owner_id: string
          segment: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          handle?: string | null
          id?: string
          name: string
          owner_id: string
          segment?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          handle?: string | null
          id?: string
          name?: string
          owner_id?: string
          segment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      finance_entries: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          created_by: string
          description: string
          due_at: string | null
          id: string
          kind: Database["public"]["Enums"]["finance_type"]
          paid_at: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          created_by: string
          description: string
          due_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["finance_type"]
          paid_at?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          created_by?: string
          description?: string
          due_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["finance_type"]
          paid_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_connections: {
        Row: {
          access_token: string | null
          client_id: string
          connected_by: string | null
          created_at: string
          id: string
          ig_user_id: string | null
          ig_username: string | null
          insights_cache: Json | null
          insights_period: string | null
          insights_updated_at: string | null
          is_monitored: boolean
          last_comments_sync: string | null
          last_dms_sync: string | null
          page_id: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          client_id: string
          connected_by?: string | null
          created_at?: string
          id?: string
          ig_user_id?: string | null
          ig_username?: string | null
          insights_cache?: Json | null
          insights_period?: string | null
          insights_updated_at?: string | null
          is_monitored?: boolean
          last_comments_sync?: string | null
          last_dms_sync?: string | null
          page_id?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          client_id?: string
          connected_by?: string | null
          created_at?: string
          id?: string
          ig_user_id?: string | null
          ig_username?: string | null
          insights_cache?: Json | null
          insights_period?: string | null
          insights_updated_at?: string | null
          is_monitored?: boolean
          last_comments_sync?: string | null
          last_dms_sync?: string | null
          page_id?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_connections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_comments: {
        Row: {
          account_id: string
          author_avatar_url: string | null
          author_username: string | null
          comment_id: string
          created_at: string
          id: string
          likes_count: number
          post_id: string
          replied_to_id: string | null
          synced_at: string
          text: string | null
        }
        Insert: {
          account_id: string
          author_avatar_url?: string | null
          author_username?: string | null
          comment_id: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id: string
          replied_to_id?: string | null
          synced_at?: string
          text?: string | null
        }
        Update: {
          account_id?: string
          author_avatar_url?: string | null
          author_username?: string | null
          comment_id?: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id?: string
          replied_to_id?: string | null
          synced_at?: string
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_comments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_dms: {
        Row: {
          account_id: string
          conversation_id: string
          created_at: string
          id: string
          is_from_me: boolean
          sender_avatar_url: string | null
          sender_username: string | null
          synced_at: string
          text: string | null
        }
        Insert: {
          account_id: string
          conversation_id: string
          created_at?: string
          id?: string
          is_from_me?: boolean
          sender_avatar_url?: string | null
          sender_username?: string | null
          synced_at?: string
          text?: string | null
        }
        Update: {
          account_id?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_from_me?: boolean
          sender_avatar_url?: string | null
          sender_username?: string | null
          synced_at?: string
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_dms_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string
          id: string
          ord: number
          post_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          ord?: number
          post_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          ord?: number
          post_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          client_id: string
          cover_url: string | null
          created_at: string
          created_by: string
          format: Database["public"]["Enums"]["post_format"]
          id: string
          network: Database["public"]["Enums"]["post_network"]
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          client_id: string
          cover_url?: string | null
          created_at?: string
          created_by: string
          format?: Database["public"]["Enums"]["post_format"]
          id?: string
          network?: Database["public"]["Enums"]["post_network"]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          client_id?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string
          format?: Database["public"]["Enums"]["post_format"]
          id?: string
          network?: Database["public"]["Enums"]["post_network"]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_at: string | null
          id: string
          post_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_at?: string | null
          id?: string
          post_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_at?: string | null
          id?: string
          post_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_client: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "designer" | "social" | "financeiro"
      finance_type: "receber" | "pagar"
      post_format: "feed" | "carrossel" | "reels" | "story" | "video"
      post_network: "instagram" | "tiktok" | "x" | "outras"
      post_status:
        | "rascunho"
        | "aprovacao"
        | "ajuste"
        | "aprovado"
        | "agendado"
        | "publicado"
      task_status: "a_fazer" | "fazendo" | "feito"
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
    Enums: {
      app_role: ["owner", "admin", "designer", "social", "financeiro"],
      finance_type: ["receber", "pagar"],
      post_format: ["feed", "carrossel", "reels", "story", "video"],
      post_network: ["instagram", "tiktok", "x", "outras"],
      post_status: [
        "rascunho",
        "aprovacao",
        "ajuste",
        "aprovado",
        "agendado",
        "publicado",
      ],
      task_status: ["a_fazer", "fazendo", "feito"],
    },
  },
} as const

// Aliases de conveniência (Instagram Monitoring — Fase 1)
export type InstagramAccount = Tables<"instagram_connections">
export type InstagramComment = Tables<"instagram_comments">
export type InstagramDM = Tables<"instagram_dms">
