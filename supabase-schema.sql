create table if not exists public.sessions (
  id uuid primary key,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  messages jsonb not null default '[]'::jsonb
);

create table if not exists public.journal_entries (
  id uuid primary key,
  entry text not null,
  created_at timestamptz not null default now()
);

alter table public.sessions disable row level security;
alter table public.journal_entries disable row level security;
