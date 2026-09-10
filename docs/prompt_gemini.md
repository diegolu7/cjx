# prompt_gemini.md — Plantilla para generar filas de fixture con IA

> Objetivo: que Gemini te arme las filas **listas para pegar** en la hoja, en el
> formato exacto de [`docs/formato.md`](./formato.md). La IA ayuda, pero **siempre
> verificás** los datos antes de pegarlos (fechas, rivales, canales).

## Cómo usarla

1. Copiá el prompt de abajo y reemplazá lo que está entre `{...}`.
2. Pegalo en Gemini (o ChatGPT/Claude).
3. Copiá la respuesta en CSV.
4. En la hoja: pegá en A2 las filas (si hay datos previos, primero borralos o pegá en una hoja temporal y copiá).
5. Verificá: fechas en `aaaa-mm-dd`, hora Argentina, una sola fila `Próximo`, `Finalizado` con goles.

## Prompt

```
Sos un asistente que genera datos de una tabla para un sitio de fútbol.
El club es Boca Juniors (Argentina). Generá SOLO texto CSV sin explicaciones,
sin comillas adicionales y sin ```.

Formato exacto (encabezado fijo, no lo repitas en la salida):
Estado,Fecha,Hora,Condición,Rival,Goles Boca,Goles Rival,Torneo,Fase,Canal,Lugar

Reglas:
- Estado: usa "Próximo" para el partido más cercano (uno solo), "Confirmado"
  para los demás partidos futuros, "Finalizado" solo si se pide un resultado
  (en ese caso completá "Goles Boca" y "Goles Rival" con números).
- Fecha: siempre en formato aaaa-mm-dd (ej. 2026-10-05).
- Hora: formato HH:MM de 24 h en hora Argentina.
- Condición: "Local" si Boca juega de local, "Visitante" si juega de visita.
- Rival: nombre corto del equipo (ej. River, Independiente, Flamengo).
- Torneo: nombre de la competencia (Liga Profesional, Copa Argentina,
  Copa Sudamericana, Copa Libertadores, Amistoso, etc.).
- Fase: ronda o fecha (ej. "Fecha 12", "Cuartos de Final - Ida", "Grupo 4 - Fecha 3").
- Canal: si lo sabés, el canal/plataforma (ESPN, TNT Sports, DSports, etc.);
  si no, dejalo vacío.
- Lugar: estadio si se conoce (La Bombonera, estadio del rival), si no, vacío.
- Para partidos futuros dejá vacías "Goles Boca" y "Goles Rival".

Cargame el fixture de Boca Juniors para: {torneo}, {fase o fecha}, {año o temporada}.
Listá los partidos de Boca en orden cronológico.
```

## Ejemplo de salida esperada

```
Confirmado,2026-10-04,17:00,Local,River,,,Liga Profesional,Fecha 15,ESPN,La Bombonera
Próximo,2026-10-11,21:30,Visitante,Talleres,,,Liga Profesional,Fecha 16,TNT Sports,Mario Kempes
Confirmado,2026-10-15,21:30,Local,Inter de Porto Alegre,,,Copa Sudamericana,Cuartos de Final - Ida,ESPN,La Bombonera
```

## Recordatorios

- Pegás vos en la hoja; el script NO escribe el fixture futuro (solo resultados).
- Si la IA inventa un canal o estadio, corregilo: mejor vacío que erróneo.
- Si vas a cargar resultados viejos, marcá `Finalizado` y completá los goles;
  el script igual mantiene solo los 2 `Finalizado` más recientes.
