-- Supabase setup for portfolio recommendations.
-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.recommendations (
  id            uuid primary key default gen_random_uuid(),
  author        text not null check (char_length(author) between 1 and 100),
  organization  text not null check (char_length(organization) between 1 and 120),
  context       text not null check (char_length(context) between 1 and 160),
  message       text not null check (char_length(message) between 1 and 2000),
  published_at  timestamptz not null default now(),
  -- Salted SHA-256 of the visitor's IP, used only for rate limiting.
  -- Never returned by the API.
  ip_hash       text not null
);

create index if not exists recommendations_published_at_idx
  on public.recommendations (published_at desc);
create index if not exists recommendations_ip_hash_idx
  on public.recommendations (ip_hash, published_at);

-- Lock the table down: Row Level Security on, with NO policies, means the
-- public "anon"/"publishable" key can't read or write anything. Only the
-- server (Vercel function using the secret key) can, because the secret key
-- bypasses RLS.
alter table public.recommendations enable row level security;

-- Belt and braces: remove any direct table privileges from public roles.
revoke all on table public.recommendations from anon, authenticated;
