// Supabase Edge Function: subscribe
// Registra/actualiza una suscripción push (pública). Usa service role.
// POST { endpoint, keys: { p256dh, auth }, prefs?, enabled? }

import { createClient } from "npm:@supabase/supabase-js@2";

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

  let body: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    prefs?: Record<string, boolean>;
    enabled?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const auth = body.keys?.auth?.trim();

  if (!endpoint || !p256dh || !auth) {
    return json({ error: "missing_fields" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const row: Record<string, unknown> = {
    endpoint,
    p256dh,
    auth,
    enabled: body.enabled ?? true,
  };
  if (body.prefs && typeof body.prefs === "object") row.prefs = body.prefs;

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(row, { onConflict: "endpoint" });

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
