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
      appointments: {
        Row: {
          created_at: string
          customer_id: string | null
          duration_minutes: number
          id: string
          notes: string | null
          price: number
          product_id: string | null
          scheduled_at: string
          service_name: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          price?: number
          product_id?: string | null
          scheduled_at: string
          service_name: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          price?: number
          product_id?: string | null
          scheduled_at?: string
          service_name?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          created_at: string
          id: string
          message: string
          recipients_count: number
          sent_by: string
          status: string
          title: string
          webhook_response: Json
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          recipients_count?: number
          sent_by: string
          status?: string
          title: string
          webhook_response?: Json
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          recipients_count?: number
          sent_by?: string
          status?: string
          title?: string
          webhook_response?: Json
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          last_purchase_at: string | null
          name: string
          notes: string | null
          phone: string | null
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          last_purchase_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          last_purchase_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json
          created_at: string
          id: string
          message: string
          severity: string
          source: string
          user_id: string | null
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          message: string
          severity?: string
          source: string
          user_id?: string | null
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          message?: string
          severity?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          recurring: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          recurring?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          recurring?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      followups: {
        Row: {
          created_at: string
          customer_id: string | null
          due_at: string
          id: string
          message: string
          metadata: Json
          phone_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          due_at: string
          id?: string
          message: string
          metadata?: Json
          phone_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          due_at?: string
          id?: string
          message?: string
          metadata?: Json
          phone_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          min_quantity: number
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_quantity?: number
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          min_quantity?: number
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          cost: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_service: boolean
          name: string
          price: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_service?: boolean
          name: string
          price?: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          category?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_service?: boolean
          name?: string
          price?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          cnpj: string | null
          created_at: string
          full_name: string | null
          id: string
          monthly_goal: number | null
          onboarding_completed: boolean
          phone: string | null
          updated_at: string
          user_id: string
          welcome_tour_completed: boolean
          whatsapp_bot_enabled: boolean
          whatsapp_business_account_id: string | null
          whatsapp_connected_at: string | null
          whatsapp_onboarding_pending: boolean
          whatsapp_onboarding_sent_at: string | null
          whatsapp_phone_number_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          cnpj?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          monthly_goal?: number | null
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
          welcome_tour_completed?: boolean
          whatsapp_bot_enabled?: boolean
          whatsapp_business_account_id?: string | null
          whatsapp_connected_at?: string | null
          whatsapp_onboarding_pending?: boolean
          whatsapp_onboarding_sent_at?: string | null
          whatsapp_phone_number_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          cnpj?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          monthly_goal?: number | null
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
          welcome_tour_completed?: boolean
          whatsapp_bot_enabled?: boolean
          whatsapp_business_account_id?: string | null
          whatsapp_connected_at?: string | null
          whatsapp_onboarding_pending?: boolean
          whatsapp_onboarding_sent_at?: string | null
          whatsapp_phone_number_id?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sale_id: string
          subtotal?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sale_id?: string
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          discount: number
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          sold_at: string
          status: Database["public"]["Enums"]["sale_status"]
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sold_at?: string
          status?: Database["public"]["Enums"]["sale_status"]
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sold_at?: string
          status?: Database["public"]["Enums"]["sale_status"]
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      taxes: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          month_reference: string
          paid_at: string | null
          pix_code: string | null
          status: Database["public"]["Enums"]["tax_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          month_reference: string
          paid_at?: string | null
          pix_code?: string | null
          status?: Database["public"]["Enums"]["tax_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          month_reference?: string
          paid_at?: string | null
          pix_code?: string | null
          status?: Database["public"]["Enums"]["tax_status"]
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
      whatsapp_messages: {
        Row: {
          ai_intent: string | null
          ai_payload: Json
          body: string | null
          created_at: string
          customer_id: string | null
          direction: string
          error: string | null
          id: string
          media_url: string | null
          message_type: string
          phone_number: string
          raw_payload: Json
          status: string
          user_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          ai_intent?: string | null
          ai_payload?: Json
          body?: string | null
          created_at?: string
          customer_id?: string | null
          direction: string
          error?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          phone_number: string
          raw_payload?: Json
          status?: string
          user_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          ai_intent?: string | null
          ai_payload?: Json
          body?: string | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          error?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          phone_number?: string
          raw_payload?: Json
          status?: string
          user_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_metrics: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_whatsapp_sale: {
        Args: {
          p_action_data: Json
          p_business_type?: string
          p_conversation_text?: string
          p_customer_id: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      appointment_status:
        | "pendente"
        | "confirmado"
        | "concluido"
        | "cancelado"
        | "faltou"
      business_type:
        | "comercio"
        | "servicos"
        | "alimentacao"
        | "beleza"
        | "outros"
      payment_method:
        | "dinheiro"
        | "pix"
        | "cartao_credito"
        | "cartao_debito"
        | "boleto"
        | "transferencia"
        | "outro"
      sale_status: "pendente" | "pago" | "cancelado" | "reembolsado"
      tax_status: "pendente" | "pago" | "atrasado" | "vencido"
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
      app_role: ["admin", "user"],
      appointment_status: [
        "pendente",
        "confirmado",
        "concluido",
        "cancelado",
        "faltou",
      ],
      business_type: [
        "comercio",
        "servicos",
        "alimentacao",
        "beleza",
        "outros",
      ],
      payment_method: [
        "dinheiro",
        "pix",
        "cartao_credito",
        "cartao_debito",
        "boleto",
        "transferencia",
        "outro",
      ],
      sale_status: ["pendente", "pago", "cancelado", "reembolsado"],
      tax_status: ["pendente", "pago", "atrasado", "vencido"],
    },
  },
} as const
