// Service Worker — Cuando Juega el Xeneize
// Base para PWA (acceso directo) y futuras Web Push.
// Pass-through: no cachea datos para evitar contenido viejo.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handler de fetch (requerido para la instalabilidad). Sin caché: red directa.
self.addEventListener("fetch", () => {});

// Web Push (se completará cuando implementemos las notificaciones)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "Cuando Juega el Xeneize", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "Cuando Juega el Xeneize", {
      body: payload.body || "",
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      data: { url: payload.url || "./" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
