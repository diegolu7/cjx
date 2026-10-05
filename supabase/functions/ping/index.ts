// Supabase Edge Function: ping
// Keepalive del proyecto Supabase Free (lo pausa a los 7 días sin actividad en la DB).
// Requiere header Authorization: Bearer <PING_SECRET>.
// Se llama desde scripts/keepalive.mjs (workflow diario "Keepalive Supabase").
//
// Hace un UPSERT real contra Postgres a propósito: Supabase excluye los health-checks
// del conteo de actividad, así que un ping que no consulte la DB no serviría.

import { createClient } from "npm:@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("PING_SECRET");
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return json({ error: "unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const at = new Date().toISOString();
  const { error } = await supabase
    .from("keepalive")
    .upsert({ id: true, last_ping: at });

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, at });
});
