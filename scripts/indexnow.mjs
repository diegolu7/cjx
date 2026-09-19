// IndexNow: notifica a Bing/Yandex las URLs del sitemap tras cada deploy.
// La clave es pública (vive en public/<KEY>.txt).
// Uso: node scripts/indexnow.mjs

const HOST = "cuandojuegaelxeneize.com.ar";
const KEY = "c7f2a9e4b1d63f805a2c4e7b9d1f3a60";
const SITEMAP = `https://${HOST}/sitemap-0.xml`;

async function main() {
  const res = await fetch(SITEMAP);
  if (!res.ok) {
    console.warn(`[indexnow] no se pudo leer el sitemap: HTTP ${res.status}`);
    return;
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) {
    console.warn("[indexnow] sitemap sin URLs");
    return;
  }

  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(`[indexnow] ${urls.length} URLs → HTTP ${r.status}`);
}

main().catch((err) => {
  console.error("[indexnow] error:", err);
  process.exit(1);
});
