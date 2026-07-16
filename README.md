# Frame

**Frame — a Cambric product**

A powerful workspace for content creators, influencers, and YouTubers to plan, organize, and manage their creative work.

## Features

### 📊 Projects
- Track videos, podcasts, blogs, social posts, and courses
- Multi-platform support (YouTube, TikTok, Twitter, Instagram, LinkedIn, Podcast, Blog, Pinterest)
- Status workflow: Concept → Research → Planning → Production → Review → Published

### 🔄 Production Pipeline
- Visual Kanban board for content production stages
- Stages: Research → Outline → Script → Record → Edit → Thumbnail → SEO → Upload → Published

### 📺 Series Management
- Organize multi-episode content series
- Track episode progress and completion

### 🎨 Brand Assets
- Store logos, colors, fonts, and templates
- Quick copy codes and usage tracking

### 🔥 Trending Topics
- Track content ideas and trends
- Source attribution and relevance scoring

### 📈 Content Optimization
- Platform-specific SEO optimization
- Title, description, and hashtag generation

### 📅 Publishing Schedule
- Calendar view of scheduled content
- Multi-platform scheduling with best time suggestions

### 📝 Content Templates
- Reusable templates for titles, descriptions, thumbnails

### 📊 Analytics
- Track views, likes, comments, shares
- Platform-specific performance metrics

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Supabase for authentication and database
- Same design system as Atlas (Cambric's knowledge workspace)

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and add your Supabase credentials
3. Run `npm install`
4. Run `npm run dev` to start the development server

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

Go to **Supabase Dashboard → SQL Editor** and run the schema from `supabase/schema.sql`.

### Database Tables

Frame uses 10 tables prefixed with `frame_`:

| Table | Description |
|-------|-------------|
| `frame_projects` | Core content projects |
| `frame_pipeline_items` | Production workflow stages |
| `frame_series` | Multi-episode series |
| `frame_episodes` | Individual episodes |
| `frame_brand_assets` | Logos, colors, fonts, templates |
| `frame_trending_topics` | Content ideas and trends |
| `frame_content_optimizations` | Platform-specific SEO |
| `frame_schedules` | Publishing calendar |
| `frame_content_templates` | Reusable templates |
| `frame_analytics` | Performance tracking |

All tables have Row Level Security (RLS) for data isolation.

## Development

```bash
npm install    # Install dependencies
npm run dev   # Start dev server
npm run build # Build for production
```