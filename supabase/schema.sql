-- ========================================
-- FRAME DATABASE SCHEMA
-- Supabase/PostgreSQL with Row Level Security
-- Creator Workspace - Part of Cambric Ecosystem
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- IDEAS TABLE
-- Core creative ideas and content planning
-- ========================================

CREATE TABLE IF NOT EXISTS frame_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Idea',
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'in-progress', 'ready', 'published')),
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ASSETS TABLE
-- Reference library for links, files, notes
-- ========================================

CREATE TABLE IF NOT EXISTS frame_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES frame_ideas(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Asset',
    asset_type TEXT DEFAULT 'link' CHECK (asset_type IN ('link', 'file', 'note')),
    url TEXT,
    file_reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SCHEDULE TABLE
-- Publishing calendar entries
-- ========================================

CREATE TABLE IF NOT EXISTS frame_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES frame_ideas(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Schedule',
    scheduled_date DATE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Frame Ideas: Users can only access their own ideas
ALTER TABLE frame_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own frame_ideas" ON frame_ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own frame_ideas" ON frame_ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own frame_ideas" ON frame_ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own frame_ideas" ON frame_ideas
    FOR DELETE USING (auth.uid() = user_id);

-- Frame Assets: Users can only access their own assets
ALTER TABLE frame_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own frame_assets" ON frame_assets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own frame_assets" ON frame_assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own frame_assets" ON frame_assets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own frame_assets" ON frame_assets
    FOR DELETE USING (auth.uid() = user_id);

-- Frame Schedule: Users can only access their own schedule entries
ALTER TABLE frame_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own frame_schedule" ON frame_schedule
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own frame_schedule" ON frame_schedule
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own frame_schedule" ON frame_schedule
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own frame_schedule" ON frame_schedule
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_frame_ideas_user_id ON frame_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_ideas_status ON frame_ideas(status);
CREATE INDEX IF NOT EXISTS idx_frame_ideas_updated_at ON frame_ideas(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_frame_assets_user_id ON frame_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_assets_idea_id ON frame_assets(idea_id);
CREATE INDEX IF NOT EXISTS idx_frame_assets_type ON frame_assets(asset_type);

CREATE INDEX IF NOT EXISTS idx_frame_schedule_user_id ON frame_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_frame_schedule_idea_id ON frame_schedule(idea_id);
CREATE INDEX IF NOT EXISTS idx_frame_schedule_date ON frame_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_frame_schedule_status ON frame_schedule(status);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_frame_ideas_updated_at
    BEFORE UPDATE ON frame_ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_assets_updated_at
    BEFORE UPDATE ON frame_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frame_schedule_updated_at
    BEFORE UPDATE ON frame_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
