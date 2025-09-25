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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      deal_analyses: {
        Row: {
          analysis_score: number | null
          annual_income: string | null
          arv_estimate: string | null
          bank_balance: string | null
          close_timeline: string | null
          created_at: string
          credit_score: string
          current_value: string | null
          financial_assets: string[] | null
          funding_amount: string
          funding_purpose: string
          good_deal_criteria: string | null
          id: string
          income_sources: string | null
          last_deal_profit: string | null
          money_plans: string | null
          owns_other_properties: boolean | null
          past_deals: boolean | null
          properties_count: string
          property_address: string
          property_details: string | null
          property_info: string | null
          property_specific_info: string | null
          property_type: string
          rehab_costs: string | null
          repair_level: string | null
          repairs_needed: boolean | null
          under_contract: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_score?: number | null
          annual_income?: string | null
          arv_estimate?: string | null
          bank_balance?: string | null
          close_timeline?: string | null
          created_at?: string
          credit_score: string
          current_value?: string | null
          financial_assets?: string[] | null
          funding_amount: string
          funding_purpose: string
          good_deal_criteria?: string | null
          id?: string
          income_sources?: string | null
          last_deal_profit?: string | null
          money_plans?: string | null
          owns_other_properties?: boolean | null
          past_deals?: boolean | null
          properties_count: string
          property_address: string
          property_details?: string | null
          property_info?: string | null
          property_specific_info?: string | null
          property_type: string
          rehab_costs?: string | null
          repair_level?: string | null
          repairs_needed?: boolean | null
          under_contract?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_score?: number | null
          annual_income?: string | null
          arv_estimate?: string | null
          bank_balance?: string | null
          close_timeline?: string | null
          created_at?: string
          credit_score?: string
          current_value?: string | null
          financial_assets?: string[] | null
          funding_amount?: string
          funding_purpose?: string
          good_deal_criteria?: string | null
          id?: string
          income_sources?: string | null
          last_deal_profit?: string | null
          money_plans?: string | null
          owns_other_properties?: boolean | null
          past_deals?: boolean | null
          properties_count?: string
          property_address?: string
          property_details?: string | null
          property_info?: string | null
          property_specific_info?: string | null
          property_type?: string
          rehab_costs?: string | null
          repair_level?: string | null
          repairs_needed?: boolean | null
          under_contract?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deal_history: {
        Row: {
          city: string
          close_date: string | null
          created_at: string
          deal_status: string
          deal_value: number | null
          id: string
          profit_amount: number | null
          property_type: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          close_date?: string | null
          created_at?: string
          deal_status: string
          deal_value?: number | null
          id?: string
          profit_amount?: number | null
          property_type: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          close_date?: string | null
          created_at?: string
          deal_status?: string
          deal_value?: number | null
          id?: string
          profit_amount?: number | null
          property_type?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deal_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_reported: boolean
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_reported?: boolean
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_reported?: boolean
          likes_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          actively_seeking_funding: boolean | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          deals_completed: number | null
          display_name: string | null
          email: string
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          experience_level: string | null
          experience_summary: string | null
          first_name: string
          funding_eligibility_score: number | null
          id: string
          last_eligibility_update: string | null
          last_name: string
          linkedin_profile: string | null
          location: string | null
          market_focus: string | null
          phone: string | null
          preferred_asset_classes:
            | Database["public"]["Enums"]["asset_class"][]
            | null
          profile_bio: string | null
          property_focus: string[] | null
          role_title: string | null
          updated_at: string
          user_id: string
          years_active: number | null
        }
        Insert: {
          actively_seeking_funding?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          deals_completed?: number | null
          display_name?: string | null
          email: string
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          experience_level?: string | null
          experience_summary?: string | null
          first_name: string
          funding_eligibility_score?: number | null
          id?: string
          last_eligibility_update?: string | null
          last_name: string
          linkedin_profile?: string | null
          location?: string | null
          market_focus?: string | null
          phone?: string | null
          preferred_asset_classes?:
            | Database["public"]["Enums"]["asset_class"][]
            | null
          profile_bio?: string | null
          property_focus?: string[] | null
          role_title?: string | null
          updated_at?: string
          user_id: string
          years_active?: number | null
        }
        Update: {
          actively_seeking_funding?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          deals_completed?: number | null
          display_name?: string | null
          email?: string
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          experience_level?: string | null
          experience_summary?: string | null
          first_name?: string
          funding_eligibility_score?: number | null
          id?: string
          last_eligibility_update?: string | null
          last_name?: string
          linkedin_profile?: string | null
          location?: string | null
          market_focus?: string | null
          phone?: string | null
          preferred_asset_classes?:
            | Database["public"]["Enums"]["asset_class"][]
            | null
          profile_bio?: string | null
          property_focus?: string[] | null
          role_title?: string | null
          updated_at?: string
          user_id?: string
          years_active?: number | null
        }
        Relationships: []
      }
      saved_strategies: {
        Row: {
          id: string
          original_author_name: string
          original_content: string
          post_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          original_author_name: string
          original_content: string
          post_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          original_author_name?: string
          original_content?: string
          post_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_strategies_post_id_fkey"
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
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deals_completed: number | null
          display_name: string | null
          experience_level: string | null
          first_name: string | null
          last_name: string | null
          user_id: string | null
          years_active: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deals_completed?: number | null
          display_name?: string | null
          experience_level?: string | null
          first_name?: string | null
          last_name?: string | null
          user_id?: string | null
          years_active?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deals_completed?: number | null
          display_name?: string | null
          experience_level?: string | null
          first_name?: string | null
          last_name?: string | null
          user_id?: string | null
          years_active?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_full_profile: {
        Args: { _profile_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_email: {
        Args: { email: string }
        Returns: boolean
      }
      validate_financial_amount: {
        Args: { amount: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "investor" | "broker" | "lender"
      asset_class:
        | "fix_and_flip"
        | "multifamily"
        | "commercial"
        | "bridge"
        | "dscr_rental"
        | "construction"
        | "land_development"
      entity_type: "individual" | "llc" | "corporation" | "partnership"
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
      app_role: ["admin", "moderator", "investor", "broker", "lender"],
      asset_class: [
        "fix_and_flip",
        "multifamily",
        "commercial",
        "bridge",
        "dscr_rental",
        "construction",
        "land_development",
      ],
      entity_type: ["individual", "llc", "corporation", "partnership"],
    },
  },
} as const
