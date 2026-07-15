import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

export const isConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing!')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Project Types
export type ContentType = 'video' | 'podcast' | 'blog' | 'social' | 'course' | 'other'
export type ProjectStatus = 'concept' | 'research' | 'planning' | 'production' | 'review' | 'published' | 'archived'
export type Visibility = 'public' | 'private' | 'unlisted'

export interface FrameProject {
  id: string
  user_id: string
  title: string
  description: string | null
  content_type: ContentType
  platforms: string[]
  status: ProjectStatus
  visibility: Visibility
  priority: number
  estimated_duration: number | null
  actual_duration: number | null
  thumbnail_url: string | null
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  published_at: string | null
}

export type PipelineStage = 'research' | 'outline' | 'script' | 'record' | 'edit' | 'thumbnail' | 'seo' | 'upload' | 'published'

export interface FramePipelineItem {
  id: string
  user_id: string
  project_id: string
  stage: PipelineStage
  title: string | null
  content: string | null
  completed: boolean
  completed_at: string | null
  due_date: string | null
  notes: string | null
  attachments: string[] | null
  time_spent: number
  sort_order: number
  created_at: string
  updated_at: string
}

export type SeriesStatus = 'active' | 'completed' | 'paused' | 'archived'
export type EpisodeStatus = 'planned' | 'in_progress' | 'recorded' | 'edited' | 'published'

export interface FrameSeries {
  id: string
  user_id: string
  title: string
  description: string | null
  content_type: ContentType
  total_episodes: number
  completed_episodes: number
  status: SeriesStatus
  created_at: string
  updated_at: string
}

export interface FrameEpisode {
  id: string
  user_id: string
  series_id: string | null
  project_id: string | null
  episode_number: number | null
  title: string
  description: string | null
  status: EpisodeStatus
  planned_date: string | null
  published_date: string | null
  thumbnail_url: string | null
  duration: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AssetType = 'logo' | 'font' | 'color' | 'template' | 'image' | 'video' | 'audio' | 'document' | 'other'

export interface FrameBrandAsset {
  id: string
  user_id: string
  title: string
  asset_type: AssetType
  file_url: string | null
  file_data: string | null
  color_hex: string | null
  color_name: string | null
  tags: string[] | null
  quick_copy_code: string | null
  usage_notes: string | null
  last_used_at: string | null
  usage_count: number
  created_at: string
  updated_at: string
}

export type TopicStatus = 'collected' | 'reviewed' | 'used' | 'archived'

export interface FrameTrendingTopic {
  id: string
  user_id: string
  title: string
  source_url: string | null
  source_platform: string | null
  themes: string[] | null
  tags: string[] | null
  notes: string | null
  extracted_content: string | null
  relevance_score: number
  status: TopicStatus
  linked_project_id: string | null
  created_at: string
  updated_at: string
}

export type Platform = 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'linkedin' | 'podcast' | 'blog' | 'pinterest'

export interface Timestamp {
  time: string
  label: string
}

export interface FrameContentOptimization {
  id: string
  user_id: string
  project_id: string | null
  platform: Platform
  generated_title: string | null
  generated_description: string | null
  generated_tags: string[] | null
  generated_hashtags: string[] | null
  seo_score: number
  character_count: number
  headline: string | null
  hook: string | null
  cta: string | null
  timestamps: Timestamp[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type ScheduleStatus = 'scheduled' | 'published' | 'failed' | 'cancelled'

export interface PlatformMeta {
  title?: string
  description?: string
  tags?: string[]
  thumbnail?: string
  visibility?: string
}

export interface FrameSchedule {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  scheduled_date: string
  scheduled_time: string | null
  timezone: string
  platforms: string[]
  platform_metadata: PlatformMeta[]
  status: ScheduleStatus
  best_time_suggestion: boolean
  reminder_sent: boolean
  published_url: string | null
  created_at: string
  updated_at: string
}

export type TemplateType = 'title' | 'description' | 'thumbnail' | 'script' | 'series' | 'social'

export interface FrameContentTemplate {
  id: string
  user_id: string
  title: string
  template_type: TemplateType
  platform: Platform | null
  content: string
  variables: string[] | null
  usage_count: number
  created_at: string
  updated_at: string
}

export interface FrameAnalytics {
  id: string
  user_id: string
  project_id: string | null
  platform: string
  metric_date: string
  views: number
  likes: number
  comments: number
  shares: number
  watch_time: number | null
  ctr: number | null
  avg_view_duration: number | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export const PIPELINE_STAGES = [
  { value: 'research', label: 'Research' },
  { value: 'outline', label: 'Outline' },
  { value: 'script', label: 'Script' },
  { value: 'record', label: 'Record' },
  { value: 'edit', label: 'Edit' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'seo', label: 'SEO' },
  { value: 'upload', label: 'Upload' },
  { value: 'published', label: 'Published' }
]

export const CONTENT_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'social', label: 'Social Media' },
  { value: 'course', label: 'Course' },
  { value: 'other', label: 'Other' }
]

export const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', maxTitle: 100, maxDesc: 5000, maxTags: 500 },
  { value: 'tiktok', label: 'TikTok', maxTitle: 150, maxDesc: 2200, maxTags: 0 },
  { value: 'twitter', label: 'Twitter/X', maxTitle: 280, maxDesc: 0, maxTags: 0 },
  { value: 'instagram', label: 'Instagram', maxTitle: 2200, maxDesc: 0, maxTags: 0 },
  { value: 'linkedin', label: 'LinkedIn', maxTitle: 300, maxDesc: 3000, maxTags: 0 },
  { value: 'podcast', label: 'Podcast', maxTitle: 200, maxDesc: 4000, maxTags: 0 },
  { value: 'blog', label: 'Blog', maxTitle: 70, maxDesc: 10000, maxTags: 0 },
  { value: 'pinterest', label: 'Pinterest', maxTitle: 500, maxDesc: 500, maxTags: 0 }
]

export const PROJECT_STATUSES = [
  { value: 'concept', label: 'Concept', color: '#a78bfa' },
  { value: 'research', label: 'Research', color: '#60a5fa' },
  { value: 'planning', label: 'Planning', color: '#fbbf24' },
  { value: 'production', label: 'Production', color: '#f472b6' },
  { value: 'review', label: 'Review', color: '#a3e635' },
  { value: 'published', label: 'Published', color: '#34d399' },
  { value: 'archived', label: 'Archived', color: '#71717a' }
]

export const ASSET_TYPES = [
  { value: 'logo', label: 'Logo' },
  { value: 'font', label: 'Font' },
  { value: 'color', label: 'Color' },
  { value: 'template', label: 'Template' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Document' },
  { value: 'other', label: 'Other' }
]

export const BEST_POSTING_TIMES = {
  youtube: [14, 15, 16, 17, 18],
  tiktok: [12, 19, 20, 21],
  twitter: [8, 9, 12, 17, 18],
  instagram: [11, 12, 13, 19, 20, 21],
  linkedin: [8, 9, 12, 17, 18],
  podcast: [5, 6, 7, 8],
  blog: [9, 10, 11],
  pinterest: [14, 15, 20, 21, 22]
}
