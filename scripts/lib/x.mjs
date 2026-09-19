// Publicación en X (Twitter) — auto-post por partido.
// Requiere (secrets de GitHub Actions):
//   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
// Si faltan, no publica (no rompe el workflow).

import pkg from "twitter-api-v2";

const { TwitterApi } = pkg;

export function xConfigured() {
  return Boolean(
    process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_SECRET,
  );
}

export async function postToX(text) {
  if (!xConfigured()) {
    return { posted: false, reason: "no_creds" };
  }
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });
  try {
    const res = await client.v2.tweet(text);
    return { posted: true, id: res.data?.id };
  } catch (err) {
    return { posted: false, reason: String(err?.message || err) };
  }
}
