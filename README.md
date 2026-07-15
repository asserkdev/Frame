# Frame

**Frame — a Cambric product**

Frame is the creator workspace — where you plan, organize, and manage creative and content work: ideas, scripts, assets, and a publishing schedule.

## Features

- **Ideas** — Create and organize creative ideas with rich text notes and status tracking
- **Assets** — Build a reference library of links, files, and notes tied to your ideas
- **Schedule** — Plan your publishing calendar with a list or calendar view

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Supabase for authentication and database
- TipTap for rich text editing
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

## Database Schema

Frame uses the shared Cambric Supabase project. All tables are prefixed with `frame_`:

- `frame_ideas` — Creative ideas with title, content, and status
- `frame_assets` — Reference library entries linked to ideas
- `frame_schedule` — Publishing calendar entries

See `supabase/schema.sql` for the full schema with Row Level Security policies.

## Development

```bash
npm install    # Install dependencies
npm run dev   # Start dev server
npm run build # Build for production
```