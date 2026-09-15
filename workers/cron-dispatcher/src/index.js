// Cloudflare Worker: dispara los workflows de GitHub en un cron confiable.
//
// Motivo: el evento `schedule` de GitHub Actions se espacia a cada ~3-6 h en
// este repo, así que los resultados y el aviso de 1 h no son confiables. Este
// Worker usa un Cron Trigger (confiable) y llama a la API de GitHub para
// ejecutar los workflows por `workflow_dispatch`.
//
// Env (secrets/vars):
//   GITHUB_TOKEN  (secret)  PAT con permiso Actions: read & write
//   GITHUB_OWNER  (var)     ej. diegolu7
//   GITHUB_REPO   (var)     ej. cjx
//   GITHUB_REF    (var)     ej. main
//   WORKFLOWS     (var)     ej. "deploy.yml,notify.yml"

const GITHUB_API = "https://api.github.com";

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

export default {
  async scheduled(_event, env, _ctx) {
    const results = await dispatchAll(env);
    console.log("[cjx-cron] dispatch:", JSON.stringify(results));
  },

  // Permite forzar el disparo a mano: GET/POST a la URL del Worker.
  async fetch(_request, env) {
    if (!env.GITHUB_TOKEN) {
      return json({ error: "GITHUB_TOKEN no configurado" }, 500);
    }
    const results = await dispatchAll(env);
    const ok = results.every((r) => r.ok);
    return json({ ok, results }, ok ? 200 : 502);
  },
};
