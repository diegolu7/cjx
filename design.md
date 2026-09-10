# `design.md` — Cuándo juega el Xeneize

> **Versión:** 1.0  
> **Alcance:** UI/UX responsive, mobile-first + desktop  
> **Objetivo:** implementar fielmente el mockup aprobado, preservando jerarquía, orden cronológico, proporciones, colores, tipografía, iconografía, sombras, estados y comportamiento responsive.

---

# 1. Objetivo del diseño

El producto debe permitir responder en pocos segundos:

> **¿Cuándo juega Boca y qué pasó en los partidos inmediatamente anteriores?**

La experiencia debe funcionar como una **línea temporal cronológica única**:

1. partidos anteriores;
2. próximo partido destacado;
3. partidos siguientes.

No se debe separar la información principal en módulos independientes del tipo “Agenda” y “Últimos resultados”.

La interfaz debe sentirse:

- deportiva;
- moderna;
- seria;
- oscura;
- premium;
- compacta;
- legible;
- con una estética levemente técnica / terminal;
- claramente distinta de una interfaz institucional oficial.

La pieza visual dominante siempre debe ser el **próximo partido**.

---

# 2. Referencia visual principal

El desarrollo debe tomar como referencia el mockup aprobado de mobile + desktop.

El mockup define especialmente:

- composición;
- proporciones;
- orden de bloques;
- densidad visual;
- jerarquía;
- estilo de cards;
- distribución del contenido;
- protagonismo del próximo partido;
- relación entre pasado / próximo / futuros;
- sensación general del producto.

## Regla

Cuando exista una diferencia entre:

1. una interpretación libre del programador;
2. una decisión documentada en este archivo;

**prevalece este `design.md`.**

No agregar recursos visuales “porque quedan bien” si no están documentados.

---

# 3. Principios no negociables

## 3.1. Estructura cronológica

Orden obligatorio:

```text
PARTIDO ANTERIOR
PARTIDO ANTERIOR
PRÓXIMO PARTIDO DESTACADO
PARTIDO FUTURO
PARTIDO FUTURO
PARTIDO FUTURO
```

En desktop puede visualizarse además como timeline:

```text
ANTERIORES
    ○
    ○
PRÓXIMO
    ●
PRÓXIMOS
    ○
    ○
    ○
```

---

## 3.2. Próximo partido

Debe ser el elemento con mayor peso visual de toda la página.

Debe diferenciarse mediante:

- borde más fuerte;
- color accent;
- glow muy sutil;
- badge `PRÓXIMO`;
- fecha/hora enfatizada;
- mayor altura que una card estándar;
- mayor peso tipográfico en los equipos.

No debe convertirse en una card “gamer”, neon exagerada o con efectos intensos.

---

## 3.3. Identidad visual no oficial

La interfaz **no debe imitar una identidad institucional oficial**.

No usar:

- escudo oficial;
- isotipos oficiales;
- composición gráfica institucional;
- franjas características;
- combinaciones cromáticas oficiales exactas;
- amarillo puro saturado;
- azul rey saturado;
- fondos azul + amarillo institucionales.

El sitio debe incluir una aclaración visible y discreta:

```text
Sitio no oficial.
```

---

# 4. Design tokens

---

## 4.1. Colores

Paleta definitiva:

```css
:root {
  /* Backgrounds */
  --color-bg: #07111F;
  --color-surface: #0D1B2E;
  --color-surface-elevated: #101F34;
  --color-surface-hover: #11233A;

  /* Borders */
  --color-border: #1C3552;
  --color-border-strong: #274866;

  /* Text */
  --color-text-primary: #F3F7FB;
  --color-text-secondary: #A7B6C8;
  --color-text-muted: #71849A;

  /* Accents */
  --color-accent: #D9A441;
  --color-accent-strong: #E7B85C;
  --color-accent-secondary: #5FA8D3;

  /* Status */
  --color-status-finished: #A7B6C8;
  --color-status-scheduled: #5FA8D3;
  --color-status-next: #D9A441;

  /* Utility */
  --color-black: #000000;
  --color-white: #FFFFFF;
}
```

---

## 4.2. Opacidades

```css
:root {
  --opacity-border-soft: 0.70;
  --opacity-muted: 0.72;
  --opacity-disabled: 0.42;
  --opacity-glow: 0.14;
}
```

---

## 4.3. Tipografía

Fuente recomendada:

```css
--font-ui: "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

Importar preferentemente desde Google Fonts o servir localmente según arquitectura del proyecto.

Pesos requeridos:

```text
400 Regular
500 Medium
600 SemiBold
700 Bold
```

No mezclar múltiples familias tipográficas en la primera versión.

---

## 4.4. Escala tipográfica

### Mobile

| Elemento | Size | Line-height | Weight | Letter-spacing |
|---|---:|---:|---:|---:|
| H1 principal | 28px | 1.12 | 700 | 0.02em |
| Subtítulo | 14px | 1.45 | 400 | 0.04em |
| Tabs | 12px | 1 | 600 | 0.04em |
| Fecha normal | 18px | 1.05 | 600 | 0.01em |
| Equipos normal | 15px | 1.25 | 600 | 0 |
| Metadata | 12px | 1.45 | 400 | 0.01em |
| Featured teams | 18px | 1.2 | 700 | 0 |
| Featured date/time | 16px | 1.35 | 600 | 0.02em |
| Badge | 10px | 1 | 600 | 0.03em |
| Footer | 11px | 1.4 | 400 | 0.02em |

### Desktop

| Elemento | Size | Line-height | Weight | Letter-spacing |
|---|---:|---:|---:|---:|
| H1 principal | 30px | 1.12 | 700 | 0.02em |
| Subtítulo | 15px | 1.45 | 400 | 0.04em |
| Nav | 12px | 1 | 600 | 0.04em |
| Timeline label | 13px | 1 | 600 | 0.03em |
| Fecha normal | 18px | 1.05 | 600 | 0.01em |
| Equipos normal | 15px | 1.25 | 600 | 0 |
| Metadata | 12px | 1.45 | 400 | 0.01em |
| Featured teams | 20px | 1.2 | 700 | 0 |
| Featured date/time | 17px | 1.35 | 600 | 0.02em |
| Badge | 10px | 1 | 600 | 0.03em |
| Footer | 11px | 1.4 | 400 | 0.02em |

---

# 5. Espaciado

Usar una escala cerrada.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 64px;
}
```

Evitar valores arbitrarios salvo necesidad real.

---

# 6. Border radius

```css
:root {
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-pill: 999px;
}
```

Aplicación:

```text
Cards normales        8px
Card destacada        8px
Tabs                   4px
Badges                 4px
Contenedor desktop     10px
```

No usar radios grandes tipo 16–24px.

---

# 7. Bordes

```css
--border-default: 1px solid var(--color-border);
--border-strong: 1px solid var(--color-border-strong);
--border-featured: 2px solid var(--color-accent);
```

---

# 8. Sombras

## Card estándar

```css
box-shadow:
  0 4px 16px rgba(0, 0, 0, 0.16);
```

## Próximo partido

```css
box-shadow:
  0 0 0 1px rgba(217, 164, 65, 0.08),
  0 8px 24px rgba(0, 0, 0, 0.28),
  0 0 22px rgba(217, 164, 65, 0.14);
```

## Hover desktop

```css
box-shadow:
  0 6px 20px rgba(0, 0, 0, 0.22);
```

### No usar

- glow blanco;
- glow azul intenso;
- box-shadow difuso exagerado;
- glassmorphism;
- blur detrás de cards;
- sombras “3D”.

---

# 9. Backgrounds

## Body

```css
background: var(--color-bg);
```

Puede incorporarse una textura o fotografía deportiva **muy oscurecida**, siempre que:

```text
opacity percibida <= 10%
no dificulte lectura
no compita con las cards
no use branding oficial
```

La versión MVP puede funcionar perfectamente con background plano.

---

# 10. Gradientes

Usar únicamente en el próximo partido.

```css
background:
  linear-gradient(
    135deg,
    #0D1B2E 0%,
    #101F34 100%
  );
```

No aplicar gradientes fuertes al resto de las cards.

---

# 11. Iconografía

Librería recomendada:

```text
Lucide Icons
```

Iconos permitidos:

```text
Menu
Tv
ArrowRight
ChevronDown
```

Opcional:

```text
Clock
CalendarDays
```

Reglas:

```text
stroke-width: 1.5
tamaño estándar: 16px
menu mobile: 24px
flechas: 16px
```

No usar emojis.

No mezclar:

- FontAwesome;
- Material Icons;
- Lucide;
- SVGs arbitrarios;

en una misma implementación.

---

# 12. Arquitectura de componentes

```text
App
├── SiteHeader
│   ├── BrandBlock
│   │   ├── Title
│   │   └── Subtitle
│   ├── DesktopNav
│   └── MobileMenuButton
│
├── MatchFilters
│   ├── AllTab
│   ├── PastTab
│   └── UpcomingTab
│
├── MatchesTimeline
│   ├── TimelineSectionLabel
│   ├── MatchCard
│   ├── MatchCard
│   ├── FeaturedMatchCard
│   ├── MatchCard
│   ├── MatchCard
│   └── MatchCard
│
└── SiteFooter
```

---

# 13. Modelo de datos sugerido

```ts
type MatchStatus =
  | "finished"
  | "next"
  | "scheduled";

interface Match {
  id: string;
  date: string;
  dayLabel?: string;
  time?: string;

  homeTeam: string;
  awayTeam: string;

  homeScore?: number;
  awayScore?: number;

  competition: string;
  round?: string;

  channel?: string;

  status: MatchStatus;
}
```

---

# 14. Contenido ejemplo

```ts
const matches = [
  {
    id: "match-1",
    date: "29 AGO",
    homeTeam: "Boca",
    awayTeam: "Lanús",
    homeScore: 1,
    awayScore: 0,
    competition: "Liga Prof.",
    round: "Fecha 7",
    status: "finished"
  },
  {
    id: "match-2",
    date: "03 SEP",
    homeTeam: "Racing",
    awayTeam: "Boca",
    homeScore: 0,
    awayScore: 2,
    competition: "Liga Prof.",
    round: "Fecha 8",
    status: "finished"
  },
  {
    id: "match-3",
    dayLabel: "SAB",
    date: "08/09",
    time: "21:30",
    homeTeam: "Boca",
    awayTeam: "Sao Paulo",
    competition: "Copa Sudamericana",
    round: "Cuartos de Final · Ida",
    channel: "ESPN",
    status: "next"
  }
];
```

---

# 15. Header

---

## 15.1. Mobile

Estructura:

```text
┌───────────────────────────────┐
│ CUANDO JUEGA              ☰   │
│ EL XENEIZE                    │
│ Partidos de Boca Juniors      │
└───────────────────────────────┘
```

Especificaciones:

```text
padding-top: 24px
padding-left/right: 16px
padding-bottom: 20px

H1:
max-width: 250px
color: #F3F7FB

Subtitle:
margin-top: 6px
color: #A7B6C8

Menu:
position: top-right
size: 24px
color: #5FA8D3
```

No dividir artificialmente el título en colores institucionales.

Puede mantenerse completamente blanco.

---

## 15.2. Desktop

Estructura:

```text
┌────────────────────────────────────────────────────┐
│ CUANDO JUEGA EL XENEIZE       INICIO PARTIDOS INFO│
│ Partidos de Boca Juniors                           │
└────────────────────────────────────────────────────┘
```

Especificaciones:

```text
min-height: 112px
padding: 28px 36px
display: flex
justify-content: space-between
align-items: center
```

Nav:

```text
gap: 32px
```

Estado activo:

```css
color: var(--color-accent);
border-bottom: 2px solid var(--color-accent);
padding-bottom: 8px;
```

---

# 16. Filtros mobile

Visible únicamente en mobile/tablet.

```text
┌──────────┬──────────────┬────────────┐
│ TODOS    │ ANTERIORES   │ PRÓXIMOS   │
└──────────┴──────────────┴────────────┘
```

Container:

```text
height: 42px
border: 1px solid #1C3552
border-radius: 6px
display: grid
grid-template-columns: repeat(3, 1fr)
```

Tab:

```text
display: flex
align-items: center
justify-content: center
```

Active:

```css
color: var(--color-text-primary);
background: rgba(95, 168, 211, 0.07);
box-shadow: inset 0 -2px 0 var(--color-accent-secondary);
```

Inactive:

```css
color: var(--color-text-muted);
```

### Nota UX

Los filtros son secundarios.

El estado inicial es:

```text
TODOS
```

---

# 17. Timeline desktop

Disponible desde:

```text
>= 900px
```

Estructura:

```text
ANTERIORES          ○    Card pasada
                     │
                     ○    Card pasada
                     │
PRÓXIMO             ●    Card destacada
                     │
PRÓXIMOS            ○    Card futura
                     │
                     ○    Card futura
                     │
                     ○    Card futura
```

Grid recomendado:

```css
grid-template-columns:
  120px
  32px
  minmax(0, 1fr);
```

Gap:

```text
column-gap: 16px
```

---

## 17.1. Línea vertical

```css
width: 1px;
background: var(--color-border-strong);
```

---

## 17.2. Node normal

```css
width: 10px;
height: 10px;
border-radius: 999px;
border: 1px solid var(--color-accent-secondary);
background: var(--color-bg);
```

---

## 17.3. Node próximo

```css
width: 14px;
height: 14px;
border-radius: 999px;
background: var(--color-accent);
box-shadow: 0 0 14px rgba(217, 164, 65, .30);
```

---

# 18. MatchCard estándar

Anatomía:

```text
┌────────────────────────────────────────────┐
│ 29 │ Boca 1 - 0 Lanús          FINALIZADO │
│ AGO│ Liga Prof. · Fecha 7                  │
└────────────────────────────────────────────┘
```

Componente:

```text
MatchCard
├── DateBlock
│   ├── Day
│   └── Month
│
├── MatchInfo
│   ├── Teams
│   └── Meta
│
└── StatusBadge
```

---

## 18.1. Mobile

```text
width: 100%
min-height: 78px
padding: 14px 12px
border: 1px solid #1C3552
border-radius: 8px
background: #0D1B2E
```

Grid:

```css
grid-template-columns:
  64px
  minmax(0, 1fr)
  auto;
```

Gap:

```text
12px
```

---

## 18.2. Desktop

```text
width: 100%
min-height: 64px
padding: 10px 14px
border-radius: 8px
```

Grid:

```css
grid-template-columns:
  64px
  minmax(0, 1fr)
  104px;
```

---

# 19. DateBlock

Normal:

```text
29
AGO
```

Featured:

```text
SAB
08/09
21:30
```

Propiedades:

```text
border-right: 1px solid #1C3552
padding-right: 12px
align-self: stretch
display: flex
flex-direction: column
justify-content: center
```

No centrar horizontalmente todo el contenido.

Alinear predominantemente a la izquierda.

---

# 20. Teams

Partido normal:

```text
Boca 1 - 0 Lanús
```

Color:

```text
#F3F7FB
```

Weight:

```text
600
```

Truncado:

```css
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

No debe romper el layout.

---

# 21. Metadata

Ejemplo:

```text
Liga Prof. · Fecha 7
```

o:

```text
Copa Sudamericana
Cuartos de Final · Ida
```

Color:

```text
#A7B6C8
```

Weight:

```text
400
```

---

# 22. StatusBadge

Base:

```css
display: inline-flex;
align-items: center;
justify-content: center;

min-height: 28px;
padding: 0 10px;

border-radius: 4px;

font-size: 10px;
font-weight: 600;
letter-spacing: 0.03em;
text-transform: uppercase;
```

---

## 22.1. FINALIZADO

```css
color: #A7B6C8;
border: 1px solid #1C3552;
background: rgba(167, 182, 200, 0.03);
```

---

## 22.2. PROGRAMADO

```css
color: #5FA8D3;
border: 1px solid rgba(95, 168, 211, 0.72);
background: rgba(95, 168, 211, 0.05);
```

---

## 22.3. PRÓXIMO

```css
color: #07111F;
border: 1px solid #D9A441;
background: #D9A441;
```

Hover:

```css
background: #E7B85C;
```

---

# 23. FeaturedMatchCard

Debe ser un componente propio.

No tratarlo simplemente como una `MatchCard` con otro color.

Anatomía:

```text
╔══════════════════════════════════════════╗
║ SAB │ BOCA vs SAO PAULO       PRÓXIMO  ║
║08/09│ Copa Sudamericana                 ║
║21:30│ Cuartos de Final · Ida            ║
║     │ [TV] ESPN                         ║
╚══════════════════════════════════════════╝
```

---

## 23.1. Mobile

```text
min-height: 132px
padding: 16px 12px
border: 2px solid #D9A441
border-radius: 8px
```

Grid:

```css
grid-template-columns:
  76px
  minmax(0, 1fr)
  auto;
```

---

## 23.2. Desktop

```text
min-height: 126px
padding: 16px 18px
```

Grid:

```css
grid-template-columns:
  82px
  minmax(0, 1fr)
  112px;
```

---

## 23.3. Background

```css
background:
  linear-gradient(
    135deg,
    #0D1B2E 0%,
    #101F34 100%
  );
```

---

## 23.4. Border

```css
border: 2px solid var(--color-accent);
```

---

## 23.5. Shadow

```css
box-shadow:
  0 0 0 1px rgba(217, 164, 65, 0.08),
  0 8px 24px rgba(0, 0, 0, 0.28),
  0 0 22px rgba(217, 164, 65, 0.14);
```

---

## 23.6. Fecha / hora

Color:

```text
#E7B85C
```

Orden:

```text
SAB
08/09
21:30
```

No comprimirlo en una sola línea en desktop.

---

## 23.7. Canal

Ejemplo:

```text
[TV] ESPN
```

Icono:

```text
Lucide Tv
16px
color: #5FA8D3
```

Texto:

```text
color: #F3F7FB
```

Gap:

```text
6px
```

---

# 24. Separación entre cards

Mobile:

```text
12px
```

Desktop:

```text
10px
```

El próximo partido puede tener:

```text
margin-top: 4px
margin-bottom: 4px
```

para respirar ligeramente más.

---

# 25. Layout general mobile-first

Base objetivo:

```text
320px → 767px
```

Contenedor:

```css
width: 100%;
max-width: 480px;
margin: 0 auto;
padding-left: 16px;
padding-right: 16px;
```

Page padding:

```text
top: 24px
bottom: 24px
```

---

# 26. Mobile wireframe

```text
┌───────────────────────────────────┐
│                                   │
│ CUANDO JUEGA                  ☰   │
│ EL XENEIZE                        │
│ Partidos de Boca Juniors          │
│                                   │
│ TODOS | ANTERIORES | PRÓXIMOS     │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 29 │ Boca 1-0 Lanús    FINAL │ │
│ │ AGO│ Liga Prof. · Fecha 7     │ │
│ └───────────────────────────────┘ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 03 │ Racing 0-2 Boca   FINAL │ │
│ │ SEP│ Liga Prof. · Fecha 8     │ │
│ └───────────────────────────────┘ │
│                                   │
│ ╔═══════════════════════════════╗ │
│ ║ SAB │ BOCA vs SAO PAULO      ║ │
│ ║08/09│ Copa Sudamericana      ║ │
│ ║21:30│ Cuartos · Ida          ║ │
│ ║     │ TV ESPN      PRÓXIMO   ║ │
│ ╚═══════════════════════════════╝ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 11 │ Boca vs Central C.      │ │
│ │ SEP│ Liga Prof. · Fecha 9    │ │
│ └───────────────────────────────┘ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 15 │ Sao Paulo vs Boca       │ │
│ │ SEP│ Sudamericana · Vuelta   │ │
│ └───────────────────────────────┘ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 20 │ Boca vs San Lorenzo     │ │
│ │ SEP│ Liga Prof. · Fecha 10   │ │
│ └───────────────────────────────┘ │
│                                   │
│ ────────────────────────────────  │
│ Sitio no oficial.                 │
│                                   │
└───────────────────────────────────┘
```

---

# 27. Desktop layout

Breakpoint principal:

```text
>= 900px
```

Contenedor:

```css
width: min(1120px, calc(100% - 64px));
margin: 0 auto;
```

Outer panel:

```text
border: 1px solid #1C3552
border-radius: 10px
background: rgba(7, 17, 31, 0.92)
```

---

# 28. Desktop wireframe

```text
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│ CUANDO JUEGA EL XENEIZE              INICIO  PARTIDOS  INFO   │
│ Partidos de Boca Juniors                                      │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ANTERIORES       ○   ┌──────────────────────────────────────┐  │
│                  │   │ 29 AGO │ Boca 1-0 Lanús       FINAL │  │
│                  │   └──────────────────────────────────────┘  │
│                  │                                             │
│                  ○   ┌──────────────────────────────────────┐  │
│                  │   │ 03 SEP │ Racing 0-2 Boca      FINAL │  │
│                  │   └──────────────────────────────────────┘  │
│                  │                                             │
│ PRÓXIMO          ●   ╔══════════════════════════════════════╗  │
│                  │   ║ SAB 08/09 │ BOCA vs SAO PAULO      ║  │
│                  │   ║ 21:30     │ Copa Sudamericana      ║  │
│                  │   ║           │ Cuartos · Ida  PRÓXIMO ║  │
│                  │   ╚══════════════════════════════════════╝  │
│                  │                                             │
│ PRÓXIMOS         ○   ┌──────────────────────────────────────┐  │
│                  │   │ 11 SEP │ Boca vs Central Córdoba   │  │
│                  │   └──────────────────────────────────────┘  │
│                  │                                             │
│                  ○   ┌──────────────────────────────────────┐  │
│                  │   │ 15 SEP │ Sao Paulo vs Boca         │  │
│                  │   └──────────────────────────────────────┘  │
│                  │                                             │
│                  ○   ┌──────────────────────────────────────┐  │
│                      │ 20 SEP │ Boca vs San Lorenzo       │  │
│                      └──────────────────────────────────────┘  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ Sitio no oficial.                         bocajuniors.com.ar → │
└────────────────────────────────────────────────────────────────┘
```

---

# 29. Breakpoints

```css
/* Mobile */
@media (min-width: 320px) {}

/* Mobile large */
@media (min-width: 480px) {}

/* Tablet */
@media (min-width: 768px) {}

/* Desktop */
@media (min-width: 900px) {}

/* Desktop wide */
@media (min-width: 1200px) {}
```

---

# 30. Comportamiento responsive

## < 900px

```text
mostrar tabs
ocultar timeline lateral
ocultar nav desktop
mostrar menú hamburger
cards 100%
featured card 100%
```

## >= 900px

```text
ocultar tabs mobile si no aportan valor
mostrar timeline lateral
mostrar nav desktop
ocultar menú hamburger
usar panel desktop
```

---

# 31. Reglas específicas mobile

1. No scroll horizontal.
2. No textos cortados verticalmente.
3. Badge puede bajar a segunda línea si fuera estrictamente necesario.
4. El nombre del rival puede truncarse con ellipsis.
5. El próximo partido debe permanecer totalmente visible.
6. Mantener al menos `16px` de padding lateral.
7. El área táctil mínima debe ser `44x44px`.

---

# 32. Reglas específicas desktop

1. No estirar la card a todo el viewport.
2. Mantener `max-width` del contenido.
3. Timeline debe conservar lectura vertical.
4. No transformar cada partido en una “mega card”.
5. La densidad debe seguir siendo compacta.
6. El próximo partido debe destacar sin romper el ritmo visual.

---

# 33. Header sticky

No obligatorio en MVP.

Si se implementa:

```css
position: sticky;
top: 0;
z-index: 20;
background: rgba(7, 17, 31, .96);
backdrop-filter: blur(8px);
```

No usar blur si afecta performance.

---

# 34. Interacciones

---

## 34.1. Tabs

Transición:

```css
transition:
  color 160ms ease,
  background 160ms ease,
  box-shadow 160ms ease;
```

---

## 34.2. Cards desktop

Hover:

```css
transform: translateY(-1px);
background: #11233A;
border-color: #274866;
```

Transition:

```css
transition:
  transform 160ms ease,
  background 160ms ease,
  border-color 160ms ease,
  box-shadow 160ms ease;
```

---

## 34.3. Featured card

Hover únicamente desktop:

```css
border-color: #E7B85C;
```

No escalar.

No usar:

```text
scale(1.03)
scale(1.05)
```

---

# 35. Focus states

Obligatorio:

```css
:focus-visible {
  outline: 2px solid var(--color-accent-secondary);
  outline-offset: 3px;
}
```

---

# 36. Motion

Respetar:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 37. Accesibilidad

Objetivo mínimo:

```text
WCAG 2.2 AA
```

Requisitos:

- contraste mínimo AA;
- tabs navegables por teclado;
- menú accesible;
- focus visible;
- iconos decorativos con `aria-hidden="true"`;
- botones con nombre accesible;
- no depender exclusivamente del color para representar estado.

Ejemplo:

```html
<span class="status status--finished">
  Finalizado
</span>
```

---

# 38. Semántica HTML recomendada

```html
<header>
<nav>
<main>
<section aria-labelledby="matches-heading">
<ol>
<li>
<article>
<footer>
```

La cronología debería ser una lista ordenada semánticamente.

---

# 39. Estados de datos

La UI debe contemplar:

```text
loading
loaded
empty
error
partial
```

---

## 39.1. Loading

Usar skeleton discreto.

No spinner gigante.

---

## 39.2. Empty

Texto:

```text
No hay partidos disponibles por el momento.
```

---

## 39.3. Error

Texto:

```text
No pudimos cargar los partidos.
Intentá nuevamente en unos minutos.
```

---

# 40. Partido sin canal

Si no existe `channel`:

```text
ocultar completamente la fila TV/canal
```

No mostrar:

```text
Canal: -
TV: N/A
```

---

# 41. Partido sin hora confirmada

Mostrar:

```text
Horario a confirmar
```

No inventar:

```text
00:00
```

---

# 42. Partido postergado

Estado adicional opcional:

```text
POSTERGADO
```

Color:

```text
#A7B6C8
```

No usar rojo salvo error crítico.

---

# 43. Formato de fecha

Mobile:

```text
29
AGO
```

Próximo:

```text
SAB
08/09
21:30
```

Desktop:

mismo formato.

No mezclar formatos dentro de la misma lista.

---

# 44. Casing

Recomendado:

```text
Headers: uppercase
Badges: uppercase
Equipos: Title Case / naming real
Metadata: sentence/title case
```

Ejemplo:

```text
BOCA vs SAO PAULO
Copa Sudamericana
Cuartos de Final · Ida
```

---

# 45. Footer

Mobile:

```text
Sitio no oficial.
```

Opcional:

```text
bocajuniors.com.ar →
```

Desktop:

```text
Sitio no oficial.                         bocajuniors.com.ar →
```

Especificaciones:

```text
border-top: 1px solid #1C3552
padding: 16px 0
color: #A7B6C8
```

No debe competir con la agenda.

---

# 46. Contenido legal / identidad

No presentar el proyecto como sitio oficial.

No usar copy del tipo:

```text
Sitio oficial de Boca Juniors
Portal oficial
Web oficial
```

Usar siempre:

```text
Sitio no oficial.
```

---

# 47. CSS tokens completos

```css
:root {
  /* Colors */
  --color-bg: #07111F;
  --color-surface: #0D1B2E;
  --color-surface-elevated: #101F34;
  --color-surface-hover: #11233A;

  --color-border: #1C3552;
  --color-border-strong: #274866;

  --color-text-primary: #F3F7FB;
  --color-text-secondary: #A7B6C8;
  --color-text-muted: #71849A;

  --color-accent: #D9A441;
  --color-accent-strong: #E7B85C;
  --color-accent-secondary: #5FA8D3;

  /* Typography */
  --font-ui: "IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-pill: 999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 64px;

  /* Shadows */
  --shadow-card:
    0 4px 16px rgba(0, 0, 0, .16);

  --shadow-featured:
    0 0 0 1px rgba(217, 164, 65, .08),
    0 8px 24px rgba(0, 0, 0, .28),
    0 0 22px rgba(217, 164, 65, .14);

  /* Layout */
  --mobile-max-width: 480px;
  --desktop-max-width: 1120px;
}
```

---

# 48. Estructura CSS recomendada

```text
styles/
├── tokens.css
├── reset.css
├── global.css
├── layout.css
│
├── components/
│   ├── site-header.css
│   ├── tabs.css
│   ├── timeline.css
│   ├── match-card.css
│   ├── featured-match.css
│   ├── status-badge.css
│   └── footer.css
│
└── utilities.css
```

---

# 49. Convención CSS sugerida

BEM.

Ejemplo:

```html
<article class="match-card match-card--featured">
  <div class="match-card__date"></div>
  <div class="match-card__content"></div>
  <div class="match-card__status"></div>
</article>
```

---

# 50. Clases principales

```text
.site
.site__container

.site-header
.site-header__brand
.site-header__title
.site-header__subtitle
.site-header__nav

.match-tabs
.match-tabs__item
.match-tabs__item--active

.timeline
.timeline__label
.timeline__rail
.timeline__node
.timeline__node--active

.match-card
.match-card__date
.match-card__day
.match-card__month
.match-card__time
.match-card__content
.match-card__teams
.match-card__meta
.match-card__channel
.match-card__status

.match-card--finished
.match-card--scheduled
.match-card--featured

.status-badge
.status-badge--finished
.status-badge--scheduled
.status-badge--next

.site-footer
```

---

# 51. Orden del DOM

Importante para mobile-first.

```html
<header />

<nav class="match-tabs" />

<main>
  <ol class="matches">
    <li>partido pasado</li>
    <li>partido pasado</li>
    <li>próximo partido</li>
    <li>partido futuro</li>
    <li>partido futuro</li>
    <li>partido futuro</li>
  </ol>
</main>

<footer />
```

En desktop, la timeline debe construirse mediante CSS/layout alrededor del mismo contenido.

Evitar duplicar listas independientes para mobile y desktop.

---

# 52. Performance

Evitar:

- librerías UI pesadas para una pantalla simple;
- animaciones continuas;
- fondos en video;
- imágenes gigantes;
- múltiples fuentes;
- iconos SVG inline repetidos innecesariamente.

---

# 53. Responsive implementation strategy

Primero implementar:

```text
320–480 px
```

Luego:

```text
768 px
```

Finalmente:

```text
900–1200+ px
```

No diseñar desktop primero y reducirlo.

---

# 54. QA visual mobile

Validar al menos en:

```text
320px
360px
375px
390px
414px
430px
```

---

# 55. QA visual desktop

Validar al menos en:

```text
900px
1024px
1280px
1366px
1440px
1920px
```

---

# 56. Definition of Done visual

La implementación **NO se considera terminada** si ocurre cualquiera de los siguientes casos:

- [ ] el próximo partido no es el elemento visualmente dominante;
- [ ] se utilizan colores fuera de los tokens sin justificación;
- [ ] aparece azul rey institucional;
- [ ] aparece amarillo puro institucional;
- [ ] se utiliza un escudo oficial;
- [ ] las cards tienen radios grandes;
- [ ] hay glassmorphism;
- [ ] hay sombras exageradas;
- [ ] se utilizan emojis;
- [ ] se mezclan librerías de iconos;
- [ ] el orden deja de ser cronológico;
- [ ] “Agenda” y “Resultados” se convierten nuevamente en dos bloques principales separados;
- [ ] mobile tiene scroll horizontal;
- [ ] desktop es únicamente la versión mobile estirada;
- [ ] la timeline desktop desaparece;
- [ ] el featured match tiene la misma altura que una card normal;
- [ ] el badge `PRÓXIMO` no se diferencia del resto;
- [ ] se pierde la columna visual de fecha;
- [ ] los textos secundarios compiten con el nombre de los equipos;
- [ ] el footer tiene demasiado protagonismo;
- [ ] los bordes son demasiado claros;
- [ ] todos los elementos tienen glow;
- [ ] hay más de una fuente tipográfica principal;
- [ ] el estado activo de tabs/nav no es evidente;
- [ ] el contraste no cumple AA;
- [ ] no existe focus visible;
- [ ] el próximo partido no se entiende sin depender del color.

---

# 57. Checklist del próximo partido

Debe cumplir:

- [ ] borde dorado `#D9A441`;
- [ ] fondo más elevado;
- [ ] sombra/glow sutil;
- [ ] equipos en peso `700`;
- [ ] badge `PRÓXIMO`;
- [ ] fecha/hora visibles;
- [ ] competición visible;
- [ ] instancia/round visible;
- [ ] TV/canal solo si existe;
- [ ] mayor altura que cards normales;
- [ ] mayor peso visual que cualquier otro partido.

---

# 58. Checklist mobile

- [ ] padding lateral 16px;
- [ ] max-width 480px;
- [ ] header compacto;
- [ ] hamburger visible;
- [ ] tabs visibles;
- [ ] cards 100%;
- [ ] sin timeline lateral;
- [ ] featured card destacada;
- [ ] footer discreto;
- [ ] target táctil mínimo 44px;
- [ ] sin scroll horizontal.

---

# 59. Checklist desktop

- [ ] max-width 1120px;
- [ ] panel central;
- [ ] header + nav desktop;
- [ ] timeline visible;
- [ ] labels `ANTERIORES`, `PRÓXIMO`, `PRÓXIMOS`;
- [ ] node activo dorado;
- [ ] cards compactas;
- [ ] featured card más alta;
- [ ] footer alineado horizontalmente.

---

# 60. Resultado esperado

El usuario debe poder entender la pantalla en este orden:

```text
1. Qué sitio está viendo.
2. Cuáles fueron los dos partidos anteriores.
3. Cuándo es el próximo partido.
4. Contra quién juega.
5. Qué competición es.
6. A qué hora juega.
7. Por dónde verlo.
8. Qué partidos vienen después.
```

El producto no debe sentirse como una tabla de datos.

Debe sentirse como una **agenda deportiva editorial, compacta y cronológica**, con el próximo partido como centro visual.

---

# 61. Regla final de fidelidad

No reinterpretar el diseño sin necesidad.

La implementación debe conservar:

- colores;
- jerarquías;
- orden;
- proporciones;
- densidad;
- espaciado;
- iconografía;
- estados;
- bordes;
- sombras;
- timeline desktop;
- estructura mobile;
- protagonismo del próximo partido.

Los ajustes que deban hacerse durante desarrollo deben respetar el sistema de tokens definido en este documento.

