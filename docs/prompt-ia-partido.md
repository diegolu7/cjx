# prompt-ia-partido.md — Prompt para generar contenido de un partido

> Prompt para pegar en tu IA (ChatGPT/Gemini) y generar el **`Preview`** y los
> **`DatosCuriosos`** de un partido, listos para pegar en la pestaña `Detalles`.
> **No reemplaza datos reales**: la IA solo redacta con lo que le pasás.

---

## Prompt base (copiar y completar los datos)

```
Sos redactor deportivo de "Cuando Juega el Xeneize", un sitio NO oficial hecho por
hinchas de Boca Juniors.

Tu tarea: escribir el contenido de un partido con los datos que te paso.

REGLAS:
- No inventes datos. Si un dato no está, no lo menciones.
- No des pronósticos ni cuotas de apuestas.
- No afirmes lesiones, suspensiones ni rumores que no estén en los datos.
- Español rioplatense, tono hincha pero respetuoso, sin emojis.
- Nada de "sitio oficial" ni lenguaje que sugiera afiliación con el club.

DATOS DEL PARTIDO:
- Fecha y hora:
- Rival:
- Condición (Local/Visitante):
- Torneo y fase:
- Estadio:
- Canal:
- Últimos resultados de Boca (más reciente primero):
- Antecedentes vs el rival (si hay):

DEVOLVÉ EXACTAMENTE ESTE FORMATO, sin nada más:

PREVIEW: <2 párrafos, entre 120 y 200 palabras en total>
DATOS: <4 a 6 hechos separados por "; " (sin punto final)>
```

---

## Ejemplo completo (entrada)

```
DATOS DEL PARTIDO:
- Fecha y hora: 2026-09-20 21:30
- Rival: Racing
- Condición: Visitante
- Torneo y fase: Copa Argentina - Octavos de Final
- Estadio: Estadio Presidente Perón (Avellaneda)
- Canal: TyC Sports
- Últimos resultados de Boca: Boca 3-1 Central Córdoba; São Paulo 1-1 Boca; Boca 1-0 São Paulo
- Antecedentes vs el rival: Último: Boca 2-0 Racing (Liga, 2026)
```

## Ejemplo completo (salida esperada)

```
PREVIEW: Boca visita a Racing por los octavos de final de la Copa Argentina, en un duelo
de clásico que promete. El Xeneize llega con confianza tras una serie de buenos resultados
y busca meterse entre los ocho mejores del torneo. Racing, de local en Avellaneda, intentará
hacerse fuerte para dar el golpe.

Será un partido de cuidado: los clásicos no entienden de momentos y cualquiera puede ganarlo.
Boca necesitará ser sólido atrás y preciso arriba para sacar ventaja en un estadio exigente.

DATOS: Racing no le gana a Boca desde 2023; Es el 5.º cruce del año; Boca ganó 3 de los últimos 4 en Avellaneda; El último enfrentamiento fue victoria de Boca 2-0 por Liga
```

---

## Cómo usarlo

1. Completá los **DATOS DEL PARTIDO** (cuanto más reales, mejor).
2. Pegá el prompt completo en la IA.
3. Copiá el `PREVIEW:` a la columna **`Preview`** y el `DATOS:` a **`DatosCuriosos`**
   (separados por `;` como los devuelve).
4. Revisá que no haya datos inventados antes de guardar.

> Recordá: la IA puede equivocarse. Verificá nombres y hechos antes de publicar.

---

## Notas según el estado del partido

- **Próximo:** lo que genera el prompt va a la sección **"Previa del partido"**.
- **Finalizado:** el mismo texto se muestra como **"Resumen del partido"** (mismo campo
  `Preview`). Ajustá el prompt para que redacte en pasado si el partido ya se jugó, por ej.:
  *"Escribí un resumen de lo que pasó, no una previa."*
- **`DatosCuriosos` + `Antecedentes` + `Notas`** se muestran juntos en **"Claves del
  partido"**. Evitá repetir en `Notas` lo que ya está en `Antecedentes` o en el `Preview`.
