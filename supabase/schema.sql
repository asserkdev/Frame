-- ========================================
-- FRAME DATABASE SCHEMA v2.0
-- Content Creator/Influencer Productivity
-- Part of Cambric Ecosystem
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PROJECTS TABLE
-- Core content projects (videos, podcasts, blogs, etc.)
-- ========================================

CREATE TABLE IF NOT EXISTS frame_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    description TEXT,
    content_type TEXT DEFAULT 'video',
    platforms TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'concept',
    visibility TEXT DEFAULT 'private',
    priority INTEGER DEFAULT 3,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    thumbnail_url TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- ========================================
-- PIPELINE ITEMS TABLE
-- Production pipeline stages for each project
-- ========================================

CREATE TABLE IF NOT EXISTS frame_pipeline_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES frame_projects(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    title TEXT,
    content TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    notes TEXT,
    attachments TEXT[],
    time_spent INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- SERIES TABLE
-- Multi-episode content series
-- ========================================

CREATE TABLE IF NOT EXISTS frame_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    description TEXT,
    content_type TEXT DEFAULT 'video',
    total_episodes INTEGER DEFAULT 0,
    completed_episodes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- EPISODES TABLE
-- Individual episodes within a series
-- ========================================

CREATE TABLE IF NOT EXISTS frame_episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    series_id UUID REFERENCES frame_series(id) ON DELETE SET NULL,
    project_id UUID REFERENCES frame_projects(id) ON DELETE SET NULL,
    episode_number INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned',
    planned_date DATE,
    published_date DATE,
    thumbnail_url TEXT,
    duration INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- BRAND ASSETS TABLE
-- Logos, colors, fonts, templates, etc.
// ========================================

CREATE TABLE IF NOT EXISTS frame_brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    asset_type TEXT NOT NULL,
    file_url TEXT,
    file_data TEXT,
    color_hex TEXT,
    color_name TEXT,
    tags TEXT[],
    quick_copy_code TEXT,
    usage_notes TEXT,
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TRENDING TOPICS TABLE
-- Content ideas and trend tracking
-- ========================================

CREATE TABLE IF NOT EXISTS frame_trending_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_url TEXT,
    source_platform TEXT,
    themes TEXT[],
    tags TEXT[],
    notes TEXT,
    extracted_content TEXT,
    relevance_score INTEGER DEFAULT 50,
    status TEXT DEFAULT 'collected',
    linked_project_id UUID REFERENCES frame_projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- CONTENT OPTIMIZATIONS TABLE
-- Platform-specific content optimization
-- ========================================

CREATE TABLE IF NOT EXISTS frame_content_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES frame_projects(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    generated_title TEXT,
    generated_description TEXT,
    generated_tags TEXT[],
    generated_hashtags TEXT[],
    seo_score INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    headline TEXT,
    hook TEXT,
    cta TEXT,
    timestamps JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- SCHEDULES TABLE
-- Publishing calendar
-- ========================================

CREATE TABLE IF NOT EXISTS frame_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES frame_projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    timezone TEXT DEFAULT 'UTC',
    platforms TEXT[] NOT NULL DEFAULT '{}',
    platform_metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'scheduled',
    best_time_suggestion BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    published_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- CONTENT TEMPLATES TABLE
-- Reusable content templates
-- ========================================

CREATE TABLE IF NOT EXISTS frame_content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    template_type TEXT NOT NULL,
    platform TEXT,
    content TEXT NOT NULL,
    variables TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ANALYTICS TABLE
-- Content performance tracking
-- ========================================

CREATE TABLE IF NOT EXISTS frame_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES frame_projects(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    metric_date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    watch_time INTEGER,
    ctr REAL,
    avg_view_duration INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE frame_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_pipeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_content_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_analytics ENABLE ROW LEVEL SECURITY;

-- Projects: Users can only access their own projects
CREATE POLICY "projects_select" ON frame_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert" ON frame_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update" ON frame_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete" ON frame_projects FOR DELETE USING (auth.uid() = user_id);

-- Pipeline: Users can only access their own pipeline items
CREATE POLICY "pipeline_select" ON frame_pipeline_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pipeline_insert" ON frame_pipeline_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pipeline_update" ON frame_pipeline_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pipeline_delete" ON frame_pipeline_items FOR DELETE USING (auth.uid() = user_id);

-- Series: Users can only access their own series
CREATE POLICY "series_select" ON frame_series FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "series_insert" ON frame_series FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "series_update" ON frame_series FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "series_delete" ON frame_series FOR DELETE USING (auth.uid() = user_id);

-- Episodes: Users can only access their own episodes
CREATE POLICY "episodes_select" ON frame_episodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "episodes_insert" ON frame_episodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "episodes_update" ON frame_episodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "episodes_delete" ON frame_episodes FOR DELETE USING (auth.uid() = user_id);

-- Brand Assets: Users can only access their own assets
CREATE POLICY "brand_assets_select" ON frame_brand_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "brand_assets_insert" ON frame_brand_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brand_assets_update" ON frame_brand_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "brand_assets_delete" ON frame_brand_assets FOR DELETE USING (auth.uid() = user_id);

-- Trending Topics: Users can only access their own topics
CREATE POLICY "trending_topics_select" ON frame_trending_topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trending_topics_insert" ON frame_trending_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trending_topics_update" ON frame_trending_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trending_topics_delete" ON frame_trending_topics FOR DELETE USING (auth.uid() = user_id);

-- Content Optimizations: Users can only access their own optimizations
CREATE POLICY "content_optimizations_select" ON frame_content_optimizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "content_optimizations_insert" ON frame_content_optimizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "content_optimizations_update" ON frame_content_optimizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "content_optimizations_delete" ON frame_content_optimizations FOR DELETE USING (auth.uid() = user_id);

-- Schedules: Users can only access their own schedules
CREATE POLICY "schedules_select" ON frame_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "schedules_insert" ON frame_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "schedules_update" ON frame_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "schedules_delete" ON frame_schedules FOR DELETE USING (auth.uid() = user_id);

-- Content Templates: Users can only access their own templates
CREATE POLICY "content_templates_select" ON frame_content_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "content_templates_insert" ON frame_content_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "content_templates_update" ON frame_content_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "content_templates_delete" ON frame_content_templates FOR DELETE USING (auth.uid() = user_id);

-- Analytics: Users can only access their own analytics
CREATE POLICY "analytics_select" ON frame_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analytics_insert" ON frame_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analytics_update" ON frame_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "analytics_delete" ON frame_analytics FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_frame_projects_user_id ON frame_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_projects_status ON frame_projects(status);
CREATE INDEX IF NOT EXISTS idx_frame_projects_content_type ON frame_projects(content_type);
CREATE INDEX IF NOT EXISTS idx_frame_projects_updated_at ON frame_projects(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_frame_pipeline_project_id ON frame_pipeline_items(project_id);
CREATE INDEX IF NOT EXISTS idx_frame_pipeline_user_id ON frame_pipeline_items(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_pipeline_stage ON frame_pipeline_items(stage);

CREATE INDEX IF NOT EXISTS idx_frame_series_user_id ON frame_series(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_series_status ON frame_series(status);

CREATE INDEX IF NOT EXISTS idx_frame_episodes_series_id ON frame_episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_frame_episodes_project_id ON frame_episodes(project_id);
CREATE INDEX IF NOT EXISTS idx_frame_episodes_status ON frame_episodes(status);

CREATE INDEX IF NOT EXISTS idx_frame_brand_assets_user_id ON frame_brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_brand_assets_type ON frame_brand_assets(asset_type);

CREATE INDEX IF NOT EXISTS idx_frame_trending_topics_user_id ON frame_trending_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_trending_topics_status ON frame_trending_topics(status);
CREATE INDEX IF NOT EXISTS idx_frame_trending_topics_relevance ON frame_trending_topics(relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_frame_content_optimizations_project_id ON frame_content_optimizations(project_id);
CREATE INDEX IF NOT EXISTS idx_frame_content_optimizations_platform ON frame_content_optimizations(platform);

CREATE INDEX IF NOT EXISTS idx_frame_schedules_user_id ON frame_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_schedules_project_id ON frame_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_frame_schedules_date ON frame_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_frame_schedules_status ON frame_schedules(status);

CREATE INDEX IF NOT EXISTS idx_frame_content_templates_user_id ON frame_content_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_content_templates_type ON frame_content_templates(template_type);

CREATE INDEX IF NOT EXISTS idx_frame_analytics_project_id ON frame_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_frame_analytics_platform ON frame_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_frame_analytics_date ON frame_analytics(metric_date DESC);

-- ========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_frame_projects_updated_at
    BEFORE UPDATE ON frame_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_pipeline_items_updated_at
    BEFORE UPDATE ON frame_pipeline_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_series_updated_at
    BEFORE UPDATE ON frame_series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_episodes_updated_at
    BEFORE UPDATE ON frame_episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_brand_assets_updated_at
    BEFORE UPDATE ON frame_brand_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_trending_topics_updated_at
    BEFORE UPDATE ON frame_trending_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_content_optimizations_updated_at
    BEFORE UPDATE ON frame_content_optimizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_schedules_updated_at
    BEFORE UPDATE ON frame_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_content_templates_updated_at
    BEFORE UPDATE ON frame_content_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_analytics_updated_at
    BEFORE UPDATE ON frame_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
