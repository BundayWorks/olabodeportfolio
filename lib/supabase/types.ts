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
        Insert: Omit<Database['public']['Tables']['commitments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['commitments']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['todos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['todos']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
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
