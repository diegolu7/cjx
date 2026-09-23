# cargar-detalle-partido.md — Contenido rico por partido

> Cómo cargar a mano el contenido de cada partido para las **páginas por partido**
> (`/partidos/{slug}`). Es una **pestaña nueva** del mismo Google Sheet, publicada como CSV.

---

## 1. Crear y publicar la pestaña

1. En el mismo Google Sheet, creá una pestaña nueva llamada **`Detalles`**.
2. Fila 1 (encabezados) — copiar **literal** en la celda A1:

```
Fecha,Preview,DatosCuriosos,Arbitro,Antecedentes,FormacionBoca,FormacionRival,TitularesBoca,SuplentesBoca,TitularesRival,SuplentesRival,Eventos,Notas
```

3. `Archivo → Compartir → Publicar en la web` → elegí la pestaña **`Detalles`** →
   formato **Valores separados por comas (.csv)** → `Publicar`.
4. Anotá el **gid** de esa pestaña (está en la URL cuando la tenés seleccionada:
   `...#gid=1234567890`). Ese número va en la config del sitio (`scripts/lib/parse.mjs`,
   constante `SHEET_DETAILS_GID`).

> Sin `gid` configurado, el sitio funciona igual: las páginas por partido se generan
> solo con la ficha básica (sin contenido rico).

---

## 2. Reglas generales

- **Una fila = un partido.** La clave es **`Fecha`** (formato `aaaa-mm-dd`), la misma que
  en la pestaña `Partidos`. Boca juega un solo partido por día, así que es única.
- **`-` o vacío = no disponible.** El sitio **oculta** esa sección. No dejes celdas a medias.
- **Separadores:**
  - `;` → separa ítems de una lista (datos curiosos, jugadores, eventos).
  - `|` → separa los campos **dentro** de un evento.
  - **No uses `;` ni `|` dentro de un nombre.**
  - Las **comas** sí se permiten (Sheets las escapa solo en el CSV).
- No inventes datos. Si no lo tenés, `-`.

---

## 3. Columnas

| Columna | Req. | Formato | Ejemplo |
|---|---|---|---|
| `Fecha` | **Sí** | `aaaa-mm-dd` | `2026-09-20` |
| `Preview` | No | texto, 1–3 párrafos | `Boca visita a Racing por los octavos...` |
| `DatosCuriosos` | No | lista con `;` | `Racing no le gana a Boca desde 2023; Es el 5.º cruce del año` |
| `Arbitro` | No | texto | `Darío Herrera` |
| `Antecedentes` | No | texto (H2H) | `Último: Boca 2-0 Racing (2026)` |
| `FormacionBoca` | No | `4-3-3` | `4-3-3` |
| `FormacionRival` | No | `4-2-3-1` | `4-2-3-1` |
| `TitularesBoca` | No | nombres con `;` (arquero primero) | `Brey; Advíncula; Di Lollo; ...` |
| `SuplentesBoca` | No | nombres con `;` | `Marchesín; ...` |
| `TitularesRival` | No | nombres con `;` | `Arias; ...` |
| `SuplentesRival` | No | nombres con `;` | `...` |
| `Eventos` | No | `min\|tipo\|equipo\|jugador[|detalle]` con `;` | `12'\|Gol\|Boca\|Merentiel; 45'\|Amarilla\|Rival\|Pérez` |
| `Notas` | No | texto libre | `Boca necesita ganar para pasar de ronda.` |

### Tipos de evento (`tipo`)
`Gol` · `Penal` · `Autogol` · `Amarilla` · `Roja` · `Cambio` · `VAR`

- `equipo`: `Boca` o `Rival`.
- Para `Cambio`, usá el 5.º campo: `min|Cambio|Boca|Sale Uno|Entra Otro`.
- El `min` puede ser `45+2'`, `90+4'`, etc.

---

## 4. Ejemplo de fila completa

```
Fecha: 2026-09-20
Preview: Boca visita a Racing por los octavos de final de la Copa Argentina. El Xeneize llega en buen momento y busca meterse entre los ocho mejores del torneo. Racing, de local, intentará hacerse fuerte en Avellaneda.
DatosCuriosos: Racing no le gana a Boca desde 2023; Es el 5.º cruce del año; Boca ganó 3 de los últimos 4 en Avellaneda
Arbitro: Darío Herrera
Antecedentes: Último: Boca 2-0 Racing (Liga, 2026)
FormacionBoca: 4-3-3
FormacionRival: 4-2-3-1
TitularesBoca: Brey; Advíncula; Di Lollo; Costa; Blanco; Paredes; Palacios; Zenón; Velasco; Merentiel; Cavani
SuplentesBoca: Marchesín; Lema; Fabra; Miramón; Gago; Giménez; Zeballos; Aguirre
TitularesRival: Arias; ...
SuplentesRival: ...
Eventos: 12'|Gol|Boca|Merentiel; 45'|Amarilla|Rival|Pérez; 70'|Cambio|Boca|Sale Cavani|Entra Giménez
Notas: Boca necesita ganar para avanzar de ronda; en caso de empate, se define por penales.
```

---

## 5. Cómo se usa cada dato en el sitio

| Dato | Dónde aparece |
|---|---|
| `Preview` | **"Previa del partido"** (próximo) o **"Resumen del partido"** (finalizado) |
| `DatosCuriosos` + `Antecedentes` + `Notas` | Se fusionan en **"Claves del partido"** |
| `Arbitro` | Datos esenciales (próximo) y Ficha técnica (finalizado) |
| `FormacionBoca`/`Rival` + titulares | Sección **Formaciones**, agrupada por líneas (Arquero/Defensores/Mediocampistas/Delanteros) |
| `SuplentesBoca`/`Rival` | Acordeón **Suplentes** dentro de Formaciones |
| `Eventos` | **Eventos del partido** (solo en finalizados) |

**Estados de Formaciones (sin columna extra):**
- Sin titulares (`-`/vacío) → nota **"Se publicarán cerca del inicio del partido"**.
- Con titulares y partido **próximo** → se muestran como **"Formación probable"** (aviso "No oficial").
- Con titulares y partido **finalizado** → se muestran como **Formaciones** (confirmadas).

Si una sección no tiene datos (`-`), **no se muestra**. Los datos que aún no están se
muestran como **"A confirmar"** (nunca `-`).

> El **countdown** ("Faltan X días"), el **resultado global** y el **"Boca clasificó"** se
> calculan solos a partir de la ficha y del global; no hay que cargarlos.

### Estado del partido y redacción (importante para SEO/GEO)
- **Próximo:** escribí el `Preview` en **futuro/presente** (se muestra como "Previa del partido").
- **Finalizado:** escribí el `Preview` en **pasado** (se muestra como "Resumen del partido").
  No dejes una previa en futuro en un partido ya jugado.
- **Evitá claves genéricas** (ej. "es un partido de octavos"): preferí **sede confirmada,
  contexto del cruce, antecedentes concretos y cambios de horario**.
- La ficha muestra **"Datos actualizados: …"** (automático, del snapshot).

---

## 6. Indexación (SEO)

Cada página suma puntos de contenido:
- `Preview` ≥ 200 caracteres → **+2**
- `DatosCuriosos` ≥ 1 ítem → **+1**
- `TitularesBoca` **y** `TitularesRival` → **+2**
- `Eventos` ≥ 1 → **+1**
- `Notas` ≥ 200 caracteres → **+1**

- **Score ≥ 3** → `index, follow` (Google la puede indexar).
- **Score < 3** → `noindex, follow` (no se indexa; evita contenido fino).
- Partidos con fecha > 60 días y **sin** contenido → no se genera la página.

> **Tip:** escribí `Preview` de **200+ caracteres** (≈120–200 palabras) para sumar **+2**.
> El prompt de `docs/prompt-ia-partido.md` ya pide esa extensión, así que si lo usás, cumplís.

> Cargá al menos `Preview` (200+ caracteres) o `Notas` para que la página se indexe.

---

## 7. Checklist antes de publicar

- [ ] `Fecha` coincide con la de la pestaña `Partidos`.
- [ ] Sin `;` ni `|` dentro de nombres.
- [ ] La pestaña `Detalles` sigue publicada como CSV.
- [ ] Secciones que no tengo: `-` (no dejar a medias).
- [ ] Si quiero que se indexe: `Preview` o `Notas` de 200+ caracteres.
