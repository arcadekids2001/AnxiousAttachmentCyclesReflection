# AURA Web

A production-oriented Next.js foundation for:

- anxious attachment reflection support
- AI-assisted intervention dialogue
- server-side conversation recording
- journal entry persistence
- future skill-based agent orchestration

## Stack

- Next.js App Router
- TypeScript
- server-side Gemini API calls
- local JSON persistence for MVP storage

## Setup

1. Copy `.env.example` to `.env.local`
2. Set `GEMINI_API_KEY`
3. Optionally change `GEMINI_MODEL`

Example:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Run

```bash
npm run dev
```

Then open:

`http://localhost:3000`

## Current MVP behavior

- conversations are stored in `data/aura-store.json`
- journal entries are stored in the same file
- chat requests go through `/api/chat`
- sessions load through `/api/sessions`
- journal saves through `/api/journal`

## Important note

This version is much safer than a pure browser-only demo because the API key stays on the server, but it is still an MVP.

For the next step, I recommend adding:

- PostgreSQL + Prisma
- user accounts
- structured profile memory
- safety escalation logic
- richer skill registry and orchestration
