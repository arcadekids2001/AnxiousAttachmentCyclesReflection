# AURA Web
Demo：https://anxious-attachment-cycles-reflectio.vercel.app/

AURA Web is a Next.js experience for:

- AI-supported relationship reflection
- anxious attachment intervention flows
- journaling
- music and sandbox calming spaces
- a polished 3D-first interface for guided support

## Stack

- Next.js App Router
- TypeScript
- Gemini API on the server
- Three.js
- webgl-fluid

## Environment Variables

Create `.env.local` for local development:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

For Vercel, add the same variables in the project settings:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open:

`http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy To Vercel

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Add:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
4. Deploy.

## Storage Behavior

This project now supports Supabase-backed persistence.

- If Supabase environment variables are present, sessions and journal entries are stored in Supabase.
- If Supabase is not configured:
  local development falls back to `data/aura-store.json`
- If Supabase is not configured on Vercel:
  runtime falls back to in-memory storage

Use [supabase-schema.sql](C:\Users\zyuan\OneDrive\Documents\New%20project\aura-web\supabase-schema.sql) in the Supabase SQL editor before deploying the database-backed version.

## Current API Routes

- `/api/chat`
- `/api/sessions`
- `/api/journal`

## Recommended Next Step

If you want to go further, the next step is adding auth and row-level policies on top of the current Supabase tables.
