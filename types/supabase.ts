// AUTO-GENERATED TYPE DEFINITIONS
// Mirrors the Supabase quickstart `todos` schema.
// Run `supabase gen types typescript --project-id <id> > types/supabase.ts`
// after schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: number;
          user_id: string | null;
          task: string | null;
          is_complete: boolean | null;
          inserted_at: string | null;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          task?: string | null;
          is_complete?: boolean | null;
          inserted_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          task?: string | null;
          is_complete?: boolean | null;
          inserted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type TodoRow = Database['public']['Tables']['todos']['Row'];
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];
