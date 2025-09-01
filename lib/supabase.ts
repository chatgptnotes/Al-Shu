import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'student' | 'parent' | 'teacher' | 'admin'
          is_active: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          is_active?: boolean
          avatar_url?: string | null
        }
        Update: {
          email?: string
          first_name?: string
          last_name?: string
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          is_active?: boolean
          avatar_url?: string | null
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          board: 'igcse' | 'ib' | 'a_level' | 'cbse'
          grade_level: number
          school_name: string | null
          subjects: string[]
          exam_dates: any | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          board: 'igcse' | 'ib' | 'a_level' | 'cbse'
          grade_level: number
          school_name?: string | null
          subjects?: string[]
          exam_dates?: any | null
          parent_id?: string | null
        }
        Update: {
          board?: 'igcse' | 'ib' | 'a_level' | 'cbse'
          grade_level?: number
          school_name?: string | null
          subjects?: string[]
          exam_dates?: any | null
          parent_id?: string | null
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          board: 'igcse' | 'ib' | 'a_level' | 'cbse'
          description: string | null
          created_at: string
          updated_at: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          student_id: string
          title: string
          subject_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          title: string
          subject_id?: string | null
        }
        Update: {
          title?: string
          subject_id?: string | null
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          metadata: any
          created_at: string
        }
        Insert: {
          session_id: string
          role: 'user' | 'assistant'
          content: string
          metadata?: any
        }
      }
    }
  }
}