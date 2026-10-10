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
      abandoned_carts: {
        Row: {
          cart_items: Json
          cart_total: number
          created_at: string
          customer_email: string
          customer_name: string | null
          id: string
          recovered: boolean
          recovery_email_sent: boolean
          recovery_email_sent_at: string | null
          store_id: string | null
          store_owner_id: string
          store_slug: string
          updated_at: string
        }
        Insert: {
          cart_items?: Json
          cart_total?: number
          created_at?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          recovered?: boolean
          recovery_email_sent?: boolean
          recovery_email_sent_at?: string | null
          store_id?: string | null
          store_owner_id: string
          store_slug: string
          updated_at?: string
        }
        Update: {
          cart_items?: Json
          cart_total?: number
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          recovered?: boolean
          recovery_email_sent?: boolean
          recovery_email_sent_at?: string | null
          store_id?: string | null
          store_owner_id?: string
          store_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string
          description: string | null
          icon: string
          id: string
          key: string
          title: string
          xp_reward: number
        }
        Insert: {
          condition_type: string
          condition_value?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key: string
          title: string
          xp_reward?: number
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          action_type: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          description: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      ai_agent_analytics: {
        Row: {
          ai_replies: number
          ai_success_rate: number
          avg_response_time_ms: number
          created_at: string
          date: string
          human_replies: number
          id: string
          sales_generated: number
          top_questions: Json | null
          total_conversations: number
          user_id: string
          voice_messages_processed: number
        }
        Insert: {
          ai_replies?: number
          ai_success_rate?: number
          avg_response_time_ms?: number
          created_at?: string
          date?: string
          human_replies?: number
          id?: string
          sales_generated?: number
          top_questions?: Json | null
          total_conversations?: number
          user_id: string
          voice_messages_processed?: number
        }
        Update: {
          ai_replies?: number
          ai_success_rate?: number
          avg_response_time_ms?: number
          created_at?: string
          date?: string
          human_replies?: number
          id?: string
          sales_generated?: number
          top_questions?: Json | null
          total_conversations?: number
          user_id?: string
          voice_messages_processed?: number
        }
        Relationships: []
      }
      ai_agent_settings: {
        Row: {
          auto_reply: boolean
          created_at: string
          custom_instructions: string
          darija_level: string
          enabled: boolean
          faq_entries: Json
          forbidden_words: string[] | null
          greeting_message: string
          id: string
          language_mode: string
          max_ai_turns: number
          personality: string
          reply_delay_seconds: number
          store_id: string | null
          suggest_human_takeover: boolean
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_reply?: boolean
          created_at?: string
          custom_instructions?: string
          darija_level?: string
          enabled?: boolean
          faq_entries?: Json
          forbidden_words?: string[] | null
          greeting_message?: string
          id?: string
          language_mode?: string
          max_ai_turns?: number
          personality?: string
          reply_delay_seconds?: number
          store_id?: string | null
          suggest_human_takeover?: boolean
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_reply?: boolean
          created_at?: string
          custom_instructions?: string
          darija_level?: string
          enabled?: boolean
          faq_entries?: Json
          forbidden_words?: string[] | null
          greeting_message?: string
          id?: string
          language_mode?: string
          max_ai_turns?: number
          personality?: string
          reply_delay_seconds?: number
          store_id?: string | null
          suggest_human_takeover?: boolean
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generations: {
        Row: {
          created_at: string
          credits_spent: number
          id: string
          input: Json
          output: Json
          tool: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_spent?: number
          id?: string
          input?: Json
          output?: Json
          tool: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_spent?: number
          id?: string
          input?: Json
          output?: Json
          tool?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_integrations: {
        Row: {
          created_at: string
          ga4_id: string
          id: string
          meta_pixel_id: string
          store_id: string | null
          tiktok_pixel_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ga4_id?: string
          id?: string
          meta_pixel_id?: string
          store_id?: string | null
          tiktok_pixel_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ga4_id?: string
          id?: string
          meta_pixel_id?: string
          store_id?: string | null
          tiktok_pixel_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_integrations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      app_purchases: {
        Row: {
          amount_paid: number
          app_id: string
          created_at: string
          id: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number
          app_id: string
          created_at?: string
          id?: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          app_id?: string
          created_at?: string
          id?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_purchases_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      app_reviews: {
        Row: {
          app_id: string
          comment: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          app_id: string
          comment?: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          app_id?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_reviews_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps"
            referencedColumns: ["id"]
          },
        ]
      }
      apps: {
        Row: {
          app_url: string
          category: string
          created_at: string
          developer_id: string
          icon_url: string | null
          id: string
          is_free: boolean
          long_description: string
          price: number
          rejection_reason: string | null
          screenshots: string[]
          short_description: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          app_url?: string
          category?: string
          created_at?: string
          developer_id: string
          icon_url?: string | null
          id?: string
          is_free?: boolean
          long_description?: string
          price?: number
          rejection_reason?: string | null
          screenshots?: string[]
          short_description?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          app_url?: string
          category?: string
          created_at?: string
          developer_id?: string
          icon_url?: string | null
          id?: string
          is_free?: boolean
          long_description?: string
          price?: number
          rejection_reason?: string | null
          screenshots?: string[]
          short_description?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      builtin_app_edits: {
        Row: {
          app_key: string
          created_at: string
          description: string | null
          long_description: string | null
          name: string | null
          screenshots: string[]
          updated_at: string
        }
        Insert: {
          app_key: string
          created_at?: string
          description?: string | null
          long_description?: string | null
          name?: string | null
          screenshots?: string[]
          updated_at?: string
        }
        Update: {
          app_key?: string
          created_at?: string
          description?: string | null
          long_description?: string | null
          name?: string | null
          screenshots?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      category_images: {
        Row: {
          category_name: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          store_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_name: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          store_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_name?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          store_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_images_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          store_owner_id: string
          store_slug: string
          updated_at: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          store_owner_id: string
          store_slug: string
          updated_at?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          store_owner_id?: string
          store_slug?: string
          updated_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          ai_model: string
          created_at: string
          enabled: boolean
          id: string
          knowledge_base: string
          primary_color: string
          store_id: string | null
          updated_at: string
          user_id: string
          welcome_message: string
        }
        Insert: {
          ai_model?: string
          created_at?: string
          enabled?: boolean
          id?: string
          knowledge_base?: string
          primary_color?: string
          store_id?: string | null
          updated_at?: string
          user_id: string
          welcome_message?: string
        }
        Update: {
          ai_model?: string
          created_at?: string
          enabled?: boolean
          id?: string
          knowledge_base?: string
          primary_color?: string
          store_id?: string | null
          updated_at?: string
          user_id?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_collections: {
        Row: {
          actual_transfer_date: string | null
          amount: number
          created_at: string | null
          customer_name: string | null
          delivery_company: string
          expected_transfer_date: string | null
          id: string
          merchant_id: string
          order_id: string | null
          status: string | null
          tracking_number: string | null
          transfer_reference: string | null
          updated_at: string | null
        }
        Insert: {
          actual_transfer_date?: string | null
          amount: number
          created_at?: string | null
          customer_name?: string | null
          delivery_company: string
          expected_transfer_date?: string | null
          id?: string
          merchant_id: string
          order_id?: string | null
          status?: string | null
          tracking_number?: string | null
          transfer_reference?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_transfer_date?: string | null
          amount?: number
          created_at?: string | null
          customer_name?: string | null
          delivery_company?: string
          expected_transfer_date?: string | null
          id?: string
          merchant_id?: string
          order_id?: string | null
          status?: string | null
          tracking_number?: string | null
          transfer_reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cod_collections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_transfers: {
        Row: {
          amount: number
          created_at: string | null
          delivery_company: string
          id: string
          merchant_id: string
          notes: string | null
          reference: string | null
          transfer_date: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          delivery_company: string
          id?: string
          merchant_id: string
          notes?: string | null
          reference?: string | null
          transfer_date: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          delivery_company?: string
          id?: string
          merchant_id?: string
          notes?: string | null
          reference?: string | null
          transfer_date?: string
        }
        Relationships: []
      }
      consent_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          store_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          store_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_audit_log_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          sender_email: string
          sender_name: string
          store_id: string | null
          store_owner_id: string
          store_slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          sender_email: string
          sender_name: string
          store_id?: string | null
          store_owner_id: string
          store_slug: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          sender_email?: string
          sender_name?: string
          store_id?: string | null
          store_owner_id?: string
          store_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consent_settings: {
        Row: {
          accept_all_text: string
          banner_text: string
          banner_title: string
          created_at: string
          enabled: boolean
          id: string
          manage_text: string
          position: string
          privacy_policy_url: string | null
          reject_all_text: string
          save_text: string
          store_id: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accept_all_text?: string
          banner_text?: string
          banner_title?: string
          created_at?: string
          enabled?: boolean
          id?: string
          manage_text?: string
          position?: string
          privacy_policy_url?: string | null
          reject_all_text?: string
          save_text?: string
          store_id: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accept_all_text?: string
          banner_text?: string
          banner_title?: string
          created_at?: string
          enabled?: boolean
          id?: string
          manage_text?: string
          position?: string
          privacy_policy_url?: string | null
          reject_all_text?: string
          save_text?: string
          store_id?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cookie_consent_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consents: {
        Row: {
          analytics: boolean
          created_at: string
          expires_at: string
          id: string
          marketing: boolean
          necessary: boolean
          preferences: boolean
          store_id: string
          visitor_id: string
        }
        Insert: {
          analytics?: boolean
          created_at?: string
          expires_at: string
          id?: string
          marketing?: boolean
          necessary?: boolean
          preferences?: boolean
          store_id: string
          visitor_id: string
        }
        Update: {
          analytics?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          marketing?: boolean
          necessary?: boolean
          preferences?: boolean
          store_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cookie_consents_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      currency_settings: {
        Row: {
          auto_detect: boolean
          base_currency: string
          created_at: string
          enabled_currencies: string[]
          id: string
          rates: Json
          store_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_detect?: boolean
          base_currency?: string
          created_at?: string
          enabled_currencies?: string[]
          id?: string
          rates?: Json
          store_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_detect?: boolean
          base_currency?: string
          created_at?: string
          enabled_currencies?: string[]
          id?: string
          rates?: Json
          store_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "currency_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          created_at: string
          detected_provider: string | null
          dns_records: Json
          domain: string
          domain_type: string
          error_message: string | null
          id: string
          is_primary: boolean
          last_checked_at: string | null
          ssl_active: boolean
          status: string
          store_id: string | null
          store_slug: string
          updated_at: string
          user_id: string
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          detected_provider?: string | null
          dns_records?: Json
          domain: string
          domain_type?: string
          error_message?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          ssl_active?: boolean
          status?: string
          store_id?: string | null
          store_slug: string
          updated_at?: string
          user_id: string
          verification_token: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          detected_provider?: string | null
          dns_records?: Json
          domain?: string
          domain_type?: string
          error_message?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          ssl_active?: boolean
          status?: string
          store_id?: string | null
          store_slug?: string
          updated_at?: string
          user_id?: string
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          delivery_method: string
          email: string
          file_url: string | null
          id: string
          request_type: string
          status: string
          store_id: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          delivery_method?: string
          email: string
          file_url?: string | null
          id?: string
          request_type?: string
          status?: string
          store_id: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          delivery_method?: string
          email?: string
          file_url?: string | null
          id?: string
          request_type?: string
          status?: string
          store_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      db_automations: {
        Row: {
          actions: Json
          created_at: string
          enabled: boolean
          id: string
          name: string
          table_id: string
          trigger: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          table_id: string
          trigger?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          table_id?: string
          trigger?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "db_automations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "db_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      db_fields: {
        Row: {
          created_at: string
          field_type: string
          id: string
          name: string
          options: Json
          position: number
          table_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_type: string
          id?: string
          name: string
          options?: Json
          position?: number
          table_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_type?: string
          id?: string
          name?: string
          options?: Json
          position?: number
          table_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "db_fields_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "db_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      db_records: {
        Row: {
          created_at: string
          data: Json
          id: string
          position: number
          table_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          position?: number
          table_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          position?: number
          table_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "db_records_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "db_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      db_tables: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          order_ids: string[] | null
          reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          store_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          order_ids?: string[] | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          order_ids?: string[] | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_companies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_tariffs: {
        Row: {
          city: string
          company_id: string | null
          created_at: string
          delivery_type: string
          id: string
          owner_id: string
          price: number
          store_id: string | null
          updated_at: string
          wilaya: string
        }
        Insert: {
          city?: string
          company_id?: string | null
          created_at?: string
          delivery_type?: string
          id?: string
          owner_id: string
          price?: number
          store_id?: string | null
          updated_at?: string
          wilaya: string
        }
        Update: {
          city?: string
          company_id?: string | null
          created_at?: string
          delivery_type?: string
          id?: string
          owner_id?: string
          price?: number
          store_id?: string | null
          updated_at?: string
          wilaya?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tariffs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "delivery_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tariffs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          display_name: string
          id: string
          stripe_connect_id: string | null
          updated_at: string
          user_id: string
          website: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          stripe_connect_id?: string | null
          updated_at?: string
          user_id: string
          website?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          stripe_connect_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          active: boolean
          applies_to: string
          applies_to_ids: string[]
          code: string
          created_at: string
          discount_type: string
          expires_at: string | null
          id: string
          min_order_value: number
          per_customer_limit: number | null
          store_id: string | null
          updated_at: string
          usage_limit: number | null
          used_count: number
          user_id: string
          value: number
        }
        Insert: {
          active?: boolean
          applies_to?: string
          applies_to_ids?: string[]
          code: string
          created_at?: string
          discount_type?: string
          expires_at?: string | null
          id?: string
          min_order_value?: number
          per_customer_limit?: number | null
          store_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          user_id: string
          value?: number
        }
        Update: {
          active?: boolean
          applies_to?: string
          applies_to_ids?: string[]
          code?: string
          created_at?: string
          discount_type?: string
          expires_at?: string | null
          id?: string
          min_order_value?: number
          per_customer_limit?: number | null
          store_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          audience_type: string
          created_at: string
          error: string | null
          failed_count: number
          id: string
          message: string
          recipients: string[]
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_type?: string
          created_at?: string
          error?: string | null
          failed_count?: number
          id?: string
          message: string
          recipients?: string[]
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_type?: string
          created_at?: string
          error?: string | null
          failed_count?: number
          id?: string
          message?: string
          recipients?: string[]
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          expense_date: string
          id: string
          note: string | null
          owner_id: string
          store_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          expense_date?: string
          id?: string
          note?: string | null
          owner_id: string
          store_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          note?: string | null
          owner_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_conversations: {
        Row: {
          ai_confidence: number | null
          created_at: string
          customer_instagram_id: string
          customer_name: string
          customer_profile_pic: string | null
          customer_username: string
          id: string
          instagram_conversation_id: string | null
          last_message_at: string | null
          last_message_text: string | null
          mode: string
          sentiment: string | null
          status: string
          tags: string[] | null
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string
          customer_instagram_id: string
          customer_name?: string
          customer_profile_pic?: string | null
          customer_username?: string
          id?: string
          instagram_conversation_id?: string | null
          last_message_at?: string | null
          last_message_text?: string | null
          mode?: string
          sentiment?: string | null
          status?: string
          tags?: string[] | null
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string
          customer_instagram_id?: string
          customer_name?: string
          customer_profile_pic?: string | null
          customer_username?: string
          id?: string
          instagram_conversation_id?: string | null
          last_message_at?: string | null
          last_message_text?: string | null
          mode?: string
          sentiment?: string | null
          status?: string
          tags?: string[] | null
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ig_messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          instagram_message_id: string | null
          is_ai_generated: boolean
          message_type: string
          metadata: Json | null
          read: boolean
          sender_type: string
          user_id: string
          voice_audio_url: string | null
          voice_transcript: string | null
        }
        Insert: {
          attachments?: Json | null
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          instagram_message_id?: string | null
          is_ai_generated?: boolean
          message_type?: string
          metadata?: Json | null
          read?: boolean
          sender_type?: string
          user_id: string
          voice_audio_url?: string | null
          voice_transcript?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          instagram_message_id?: string | null
          is_ai_generated?: boolean
          message_type?: string
          metadata?: Json | null
          read?: boolean
          sender_type?: string
          user_id?: string
          voice_audio_url?: string | null
          voice_transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ig_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ig_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_connections: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          instagram_user_id: string | null
          instagram_username: string | null
          last_synced_at: string | null
          page_id: string | null
          page_name: string | null
          profile_picture_url: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          instagram_user_id?: string | null
          instagram_username?: string | null
          last_synced_at?: string | null
          page_id?: string | null
          page_name?: string | null
          profile_picture_url?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          instagram_user_id?: string | null
          instagram_username?: string | null
          last_synced_at?: string | null
          page_id?: string | null
          page_name?: string | null
          profile_picture_url?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      installed_apps: {
        Row: {
          app_key: string
          id: string
          installed_at: string
          store_id: string | null
          user_id: string
        }
        Insert: {
          app_key: string
          id?: string
          installed_at?: string
          store_id?: string | null
          user_id: string
        }
        Update: {
          app_key?: string
          id?: string
          installed_at?: string
          store_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installed_apps_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          delivery_update: boolean
          low_stock: boolean
          new_order: boolean
          order_status: boolean
          payment: boolean
          sound_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          delivery_update?: boolean
          low_stock?: boolean
          new_order?: boolean
          order_status?: boolean
          payment?: boolean
          sound_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          delivery_update?: boolean
          low_stock?: boolean
          new_order?: boolean
          order_status?: boolean
          payment?: boolean
          sound_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_state_nonces: {
        Row: {
          created_at: string
          expires_at: string
          nonce: string
          provider: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          nonce: string
          provider: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          nonce?: string
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      order_costs: {
        Row: {
          delivery_cost: number
          order_id: string
          owner_id: string
          return_cost: number
          store_id: string
          updated_at: string
        }
        Insert: {
          delivery_cost?: number
          order_id: string
          owner_id: string
          return_cost?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          delivery_cost?: number
          order_id?: string
          owner_id?: string
          return_cost?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_costs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_costs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_scan_logs: {
        Row: {
          confidence: string
          created_at: string
          id: string
          items_found: number
          user_id: string
        }
        Insert: {
          confidence?: string
          created_at?: string
          id?: string
          items_found?: number
          user_id: string
        }
        Update: {
          confidence?: string
          created_at?: string
          id?: string
          items_found?: number
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          bordereau_fetched_at: string | null
          chargily_checkout_id: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_type: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_postal_code: string
          shipping_wilaya: string | null
          source: string
          status: string
          store_id: string | null
          store_owner_id: string
          store_slug: string
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          zr_colis_id: string | null
        }
        Insert: {
          bordereau_fetched_at?: string | null
          chargily_checkout_id?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_type?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_postal_code: string
          shipping_wilaya?: string | null
          source?: string
          status?: string
          store_id?: string | null
          store_owner_id: string
          store_slug: string
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          zr_colis_id?: string | null
        }
        Update: {
          bordereau_fetched_at?: string | null
          chargily_checkout_id?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_type?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_country?: string
          shipping_postal_code?: string
          shipping_wilaya?: string | null
          source?: string
          status?: string
          store_id?: string | null
          store_owner_id?: string
          store_slug?: string
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          zr_colis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_auto_verify_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          pattern: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          pattern?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          pattern?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string
          currency: string
          enabled: boolean
          payout_email: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          enabled?: boolean
          payout_email?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          enabled?: boolean
          payout_email?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          plan: string
          proof_url: string
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          plan: string
          proof_url: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          plan?: string
          proof_url?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      popups: {
        Row: {
          active: boolean
          background_color: string
          content: string
          created_at: string
          cta_label: string
          cta_url: string
          id: string
          store_id: string | null
          text_color: string
          title: string
          trigger_type: string
          trigger_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          background_color?: string
          content?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          id?: string
          store_id?: string | null
          text_color?: string
          title?: string
          trigger_type?: string
          trigger_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          background_color?: string
          content?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          id?: string
          store_id?: string | null
          text_color?: string
          title?: string
          trigger_type?: string
          trigger_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "popups_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_policy_settings: {
        Row: {
          created_at: string
          custom_html: string | null
          enabled: boolean
          id: string
          last_updated: string
          sections: Json
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_html?: string | null
          enabled?: boolean
          id?: string
          last_updated?: string
          sections?: Json
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_html?: string | null
          enabled?: boolean
          id?: string
          last_updated?: string
          sections?: Json
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_policy_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_costs: {
        Row: {
          cost_price: number
          owner_id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          cost_price: number
          owner_id: string
          product_id: string
          updated_at?: string
        }
        Update: {
          cost_price?: number
          owner_id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          id: string
          product_id: string
          rating: number
          reply: string | null
          status: string
          store_owner_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          id?: string
          product_id: string
          rating: number
          reply?: string | null
          status?: string
          store_owner_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          id?: string
          product_id?: string
          rating?: number
          reply?: string | null
          status?: string
          store_owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: string[]
          low_stock_threshold: number
          name: string
          price: number
          sale_price: number | null
          sales_count: number
          sku: string | null
          source: string | null
          source_url: string | null
          status: string
          stock: number
          stock_alert_sent_at: string | null
          store_id: string | null
          tags: string[]
          updated_at: string
          user_id: string
          variants: Json
          weight: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[]
          low_stock_threshold?: number
          name: string
          price?: number
          sale_price?: number | null
          sales_count?: number
          sku?: string | null
          source?: string | null
          source_url?: string | null
          status?: string
          stock?: number
          stock_alert_sent_at?: string | null
          store_id?: string | null
          tags?: string[]
          updated_at?: string
          user_id: string
          variants?: Json
          weight?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[]
          low_stock_threshold?: number
          name?: string
          price?: number
          sale_price?: number | null
          sales_count?: number
          sku?: string | null
          source?: string | null
          source_url?: string | null
          status?: string
          stock?: number
          stock_alert_sent_at?: string | null
          store_id?: string | null
          tags?: string[]
          updated_at?: string
          user_id?: string
          variants?: Json
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits: number
          current_store_id: string | null
          email: string | null
          id: string
          name: string | null
          onboarded: boolean
          onboarding_completed: boolean
          plan: string
          plan_renews_at: string | null
          referral_code: string | null
          referred_by: string | null
          source_of_user: string | null
          subscription_end_date: string | null
          subscription_status: string
          subscription_type: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_wilaya: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          current_store_id?: string | null
          email?: string | null
          id: string
          name?: string | null
          onboarded?: boolean
          onboarding_completed?: boolean
          plan?: string
          plan_renews_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          source_of_user?: string | null
          subscription_end_date?: string | null
          subscription_status?: string
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_wilaya?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits?: number
          current_store_id?: string | null
          email?: string | null
          id?: string
          name?: string | null
          onboarded?: boolean
          onboarding_completed?: boolean
          plan?: string
          plan_renews_at?: string | null
          referral_code?: string | null
          referred_by?: string | null
          source_of_user?: string | null
          subscription_end_date?: string | null
          subscription_status?: string
          subscription_type?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_store_id_fkey"
            columns: ["current_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string
          p256dh: string
          store_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string
          p256dh: string
          store_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string
          p256dh?: string
          store_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          key: string
          requirements: Json | null
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key: string
          requirements?: Json | null
          title: string
          type: string
          xp_reward: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key?: string
          requirements?: Json | null
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referee_id: string
          referrer_id: string
          reward_granted: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          referee_id: string
          referrer_id: string
          reward_granted?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          referee_id?: string
          referrer_id?: string
          reward_granted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          details: string | null
          id: string
          order_id: string
          reason: string
          refund_amount: number
          status: string
          store_owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          details?: string | null
          id?: string
          order_id: string
          reason: string
          refund_amount?: number
          status?: string
          store_owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          details?: string | null
          id?: string
          order_id?: string
          reason?: string
          refund_amount?: number
          status?: string
          store_owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      section_templates: {
        Row: {
          block_key: string
          category: string
          created_at: string
          id: string
          name: string
          props: Json
          style_overrides: Json
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          block_key: string
          category?: string
          created_at?: string
          id?: string
          name: string
          props?: Json
          style_overrides?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          block_key?: string
          category?: string
          created_at?: string
          id?: string
          name?: string
          props?: Json
          style_overrides?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          created_at: string
          id: string
          keywords: string
          meta_description: string
          meta_title: string
          og_image_url: string | null
          sitemap_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keywords?: string
          meta_description?: string
          meta_title?: string
          og_image_url?: string | null
          sitemap_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keywords?: string
          meta_description?: string
          meta_title?: string
          og_image_url?: string | null
          sitemap_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          bordereau_fetched_at: string | null
          company_id: string | null
          created_at: string
          delivery_type: string
          id: string
          last_error: string | null
          last_sync_at: string | null
          order_id: string
          provider_response: Json | null
          status: string
          store_id: string
          tracking_number: string
          updated_at: string
          zr_colis_id: string | null
        }
        Insert: {
          bordereau_fetched_at?: string | null
          company_id?: string | null
          created_at?: string
          delivery_type?: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          order_id: string
          provider_response?: Json | null
          status?: string
          store_id: string
          tracking_number?: string
          updated_at?: string
          zr_colis_id?: string | null
        }
        Update: {
          bordereau_fetched_at?: string | null
          company_id?: string | null
          created_at?: string
          delivery_type?: string
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          order_id?: string
          provider_response?: Json | null
          status?: string
          store_id?: string
          tracking_number?: string
          updated_at?: string
          zr_colis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "delivery_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      store_contact_info: {
        Row: {
          contact_email: string
          contact_phone: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_delivery_companies: {
        Row: {
          api_key: string
          api_secret: string
          company_id: string
          created_at: string
          enabled: boolean
          id: string
          is_default: boolean
          store_id: string
          updated_at: string
        }
        Insert: {
          api_key?: string
          api_secret?: string
          company_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          store_id: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          api_secret?: string
          company_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_delivery_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "delivery_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      store_languages: {
        Row: {
          created_at: string
          default_language: string
          enabled_languages: string[]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_language?: string
          enabled_languages?: string[]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_language?: string
          enabled_languages?: string[]
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          about_content: string
          about_image_url: string | null
          about_title: string
          accent_color: string
          background_color: string
          border_radius: string
          button_labels: Json
          button_style: string
          chargily_enabled: boolean | null
          contact_address: string
          contact_form_enabled: boolean
          contact_intro: string
          contact_map_url: string
          created_at: string
          currency: string
          custom_css: string | null
          font_family: string
          footer_about: string
          footer_copyright: string
          footer_socials: Json
          footer_style: string
          hero_cta_label: string
          hero_heading: string
          hero_image_url: string | null
          hero_layout: string
          hero_subheading: string
          is_active: boolean
          logo_url: string | null
          nav_links: Json
          navbar_style: string
          primary_color: string
          secondary_color: string
          section_order: string[]
          section_titles: Json
          sections: Json
          show_categories: boolean
          show_featured: boolean
          show_hero: boolean
          show_newsletter: boolean
          show_search: boolean
          slug: string
          store_id: string | null
          store_name: string
          tagline: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          about_content?: string
          about_image_url?: string | null
          about_title?: string
          accent_color?: string
          background_color?: string
          border_radius?: string
          button_labels?: Json
          button_style?: string
          chargily_enabled?: boolean | null
          contact_address?: string
          contact_form_enabled?: boolean
          contact_intro?: string
          contact_map_url?: string
          created_at?: string
          currency?: string
          custom_css?: string | null
          font_family?: string
          footer_about?: string
          footer_copyright?: string
          footer_socials?: Json
          footer_style?: string
          hero_cta_label?: string
          hero_heading?: string
          hero_image_url?: string | null
          hero_layout?: string
          hero_subheading?: string
          is_active?: boolean
          logo_url?: string | null
          nav_links?: Json
          navbar_style?: string
          primary_color?: string
          secondary_color?: string
          section_order?: string[]
          section_titles?: Json
          sections?: Json
          show_categories?: boolean
          show_featured?: boolean
          show_hero?: boolean
          show_newsletter?: boolean
          show_search?: boolean
          slug: string
          store_id?: string | null
          store_name?: string
          tagline?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          about_content?: string
          about_image_url?: string | null
          about_title?: string
          accent_color?: string
          background_color?: string
          border_radius?: string
          button_labels?: Json
          button_style?: string
          chargily_enabled?: boolean | null
          contact_address?: string
          contact_form_enabled?: boolean
          contact_intro?: string
          contact_map_url?: string
          created_at?: string
          currency?: string
          custom_css?: string | null
          font_family?: string
          footer_about?: string
          footer_copyright?: string
          footer_socials?: Json
          footer_style?: string
          hero_cta_label?: string
          hero_heading?: string
          hero_image_url?: string | null
          hero_layout?: string
          hero_subheading?: string
          is_active?: boolean
          logo_url?: string | null
          nav_links?: Json
          navbar_style?: string
          primary_color?: string
          secondary_color?: string
          section_order?: string[]
          section_titles?: Json
          sections?: Json
          show_categories?: boolean
          show_featured?: boolean
          show_hero?: boolean
          show_newsletter?: boolean
          show_search?: boolean
          slug?: string
          store_id?: string | null
          store_name?: string
          tagline?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          category: string
          created_at: string
          currency: string
          description: string
          id: string
          is_active: boolean
          is_default: boolean
          logo_url: string | null
          name: string
          owner_id: string
          slug: string | null
          telegram_chat_id: string | null
          telegram_link_token: string | null
          telegram_link_token_expires_at: string | null
          tiktok_pixel_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          logo_url?: string | null
          name?: string
          owner_id: string
          slug?: string | null
          telegram_chat_id?: string | null
          telegram_link_token?: string | null
          telegram_link_token_expires_at?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string | null
          telegram_chat_id?: string | null
          telegram_link_token?: string | null
          telegram_link_token_expires_at?: string | null
          tiktok_pixel_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      supply_marketplace_products: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          images: string[]
          name: string
          price: number
          status: string
          stock: number
          suggested_price: number
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          images?: string[]
          name: string
          price: number
          status?: string
          stock?: number
          suggested_price: number
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          images?: string[]
          name?: string
          price?: number
          status?: string
          stock?: number
          suggested_price?: number
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      supply_orders: {
        Row: {
          created_at: string
          id: string
          quantity: number
          status: string
          store_id: string | null
          supply_product_id: string
          total_price: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          status?: string
          store_id?: string | null
          supply_product_id: string
          total_price: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          status?: string
          store_id?: string | null
          supply_product_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_orders_supply_product_id_fkey"
            columns: ["supply_product_id"]
            isOneToOne: false
            referencedRelation: "supply_marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invite_token: string
          invited_at: string
          owner_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invite_token?: string
          invited_at?: string
          owner_id: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invite_token?: string
          invited_at?: string
          owner_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string
          id: string
          key: string
          language: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          language: string
          updated_at?: string
          user_id: string
          value?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          language?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      unlockables: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          key: string
          name: string
          requirement_type: string
          requirement_value: number
          reward_data: Json | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key: string
          name: string
          requirement_type: string
          requirement_value?: number
          reward_data?: Json | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          reward_data?: Json | null
          type?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          shared: boolean
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          shared?: boolean
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          shared?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          current_streak: number
          id: string
          last_active_date: string | null
          level: number
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quests: {
        Row: {
          claimed: boolean
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          period_start: string
          progress: number
          quest_id: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          period_start?: string
          progress?: number
          quest_id: string
          target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          period_start?: string
          progress?: number
          quest_id?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      user_supply_listings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          selling_price: number
          store_id: string | null
          supply_product_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          selling_price: number
          store_id?: string | null
          supply_product_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          selling_price?: number
          store_id?: string | null
          supply_product_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_supply_listings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_supply_listings_supply_product_id_fkey"
            columns: ["supply_product_id"]
            isOneToOne: false
            referencedRelation: "supply_marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_unlocks: {
        Row: {
          equipped: boolean
          id: string
          unlockable_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          equipped?: boolean
          id?: string
          unlockable_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          equipped?: boolean
          id?: string
          unlockable_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unlocks_unlockable_id_fkey"
            columns: ["unlockable_id"]
            isOneToOne: false
            referencedRelation: "unlockables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_plan: {
        Args: { _credits: number; _plan: string; _user_id: string }
        Returns: undefined
      }
      apply_referral_bonus: {
        Args: { _referee_id: string; _referrer_id: string }
        Returns: undefined
      }
      calculate_level: { Args: { xp: number }; Returns: number }
      consume_credits: {
        Args: { _amount: number; _metadata?: Json; _reason: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      disconnect_store_telegram: {
        Args: { _store_id: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_referral_code: { Args: never; Returns: string }
      get_store_contact_info: {
        Args: { _slug: string }
        Returns: {
          contact_email: string
          contact_phone: string
        }[]
      }
      get_xp_for_level: { Args: { level: number }; Returns: number }
      grant_credits: {
        Args: {
          _amount: number
          _metadata?: Json
          _reason: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      store_telegram_connected: {
        Args: { _store_id: string }
        Returns: boolean
      }
      user_owns_store: { Args: { _store_id: string }; Returns: boolean }
      validate_discount_code: {
        Args: { _code: string; _user_id: string }
        Returns: {
          active: boolean
          code: string
          discount_type: string
          expires_at: string
          id: string
          usage_limit: number
          used_count: number
          value: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "marketplace_admin"
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
      app_role: ["admin", "user", "marketplace_admin"],
    },
  },
} as const
