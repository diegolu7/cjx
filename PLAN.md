# PLAN: Cuando Juega el Xeneize

> **Dominio:** `cuandojuegaelxeneize.com.ar`
> **Repo:** `git@github.com:diegolu7/cjx.git`
> **Estado:** En desarrollo
> **Última actualización:** 2026-09-09

---

## 1. Concepto del Proyecto

Sitio web informativo que muestra **próximos partidos, rivales, fechas y resultados** del Club Atlético Boca Juniors.

**Propuesta de valor:** "Entrás, ves cuándo juega Boca, y te vas. Sin vueltas."

---

## 2. Stack Técnico

| Componente         | Tecnología                           | Costo                 |
| ------------------ | ------------------------------------ | --------------------- |
| Framework          | Astro + TypeScript                   | $0                    |
| Interactividad     | React (islands)                      | $0                    |
| Estilos            | Tailwind CSS                         | $0                    |
| Animaciones        | Framer Motion + Aceternity UI        | $0                    |
| Backend datos      | Google Sheets (leído como JSON)      | $0                    |
| Auto-actualización | Google Apps Script + TheSportsDB API | $0                    |
| Hosting            | GitHub Pages → Cloudflare Pages      | $0                    |
| DNS                | Cloudflare                           | $0                    |
| Dominio            | `.com.ar` (NIC Argentina)            | ~$3.000-5.000 ARS/año |
| **Total anual**    |                                      | **~$3.000-5.000 ARS** |

**Nota:** Fase inicial en GitHub Pages. Luego se pasa a Cloudflare Pages en producción.

### Stack detallado

```
Framework:   Astro + TypeScript
Componentes: React para interactividad (tabs, filtros)
Estilos:     Tailwind CSS (tokens mapeados desde design.md)
Animaciones: Framer Motion + Aceternity UI (selectivo, sutil)
Build:       astro build → estático en /dist
```

### Nota sobre Animaciones

- Transiciones suaves entre secciones
- Efectos hover en elementos interactivos
- Animaciones de entrada progresiva (scroll-triggered)
- Aceternity UI para elementos gráficos modernos, PERO respetando restrictions del design.md:
  - Sin neon exagerado
  - Sin glassmorphism
  - Sin glow excesivo
  - Cards principales fieles a design.md

### Arquitectura

```
┌──────────────────────┐
│   Google Sheets       │
│  ┌──────────────────┐ │
│  │ Pestaña "Partidos"│ │ ← Una sola pestaña
│  │ Estado|Fecha|Hora │ │   Carga MANUAL + Script
│  │ Rival|Goles|Torneo│ │   auto-marca Finalizado
│  │ Fase|Canal|Lugar  │ │
│  └──────────────────┘ │
└──────────┬───────────┘
           │ Google Sheets API (CSV publicado)
           ▼
┌──────────────────────┐
│   GitHub Pages        │ ← Fase inicial
│   (Astro build /dist) │   fetch() al JSON
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Cloudflare Pages     │ ← Fase productiva
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  cuandojuegael        │
│  xeneize.com.ar      │ ← DNS Cloudflare
└──────────────────────┘

┌──────────────────────┐
│   TheSportsDB API     │ ← Gratis, sin API key
│   (auto-actualiza     │   ID Boca: 135156
│    goles y estado)    │
└──────────────────────┘
```

---

## 3. Estructura del Google Sheet

**Google Sheet:** https://docs.google.com/spreadsheets/d/1kqtU0JAyqtQ9NY2Jm-94eXxHQCNMLnc2C9Sd_hM69Xw/edit

> 📘 **Cómo cargar cada columna (formato, valores y reglas): ver [`docs/formato.md`](./docs/formato.md)**.

### Pestaña única "Partidos" (carga manual + auto-actualización)

El sitio consume **una sola pestaña** con todas las fechas. Cada fila es un partido; no hay filas separadas por estado. Los nombres de columna se leen de la **fila 1** y el parser los mapea por nombre (no por índice), así el orden puede acomodarse.

| Columna         | Ejemplo                | Descripción                            |
| --------------- | ---------------------- | -------------------------------------- |
| A: Estado       | Próximo / Confirmado / Finalizado | Estado del partido           |
| B: Fecha        | 2026-09-08             | Fecha del partido (ISO yyyy-mm-dd)     |
| C: Hora         | 21:30                  | Hora Argentina                         |
| D: Condición    | Local / Visitante      | Define si Boca juega de local o visita |
| E: Rival        | São Paulo              | Nombre del rival                       |
| F: Goles Boca   | (vacío)                | Goles de Boca (se llena al finalizar)  |
| G: Goles Rival  | (vacío)                | Goles del rival (se llenan al finalizar) |
| H: Torneo       | Copa Sudamericana      | Competencia                            |
| I: Fase         | Cuartos de Final - Ida | Instancia / fecha del torneo           |
| J: Canal        | ESPN                   | Dónde se puede ver (opcional)          |
| K: Lugar        | La Bombonera           | Estadio (opcional)                     |

**Fila 1 (headers) — copiar literal en la celda A1:**
`Estado,Fecha,Hora,Condición,Rival,Goles Boca,Goles Rival,Torneo,Fase,Canal,Lugar`

**Valores de Estado:**
- `Próximo` → se muestra como el **partido destacado** (FeaturedMatchCard).
- `Confirmado` → partido programado (lista de próximos).
- `Finalizado` → pasa a la sección "Anteriores" con su marcador.

**Importante para que el sitio lo lea:** menú `Archivo → Compartir → Publicar en la web` → pestaña `Partidos` → formato **CSV**. Sin publicar, el sitio muestra los datos de ejemplo.

---

## 4. Automatización con TheSportsDB

### Datos de la API

```
Equipo: Boca Juniors
ID TheSportsDB: 135156
URL Próximos: https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=135156
URL Últimos: https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=135156
Costo: GRATIS (sin API key para uso básico)
```

### Campos disponibles en la API

| Campo            | Disponible | Ejemplo                                    |
| ---------------- | ---------- | ------------------------------------------ |
| Rival            | ✅         | `strAwayTeam`: "São Paulo"                 |
| Fecha            | ✅         | `dateEvent`: "2026-09-08"                  |
| Hora (ARG)       | ✅         | `strTimeLocal`: "21:30:00"                 |
| Torneo           | ✅         | `strLeague`: "Copa Sudamericana"           |
| Goles            | ✅         | `intHomeScore` / `intAwayScore`            |
| Estadio          | ✅         | `strVenue`: "Estadio Alberto José Armando" |
| Canal de TV      | ❌         | No disponible (carga manual)               |
| Más de 1 próximo | ⚠️         | Solo devuelve el siguiente                 |

### Script de Google Apps Script

> ✅ **v2 actual** (2026-09): script completo en [`docs/auto_actualizar.gs`](./docs/auto_actualizar.gs) con:
> - `actualizarResultadosBoca()` — completa goles/Estado de filas existentes e inserta resultados recientes faltantes.
> - `insertarProximoSiFalta()` — inserta el próximo partido solo si no hay ningún futuro cargado.
> - Lectura de columnas por nombre (no depende del orden), normalización de rival/fechas y dedupe.
> - No pisa Canal/Torneo manuales. Soporta la primera pestaña de la hoja.

### Configuración del Activador

| Parámetro | Valor                                       |
| --------- | ------------------------------------------- |
| Función   | `actualizarResultadosBoca` y `insertarProximoSiFalta` (o `actualizarTodo`) |
| Fuente    | Según tiempo                                |
| Tipo      | Temporizador por horas                      |
| Frecuencia| **Cada 1 hora** (~48 llamadas/día a TheSportsDB: dentro de cuotas gratuitas) |

> No bajar de 1 hora por las cuotas de TheSportsDB sin API key. Con key gratuita se puede ajustar.

### Escalabilidad futura (estado: evolutivo)

El front hoy lee la hoja directamente desde cada navegador (Google responde `no-store`), con
caché local de 10 min y fallback a la última caché ante errores. Para una "ola" grande de
visitantes, el plan **B (snapshot)** es el paso recomendado antes de producción:
un GitHub Action que baje el CSV y genere `public/matches.json` (el sitio leería un archivo
propio servido por CDN, sin tocar Google).

---

## 5. Estrategia Legal (Derecho Informático)

### 5.1 Protección del nombre

| Capa              | Estrategia                           | Riesgo                                              |
| ----------------- | ------------------------------------ | --------------------------------------------------- |
| **Dominio**       | `cuandojuegaelxeneize.com.ar`        | **Mínimo** - "Xeneize" es término cultural genérico |
| **Contenido SEO** | Mencionar "Boca Juniors" en textos   | **Nulo** - Uso descriptivo legítimo                 |
| **Meta tags**     | Title/description con "Boca Juniors" | **Nulo** - Práctica estándar SEO                    |
| **Disclaimer**    | "Sitio no oficial" visible           | **Protector** - Refuerza buena fe                   |

### 5.2 Lo que NO se puede hacer

- ❌ Usar el escudo oficial de Boca Juniors
- ❌ Usar la paleta de colores exacta (Pantone institucional)
- ❌ Copiar el patrón de rayas verticales azul-amarillo
- ❌ Dar a entender que es un sitio oficial o afiliado
- ❌ Usar fotos con copyright sin permiso

### 5.3 Lo que SÍ se puede hacer

- ✅ Mencionar "Boca Juniors", "Boca", "Xeneize" en contenido
- ✅ Crear logo propio 100% original
- ✅ Usar colores "inspirados" (azul y amarillo genéricos)
- ✅ Linkear a bocajuniors.com.ar como fuente oficial
- ✅ Usar información pública de calendarios

### 5.4 Disclaimer obligatorio

```html
<footer>
  <p>
    Este sitio no está afiliado, respaldado ni conectado con el Club Atlético
    Boca Juniors ni ninguna de sus subsidiarias.
  </p>
  <p>
    La página oficial del club es
    <a href="https://www.bocajuniors.com.ar" target="_blank">
      bocajuniors.com.ar
    </a>
  </p>
</footer>
```

---

## 6. Estrategia de Marketing / SEO

### 6.1 Keywords objetivo

| Keyword                    | Volumen estimado | Prioridad  |
| -------------------------- | ---------------- | ---------- |
| cuando juega boca          | MUY ALTO         | Principal  |
| cuando juega boca juniors  | ALTO             | Principal  |
| proximo partido boca       | ALTO             | Secundaria |
| boca juniors calendario    | MEDIO            | Secundaria |
| boca fecha próximo partido | MEDIO            | Long-tail  |

### 6.2 SEO On-page

```html
<title>Cuándo Juega Boca Juniors - Próximos Partidos 2026</title>
<meta
  name="description"
  content="Calendario de partidos de Boca Juniors.
  Próximos encuentros, rivales y horarios. Sitio no oficial.
  Canal oficial: bocajuniors.com.ar"
/>

<h1>Cuándo Juega Boca Juniors</h1>
<h2>Próximos Partidos</h2>
```

### 6.3 Canales de tráfico

1. **SEO orgánico** (principal)
2. **Twitter/X** - Alertas antes de cada partido
3. **WhatsApp** - Lista de difusión
4. **Google Search Console** - Monitorear indexación

### 6.4 Monetización futura

| Nivel          | Fuente         | Ingreso estimado |
| -------------- | -------------- | ---------------- |
| 1K visitas/día | Google AdSense | $10-30 USD/mes   |

---

## 7. Diseño del Sitio

### 7.1 Principios

- **Minimalista:** Sin banners, sin pop-ups
- **Rápido:** Carga en <2 segundos
- **Mobile-first:** 90%+ tráfico desde celular
- **Accesible:** Contraste WCAG AA

### 7.2 Paleta de colores

**Definida en `design.md` (Design Tokens - Sección 4.1).** Este es el source of truth:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg` | `#07111F` | Background |
| `--color-surface` | `#0D1B2E` | Cards |
| `--color-surface-elevated` | `#101F34` | Featured card |
| `--color-surface-hover` | `#11233A` | Hover |
| `--color-accent` | `#D9A441` | Dorado (próximo) |
| `--color-accent-strong` | `#E7B85C` | Dorado fuerte |
| `--color-accent-secondary` | `#5FA8D3` | Azul claro |
| `--color-text-primary` | `#F3F7FB` | Texto principal |
| `--color-text-secondary` | `#A7B6C8` | Metadata |
| `--color-text-muted` | `#71849A` | Texto muted |

Estos tokens se mapean 1:1 en `src/styles/global.css` con Tailwind v4 (`@theme`).

### 7.3 Wireframe Homepage

**Definido en `design.md` (Secciones 26 y 28):**
- Mobile wireframe → design.md #26
- Desktop wireframe → design.md #28
- Arquitectura de componentes → design.md #12

Ver el wireframe completo en `design.md` antes de implementar.

---

## 8. Fases de Desarrollo

### Fase 1: MVP (1-2 días)

- [x] Crear Google Sheet (sin columnas aún): https://docs.google.com/spreadsheets/d/1kqtU0JAyqtQ9NY2Jm-94eXxHQCNMLnc2C9Sd_hM69Xw/edit
- [x] Logo desktop, mobile y favicon en repo
- [x] Inicializar repo git y conectar con GitHub (git init + remote origin)
- [x] Crear proyecto Astro + TypeScript + React + Tailwind (build ✓, astro check limpio)
- [ ] Configurar columnas del Google Sheet (headers definidos en §3, falta cargarlos)
- [x] Definir script de auto-actualización de resultados (en §4, listo para pegar en Apps Script)
- [x] Fetch al Sheet y renderizar partidos (timeline, tabs, FeaturedMatchCard — con fallback a datos demo)
- [ ] Publicar el Sheet como CSV (Archivo → Publicar en la web) para que el fetch funcione
- [ ] Deploy a GitHub Pages
- [ ] Configurar dominio en Cloudflare

### Fase 2: Diseño (2-3 días)

- [x] Diseñar logo propio - **YA CREADO** (logo_desktop.png, logo_mobile.png, favicon.ico)
- [x] Favicon - **YA CREADO** (favicon.png / favicon.ico)
- [ ] Integrar logo en el header según design.md
- [ ] CSS responsive mobile-first (Tailwind con tokens del design.md)
- [ ] Animaciones sutiles (Framer Motion + Aceternity UI)

### Fase 3: Contenido SEO (1 día)

- [ ] Meta tags optimizados
- [ ] Schema.org (SportsEvent)
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Disclaimer visible

### Fase 4: Marketing (ongoing)

- [ ] Crear cuenta Twitter/X
- [ ] Google Search Console
- [ ] Google Analytics 4
- [ ] Plan de contenido pre-partido

### Fase 5: Evolutivos (futuro)

- [ ] PWA (manifest.json + service worker)
- [ ] Notificaciones push (OneSignal)
- [ ] Imagen descargable para compartir

### Fase 5: Evolutivos (futuro)

- [ ] PWA (manifest.json + service worker)
- [ ] Notificaciones push (OneSignal)
- [ ] Imagen descargable para compartir

---

## 9. Checklist Legal Pre-Lanzamiento

- [ ] Disclaimer visible en header Y footer
- [ ] Logo 100% original (no copia del escudo)
- [ ] No se usa escudo oficial en ninguna parte
- [ ] Colores inspirados, no idénticos a la marca
- [ ] Link a bocajuniors.com.ar visible
- [ ] Términos y condiciones
- [ ] Política de privacidad (si usa cookies/analytics)

---

## 10. Evolutivos a Futuro

Features que se implementarán cuando el sitio tenga tracción suficiente.

### 10.1 PWA (Progressive Web App) - Acceso Directo

**Objetivo:** Que el hincha "instale" tu sitio como app en su celular.

| Característica      | Beneficio                          |
| ------------------- | ---------------------------------- |
| Ícono en el celular | Tu marca visible todo el tiempo    |
| Notificaciones push | "¡Falta 1 hora! Boca vs São Paulo" |
| Funciona offline    | Puede ver agenda sin conexión      |
| Carga rápida        | Sin descargar de tiendas           |

**Cómo funciona:**

```
1. Hincha entra a cuandojuegaelxeneize.com.ar
2. Chrome/Safari: "¿Agregar a tu pantalla?"
3. Hincha dice SÍ
4. Aparece tu ícono en su celular
5. 1 hora antes del partido:
   → RECIBE NOTIFICACIÓN
   → TOCA la notificación
   → ABRE tu sitio
   → VE resultado + agenda
   → VE ANUNCIOS
```

**Archivos necesarios:**

```
├── manifest.json     ← Define la "app"
├── sw.js             ← Service worker (notificaciones)
├── icon-192.png      ← Ícono 192x192
└── icon-512.png      ← Ícono 512x512
```

**Costo:** $0 (todo gratis)

### 10.2 Notificaciones Push

**Servicio:** OneSignal (gratis hasta 10K suscriptores)

**Ejemplo:**

```
"¡Falta 1 hora! Boca vs São Paulo por Copa Sudamericana"
```

**Regla:** Máximo 1 notificación por partido (antes del inicio)

### 10.3 Imagen Descargable (Marketing Viral)

**Objetivo:** Que el hincha comparta la agenda en WhatsApp/Instagram.

**Formato:**

```
┌─────────────────────────────┐
│  PRÓXIMOS PARTIDOS BOCA     │
│  ─────────────────────────  │
│  08/09 São Paulo 21:30 ESPN │
│  11/09 C. Córdoba 21:30     │
│  15/09 São Paulo 21:30      │
│  ─────────────────────────  │
│  cuandojuegaelxeneize.com.ar │
└─────────────────────────────┘
```

### 10.4 Prioridad de Evolutivos

| Feature             | Prioridad | Cuándo implementar                 |
| ------------------- | --------- | ---------------------------------- |
| PWA (manifest + SW) | Alta      | Cuando tenga 500+ visitas/día      |
| Notificaciones push | Media     | Después de PWA                     |
| Imagen descargable  | Baja      | Marketing viral, cualquier momento |

---

## 11. Apéndice: Fuente de Verdad de Diseño

El archivo `design.md` es la **fuente de verdad del diseño UI/UX** del sitio. Cualquier decisión de implementación visual debe remitirse a ese documento.

**Regla:** Si existe una diferencia entre la interpretación del programador y lo documentado en `design.md`, **siempre prevalece `design.md`**.

### Contenido del design.md

| Sección            | Descripción                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Design Tokens      | Colores, tipografía (IBM Plex Mono), espaciados, radios, sombras |
| Componentes        | Header, Tabs, MatchCard, FeaturedMatchCard, Timeline, Footer     |
| Responsive         | Mobile-first (320px), desktop (900px+) con timeline lateral      |
| Wireframes         | Mobile y desktop detallados                                      |
| Accesibilidad      | WCAG 2.2 AA, focus visible, contraste mínimo                     |
| Checklists         | QA visual mobile, desktop, y del próximo partido                 |
| Definition of Done | Criterios de aceptación obligatorios                             |

### Puntos clave a recordar

1. **El próximo partido es el centro visual** - debe ser el elemento dominante
2. **Orden cronológico estricto** - partidos pasados → próximo → futuros
3. **NO usar colores institucionales** - azul oscuro `#07111F`, dorado `#D9A441`
4. **Tipografía monospace** - IBM Plex Mono
5. **Desktop tiene timeline lateral** con nodos (○ pasado, ● próximo)
6. **BEM para CSS** - `.match-card__teams`, `.status-badge--next`
7. **Sin emojis** - usar Lucide Icons
8. **FeaturedMatchCard es componente propio** - no es una card normal con otro color

---

## 12. Notas / Decisiones Pendientes

- [ ] Verificar disponibilidad del dominio `cuandojuegaelxeneize.com.ar`
- [ ] Investigar si "Xeneize" tiene marca registrada en INPI
- [ ] Decidir si registrar marca propia desde el inicio
- [ ] Definir frecuencia de carga del fixture (semanal?)
- [x] Definir columnas exactas del Google Sheet (ver §3 — falta cargar los headers en el sheet)
- [x] Badges de estado cortos: `FINAL` / `PRÓXIMO` / `PREVISTO` (override sobre design.md §22)
- [x] **Decisión 2026-09:** fixture (copas/amistosos/internacionales) se carga **a mano** (plantilla en `docs/prompt_gemini.md`); el script auto-actualiza **solo resultados** + limpieza, con auto-próximo como red de seguridad. Full-auto real de fixture → evolutivo con API-Football si algún día se requiere.

---

_Este documento se actualiza conforme se avanza en el proyecto._
