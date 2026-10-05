-- Keepalive — evita que el plan Free pause el proyecto a los 7 días sin actividad.
-- Ejecutar en Supabase → SQL Editor (o `supabase db push`).
--
-- Supabase considera inactivo un proyecto Free que no recibe actividad suficiente
-- en la base durante 7 días. Los health-checks están excluidos del conteo, así que
-- esto NO reemplaza al ping: solo guarda la marca del último para poder diagnosticar.

-- Tabla de una sola fila (id fijo): no crece con el tiempo.
create table if not exists public.keepalive (
  id boolean primary key default true check (id),
  last_ping timestamptz not null default now()
);

-- Sin acceso anónimo: solo la Edge Function `ping` (service role) escribe.
alter table public.keepalive enable row level security;

-- (Sin policies = nadie con anon/authenticated puede leer/escribir.)

insert into public.keepalive (id, last_ping)
values (true, now())
on conflict (id) do nothing;
