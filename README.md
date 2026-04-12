# AURA Web

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
```

For Vercel, add the same variables in the project settings:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`

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

This project currently uses two storage modes:

- Local development: reads and writes `data/aura-store.json`
- Vercel deployment: uses in-memory fallback storage

That means production AI chat works on Vercel, but conversation history and journal data are not guaranteed to persist across instance restarts or redeploys.

## Current API Routes

- `/api/chat`
- `/api/sessions`
- `/api/journal`

## Recommended Next Step

If you want durable production storage, replace the current fallback with a real external store such as:

- Vercel Postgres
- Supabase
- Prisma + PostgreSQL
