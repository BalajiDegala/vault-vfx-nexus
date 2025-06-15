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
      artist_task_access: {
        Row: {
          artist_id: string
          artist_notes: string | null
          files_accessed: Json | null
          id: string
          last_accessed: string | null
          progress_status: string | null
          shared_task_id: string
        }
        Insert: {
          artist_id: string
          artist_notes?: string | null
          files_accessed?: Json | null
          id?: string
          last_accessed?: string | null
          progress_status?: string | null
          shared_task_id: string
        }
        Update: {
          artist_id?: string
          artist_notes?: string | null
          files_accessed?: Json | null
          id?: string
          last_accessed?: string | null
          progress_status?: string | null
          shared_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_task_access_shared_task_id_fkey"
            columns: ["shared_task_id"]
            isOneToOne: false
            referencedRelation: "shared_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_bookmarks: {
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
            foreignKeyName: "community_post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
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
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          attachments: Json | null
          author_id: string
          bookmarks_count: number
          category: string | null
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          mentioned_users: string[] | null
          trending: boolean | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          bookmarks_count?: number
          category?: string | null
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          mentioned_users?: string[] | null
          trending?: boolean | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          bookmarks_count?: number
          category?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          mentioned_users?: string[] | null
          trending?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dcv_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          status: string
          updated_at: string
          user_id: string
          vm_instance_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          status?: string
          updated_at?: string
          user_id: string
          vm_instance_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          status?: string
          updated_at?: string
          user_id?: string
          vm_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dcv_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dcv_sessions_vm_instance_id_fkey"
            columns: ["vm_instance_id"]
            isOneToOne: false
            referencedRelation: "vm_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      filter_presets: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      infrastructure_billing: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          billing_type: string
          charged_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          rate: number
          resource_id: string
          status: string
          total_cost: number
          transaction_id: string | null
          usage_amount: number
          user_id: string
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          billing_type: string
          charged_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          rate: number
          resource_id: string
          status?: string
          total_cost: number
          transaction_id?: string | null
          usage_amount: number
          user_id: string
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          billing_type?: string
          charged_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          rate?: number
          resource_id?: string
          status?: string
          total_cost?: number
          transaction_id?: string | null
          usage_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_billing_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v3c_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infrastructure_billing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          category: Database["public"]["Enums"]["marketplace_category"]
          created_at: string
          description: string
          downloads: number | null
          files: Json | null
          id: string
          image_url: string | null
          price: number
          rating: number | null
          seller_id: string
          status: string | null
          tags: string[] | null
          title: string
          total_ratings: number | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["marketplace_category"]
          created_at?: string
          description: string
          downloads?: number | null
          files?: Json | null
          id?: string
          image_url?: string | null
          price: number
          rating?: number | null
          seller_id: string
          status?: string | null
          tags?: string[] | null
          title: string
          total_ratings?: number | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["marketplace_category"]
          created_at?: string
          description?: string
          downloads?: number | null
          files?: Json | null
          id?: string
          image_url?: string | null
          price?: number
          rating?: number | null
          seller_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          total_ratings?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_purchases: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          item_id: string
          price_paid: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          item_id: string
          price_paid: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          item_id?: string
          price_paid?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_ratings: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          item_id: string
          rating: number
          review: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          item_id: string
          rating: number
          review?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          item_id?: string
          rating?: number
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_ratings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string
          id: string
          project_id: string
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string
          id?: string
          project_id: string
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          milestone_name: string | null
          payee_id: string
          payer_id: string
          project_id: string
          released_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          milestone_name?: string | null
          payee_id: string
          payer_id: string
          project_id: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          milestone_name?: string | null
          payee_id?: string
          payer_id?: string
          project_id?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_machines: {
        Row: {
          available_ram_gb: number
          available_storage_gb: number
          cpu_cores: number
          created_at: string | null
          dcv_enabled: boolean | null
          gpu_memory_gb: number | null
          gpu_model: string | null
          hostname: string
          id: string
          ip_address: unknown
          location: string | null
          name: string
          status: string
          total_ram_gb: number
          total_storage_gb: number
          updated_at: string | null
        }
        Insert: {
          available_ram_gb: number
          available_storage_gb: number
          cpu_cores: number
          created_at?: string | null
          dcv_enabled?: boolean | null
          gpu_memory_gb?: number | null
          gpu_model?: string | null
          hostname: string
          id?: string
          ip_address: unknown
          location?: string | null
          name: string
          status?: string
          total_ram_gb: number
          total_storage_gb: number
          updated_at?: string | null
        }
        Update: {
          available_ram_gb?: number
          available_storage_gb?: number
          cpu_cores?: number
          created_at?: string | null
          dcv_enabled?: boolean | null
          gpu_memory_gb?: number | null
          gpu_model?: string | null
          hostname?: string
          id?: string
          ip_address?: unknown
          location?: string | null
          name?: string
          status?: string
          total_ram_gb?: number
          total_storage_gb?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          file_url: string | null
          id: string
          image_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          first_name: string | null
          followers_count: number | null
          following_count: number | null
          hourly_rate: number | null
          id: string
          last_name: string | null
          last_seen: string | null
          location: string | null
          online_status: string | null
          portfolio_count: number | null
          skills: string[] | null
          updated_at: string
          username: string | null
          v3_coins_balance: number | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          hourly_rate?: number | null
          id: string
          last_name?: string | null
          last_seen?: string | null
          location?: string | null
          online_status?: string | null
          portfolio_count?: number | null
          skills?: string[] | null
          updated_at?: string
          username?: string | null
          v3_coins_balance?: number | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          hourly_rate?: number | null
          id?: string
          last_name?: string | null
          last_seen?: string | null
          location?: string | null
          online_status?: string | null
          portfolio_count?: number | null
          skills?: string[] | null
          updated_at?: string
          username?: string | null
          v3_coins_balance?: number | null
          website?: string | null
        }
        Relationships: []
      }
      project_access: {
        Row: {
          access_level: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          currency: string | null
          id: string
          project_id: string
          proposal: string | null
          timeline_days: number | null
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          currency?: string | null
          id?: string
          project_id: string
          proposal?: string | null
          timeline_days?: number | null
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          project_id?: string
          proposal?: string | null
          timeline_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          project_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          project_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          project_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          project_id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          project_id: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          project_id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_presence: {
        Row: {
          current_section: string | null
          id: string
          last_seen: string
          project_id: string
          status: string
          user_id: string
        }
        Insert: {
          current_section?: string | null
          id?: string
          last_seen?: string
          project_id: string
          status?: string
          user_id: string
        }
        Update: {
          current_section?: string | null
          id?: string
          last_seen?: string
          project_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_presence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          metadata: Json | null
          project_id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          reason?: string | null
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_status_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_status_transitions: {
        Row: {
          allowed_roles: string[] | null
          auto_notification: boolean | null
          created_at: string
          from_status: string
          id: string
          requires_approval: boolean | null
          to_status: string
        }
        Insert: {
          allowed_roles?: string[] | null
          auto_notification?: boolean | null
          created_at?: string
          from_status: string
          id?: string
          requires_approval?: boolean | null
          to_status: string
        }
        Update: {
          allowed_roles?: string[] | null
          auto_notification?: boolean | null
          created_at?: string
          from_status?: string
          id?: string
          requires_approval?: boolean | null
          to_status?: string
        }
        Relationships: []
      }
      project_statuses: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_status: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_status?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_status?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          budget_max: number | null
          budget_min: number | null
          client_id: string
          created_at: string
          currency: string | null
          data_layers: string[] | null
          deadline: string | null
          description: string | null
          id: string
          milestones: Json | null
          parent_project_id: string | null
          project_code: string | null
          project_type: string | null
          security_level: string | null
          skills_required: string[] | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          client_id: string
          created_at?: string
          currency?: string | null
          data_layers?: string[] | null
          deadline?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          parent_project_id?: string | null
          project_code?: string | null
          project_type?: string | null
          security_level?: string | null
          skills_required?: string[] | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string
          created_at?: string
          currency?: string | null
          data_layers?: string[] | null
          deadline?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          parent_project_id?: string | null
          project_code?: string | null
          project_type?: string | null
          security_level?: string | null
          skills_required?: string[] | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_parent_project_id_fkey"
            columns: ["parent_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequences_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_tasks: {
        Row: {
          access_level: string
          approved_at: string | null
          approved_by: string | null
          artist_id: string
          id: string
          notes: string | null
          shared_at: string
          status: string
          studio_id: string
          task_id: string
        }
        Insert: {
          access_level?: string
          approved_at?: string | null
          approved_by?: string | null
          artist_id: string
          id?: string
          notes?: string | null
          shared_at?: string
          status?: string
          studio_id: string
          task_id: string
        }
        Update: {
          access_level?: string
          approved_at?: string | null
          approved_by?: string | null
          artist_id?: string
          id?: string
          notes?: string | null
          shared_at?: string
          status?: string
          studio_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          frame_end: number
          frame_start: number
          id: string
          name: string
          sequence_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          frame_end?: number
          frame_start?: number
          id?: string
          name: string
          sequence_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          frame_end?: number
          frame_start?: number
          id?: string
          name?: string
          sequence_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shots_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shots_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_allocations: {
        Row: {
          access_key: string | null
          allocation_name: string
          created_at: string | null
          endpoint_url: string | null
          id: string
          monthly_rate: number
          secret_key: string | null
          size_gb: number
          status: string
          storage_type: string
          terminated_at: string | null
          used_gb: number | null
          user_id: string
        }
        Insert: {
          access_key?: string | null
          allocation_name: string
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          monthly_rate: number
          secret_key?: string | null
          size_gb: number
          status?: string
          storage_type?: string
          terminated_at?: string | null
          used_gb?: number | null
          user_id: string
        }
        Update: {
          access_key?: string | null
          allocation_name?: string
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          monthly_rate?: number
          secret_key?: string | null
          size_gb?: number
          status?: string
          storage_type?: string
          terminated_at?: string | null
          used_gb?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_allocations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_size_gb: number
          min_size_gb: number
          monthly_rate_per_gb: number
          name: string
          sort_order: number | null
          storage_type: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_size_gb: number
          min_size_gb: number
          monthly_rate_per_gb: number
          name: string
          sort_order?: number | null
          storage_type: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_size_gb?: number
          min_size_gb?: number
          monthly_rate_per_gb?: number
          name?: string
          sort_order?: number | null
          storage_type?: string
        }
        Relationships: []
      }
      storage_usage_logs: {
        Row: {
          created_at: string | null
          daily_cost: number
          date: string
          id: string
          monthly_rate: number
          storage_allocation_id: string
          used_gb: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_cost: number
          date: string
          id?: string
          monthly_rate: number
          storage_allocation_id: string
          used_gb: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_cost?: number
          date?: string
          id?: string
          monthly_rate?: number
          storage_allocation_id?: string
          used_gb?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_usage_logs_storage_allocation_id_fkey"
            columns: ["storage_allocation_id"]
            isOneToOne: false
            referencedRelation: "storage_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          name: string
          priority: string
          shot_id: string
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          name: string
          priority?: string
          shot_id: string
          status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          name?: string
          priority?: string
          shot_id?: string
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_shot_id_fkey"
            columns: ["shot_id"]
            isOneToOne: false
            referencedRelation: "shots"
            referencedColumns: ["id"]
          },
        ]
      }
      trending_hashtags: {
        Row: {
          hashtag: string
          last_updated: string | null
          post_count: number | null
          user_count: number | null
        }
        Insert: {
          hashtag: string
          last_updated?: string | null
          post_count?: number | null
          user_count?: number | null
        }
        Update: {
          hashtag?: string
          last_updated?: string | null
          post_count?: number | null
          user_count?: number | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
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
      v3c_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          project_id: string | null
          related_user_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          related_user_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          related_user_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      vm_instances: {
        Row: {
          cpu_cores: number
          created_at: string | null
          dcv_connection_url: string | null
          dcv_session_id: string | null
          gpu_allocated: boolean | null
          hourly_rate: number
          id: string
          last_activity: string | null
          physical_machine_id: string
          ram_gb: number
          status: string
          storage_gb: number
          terminated_at: string | null
          total_cost: number | null
          user_id: string
          vm_name: string
          vm_plan_name: string
        }
        Insert: {
          cpu_cores: number
          created_at?: string | null
          dcv_connection_url?: string | null
          dcv_session_id?: string | null
          gpu_allocated?: boolean | null
          hourly_rate: number
          id?: string
          last_activity?: string | null
          physical_machine_id: string
          ram_gb: number
          status?: string
          storage_gb: number
          terminated_at?: string | null
          total_cost?: number | null
          user_id: string
          vm_name: string
          vm_plan_name: string
        }
        Update: {
          cpu_cores?: number
          created_at?: string | null
          dcv_connection_url?: string | null
          dcv_session_id?: string | null
          gpu_allocated?: boolean | null
          hourly_rate?: number
          id?: string
          last_activity?: string | null
          physical_machine_id?: string
          ram_gb?: number
          status?: string
          storage_gb?: number
          terminated_at?: string | null
          total_cost?: number | null
          user_id?: string
          vm_name?: string
          vm_plan_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vm_instances_physical_machine_id_fkey"
            columns: ["physical_machine_id"]
            isOneToOne: false
            referencedRelation: "physical_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vm_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vm_plans: {
        Row: {
          cpu_cores: number
          created_at: string | null
          currency: string | null
          description: string | null
          display_name: string
          gpu_included: boolean | null
          gpu_model: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          max_instances_per_user: number | null
          name: string
          ram_gb: number
          sort_order: number | null
          storage_gb: number
          updated_at: string | null
        }
        Insert: {
          cpu_cores: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name: string
          gpu_included?: boolean | null
          gpu_model?: string | null
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          max_instances_per_user?: number | null
          name: string
          ram_gb: number
          sort_order?: number | null
          storage_gb: number
          updated_at?: string | null
        }
        Update: {
          cpu_cores?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_name?: string
          gpu_included?: boolean | null
          gpu_model?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          max_instances_per_user?: number | null
          name?: string
          ram_gb?: number
          sort_order?: number | null
          storage_gb?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      vm_usage_logs: {
        Row: {
          cost: number | null
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          hourly_rate: number
          id: string
          start_time: string
          status: string
          user_id: string
          vm_instance_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hourly_rate: number
          id?: string
          start_time: string
          status: string
          user_id: string
          vm_instance_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hourly_rate?: number
          id?: string
          start_time?: string
          status?: string
          user_id?: string
          vm_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vm_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vm_usage_logs_vm_instance_id_fkey"
            columns: ["vm_instance_id"]
            isOneToOne: false
            referencedRelation: "vm_instances"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      process_v3c_donation: {
        Args: {
          sender_id: string
          receiver_id: string
          v3c_amount: number
          tx_type?: string
          meta?: Json
        }
        Returns: Json
      }
      process_v3c_transaction: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: string
          p_metadata?: Json
          p_transaction_id?: string
        }
        Returns: Json
      }
      update_hashtag_count: {
        Args: { hashtag_name: string }
        Returns: undefined
      }
      validate_project_status_transition: {
        Args: {
          p_project_id: string
          p_from_status: string
          p_to_status: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "artist" | "studio" | "producer" | "admin"
      marketplace_category: "training" | "assets" | "templates" | "services"
      payment_status:
        | "pending"
        | "escrow"
        | "released"
        | "disputed"
        | "cancelled"
      project_status:
        | "draft"
        | "open"
        | "in_progress"
        | "review"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["artist", "studio", "producer", "admin"],
      marketplace_category: ["training", "assets", "templates", "services"],
      payment_status: [
        "pending",
        "escrow",
        "released",
        "disputed",
        "cancelled",
      ],
      project_status: [
        "draft",
        "open",
        "in_progress",
        "review",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
