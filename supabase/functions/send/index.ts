// Supabase Edge Function: send
// Envía una notificación push a las suscripciones activas (fan-out) con dedupe.
// Requiere header Authorization: Bearer <SEND_SECRET>.
// POST { matchId, type, title, body, url?, lang? }  ·  type: h24 | h1 | result
// Si viene `lang` ("es" | "en") solo se envía a los suscriptos de ese idioma.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("SEND_SECRET");
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: {
    matchId?: string;
    type?: string;
    title?: string;
    body?: string;
    url?: string;
    lang?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { matchId, type, title } = body;
  const lang = body.lang === "en" ? "en" : body.lang === "es" ? "es" : undefined;
  if (!matchId || !type || !title) return json({ error: "missing_fields" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Dedupe: si ya se envió (matchId, type), no repetir.
  const { error: dedupeError } = await supabase
    .from("notification_sends")
    .insert({ match_id: matchId, type, lang: lang ?? "es" });
  if (dedupeError) {
    if (dedupeError.code === "23505") return json({ skipped: true, reason: "already_sent" });
    return json({ error: dedupeError.message }, 500);
  }

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "mailto:delnorte.destinos@gmail.com",
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!,
  );

  // Suscripciones activas con la preferencia del tipo encendida.
  let query = supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("enabled", true)
    .filter(`prefs->>${type}`, "eq", "true");
  if (lang) query = query.eq("lang", lang);

  const { data: subs, error } = await query;

  if (error) return json({ error: error.message }, 500);

  const payload = JSON.stringify({
    title,
    body: body.body ?? "",
    url: body.url ?? "./",
  });

  let sent = 0;
  let removed = 0;

  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      sent++;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        removed++;
      }
    }
  }

  return json({ ok: true, sent, removed });
});
