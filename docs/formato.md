# formato.md — Cómo cargar el Google Sheet (backend)

> Documento operativo para cargar partidos sin romper el sitio.
> El sitio lee **una sola pestaña** del Google Sheet publicado como CSV.
> Hoja: https://docs.google.com/spreadsheets/d/1kqtU0JAyqtQ9NY2Jm-94eXxHQCNMLnc2C9Sd_hM69Xw/edit

---

## 1. Requisito previo: publicar la hoja (una sola vez)

Para que el sitio pueda leerla necesita estar **publicada como CSV**:

1. Menú `Archivo → Compartir → Publicar en la web…`
2. En "Vincular": elegir la pestaña correcta (la de partidos).
3. Formato: **Valores separados por comas (.csv)**.
4. `Publicar` (y volver a publicar cada vez que se cambie la hoja si Google lo pidiera).

Opcional pero recomendado: `Compartir → Cualquier persona con el enlace → Lector`.

> Si no está publicada, el sitio no muestra error: **cae a datos de ejemplo**.

---

## 2. Reglas generales

- **Una fila = un partido.** No repetir filas: las duplicadas exactas (misma fecha + hora + rival + torneo + fase) **se descartan automáticamente** conservando la primera.
- La **fila 1** son los encabezados. No borrarla ni renombrar las columnas.
- No dejar columnas "rotas" ni celdas con comas dentro del texto.
- Se leen estas columnas (el orden en la hoja puede variar, el sistema las detecta por el **nombre del encabezado**):

```
Estado,Fecha,Hora,Condición,Rival,Goles Boca,Goles Rival,Torneo,Fase,Canal,Lugar
```

---

## 3. Columna por columna

| Columna | Requerido | Formato esperado | Valores / ejemplos | Notas |
|---|---|---|---|---|
| **Estado** | Sí | Texto (no importa mayúsculas/minúsculas) | `Finalizado` · `Próximo` · `Confirmado` | Define cómo se muestra el partido (ver §4). |
| **Fecha** | Sí | `aaaa-mm-dd` | `2026-09-08` | **Recomendado ISO.** También tolera `2026/09/08`, `08/09/2026`, `08/09`. Siempre día y mes. |
| **Hora** | No | `HH:MM` (24 h, hora Argentina) | `21:30` | Si está vacía en el próximo partido se muestra "Horario a confirmar". |
| **Condición** | Sí | `Local` o `Visitante` | `Local` | Define si Boca juega de local o de visitante. Cualquier otra cosa se asume `Local`. |
| **Rival** | Sí | Texto | `São Paulo` | Nombre del rival. Acentos OK. Evitar comas. |
| **Goles Boca** | Solo en `Finalizado` | Número entero | `1` | Vacío en partidos no jugados. Si está vacío en un `Finalizado`, la card se ve rara (ver §4). |
| **Goles Rival** | Solo en `Finalizado` | Número entero | `1` | Ídem anterior. |
| **Torneo** | No | Texto | `Copa Sudamericana` | |
| **Fase** | No | Texto | `Cuartos de Final - Ida` | Instancia / fecha del torneo. |
| **Canal** | No | Texto | `ESPN` | Si está vacío, no se muestra la línea de TV. |
| **Lugar** | No | Texto | `La Bombonera` | No se muestra hoy en el front; se puede dejar igual. |
| **Global Boca** | No | Número | `1` | **Lo escribe el script** (no cargar a mano). Global de Boca sumando ida + vuelta. |
| **Global Rival** | No | Número | `0` | **Lo escribe el script** (no cargar a mano). Global del rival sumando ida + vuelta. |
| **Penales Boca** | No | Número | `4` | Solo si el global termina **empatado**. Carga manual en la fila de la Vuelta. |
| **Penales Rival** | No | Número | `3` | Idem anterior. |

> Las columnas nuevas van **al final**, después de `Lugar`. El script escribe las columnas A–K por posición, así que no hay que reordenar.

---

## 3.1. Resultado global (cruces de ida y vuelta)

En los torneos con partidos de **ida y vuelta**, el sitio muestra en la **Vuelta** el **resultado global** del cruce.

- Lo calcula y lo guarda el script en las columnas `Global Boca` / `Global Rival` de la fila de la **Vuelta** (suma de goles de ida + vuelta).
- El `Ida` **no se muestra** como resultado individual si ya es viejo; se usa para el global.
- Si el global termina **empatado**, se define por **penales**: cargá a mano `Penales Boca` / `Penales Rival` en la fila de la Vuelta.
- Requisitos para que aparezca:
  - La `Fase` de las dos patas debe compartir el mismo texto base (ej. `Cuartos de Final - Ida` y `Cuartos de Final - Vuelta`).
  - El `Ida` debe tener goles cargados.

Ejemplo de cruce:

```
Finalizado,2026-09-08,21:30,Local,São Paulo,1,0,Copa Sudamericana,Cuartos de Final - Ida,,La Bombonera
Confirmado,2026-09-15,21:30,Visitante,São Paulo,,,Copa Sudamericana,Cuartos de Final - Vuelta,ESPN,Morumbi
```

Con el `Ida` 1-0, el script escribe `Global Boca = 1` y `Global Rival = 0` en la fila de la Vuelta → el sitio muestra **"Global: Boca 1 - 0 São Paulo"**.

---

## 4. Regla de negocio del "Estado"

| Estado en la hoja | Qué muestra el sitio |
|---|---|
| `Finalizado` | Va a **Anteriores** con el marcador (badge `FINAL`). |
| `Próximo` | Se vuelve el **partido destacado** (card dorada, badge `PRÓXIMO`). |
| `Confirmado` (o `previsto`) | Va a **Próximos** con badge `PREVISTO`. |

Reglas estrictas:

1. **Solo UNA fila `Próximo`.** Si hay más de una, el sistema elige la de fecha más cercana y las demás se muestran como programadas.
2. **`Finalizado` SIEMPRE con goles cargados.** Si falta el marcador, la card queda "sin resultado" y se ve mal.
3. `Finalizado`, `Próximo` y `Confirmado` se escriben sin importar mayúsculas; el parser también acepta `finalizado`, `proximo`, `previsto`.

Ejemplo completo (fila 1 + 5 datos):

```
Estado,Fecha,Hora,Condición,Rival,Goles Boca,Goles Rival,Torneo,Fase,Canal,Lugar
Finalizado,2026-09-01,21:30,Local,São Paulo,1,1,Copa Sudamericana,Cuartos de Final - Ida,ESPN,La Bombonera
Finalizado,2026-09-02,21:30,Local,São test,2,1,Copa Sudamericana,Cuartos de Final - Ida,ESPN,La Bombonera
Próximo,2026-09-10,21:30,Local,São A,,,Copa Sudamericana,Cuartos de Final - Ida,ESPN,La Bombonera
Confirmado,2026-09-17,21:30,Local,São wes,,,Copa Sudamericana,Cuartos de Final - Ida,ESPN,La Bombonera
Confirmado,2026-09-18,21:30,Local,São dester,,,Copa Sudamericana,Cuartos de Final - Ida,ESPN,La Bombonera
```

---

## 5. Orden y fechas

- El sitio **ordena solo**: pasados (del más reciente al más viejo) → próximo → futuros.
- No importa en qué orden cargues las filas.
- No cargar partidos con fecha vacía ni con fecha ilegible (la card quedaría sin día/mes).

---

## 6. Cuándo se reflejan los cambios en el sitio

- El sitio es **estático (SSG)** y se regenera automáticamente **cada 15 minutos** (GitHub Action que baja la hoja y hace build).
- Por eso, un cambio en la hoja se refleja en el sitio en **≤15–20 min** (lo que tarde la Action + el deploy).
- Si editás la hoja y no ves el cambio: esperá unos minutos. Tras cambios grandes, repetí "Publicar en la web" si Google lo pide.
- No hay caché por visitante: todos ven la misma versión del último build.

---

## 7. Checklist rápido antes de cada carga

- [ ] ¿La hoja sigue publicada como CSV?
- [ ] ¿Hay **una sola** fila `Próximo`?
- [ ] ¿Los `Finalizado` tienen **goles** en ambas columnas?
- [ ] ¿Las fechas están en `aaaa-mm-dd` (o formato reconocido)?
- [ ] ¿No quedaron filas duplicadas exactas?
- [ ] ¿La fila 1 mantiene los encabezados correctos?

Si el sitio muestra "No hay partidos", revisar que no existan filas vacías sueltas y que la pestaña publicada sea la correcta.

---

## 8. Auto-actualización de la hoja (opcional)

Hay un script listo en [`docs/auto_actualizar.gs`](./auto_actualizar.gs) que se pega en la hoja (Extensiones → Apps Script) y puede:

1. **`actualizarResultadosBoca()`** — completa goles y marca `Finalizado` los partidos cargados, e inserta resultados recientes de TheSportsDB que falten (relee la hoja en cada evento para no duplicar).
2. **`limpiarDuplicados()`** — borra filas duplicadas exactas y deja la primera.
3. **`insertarProximoSiFalta()`** — si la hoja no tiene ningún partido futuro, inserta el próximo que reporta la API como `Próximo`.
4. **`limpiarHistorial()`** — borra los `Finalizado` viejos y deja solo los **2 más recientes** (nunca toca los futuros/`Próximo`).

Configurar **activador por horas (cada 1 hora)** sobre `actualizarTodo` (que corre las tres en orden).

### Flujo de trabajo recomendado (fixture manual + resultados automáticos)

1. **Cargás a mano el fixture** (próximos y futuros) con el formato de la §3: liga, copas, internacionales y amistosos. Una fila por partido; el más cercano como `Próximo`, el resto `Confirmado`. Para agilizar, podés usar la plantilla de prompt para IA en [`docs/prompt_gemini.md`](./prompt_gemini.md).
2. El script (cada 1 hora) hace el resto solo:
   - completa goles y marca `Finalizado` los que se jugaron;
   - inserta resultados recientes que falten;
   - borra duplicados y deja solo los 2 `Finalizado` más recientes;
   - **red de seguridad**: si la hoja queda sin ningún futuro, inserta el próximo que reporta la API (revisalo una vez al verlo).
3. Vos solo tocás la hoja para **cargar/corregir el calendario futuro** (y repúblicás como CSV si Google lo pide).

> Nota: TheSportsDB no cubre bien todo el fixture argentino (copas, amistosos, internacionales), por eso el futuro se carga a mano. El full-auto real requeriría otra fuente (API-Football, con key) — anotado como evolutivo en PLAN.md.

## 9. ¿Qué pasa cuando no hay próximos partidos?

- Si en la hoja hay **solo resultados** (todo `Finalizado`) y ningún `Próximo`/`Confirmado`, el sitio muestra un aviso *"No hay próximos partidos por el momento…"* arriba y conserva los resultados visibles.
- Si la hoja está **totalmente vacía**, el sitio muestra *"No hay partidos disponibles por el momento."*
- Mientras exista al menos un `Confirmado` (o `previsto`), el sitio toma el de fecha más cercana como **próximo destacado** automáticamente.
- Las filas `Próximo`/`Confirmado`/`previsto` con **fecha ya pasada** se **ignoran** en el sitio (no se muestran), para evitar partidos "zombie". Se mantienen visibles hasta **6 h después de su inicio** (hora Argentina) por si el resultado todavía no se cargó. Conviene igual borrarlas o marcarlas `Finalizado` en la hoja.
- El sitio muestra **solo los 2 `Finalizado` más recientes** (el resto no se lista, aunque estén en la hoja). Los cruces de ida y vuelta conservan su global aunque el Ida no se muestre.
