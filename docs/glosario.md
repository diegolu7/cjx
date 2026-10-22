# Glosario ES/EN — Cuando Juega el Xeneize

> Tabla canónica de traducción. Si una palabra aparece acá, se traduce **así y solo así**
> en todo el sitio (UI, SEO, RSS, `llms.txt`, OG, push).
> Fuente de verdad del código: `src/i18n/es.ts` (español) y `src/i18n/en.ts` (inglés).
> El test `tests/i18n.test.mjs` verifica que ambos diccionarios tengan las mismas claves.

## 1. Términos de dominio

| Español | English | Dónde aparece |
|---|---|---|
| Boca (el club) | Boca (the club) | todos |
| Boca Juniors / el Xeneize | Boca Juniors / the Xeneize | todos |
| Local | Home | ficha, timeline, JSON-LD |
| Visitante | Away | ficha, timeline, JSON-LD |
| Final | Full-time | timeline, card, SEO |
| En vivo | Live | timeline, card, badge OG |
| Próximo | Next | timeline, card |
| Previsto | Scheduled | timeline, card |
| Fecha (ronda) | Matchday | ficha, OG, SEO |
| Fecha (calendario) | Date | ficha técnica |
| Ida | First leg | ronda de torneo |
| Vuelta | Second leg | ronda de torneo |
| Cuartos de Final | Quarter-finals | ronda de torneo |
| Semifinales | Semi-finals | ronda de torneo |
| Final | Final | ronda de torneo |
| Octavos de Final | Round of 16 | ronda de torneo |
| 32avos / 64avos de Final | Round of 32 / Round of 64 | ronda de torneo |
| Fase de Grupos | Group Stage | ronda de torneo |
| Torneo Apertura / Clausura | Apertura / Clausura Tournament | ronda de torneo |
| Global | Aggregate | ida/vuelta |
| Penales | Penalties | ida/vuelta |
| Clasificó | Qualified | ficha |
| Cuándo juega Boca…? | When does Boca play…? | home, title |

## 2. Torneos (copas)

| Español | English | Nota |
|---|---|---|
| Liga Profesional | **Argentine Primera División** | decisión tomada: nombre de la liga traducido |
| Copa Argentina | Copa Argentina | nombre oficial, no se traduce |
| Copa Libertadores | Copa Libertadores | nombre oficial, no se traduce |
| Copa Sudamericana | Copa Sudamericana | nombre oficial, no se traduce |

La traducción sale de `competitionCode` del snapshot (`arg.1`, `arg.copa`, `conmebol.libertadores`,
`conmebol.sudamericana`), no del texto de ESPN.

## 3. Partido (formaciones, eventos, estadísticas)

| Español | English |
|---|---|
| Titulares | Starting XI |
| Suplentes | Substitutes |
| Arquero | Goalkeeper |
| Defensores | Defenders |
| Mediocampistas | Midfielders |
| Delanteros | Forwards |
| Sale {out}, entra {in} | {out} off, {in} on |
| Gol | Goal |
| Gol (penal) | Goal (penalty) |
| Gol en contra | Own goal |
| Pen fallado | Penalty missed |
| Tarjeta amarilla | Yellow card |
| Tarjeta roja | Red card |
| Tarjeta roja (2ª amarilla) | Red card (2nd yellow) |
| Cambio | Substitution |
| Evento | Event |
| A confirmar | To be confirmed |
| Faltas | Fouls |
| Tarjetas amarillas / rojas | Yellow cards / Red cards |
| Tiros de esquina | Corners |
| Atajadas | Saves |
| Posesión | Possession |
| Disparos | Shots |
| Disparos al arco | Shots on target |
| Pases / Pases completos | Passes / Accurate passes |
| Centros | Crosses |
| Balones largos | Long balls |
| Disparos bloqueados | Blocked shots |
| Tackles | Tackles |
| Intercepciones | Interceptions |
| Despejes | Clearances |
| Goles de penal / Penales | Penalty goals / Penalties |

## 4. Fechas y cuenta regresiva

| Español | English | Formato |
|---|---|---|
| {day} de {month} de {year} | {month} {day}, {year} | `dates.long` |
| Faltan {n} días | {n} days to go | `countdown.days` |
| Falta 1 día | 1 day to go | `countdown.oneDay` |
| Es hoy | Today | `countdown.today` |
| En juego o por comenzar | Kickoff imminent | `countdown.imminent` |
| Faltan {n} h | {n} h to go | `countdown.hours` |

**Todos los horarios son hora Argentina (UTC-3 fijo).** No se convierte a la zona del visitante.

## 5. Chrome del sitio

| Español | English |
|---|---|
| Inicio | Home |
| Info | Info |
| Instalar App / Instalar app | Install App / Install app |
| Abrir menú | Open menu |
| Principal / Legal | Main / Legal |
| Idioma | Language |
| Inicio | Home (breadcrumb) |
| Partidos | Matches |
| Volver a todos los partidos | Back to all matches |
| Compartir resultado / partido / en vivo | Share result / match / live |
| Copiar enlace | Copy link |
| Compartido | Copied / Shared |
| Aceptar / Rechazar / Aceptar todo | Accept / Reject / Accept all |
| Avisa cuando juega Boca | Notify me when Boca plays |
| Activar notificaciones | Enable notifications |
| Notificaciones activadas | Notifications enabled |
| Compartir | Share |
| Datos actualizados: {date} (hora Argentina) | Data updated: {date} (Argentina time) |

## 6. Textos que **no** se traducen

- **Nombres propios de clubes y personas**: Boca Juniors, River Plate, Talleres, Independiente,
  Atlético Mineiro, Vasco da Gama, Banfield, Defensa y Justicia, etc.
- **Nombres oficiales de copas** (ver §2).
- **La marca del sitio**: "Cuando Juega el Xeneize" (es el nombre del sitio; el `og:brand` de
  la imagen sí se adapta: `CUANDO JUEGA EL XENEIZE` / `WHEN DOES BOCA PLAY`).
- **Siglas**: AFA, CONMEBOL, TV, ESPN, UTC.
- **URLs, slugs, claves de objeto, clases CSS, identificadores**.
- **Códigos de evento y de estadística de ESPN** (`typeCode`, `labelCode`): se guardan en el
  snapshot y se traducen al renderizar (`dict.eventTypes`, `dict.stats`).

## 7. Reglas de estilo

- Inglés **británico** (`Kickoff`, `Substitutes`, `Aggregate`).
- El español usa voseo solo en textos legales; la UI es impersonal.
- Mayúsculas: los badges de la timeline van en MAYÚSCULAS en ambos idiomas.
- Los números de fecha en inglés van sin "de" (`October 13, 2026`).

## 8. Cómo se mantiene

```bash
npm test                       # paridad de claves ES/EN + inventario sin español suelto
node scripts/i18n-inventory.mjs # reporte de literales traducibles por archivo
node scripts/i18n-inventory.mjs --check  # sale con 1 si hay texto español fuera del diccionario
```

Regla del proyecto: **ningún texto visible puede estar escrito en el `.astro`/`.ts`**.
Todo pasa por `src/i18n/es.ts` y se refleja en `src/i18n/en.ts`.
