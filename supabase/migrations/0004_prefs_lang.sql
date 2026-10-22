-- Web Push — idioma de la suscripción
-- Ejecutar en Supabase → SQL Editor (o `supabase db push`).
--
-- El aviso de 1 hora antes se envía en el idioma con el que el visitante activó
-- las notificaciones (ES por defecto). Las filas existentes quedan en 'es'.

alter table public.push_subscriptions
  add column if not exists lang text not null default 'es';

-- El dedupe pasa a ser por (partido, tipo, idioma): el mismo aviso se envía una
-- vez en español y otra en inglés.
alter table public.notification_sends
  add column if not exists lang text not null default 'es';

alter table public.notification_sends
  drop constraint if exists notification_sends_match_id_type_key;

alter table public.notification_sends
  drop constraint if exists notification_sends_match_id_type_lang_key;

alter table public.notification_sends
  add constraint notification_sends_match_id_type_lang_key unique (match_id, type, lang);
