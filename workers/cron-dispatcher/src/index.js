// Cloudflare Worker: dispara los workflows de GitHub en un cron confiable.
//
// Motivo: el evento `schedule` de GitHub Actions se espacia a cada ~3-6 h en
// este repo, así que los resultados y el aviso de 1 h no son confiables. Este
// Worker usa un Cron Trigger (confiable) y llama a la API de GitHub para
// ejecutar los workflows por `workflow_dispatch`.
//
// Hace dos cosas distintas según qué cron se dispara:
//
//   */15 * * * *  → despacha deploy.yml y notify.yml a GitHub
//   7 4 * * *     → ping diario a Supabase (keepalive, evita la pausa del plan Free)
//
// Env (secrets/vars):
//   GITHUB_TOKEN  (secret)  PAT con permiso Actions: read & write
//   GITHUB_OWNER  (var)     ej. diegolu7
//   GITHUB_REPO   (var)     ej. cjx
//   GITHUB_REF    (var)     ej. main
//   WORKFLOWS     (var)     ej. "deploy.yml,notify.yml"
//   SUPABASE_URL  (var)     ej. https://xxxx.supabase.co
//   PING_SECRET   (secret)  mismo valor que el secret PING_SECRET de Supabase

const GITHUB_API = "https://api.github.com";

const KEEPALIVE_CRON = "7 4 * * *";

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function dispatchWorkflow(env, workflow) {
  const url = `${GITHUB_API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/${workflow}/dispatches`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "cjx-cron-dispatcher",
      "content-type": "application/json",
    },
    body: JSON.stringify({ ref: env.GITHUB_REF || "main" }),
  });
  return { workflow, status: res.status, ok: res.ok };
}

async function dispatchAll(env) {
  const workflows = (env.WORKFLOWS || "deploy.yml,notify.yml")
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

  const results = [];
  for (const wf of workflows) {
    try {
      results.push(await dispatchWorkflow(env, wf));
    } catch (err) {
      results.push({ workflow: wf, status: 0, ok: false, error: String(err) });
    }
  }
  return results;
}

// Keepalive del proyecto Supabase Free. Complementa al workflow diario
// `keepalive.yml`: si GitHub deja de disparar (desactiva los `schedule` de
// repos públicos a los 60 días sin actividad), este ping sigue evitando la pausa.
async function pingSupabase(env) {
  if (!env.SUPABASE_URL || !env.PING_SECRET) {
    return { ok: false, error: "SUPABASE_URL o PING_SECRET no configurados" };
  }
  try {
    const res = await fetch(`${env.SUPABASE_URL}/functions/v1/ping`, {
      method: "POST",
      headers: { authorization: `Bearer ${env.PING_SECRET}` },
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export default {
  async scheduled(event, env, _ctx) {
    if (event.cron === KEEPALIVE_CRON) {
      const ping = await pingSupabase(env);
      console.log("[cjx-cron] keepalive:", JSON.stringify(ping));
      return;
    }

    const results = await dispatchAll(env);
    console.log("[cjx-cron] dispatch:", JSON.stringify(results));
  },

  // Permite forzar el disparo a mano: GET/POST a la URL del Worker.
  async fetch(_request, env) {
    if (!env.GITHUB_TOKEN) {
      return json({ error: "GITHUB_TOKEN no configurado" }, 500);
    }

    const results = await dispatchAll(env);
    const ping = await pingSupabase(env);
    const ok = results.every((r) => r.ok) && ping.ok;
    return json({ ok, results, ping }, ok ? 200 : 502);
  },
};
