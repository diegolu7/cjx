// Keepalive de Supabase (cron diario, workflow "Keepalive Supabase").
//
// Motivo: el plan Free pausa el proyecto tras 7 días sin actividad en la base.
// El aviso de `notify.mjs` solo contacta a Supabase en la hora previa a un partido
// (~4 de 96 corridas diarias), así que por sí solo no alcanza para mantenerlo vivo.
//
// Cualquier fallo sale con código 1 para que GitHub Actions avise por email.
//
// Variables de entorno:
//   SUPABASE_URL   (ej. https://xxxx.supabase.co)
//   PING_SECRET    (token compartido con la Edge Function `ping`)
//
// Uso: node scripts/keepalive.mjs

const SUPABASE_URL = process.env.SUPABASE_URL;
const PING_SECRET = process.env.PING_SECRET;

async function main() {
  if (!SUPABASE_URL || !PING_SECRET) {
    console.error("[keepalive] SUPABASE_URL/PING_SECRET no configurados.");
    process.exit(1);
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/ping`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PING_SECRET}` },
  });
  const text = await res.text();

  console.log(`[keepalive] HTTP ${res.status} ${text}`);

  if (!res.ok) {
    // 401/500 = secret desincronizado o proyecto pausado.
    console.error("[keepalive] el ping falló; revisar el secret y el estado del proyecto.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[keepalive] error:", err);
  process.exit(1);
});
