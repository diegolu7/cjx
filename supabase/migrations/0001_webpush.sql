-- Web Push — esquema base
-- Ejecutar en Supabase → SQL Editor (o `supabase db push`).

create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  prefs jsonb not null default '{"h24": false, "h1": true, "result": true}'::jsonb,
  enabled boolean not null default true,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_sends (
  id bigint generated always as identity primary key,
  match_id text not null,
  type text not null, -- h24 | h1 | result
  sent_at timestamptz not null default now(),
  unique (match_id, type)
);

-- Sin acceso anónimo: todo pasa por las Edge Functions (service role).
alter table public.push_subscriptions enable row level security;
alter table public.notification_sends enable row level security;

-- (Sin policies = nadie con anon/authenticated puede leer/escribir.)

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();
