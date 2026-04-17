export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
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
  };
}

// Convenience row types
export type Commitment  = Database['public']['Tables']['commitments']['Row'];
export type Project     = Database['public']['Tables']['projects']['Row'];
export type Todo        = Database['public']['Tables']['todos']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];

// With relations
export type ProjectWithCommitment = Project & { commitments: Commitment };
export type TodoWithRelations     = Todo & { commitments: Commitment | null; projects: Project | null };
export type AchievementWithRelations = Achievement & { commitments: Commitment | null; projects: Project | null };
