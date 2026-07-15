import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

export const isConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type IdeaStatus = 'idea' | 'in-progress' | 'ready' | 'published'
export type AssetType = 'link' | 'file' | 'note'
export type ScheduleStatus = 'scheduled' | 'published' | 'cancelled'

export interface FrameIdea {
  id: string
  user_id: string
  title: string
  content: string
  status: IdeaStatus
  word_count: number
  created_at: string
  updated_at: string
}

export interface FrameIdeaSelect {
  id: string
  title: string
}

export interface FrameAsset {
  id: string
  user_id: string
  idea_id: string | null
  title: string
  asset_type: AssetType
  url: string | null
  file_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
  idea_title?: string
}

export interface FrameSchedule {
  id: string
  user_id: string
  idea_id: string | null
  title: string
  scheduled_date: string
  status: ScheduleStatus
  notes: string | null
  created_at: string
  updated_at: string
  idea_title?: string
}

export type Database = {
  public: {
    Tables: {
      frame_ideas: {
        Row: FrameIdea
        Insert: Omit<FrameIdea, 'id' | 'created_at' | 'updated_at' | 'word_count'>
        Update: Partial<Omit<FrameIdea, 'id' | 'created_at'>>
      }
      frame_assets: {
        Row: FrameAsset
        Insert: Omit<FrameAsset, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FrameAsset, 'id' | 'created_at'>>
      }
      frame_schedule: {
        Row: FrameSchedule
        Insert: Omit<FrameSchedule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FrameSchedule, 'id' | 'created_at'>>
      }
    }
  }
}
