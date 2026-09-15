# automatizar.md

# Automatización de agenda de Boca Juniors

## 1. Objetivo

Mantener actualizada automáticamente la agenda de partidos de Boca Juniors en un sitio estático publicado con:

- GitHub Pages
- Dominio `.com.ar`
- Cloudflare como DNS/CDN
- GitHub Actions para ejecutar tareas programadas
- Node.js para extracción, normalización y actualización
- Un modelo de IA pequeño para limpiar información y devolver JSON estructurado

La automatización se ejecutará todos los días en tres horarios fijos de Argentina:

- 09:00
- 12:00
- 17:00

Además tendrá ejecuciones especiales vinculadas a los partidos:

- una actualización previa al partido;
- una actualización posterior para detectar el resultado final y marcarlo como `finished`.

Zona horaria de referencia: **America/Argentina/Buenos_Aires (UTC-3)**.

El visitante del sitio nunca debe consultar directamente fuentes deportivas ni modelos de IA.  
El frontend solo debe consumir un archivo JSON estático generado previamente.

---

## 2. Arquitectura propuesta

```text
GitHub Actions
      |
      | 2 veces por día
      v
Script Node.js / MCP
      |
      +--> Busca información pública
      |    - Olé
      |    - ESPN
      |    - TyC Sports
      |
      v
Filtrado de contenido relevante
      |
      v
Modelo pequeño de IA
GPT-5 nano
      |
      v
JSON estructurado
      |
      v
Validaciones Node.js
      |
      v
Comparación / Upsert
      |
      v
public/data/agenda-boca.json
      |
      v
Commit automático
      |
      v
GitHub Pages
      |
      v
Cloudflare
      |
      v
Visitantes
```

---

# 3. Principio principal

La IA **no debe controlar directamente la agenda**.

Su única función será:

1. recibir texto deportivo;
2. extraer información;
3. normalizar nombres;
4. convertir fechas y horarios;
5. devolver JSON estricto.

Node.js será responsable de:

- validar;
- detectar duplicados;
- detectar conflictos;
- decidir si se actualiza;
- realizar el merge;
- guardar el archivo;
- hacer commit.

---

# 4. Fuentes

Fuentes principales:

1. Olé
2. ESPN
3. TyC Sports

Se pueden agregar otras fuentes posteriormente.

No depender de una única fuente.

Priorizar información relacionada con:

- próximo partido;
- últimos resultados;
- fecha;
- hora;
- rival;
- condición local/visitante;
- torneo;
- fase;
- estadio;
- canal;
- resultado final;
- reprogramaciones.

---

# 5. Datos que debe mantener cada partido

Formato sugerido:

```json
{
  "id": "boca-racing-2026-09-20",
  "status": "scheduled",
  "date": "2026-09-20",
  "time": "21:30",
  "condition": "home",
  "opponent": "Racing",
  "boca_score": null,
  "opponent_score": null,
  "competition": "Copa Argentina",
  "stage": "Octavos de Final",
  "channel": null,
  "venue": null,
  "sources": [
    "ole",
    "tyc"
  ],
  "last_verified_at": "2026-09-14T21:00:00-03:00"
}
```

---

# 6. Estados permitidos

Usar internamente valores estables:

```text
scheduled
finished
postponed
cancelled
unknown
```

En el frontend se pueden mostrar como:

```text
scheduled  -> Próximo / Previsto
finished   -> Finalizado
postponed  -> Postergado
cancelled  -> Cancelado
unknown    -> Por confirmar
```

---

# 7. Identificador único

Nunca identificar un partido únicamente por posición dentro del JSON.

Generar una clave estable:

```text
boca-{rival-normalizado}-{fecha}
```

Ejemplo:

```text
boca-central-cordoba-2026-09-11
```

Esto permitirá hacer:

```text
UPSERT
```

en vez de simplemente agregar nuevas filas.

---

# 8. Evitar duplicados

Problema actual posible:

```text
Boca vs Central Córdoba
estado: Próximo
```

y posteriormente:

```text
Boca vs Central Córdoba
estado: Finalizado
```

No deben quedar dos registros.

El segundo proceso debe encontrar el mismo `id` y actualizar:

```text
scheduled -> finished
```

junto con:

```text
boca_score
opponent_score
```

---

# 9. Modelo recomendado

Modelo principal:

```text
GPT-5 nano
```

Uso:

- extracción;
- limpieza;
- clasificación;
- normalización;
- JSON estructurado.

No se necesita un modelo de razonamiento grande.

Modelo opcional de fallback:

```text
GPT-5 mini
```

Usarlo únicamente si:

- el JSON del modelo principal es inválido;
- existen datos muy ambiguos;
- existen contradicciones entre fuentes.

---

# 10. Prompt del extractor

Prompt base:

```text
Sos un extractor de datos deportivos.

Tu única función es identificar información sobre partidos de Boca Juniors.

REGLAS:

- No expliques nada.
- No escribas comentarios.
- No inventes información.
- Utilizá únicamente el contenido suministrado.
- Si un dato no aparece, devolver null.
- Fechas siempre YYYY-MM-DD.
- Horarios siempre HH:mm.
- Identificar correctamente local y visitante.
- Si Boca aparece primero como local, condition = "home".
- Si Boca aparece segundo como visitante, condition = "away".
- Si el partido terminó, extraer resultado.
- Diferenciar fecha del partido de fecha de publicación.
- No interpretar rumores como información confirmada.
- Si dos datos son contradictorios, marcar conflict = true.
- Devolver SOLO JSON válido.

OUTPUT:

{
  "matches": [
    {
      "status": "scheduled|finished|postponed|cancelled|unknown",
      "date": null,
      "time": null,
      "condition": "home|away|null",
      "opponent": null,
      "boca_score": null,
      "opponent_score": null,
      "competition": null,
      "stage": null,
      "channel": null,
      "venue": null
    }
  ],
  "conflict": false
}
```

---

# 11. Structured Output

Siempre que sea posible, utilizar salida JSON estructurada mediante schema.

No depender únicamente de:

```text
"respondeme en JSON"
```

El schema debe exigir tipos claros.

Ejemplo:

```text
date       string | null
time       string | null
score      integer | null
opponent   string | null
conflict   boolean
```

---

# 12. Validaciones posteriores

Después de recibir la respuesta del modelo, Node.js debe validar.

Ejemplo:

```js
if (!match.date) reject();
if (!match.opponent) reject();

if (
  match.status === "finished" &&
  (match.boca_score === null || match.opponent_score === null)
) {
  reject();
}
```

También validar:

- formato de fecha;
- formato de hora;
- goles >= 0;
- rival != Boca Juniors;
- `condition` válido;
- estados permitidos;
- no duplicados;
- torneo no vacío cuando esté disponible.

---

# 13. Estrategia de fuentes

Idealmente obtener información de al menos 2 fuentes.

Ejemplo:

```text
Olé
+
TyC
```

o:

```text
ESPN
+
Olé
```

---

# 14. Regla de confianza

## Alta confianza

Dos o más fuentes coinciden en:

- fecha;
- rival;
- condición;
- resultado.

Entonces:

```text
actualizar automáticamente
```

## Confianza media

Una sola fuente confiable contiene información nueva.

Se puede completar:

```text
channel
venue
stage
```

si el valor anterior era `null`.

## Conflicto

Dos fuentes difieren en:

- fecha;
- hora;
- resultado;
- rival.

Entonces:

```text
NO sobrescribir automáticamente.
```

Guardar log:

```text
CONFLICT: Boca vs Racing
Olé: 21:30
ESPN: 22:00
```

---

# 15. Nunca inventar información

Si no se encuentra canal:

```json
"channel": null
```

No:

```json
"channel": "Por definir"
```

La conversión:

```text
null -> "Por definir"
```

debe realizarla el frontend.

Igual para:

- estadio;
- fase;
- horario;
- canal.

---

# 16. Archivo final

Ruta sugerida:

```text
/public/data/agenda-boca.json
```

Ejemplo:

```json
{
  "updated_at": "2026-09-14T21:00:00-03:00",
  "team": "Boca Juniors",
  "matches": []
}
```

---

# 17. Estructura sugerida del proyecto

```text
/
├── public/
│   └── data/
│       └── agenda-boca.json
│
├── scripts/
│   └── boca/
│       ├── search.js
│       ├── extract.js
│       ├── normalize.js
│       ├── validate.js
│       ├── merge.js
│       └── update.js
│
├── prompts/
│   └── boca-extractor.txt
│
├── .github/
│   └── workflows/
│       └── update-boca.yml
│
└── package.json
```

---

# 18. Responsabilidad de cada archivo

## search.js

Obtener contenido de las fuentes.

```text
Olé
ESPN
TyC
```

---

## extract.js

Enviar los fragmentos relevantes al modelo.

```text
GPT-5 nano
```

---

## normalize.js

Normalizar:

```text
Boca
Boca Juniors
CABJ
Club Atlético Boca Juniors
```

a:

```text
Boca Juniors
```

También normalizar rivales:

```text
Central Córdoba (SdE)
Central Córdoba de Santiago del Estero
```

a una única representación.

---

## validate.js

Aplicar reglas estrictas antes de modificar el JSON.

---

## merge.js

Comparar información nueva con:

```text
agenda-boca.json
```

Realizar:

```text
insert
update
ignore
conflict
```

---

## update.js

Orquestador general:

```text
buscar
-> extraer
-> normalizar
-> validar
-> merge
-> guardar
```

---

# 19. GitHub Actions

Ejecutar todos los días en tres horarios fijos de Argentina:

```text
09:00 ARG
12:00 ARG
17:00 ARG
```

Como GitHub Actions interpreta `cron` en UTC y Argentina utiliza UTC-3, los horarios equivalentes son:

```text
09:00 ARG -> 12:00 UTC
12:00 ARG -> 15:00 UTC
17:00 ARG -> 20:00 UTC
```

Ejemplo conceptual:

```yaml
on:
  schedule:
    - cron: "0 12 * * *"
    - cron: "0 15 * * *"
    - cron: "0 20 * * *"

  workflow_dispatch:
```

Agregar siempre:

```text
workflow_dispatch
```

para permitir una ejecución manual desde GitHub.

Nota:

Los cron de GitHub Actions no garantizan precisión al segundo o al minuto. Puede existir un pequeño retraso de ejecución. Para esta agenda deportiva es aceptable.

---

# 20. Actualizaciones vinculadas a cada partido

Además de las corridas fijas de:

```text
09:00
12:00
17:00
```

el sistema debe realizar actualizaciones especiales cuando exista un partido de Boca.

## 20.1 Actualización previa

Objetivo:

Confirmar antes del partido:

- fecha;
- hora;
- rival;
- local/visitante;
- torneo;
- fase;
- estadio;
- canal;
- posibles reprogramaciones.

Ventana recomendada:

```text
90 minutos antes del inicio
```

Ejemplo:

```text
Partido: 21:30 ARG
Actualización previa: 20:00 ARG
```

Si el partido todavía figura como futuro:

```text
status = scheduled
```

El frontend puede mostrarlo como:

```text
Próximo
```

o:

```text
Previsto
```

según la UX elegida.

## 20.2 Actualización posterior

Objetivo:

Detectar:

- resultado final;
- goles de Boca;
- goles del rival;
- estado finalizado;
- eventual suspensión/postergación.

Primera comprobación recomendada:

```text
150 minutos después del horario de inicio
```

Ejemplo:

```text
Partido: 21:30
Primera comprobación: 00:00
```

Si las fuentes confirman el resultado:

```text
status = finished
```

y guardar:

```text
boca_score
opponent_score
```

## 20.3 Segunda comprobación opcional

Si al primer intento todavía no existe resultado confiable:

```text
reintentar 60 minutos después
```

Ejemplo:

```text
00:00 -> sin confirmar
01:00 -> segundo intento
```

Si sigue sin confirmación:

```text
conservar el último snapshot válido
```

y esperar a la siguiente corrida fija.

## 20.4 Cómo programar estas ejecuciones

No es conveniente crear un cron diferente manualmente para cada partido.

La estrategia recomendada es:

```text
corridas fijas
+
script que inspecciona agenda-boca.json
```

Cada ejecución puede calcular:

```text
¿hay partido hoy?
¿faltan <= 90 minutos?
¿terminó hace >= 150 minutos?
¿todavía no está marcado como finished?
```

Para una automatización más precisa se puede agregar un workflow periódico liviano únicamente en días de partido.

Ejemplo futuro:

```text
cada 30 minutos
```

pero solo cuando exista un partido pendiente ese día.

Para el MVP, las tres corridas fijas más la lógica previa/post-partido son suficientes si se dispara manualmente o mediante un workflow adicional condicionado.

---

# 21. GitHub Secrets

Guardar secretos únicamente en:

```text
GitHub
Settings
-> Secrets and variables
-> Actions
```

Ejemplo:

```text
OPENAI_API_KEY
```

Nunca guardar:

```text
API keys
tokens
credentials
```

dentro del repositorio.

---

# 22. Commit automático

Si `agenda-boca.json` cambió:

```text
git add public/data/agenda-boca.json
git commit -m "chore: update Boca schedule"
git push
```

Si no cambió:

```text
no realizar commit
```

Esto evita commits innecesarios.

---

# 23. Logs

Cada ejecución debería registrar:

```text
[SEARCH] Olé OK
[SEARCH] ESPN OK
[SEARCH] TyC OK

[EXTRACT] 4 matches encontrados

[VALIDATE]
3 válidos
1 descartado

[MERGE]
1 insert
1 update
1 unchanged

[OUTPUT]
agenda-boca.json actualizado
```

Nunca guardar el API Key en logs.

---

# 24. Manejo de errores

Si falla una fuente:

```text
continuar con las restantes
```

Ejemplo:

```text
Olé ERROR
ESPN OK
TyC OK
```

La ejecución no debería fallar completamente.

---

# 25. Si falla la IA

Nunca eliminar ni reemplazar la agenda existente.

Regla:

```text
ERROR
-> conservar agenda-boca.json actual
-> registrar error
-> finalizar sin commit
```

Esto permite que el sitio continúe mostrando el último snapshot válido.

---

# 26. Snapshot como estrategia de seguridad

El JSON actualmente publicado siempre debe considerarse:

```text
último estado válido conocido
```

Nunca:

```text
vaciar agenda
```

porque falló:

- una fuente;
- Internet;
- una extracción;
- el modelo;
- GitHub Actions.

---

# 27. Frontend

El sitio únicamente consulta:

```text
/data/agenda-boca.json
```

No debe consultar:

```text
Olé
ESPN
TyC
OpenAI
```

desde el navegador.

Ventajas:

- más rápido;
- más barato;
- sin API keys expuestas;
- soporta picos de tráfico;
- menor dependencia externa.

---

# 28. Cloudflare

Cloudflare continuará funcionando únicamente como:

```text
DNS
+
CDN
+
SSL
+
cache
```

No necesitamos agregar inicialmente:

- Workers;
- Durable Objects;
- bases de datos;
- servidores.

---

# 29. MCP

El MCP puede incorporarse como una capa reutilizable.

Herramientas potenciales:

```text
get_boca_schedule()
get_boca_results()
verify_match()
update_boca_schedule()
validate_boca_schedule()
```

Pero para el MVP no es obligatorio mantener un servidor MCP encendido.

La lógica principal puede vivir como módulos Node.js y posteriormente exponerse mediante MCP.

---

# 30. MVP recomendado

Primera versión:

```text
GitHub Actions
+
Node.js
+
3 fuentes
+
GPT-5 nano
+
JSON estático
```

Sin:

```text
base de datos
servidor propio
API deportiva
Cloudflare Workers
modelo grande
```

---

# 31. Fases de implementación

## Fase 1 — JSON

Definir:

```text
agenda-boca.json
```

y adaptar el frontend para consumirlo.

Objetivo:

```text
frontend completamente desacoplado de la actualización
```

---

## Fase 2 — Normalizador

Crear:

```text
normalize.js
validate.js
merge.js
```

Probarlos utilizando información manual.

---

## Fase 3 — IA

Integrar:

```text
GPT-5 nano
```

y conseguir que convierta textos deportivos a JSON estricto.

---

## Fase 4 — Fuentes

Integrar progresivamente:

```text
Olé
ESPN
TyC
```

No implementar las tres simultáneamente.

Orden sugerido:

```text
1. TyC
2. Olé
3. ESPN
```

---

## Fase 5 — GitHub Actions

Crear:

```text
.github/workflows/update-boca.yml
```

Ejecutar primero mediante:

```text
workflow_dispatch
```

y verificar los commits.

---

## Fase 6 — Cron

Una vez estable:

```text
2 ejecuciones diarias
```

---

## Fase 7 — Mejoras

Posteriormente:

- actualización post-partido;
- detección de reprogramaciones;
- historial;
- logs de conflictos;
- más equipos;
- más torneos;
- MCP reutilizable.

---

# 32. Criterios de éxito

La automatización se considera estable cuando:

- no genera partidos duplicados;
- no inventa datos;
- conserva el snapshot anterior ante errores;
- actualiza resultados correctamente;
- detecta cambios de horario;
- soporta fuentes caídas;
- no expone API keys;
- no requiere intervención diaria;
- el frontend nunca depende de las fuentes externas;
- no genera commits si no existen cambios.

---

# 33. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Hosting | GitHub Pages |
| DNS/CDN | Cloudflare |
| Backend permanente | No |
| Scheduler | GitHub Actions |
| Frecuencia fija | 09:00, 12:00 y 17:00 ARG |
| Actualización previa | ~90 min antes del partido |
| Actualización posterior | ~150 min después del inicio |
| Reintento post-partido | +60 min si aún no hay resultado |
| Fuente deportiva API | No |
| Fuentes públicas | Olé + ESPN + TyC |
| Lenguaje | Node.js |
| Modelo IA | GPT-5 nano |
| Modelo fallback | GPT-5 mini opcional |
| Base de datos | No |
| Persistencia | JSON en Git |
| Estrategia | Snapshot estático |
| MCP | Opcional / segunda etapa |
| Validación | Node.js |
| Actualización | Upsert |
| Comportamiento ante error | Mantener último snapshot válido |

---


# 34. Costos estimados

El objetivo es mantener esta solución con costo mensual cercano a cero.

## 34.1 Infraestructura

| Componente | Uso | Costo estimado |
|---|---|---:|
| GitHub Pages | Hosting estático | USD 0 |
| GitHub Actions | Cron + scripts Node.js | USD 0 en un uso pequeño / repo público |
| Cloudflare Free | DNS, CDN, SSL, caché | USD 0 |
| Dominio `.com.ar` | Dominio existente | costo anual del dominio |
| Node.js | Procesamiento | USD 0 |
| JSON en Git | Persistencia | USD 0 |
| Base de datos | No se usa | USD 0 |
| Servidor VPS | No se usa | USD 0 |

## 34.2 IA

Modelo recomendado:

```text
GPT-5 nano
```

La IA solo recibe fragmentos pequeños de texto, no páginas completas.

Suposición razonable:

```text
3 corridas fijas por día
+
corridas especiales en días de partido
```

Con aproximadamente:

```text
100 a 150 ejecuciones mensuales
```

y prompts/respuestas pequeños, el consumo esperado sería muy bajo.

Estimación práctica:

```text
USD 0.05 a USD 0.50 / mes
```

dependiendo de:

- cantidad de fuentes;
- tamaño de los textos enviados;
- cantidad de reintentos;
- número de partidos;
- uso o no de un modelo fallback.

Incluso con margen de seguridad:

```text
< USD 1 / mes
```

debería ser un objetivo razonable para este proyecto.

## 34.3 Modelo fallback

GPT-5 mini debe utilizarse solo si:

```text
GPT-5 nano falla
JSON inválido
conflicto complejo
texto ambiguo
```

Esto evita multiplicar el costo.

## 34.4 Costo mensual objetivo

| Concepto | Estimación |
|---|---:|
| GitHub Pages | USD 0 |
| GitHub Actions | USD 0 |
| Cloudflare | USD 0 |
| Infraestructura backend | USD 0 |
| GPT-5 nano | ~USD 0.05–0.50 |
| GPT-5 mini fallback | ~USD 0–0.20 |
| **Total esperado** | **~USD 0.05–0.70/mes** |

No se incluye el dominio porque ya forma parte de la infraestructura actual.

## 34.5 Control de costos

Implementar límites:

```text
máximo de fuentes por ejecución
máximo de caracteres enviados al modelo
máximo de reintentos
modelo nano por defecto
modelo mini solo como fallback
```

Ejemplo:

```text
max_sources = 3
max_chars_per_source = 5000
max_ai_retries = 1
```

También registrar:

```text
tokens usados
modelo utilizado
cantidad de llamadas
```

para poder detectar aumentos inesperados de consumo.

---

# 35. Estrategia definitiva de horarios

La agenda se actualizará siguiendo esta prioridad:

```text
1. 09:00 ARG
2. 12:00 ARG
3. 17:00 ARG
4. ~90 min antes de cada partido
5. ~150 min después del inicio
6. +60 min si todavía no existe resultado confirmado
```

Ejemplo para un partido a las 21:30:

```text
09:00  actualización general
12:00  actualización general
17:00  actualización general
20:00  actualización previa
21:30  comienza el partido
00:00  buscar resultado final
01:00  reintentar si todavía no se confirmó
```

Una vez confirmado:

```text
scheduled -> finished
```

El registro existente se actualiza mediante `upsert`; nunca se crea un duplicado.

---

# 36. Resultado esperado

El proceso final deberá poder ejecutarse sin intervención manual:

```text
GitHub Action
     ↓
consulta fuentes
     ↓
extrae contenido relevante
     ↓
GPT-5 nano limpia / estructura
     ↓
Node.js valida
     ↓
Node.js compara
     ↓
actualiza JSON
     ↓
commit automático
     ↓
GitHub Pages publica
     ↓
Cloudflare distribuye
```

El sistema debe priorizar:

```text
simplicidad
+
bajo costo
+
robustez
+
datos verificables
+
cero dependencia del visitante
```
