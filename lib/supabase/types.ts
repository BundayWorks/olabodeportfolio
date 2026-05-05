export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      commitments: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          sort_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          commitment_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          commitment_id: string;
          name: string;
          sort_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          commitment_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          commitment_id: string | null;
          project_id: string | null;
          title: string;
          notes: string | null;
          scope: 'day' | 'week';
          due_date: string | null;
          status: 'open' | 'completed' | 'archived';
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          commitment_id?: string | null;
          project_id?: string | null;
          title: string;
          notes?: string | null;
          scope: 'day' | 'week';
          due_date?: string | null;
          status?: 'open' | 'completed' | 'archived';
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          commitment_id?: string | null;
          project_id?: string | null;
          title?: string;
          notes?: string | null;
          scope?: 'day' | 'week';
          due_date?: string | null;
          status?: 'open' | 'completed' | 'archived';
          completed_at?: string | null;
          created_at?: string;
        };
      };
      user_integrations: {
        Row: {
          id: string;
          user_id: string;
          source: string;
          refresh_token: string;
          access_token: string | null;
          expires_at: string | null;
          scope: string | null;
          metadata: Json;
          connected_at: string;
          last_synced_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source: string;
          refresh_token: string;
          access_token?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          metadata?: Json;
          connected_at?: string;
          last_synced_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          source?: string;
          refresh_token?: string;
          access_token?: string | null;
          expires_at?: string | null;
          scope?: string | null;
          metadata?: Json;
          connected_at?: string;
          last_synced_at?: string | null;
        };
      };
      external_todos: {
        Row: {
          id: string;
          user_id: string;
          source: string;
          external_id: string;
          list_id: string | null;
          list_name: string | null;
          title: string;
          notes: string | null;
          due_at: string | null;
          completed_at: string | null;
          status: 'open' | 'completed';
          raw: Json | null;
          synced_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source: string;
          external_id: string;
          list_id?: string | null;
          list_name?: string | null;
          title: string;
          notes?: string | null;
          due_at?: string | null;
          completed_at?: string | null;
          status?: 'open' | 'completed';
          raw?: Json | null;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source?: string;
          external_id?: string;
          list_id?: string | null;
          list_name?: string | null;
          title?: string;
          notes?: string | null;
          due_at?: string | null;
          completed_at?: string | null;
          status?: 'open' | 'completed';
          raw?: Json | null;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          commitment_id: string | null;
          project_id: string | null;
          source_todo_id: string | null;
          title: string;
          notes: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          commitment_id?: string | null;
          project_id?: string | null;
          source_todo_id?: string | null;
          title: string;
          notes?: string | null;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          commitment_id?: string | null;
          project_id?: string | null;
          source_todo_id?: string | null;
          title?: string;
          notes?: string | null;
          date?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row types
export type Commitment  = Database['public']['Tables']['commitments']['Row'];
export type Project     = Database['public']['Tables']['projects']['Row'];
export type Todo        = Database['public']['Tables']['todos']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type UserIntegration = Database['public']['Tables']['user_integrations']['Row'];
export type ExternalTodo = Database['public']['Tables']['external_todos']['Row'];

// With relations
export type ProjectWithCommitment    = Project & { commitments: Commitment };
export type TodoWithRelations        = Todo & { commitments: Commitment | null; projects: Project | null };
export type AchievementWithRelations = Achievement & { commitments: Commitment | null; projects: Project | null };
