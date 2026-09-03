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
      accounts: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          fruit: string | null
          id: string
          image_url: string | null
          level: number | null
          name: string
          price: number
          price_rm: number | null
          race: string | null
          sort_order: number
          status: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          fruit?: string | null
          id?: string
          image_url?: string | null
          level?: number | null
          name: string
          price?: number
          price_rm?: number | null
          race?: string | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          fruit?: string | null
          id?: string
          image_url?: string | null
          level?: number | null
          name?: string
          price?: number
          price_rm?: number | null
          race?: string | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          custom_instructions: string
          forbidden_words: string
          greeting: string
          id: number
          model: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          custom_instructions?: string
          forbidden_words?: string
          greeting?: string
          id?: number
          model?: string
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          custom_instructions?: string
          forbidden_words?: string
          greeting?: string
          id?: number
          model?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          created_at: string
          id: string
          message: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          message: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string | null
          link: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_key: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_key: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_key?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          session_key: string
          updated_at: string
          user_label: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_key: string
          updated_at?: string
          user_label?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_key?: string
          updated_at?: string
          user_label?: string | null
        }
        Relationships: []
      }
      community_links: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          platform: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          platform: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      fruit_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      fruits: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          price_rm: number | null
          ready: boolean
          sort_order: number
          stock: number
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          price_rm?: number | null
          ready?: boolean
          sort_order?: number
          stock?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          price_rm?: number | null
          ready?: boolean
          sort_order?: number
          stock?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      giveaways: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          ends_at: string | null
          how_to_join: string | null
          id: string
          name: string
          prize: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          how_to_join?: string | null
          id?: string
          name: string
          prize?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          how_to_join?: string | null
          id?: string
          name?: string
          prize?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      joki_services: {
        Row: {
          active: boolean
          alt_text: string | null
          category: string | null
          created_at: string
          description: string | null
          estimation: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          price_rm: number | null
          sort_order: number
          stock: number | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimation?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          price_rm?: number | null
          sort_order?: number
          stock?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt_text?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimation?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          price_rm?: number | null
          sort_order?: number
          stock?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      live_status: {
        Row: {
          ai_message: string | null
          id: number
          is_live: boolean
          link: string | null
          live_time: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          ai_message?: string | null
          id?: number
          is_live?: boolean
          link?: string | null
          live_time?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          ai_message?: string | null
          id?: number
          is_live?: boolean
          link?: string | null
          live_time?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          discount_percent: number
          ends_at: string | null
          id: string
          image_url: string | null
          scope: string
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          target_categories: string[] | null
          target_kind: string | null
          target_kinds: string[]
          target_product_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          discount_percent: number
          ends_at?: string | null
          id?: string
          image_url?: string | null
          scope: string
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          target_categories?: string[] | null
          target_kind?: string | null
          target_kinds?: string[]
          target_product_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          discount_percent?: number
          ends_at?: string | null
          id?: string
          image_url?: string | null
          scope?: string
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          target_categories?: string[] | null
          target_kind?: string | null
          target_kinds?: string[]
          target_product_ids?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      trade_conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          offer_id: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          offer_id: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          offer_id?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_conversations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "trade_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_items: {
        Row: {
          category: string | null
          created_at: string
          demand: string | null
          gamepass_value: number | null
          id: string
          image_url: string | null
          name: string
          permanent_value: number | null
          price: number | null
          rarity: string | null
          regular_value: number | null
          slug: string
          source: string | null
          source_updated_at: string | null
          trend: string | null
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          demand?: string | null
          gamepass_value?: number | null
          id?: string
          image_url?: string | null
          name: string
          permanent_value?: number | null
          price?: number | null
          rarity?: string | null
          regular_value?: number | null
          slug: string
          source?: string | null
          source_updated_at?: string | null
          trend?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          demand?: string | null
          gamepass_value?: number | null
          id?: string
          image_url?: string | null
          name?: string
          permanent_value?: number | null
          price?: number | null
          rarity?: string | null
          regular_value?: number | null
          slug?: string
          source?: string | null
          source_updated_at?: string | null
          trend?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      trade_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "trade_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_offer_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          item_id: string | null
          item_name: string
          offer_id: string
          qty: number
          side: string
          value: number | null
          variant: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          item_id?: string | null
          item_name: string
          offer_id: string
          qty?: number
          side: string
          value?: number | null
          variant?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          item_id?: string | null
          item_name?: string
          offer_id?: string
          qty?: number
          side?: string
          value?: number | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_offer_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "trade_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_offer_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "trade_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_offers: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          note: string | null
          offer_value: number
          request_value: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          note?: string | null
          offer_value?: number
          request_value?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          note?: string | null
          offer_value?: number
          request_value?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      website_settings: {
        Row: {
          id: number
          logo_url: string | null
          site_name: string
          tagline: string
          updated_at: string
          whatsapp_greeting: string | null
          whatsapp_number: string | null
        }
        Insert: {
          id?: number
          logo_url?: string | null
          site_name?: string
          tagline?: string
          updated_at?: string
          whatsapp_greeting?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          id?: number
          logo_url?: string | null
          site_name?: string
          tagline?: string
          updated_at?: string
          whatsapp_greeting?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_chat_message: {
        Args: { p_content: string; p_role: string; p_session_key: string }
        Returns: undefined
      }
      upsert_chat_session: {
        Args: { p_session_key: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
