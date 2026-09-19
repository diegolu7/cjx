# Web Push Notifications — Implementation Spec

Reference implementation: **GymCard** (Laravel 12 + React 19 SPA).
This document is a step-by-step blueprint to implement Web Push (VAPID) notifications in another Laravel project. Every section maps to working code in this repo, with paths + line numbers.

---

## 1. Architecture Overview

```
Browser (React SPA)
  │  1. navigator.serviceWorker.register('/sw.js')
  │  2. pushManager.subscribe({ applicationServerKey: <VAPID public> })
  │  3. POST /api/<role>/push/subscribe  {endpoint, publicKey, authToken}
  ▼
Laravel
  ├─ push_subscriptions table   (per user, per device endpoint)
  ├─ scheduled_notifications    (superadmin-authored rules: type, body, gym, timing)
  ├─ notification_sends         (dedupe log: rule + occurrence → sent once)
  ├─ PushService                (wraps minishlink/web-push; auto-deletes 410 Gone)
  └─ push:dispatch (cron)       (computes due notifications, filters by prefs, sends)
```

Key design decisions to replicate:

- **Server-side VAPID only** — the private key never reaches the browser. The public key is exposed via an API endpoint (or `VITE_VAPID_PUBLIC_KEY`).
- **Per-device rows** — one `push_subscriptions` row per browser endpoint, keyed unique on `endpoint`. A user can have many.
- **Per-type opt-in preferences** stored as a JSON column on each subscription, with **role-based defaults** (`owner` vs `customer`).
- **Scheduled delivery, not event-driven** — a cron job polls enabled rules every 1–5 min and dispatches what is due. No queue, no jobs, no events/listeners.
- **Dedupe by log table** — a `notification_sends` row per (rule, class, occurrence) guarantees a reminder is sent exactly once even though cron fires every minute.
- **Auto-cleanup** — expired endpoints (`410 Gone`) are deleted from the DB during send.

---

## 2. Dependencies

Add to `composer.json`:

```json
{
  "require": {
    "laravel-notification-channels/webpush": "^11.0"
  }
}
```

This pulls in `minishlink/web-push` (v10.1.0 in this repo). **Note:** this project uses the underlying `Minishlink\WebPush\WebPush` SDK directly through a custom `PushService`. The Laravel `WebPushChannel` is *not* used anywhere — you can ignore it.

No npm package is needed on the frontend. All browser logic is hand-rolled against the standard `PushManager` / `Notification` APIs.

---

## 3. Configuration

### `.env`

```dotenv
# Web Push Notifications (VAPID)
VAPID_PUBLIC_KEY=<base64 urlsafe public key>
VAPID_PRIVATE_KEY=<base64 urlsafe private key>
VAPID_SUBJECT=mailto:admin@example.com
```

### `config/services.php`

```php
'vapid' => [
    'public_key'  => env('VAPID_PUBLIC_KEY'),
    'private_key' => env('VAPID_PRIVATE_KEY'),
    'subject'     => env('VAPID_SUBJECT', 'mailto:admin@example.com'),
],
```

### Generate keys

```bash
php artisan push:generate-keys
```

Uses `Minishlink\WebPush\VAPID::createVapidKeys()` and prints ready-to-paste `VAPID_*` lines.

---

## 4. Database Schema

### `push_subscriptions`

```php
Schema::create('push_subscriptions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('endpoint', 500)->unique();
    $table->string('public_key', 255);
    $table->string('auth_token', 255);
    $table->string('content_encoding', 50)->default('aes128gcm');
    $table->json('preferences')->nullable();
    $table->timestamps();
});
```

### `scheduled_notifications` (optional — only if you want the scheduled-delivery system)

```php
$table->id();
$table->string('title');
$table->text('body');
$table->string('type');                 // class_reminder | water_reminder | promotion | subscription_reminder | owner_no_classes_reminder
$table->foreignId('gym_id')->nullable()->constrained('gyms')->nullOnDelete();
$table->integer('minutes_before')->default(180);  // lead time before class start
$table->boolean('enabled')->default(true);
$table->json('config')->nullable();     // e.g. {"time":"09:00","days_before":5}
$table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
$table->timestamps();
```

### `notification_sends` (dedupe log)

```php
$table->id();
$table->foreignId('scheduled_notification_id')->constrained('scheduled_notifications')->cascadeOnDelete();
$table->foreignId('gym_id')->nullable()->constrained('gyms')->nullOnDelete();   // per-gym reminders
$table->foreignId('gym_class_id')->nullable()->constrained('gym_classes')->nullOnDelete();
$table->dateTime('occurrence_start');
$table->timestamp('sent_at')->useCurrent();
$table->timestamps();

$table->unique(['scheduled_notification_id', 'gym_class_id', 'occurrence_start'], 'ns_unique_rule_class_occurrence');
```

---

## 5. Models

### `PushSubscription`

```php
class PushSubscription extends Model
{
    protected $fillable = [
        'user_id', 'endpoint', 'public_key', 'auth_token', 'content_encoding', 'preferences',
    ];

    protected $casts = ['preferences' => 'array'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

On `User`:

```php
public function pushSubscriptions(): HasMany
{
    return $this->hasMany(PushSubscription::class);
}
```

### `ScheduledNotification` / `NotificationSend`

Plain models with `BelongsTo`/`HasMany` relations (`gym`, `creator`, `sends`; `scheduledNotification`, `gym`, `gymClass`). Casts: `minutes_before` → integer, `enabled` → boolean, `config` → array (ScheduledNotification); `occurrence_start` and `sent_at` → datetime (NotificationSend).

---

## 6. Delivery Service — `App\Services\PushService`

This is the single choke point for sending. `app/Services/PushService.php`.

```php
class PushService
{
    private WebPush $webPush;

    public function __construct()
    {
        $publicKey  = config('services.vapid.public_key');
        $privateKey = config('services.vapid.private_key');

        if (! $publicKey || ! $privateKey) {
            throw new \RuntimeException('VAPID keys are not configured.');
        }

        $this->webPush = new WebPush([
            'VAPID' => [
                'subject'   => config('services.vapid.subject'),
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ]);
    }

    /**
     * @param Collection<int, PushSubscription> $subscriptions
     * @param array{title:string, body:string, icon?:string, badge?:string, tag?:string, url?:string} $payload
     * @param callable|null $onReport  fn(bool $success, PushSubscription $sub, ?string $reason) => void
     * @return array{success:int, failed:int, removed:int}
     */
    public function sendTo(Collection $subscriptions, array $payload, ?callable $onReport = null): array
    {
        $data = json_encode([
            'title' => $payload['title'] ?? 'GYMS.ar',
            'body'  => $payload['body']  ?? '',
            'icon'  => $payload['icon']  ?? '/icon-192x192.png',
            'badge' => $payload['badge'] ?? '/badge-96x96.png',
            'tag'   => $payload['tag']   ?? 'gymcard',
            'data'  => ['url' => $payload['url'] ?? '/mi-cuenta'],
        ]);

        $success = $failed = $removed = 0;

        foreach ($subscriptions as $sub) {
            $webPushSubscription = Subscription::create([
                'endpoint'        => $sub->endpoint,
                'publicKey'       => $sub->public_key,
                'authToken'       => $sub->auth_token,
                'contentEncoding' => $sub->content_encoding ?? 'aes128gcm',
            ]);

            $this->webPush->queueNotification($webPushSubscription, $data);

            foreach ($this->webPush->flush() as $report) {
                $isSuccess = $report->isSuccess();
                if ($isSuccess) {
                    $success++;
                } else {
                    $failed++;
                    if ($report->isSubscriptionExpired()) {   // HTTP 410 Gone
                        $sub->delete();
                        $removed++;
                    }
                }
                $onReport?->call(...); // if provided
            }
        }

        return ['success' => $success, 'failed' => $failed, 'removed' => $removed];
    }
}
```

**Payload contract** (what the service worker expects):

```json
{
  "title": "…",
  "body": "…",
  "icon": "/icon-192x192.png",
  "badge": "/badge-96x96.png",
  "tag": "class-reminder-123-202609091830",
  "data": { "url": "/mi-cuenta/clases" }
}
```

`tag` deduplicates overlapping notifications in the browser (a new notification with the same tag replaces the old). `data.url` is where the user lands on click.

---

## 7. API — Subscribe / Unsubscribe / Preferences

### Controller — `app/Http/Controllers/Api/PushNotificationController.php`

Endpoints (mirrored for each role, e.g. `owner` and `customer`):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/{role}/push/vapid-public-key` | Return `{public_key}` so the browser can subscribe |
| POST | `/api/{role}/push/subscribe` | Persist a browser subscription |
| POST | `/api/{role}/push/unsubscribe` | Remove endpoint(s) |
| GET | `/api/{role}/push/preferences` | Return `{enabled, preferences}` |
| PUT | `/api/{role}/push/preferences` | Merge prefs onto all of the user's subscriptions |

**`subscribe`** — `updateOrCreate` keyed on `endpoint`:

```php
$subscription = PushSubscription::updateOrCreate(
    ['endpoint' => $validated['endpoint']],
    [
        'user_id'          => Auth::id(),
        'public_key'       => $validated['publicKey'],
        'auth_token'       => $validated['authToken'],
        'content_encoding' => $validated['contentEncoding'] ?? 'aes128gcm',
        'preferences'      => $this->defaultPreferences(),
    ]
);
```

Validation: `endpoint|required|max:500`, `publicKey|required|max:255`, `authToken|required|max:255`, `contentEncoding|nullable|max:50`.

**`unsubscribe`** — endpoint given → delete that row; no endpoint → delete **all** of the current user's subscriptions (used as a global cleanup fallback).

**`updatePreferences`** — validates boolean keys + `card_expiration_days|integer|min:1|max:30`, then `array_merge`s into the `preferences` JSON of every subscription owned by the user.

**`defaultPreferences`** — role-based:

```php
if (Auth::user()?->hasRole('owner')) {
    return ['class_schedule_reminder' => true];
}
return [
    'classes'             => true,
    'cancellations'       => true,
    'card_expiration'     => true,
    'water_reminder'      => true,
    'card_expiration_days' => 5,
];
```

### Routes

```php
// Per-role group, e.g. for customers
Route::middleware('role:customer')->prefix('customer')->group(function () {
    Route::get('push/vapid-public-key', [PushNotificationController::class, 'getVapidPublicKey']);
    Route::post('push/subscribe',       [PushNotificationController::class, 'subscribe']);
    Route::post('push/unsubscribe',     [PushNotificationController::class, 'unsubscribe']);
    Route::get('push/preferences',      [PushNotificationController::class, 'getPreferences']);
    Route::put('push/preferences',      [PushNotificationController::class, 'updatePreferences']);
});
```

Superadmin rule CRUD: `Route::apiResource('scheduled-notifications', ScheduledNotificationController::class)` inside the admin group → `GET|POST /api/admin/scheduled-notifications`, `GET|PUT|DELETE /api/admin/scheduled-notifications/{id}`. `store`/`update` validate `title, body, type, gym_id (nullable), minutes_before (1..2880), enabled, config (nullable array)` and stamp `created_by = Auth::id()`.

---

## 8. Frontend

### Service worker — `public/sw.js`

Handles `push` (parse JSON payload, `showNotification`) and `notificationclick` (close, then focus-or-open `data.url`).

```js
self.addEventListener('push', (event) => {
    if (!event.data) return;
    let data;
    try { data = event.data.json(); }
    catch (e) { data = { title: 'App', body: event.data.text() }; }

    const title = data.title || 'App';
    const options = {
        body: data.body || '',
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-96x96.png',
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        data: data.data || {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const c of clients) {
                if (c.url === url && 'focus' in c) return c.focus();
            }
            return self.clients.openWindow(url);
        })
    );
});
```

Also add `install → skipWaiting()` and `activate → clients.claim()` so the SW activates immediately. Register the SW only from within the app (the hook does it lazily); it does **not** need to be registered in the Blade shell.

### Subscription hook — `resources/js/hooks/usePushNotifications.js`

The full browser lifecycle (`usePushNotifications(basePath = '/customer/push')`):

1. **Feature detection**: `'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window`.
2. **`checkSubscription()`** — subscribed only when BOTH a browser push subscription exists AND `GET {basePath}/preferences` returns `enabled: true`.
3. **`subscribe()`** — in order:
   1. `Notification.requestPermission()` (guard against `denied`).
   2. `navigator.serviceWorker.register('/sw.js')`.
   3. `await navigator.serviceWorker.ready`.
   4. `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) })` where `vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || (await GET {basePath}/vapid-public-key).public_key`.
   5. `POST {basePath}/subscribe` with:
      ```js
      {
        endpoint: sub.endpoint,
        publicKey: arrayBufferToBase64(sub.getKey('p256dh')),
        authToken: arrayBufferToBase64(sub.getKey('auth')),
        contentEncoding: 'aes128gcm',
      }
      ```
4. **`unsubscribe()`** — iterate every SW registration; for each subscription `POST {basePath}/unsubscribe {endpoint}` then `sub.unsubscribe()`. If none found locally, send a global `POST {basePath}/unsubscribe` (no body) to wipe server-side rows.
5. **`updatePreferences()`** — `PUT {basePath}/preferences`.

Required helpers:

```js
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
}
```

> Use a `withTimeout(promise, ms)` race helper around every API/SW call — `getRegistrations`, `getSubscription`, `serviceWorker.ready` and network calls can hang forever in some browsers.

### Settings UI

- Customer page (`resources/js/pages/customer/NotificationsSettings.jsx`): master toggle, permission state, preference switches (`classes`, `cancellations`, `card_expiration` + `card_expiration_days` number input 1–30, `water_reminder`), "Guardar preferencias" button.
- Owner page: single preference `class_schedule_reminder`, hook called with `usePushNotifications('/owner/push')`.
- Superadmin page (`resources/js/pages/superadmin/Notifications.jsx`): CRUD grid for `scheduled_notifications`; `TYPES` = `class_reminder, water_reminder, promotion, subscription_reminder, owner_no_classes_reminder`; builds `config` = `{time}` and/or `{days_before}`.

### PWA assets

`public/manifest.json` + `icon-192x192.png`, `icon-512x512.png`, maskable variants, `badge-96x96.png`. Referenced from `resources/views/app.blade.php` via `<link rel="manifest">`. Push notifications will still work without a manifest, but you want icons + `start_url` for the installable experience.

---

## 9. Commands

All in `app/Console/Commands/`. Laravel auto-discovers them (no registration needed). Run `php artisan list | grep push` to confirm.

### `push:generate-keys`
Prints a fresh VAPID keypair. Run once, paste into `.env`.

### `push:test {user?} {--all}`
Sends a test payload (`tag: 'test-notification'`). With no args, interactively lists users who have subscriptions (`User::whereHas('pushSubscriptions')->pluck('email','id')`). Deletes expired subs on `410`.

### `push:send {--message=} {--title=} {--url=} {--user=} {--gym=} {--all} {--dry-run}`
Ad-hoc broadcast. Recipients:
- `--user` → `PushSubscription::where('user_id', $userId)`
- `--gym` → `whereHas('user.customer', fn ($q) => $q->where('gym_id', $gymId))`
- `--all` → everything

`--message` is required; progress bar; returns FAILURE if any send fails.

### `push:clear {--user=} {--gym=} {--all} {--dry-run} {--force}`
Deletes subscriptions (with confirmation prompt unless `--force`). Note: browsers keep their subscription; the next send to a removed endpoint returns `410 Gone` and gets cleaned up automatically.

### `push:dispatch {--dry-run} {--now} {--gym=}` — the scheduler
See next section.

---

## 10. Scheduled Dispatch — the important part

`DispatchScheduledNotifications.php` (502 lines) is the whole scheduling engine. `handle()`:

1. Requires VAPID keys, else FAILURE.
2. Loads **enabled** `ScheduledNotification` rules (optionally scoped by `--gym`).
3. Dispatches per `rule->type` via `match`:
   - `class_reminder`
   - `water_reminder`
   - `promotion`
   - `subscription_reminder`
   - `owner_no_classes_reminder`
4. Accumulates `totalSent / totalFailed / totalRemoved / totalSkipped`.

### Supported types

| Type | Trigger | Recipients | Preference filter |
|------|---------|------------|-------------------|
| `class_reminder` | `minutes_before` minutes before each class occurrence | Users registered in the class (attendance → customer → user) | `preferences.classes` |
| `water_reminder` | Daily at `config.time` (HH:MM) | All gym subscribers | `preferences.water_reminder` |
| `promotion` | Daily at `config.time`, else first cron run of the day | All gym subscribers | none |
| `subscription_reminder` | Daily for memberships expiring within `config.days_before` (default 5) | Card owners | `preferences.card_expiration` |
| `owner_no_classes_reminder` | Daily at `config.time` (default 07:00), only if the gym has **no** upcoming classes | Gym owner | `preferences.class_schedule_reminder` |

### Reusable patterns

**Time-window check** (fire once per occurrence, in the cron window):

```php
if (! $nowFlag) {
    $dueTime = $occurrenceStart->copy()->subMinutes($rule->minutes_before);
    if (now()->lt($dueTime) || now()->gte($occurrenceStart)) {
        $this->totalSkipped++;
        continue;
    }
}
```

**Dedupe** (before every send):

```php
$alreadySent = NotificationSend::where('scheduled_notification_id', $rule->id)
    ->where('gym_class_id', $class->id)
    ->where('occurrence_start', $occurrenceStart)
    ->exists();
if ($alreadySent) { /* skip */ }

// ...after a real send:
NotificationSend::create([
    'scheduled_notification_id' => $rule->id,
    'gym_id' => $gymId,          // only used by per-gym rules
    'gym_class_id' => $classId,  // null for day-based rules
    'occurrence_start' => $occurrence,
]);
```

For day-based rules use `occurrence_start = now()->startOfDay()` with a `whereNull('gym_class_id')` check. For per-gym day rules additionally filter on `gym_id`.

**Resolving class occurrences** — a class either has a single `starts_at` datetime or a weekly `schedule` JSON keyed by day name:

```php
private const DAY_KEYS = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];

// today's slots from schedule[DAY_KEYS[now()->dayOfWeek]] = ["HH:MM-HH:MM", ...]
// or the single starts_at if it falls on today
```

**Preference filtering** — treat missing key as enabled:

```php
private function prefEnabled(PushSubscription $sub, string $key): bool
{
    $prefs = $sub->preferences ?? [];
    $val = $prefs[$key] ?? true;
    return $val !== false && $val !== 0 && $val !== 'false';
}
```

### Cron

No scheduler wiring in Laravel (`routes/console.php` / `bootstrap/app.php`) — an external crontab drives it:

```bash
* * * * * cd /path/to/project && php artisan push:dispatch >> storage/logs/push-dispatch.log 2>&1
# or every 5 minutes:
*/5 * * * * cd /path/to/project && php artisan push:dispatch >> storage/logs/push-dispatch.log 2>&1
```

Testing without waiting:

```bash
php artisan push:dispatch --now --dry-run   # dry run of everything due today
php artisan push:dispatch --now --gym=3     # force-send one gym
```

---

## 11. End-to-End Flow (reference for debugging)

1. **Activate** — user opens Settings → Notifications → taps "Enable". `subscribe()` runs: permission → SW register → `pushManager.subscribe` → POST `/api/{role}/push/subscribe`.
2. **Preference** — user toggles switches; `PUT /api/{role}/push/preferences` merges into every row.
3. **Schedule** — superadmin creates an enabled rule (e.g. `class_reminder`, `minutes_before: 180`).
4. **Dispatch** — cron fires `push:dispatch`; rule matched; occurrence due → dedupe check → collect subscriptions (gym scope + preference filter) → `PushService::sendTo()`.
5. **Deliver** — browser receives push event, shows notification with `tag`, `icon`, `badge`, `data.url`.
6. **Click** — `notificationclick` focuses existing tab or opens `data.url`.
7. **Cleanup** — any expired endpoint returns `410 Gone`; `PushService` deletes the row and counts it as `removed`.

---

## 12. Gotchas & Design Notes

- **`endpoint` uniqueness** — use `updateOrCreate(['endpoint' => …])` so re-subscribing on the same browser never duplicates.
- **`410 Gone` is your friend** — never manually prune "old" subscriptions; let the send pipeline remove them. Browser unsubscribe is unreliable (users clear site data, revoke permission, etc.).
- **`preferences` lives on the subscription, not the user** — so per-device opt-outs are possible. `updatePreferences` must iterate **all** the user's subscriptions.
- **Role-based defaults** — a customer defaulting to "everything on" drives engagement; an owner only gets `class_schedule_reminder` (matches the actual feature available to them).
- **`tag` per notification kind** — always include it in the payload. It prevents notification stacking for the same event and makes stale notifications auto-replace.
- **`content_encoding`** — always store/forward `aes128gcm` (the only option still supported by browsers; `aesgcm` is deprecated).
- **Payload size** — encrypted payloads must stay small; keep `body` ≤ ~500 chars. Plain JSON gets padded/encrypted so budget accordingly.
- **Synchronous sends** — everything here is synchronous inside the cron command. For large audiences, wrap `PushService::sendTo()` in a queued job; the dedupe log still prevents double sends.
- **HTTPS required** — service workers + PushManager only work on `localhost` or HTTPS origins.
- **The channel package is a transport, not a feature** — you don't have to build on `WebPushChannel`; a thin service wrapping `Minishlink\WebPush\WebPush` gives you full control over payload shape, per-subscription preference filtering, and the `410` cleanup in one place.

---

## 13. Files in this repo to copy from

| Concern | File |
|---------|------|
| Delivery | `app/Services/PushService.php` |
| API controller | `app/Http/Controllers/Api/PushNotificationController.php` |
| Rule CRUD controller | `app/Http/Controllers/Api/Admin/ScheduledNotificationController.php` |
| Models | `app/Models/PushSubscription.php`, `ScheduledNotification.php`, `NotificationSend.php` |
| Migrations | `database/migrations/2026_08_10_000000_create_push_subscriptions_table.php` (+ the three `2026_08_11*` / `2026_08_17*` ones) |
| Commands | `app/Console/Commands/{GenerateVapidKeys,TestPushNotification,SendPushNotification,ClearPushSubscriptions,DispatchScheduledNotifications}.php` |
| Service worker | `public/sw.js` |
| React hook | `resources/js/hooks/usePushNotifications.js` |
| Settings UI | `resources/js/pages/{customer,owner}/NotificationsSettings.jsx`, `resources/js/pages/superadmin/Notifications.jsx` |
| Config | `config/services.php` (`vapid` block), `.env.example` |
| Command docs | `docs/commands.md` |