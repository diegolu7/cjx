-- Web Push — preferencias: solo aviso 1 hora antes
-- Ejecutar en Supabase → SQL Editor (o `supabase db push`).
--
-- A partir de esta versión se envía únicamente el aviso "h1" (1 h antes).
-- Se eliminan los recordatorios "h24" y "result" (quedan como evolutivo).

alter table public.push_subscriptions
  alter column prefs set default '{"h1": true}'::jsonb;

-- Normaliza las filas existentes al nuevo esquema de preferencias.
update public.push_subscriptions
  set prefs = '{"h1": true}'::jsonb
  where prefs ? 'h24' or prefs ? 'result' or not (prefs ? 'h1');
