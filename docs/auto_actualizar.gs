/**
 * Auto-actualización del Google Sheet (backend del sitio "Cuando Juega el Xeneize").
 *
 * Fuente: TheSportsDB — ID Boca Juniors = 135156
 *   Resultados: https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=135156
 *   Próximo:    https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=135156
 *
 * CÓMO INSTALAR (una vez):
 *   1. Abrir la hoja → menú Extensiones → Apps Script.
 *   2. Pegar TODO este archivo y guardar.
 *   3. Ejecutar una vez cada función para pedir permisos.
 *   4. Configurar el activador: reloj → "Activadores" → "+ Agregar activador":
 *        - Función: actualizarResultadosBoca  (y otra para insertarProximoSiFalta)
 *        - Fuente: Según tiempo / Tipo: Temporizador por horas → "Cada hora"
 *   5. Recomendado: ejecutar cada hora. (~48 llamadas/día a la API: dentro de las
 *      cuotas gratuitas de Apps Script y de TheSportsDB. No bajar de 1 hora.)
 *
 * Notas / salvaguardas:
 *   - FLUJO: el fixture (próximos/futuros) se carga a mano en la hoja; este script
 *     solo AUTO-ACTUALIZA RESULTADOS y hace limpieza. insertarProximoSiFalta() es
 *     una RED DE SEGURIDAD: solo agrega el próximo si la hoja quedó sin futuros.
 *   - Nunca pisa Canal / Torneo / Lugar cargados a mano en filas existentes.
 *   - Solo completa goles y marca Finalizado cuando la fila aún no tiene resultado.
 *   - Deduplica por rival + fecha (normalizado).
 *   - Mantiene automáticamente solo los 2 Finalizado más recientes (podas el historial viejo).
 *   - Dedupe en caliente: limpiarDuplicados() borra filas duplicadas exactas y
 *     actualizarResultadosBoca relee la hoja en cada evento para no duplicar.
 *
 * Para cargar el fixture a mano (formato exacto) ver: docs/formato.md.
 * Plantilla de prompt para generar filas con IA: docs/prompt_gemini.md.
 */
var BOCA_ID = "135156";
var BOCA_NAME = "Boca Juniors";
var TZ = Session.getScriptTimeZone(); // zona de la hoja (Argentina)

/* ------------------------------ utilidades ------------------------------ */

function _sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets()[0]; // primera pestaña (la de partidos)
}

function _norm(s) {
  var map = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n", ü: "u" };
  return String(s || "")
    .toLowerCase()
    .trim()
    .split("")
    .map(function (c) {
      return map[c] || c;
    })
    .join("");
}

/** Devuelve { data, idx } con los índices de columna según la fila 1. */
function _ctx() {
  var data = _sheet().getDataRange().getValues();
  var idx = {};
  if (data.length > 0) {
    data[0].forEach(function (h, i) {
      idx[_norm(h)] = i;
    });
  }
  return { data: data, idx: idx };
}

function _c(estado, fecha, hora, condicion, rival, gb, gr, torneo, fase) {
  return [estado, fecha, hora, condicion, rival, gb, gr, torneo, fase, "", ""];
}

/** Parsea "2026-09-08T21:30:00" → Date UTC. */
function _parseUTC(str) {
  var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(str || ""));
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
}

function _fmt(date, pattern) {
  return date ? Utilities.formatDate(date, TZ, pattern) : "";
}

/** Fecha/hora Argentina a partir del strTimestamp (UTC) de la API. */
function _argDateTime(ev) {
  var d = _parseUTC(ev.strTimestamp);
  return { fecha: _fmt(d, "yyyy-MM-dd"), hora: _fmt(d, "HH:mm") };
}

/** Candidatas de fecha a comparar (la API mezcla UTC/local según el caso). */
function _candidateDates(ev) {
  var out = [];
  var arg = _argDateTime(ev);
  if (arg.fecha) out.push(arg.fecha);
  ["dateEvent", "dateEventLocal"].forEach(function (k) {
    var v = String(ev[k] || "").slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) out.push(v);
  });
  return out;
}

function _rival(ev) {
  var home = String(ev.strHomeTeam || "");
  if (home === BOCA_NAME) return { rival: ev.strAwayTeam, condicion: "Local" };
  return { rival: ev.strHomeTeam, condicion: "Visitante" };
}

function _leagueLabel(raw) {
  var l = _norm(raw);
  if (l.indexOf("primera division") !== -1 && l.indexOf("argentin") !== -1)
    return "Liga Profesional";
  return String(raw || "").trim();
}

function _fase(ev) {
  var round = Number(ev.intRound);
  var fase = String(ev.strRound || "").trim();
  if (fase) return fase;
  if (isFinite(round) && round > 0) return "Fecha " + round;
  return "";
}

/**
 * Busca la fila de un evento de la API en la hoja.
 *
 * Clave del fix (bug de duplicados): NO se identifica por rival exacto, porque
 * el mismo partido puede venir escrito distinto ("Central Córdoba (SdE)" vs
 * "Central Córdoba de Santiago del Estero") y eso generaba una fila nueva.
 * Estrategia:
 *   1) candidatas por fecha (la API mezcla UTC/local);
 *   2) coincidencia exacta de rival normalizado;
 *   3) si hay una única fila en esa fecha, es ese partido;
 *   4) desempate por hora de inicio.
 */
function _rowExists(data, ev) {
  var rival = _norm(_rival(ev).rival);
  var dates = _candidateDates(ev);

  var candidatas = [];
  for (var r = 1; r < data.length; r++) {
    if (dates.indexOf(_cellDate(data[r][1])) !== -1) candidatas.push(r);
  }
  if (candidatas.length === 0) return -1;

  for (var i = 0; i < candidatas.length; i++) {
    if (_norm(data[candidatas[i]][4]) === rival) return candidatas[i];
  }

  if (candidatas.length === 1) return candidatas[0];

  var hora = _argDateTime(ev).hora;
  if (hora) {
    for (var j = 0; j < candidatas.length; j++) {
      if (_cellTime(data[candidatas[j]][2]) === hora) return candidatas[j];
    }
  }

  return -1;
}

function _cellDate(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, "yyyy-MM-dd");
  var s = String(v || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function _cellTime(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, "HH:mm");
  var s = String(v || "").trim();
  var m = /^(\d{1,2}):(\d{2})/.exec(s);
  if (!m) return s.slice(0, 5);
  return (m[1].length === 1 ? "0" + m[1] : m[1]) + ":" + m[2];
}

/* --------------------------- resultados (goles) --------------------------- */

/**
 * Completa goles/Estado de partidos ya cargados e inserta resultados recientes
 * que no existan en la hoja. Se llama desde el activador por horas.
 */
function actualizarResultadosBoca() {
  var json = _fetch("eventslast");
  if (!json || !json.results) return;

  var idx = _ctx().idx; // índices de columnas (fila 1)
  var sheet = _sheet();
  var updates = 0;
  var inserts = 0;

  json.results.slice(0, 5).forEach(function (ev) {
    if (!_esDeBoca(ev)) return;
    var home = String(ev.strHomeTeam || "") === BOCA_NAME;
    var gHome = ev.intHomeScore;
    var gAway = ev.intAwayScore;
    if (
      gHome === null ||
      gHome === undefined ||
      gAway === null ||
      gAway === undefined
    )
      return;
    var bocaGoals = home ? gHome : gAway;
    var rivalGoals = home ? gAway : gHome;

    // Leer datos frescos en cada iteración: evita duplicar si la API trae el
    // mismo evento repetido o si acabamos de insertar una fila.
    var dataFresca = sheet.getDataRange().getValues();
    var r = _rowExists(dataFresca, ev);
    if (r > 0) {
      var estadoActual = String(dataFresca[r][0] || "").trim();
      var yaTiene = dataFresca[r][5] !== "" && dataFresca[r][6] !== "";
      if (estadoActual !== "Finalizado" && !yaTiene) {
        sheet.getRange(r + 1, 1).setValue("Finalizado");
        sheet.getRange(r + 1, idx["goles boca"] + 1 || 6).setValue(bocaGoals);
        sheet.getRange(r + 1, idx["goles rival"] + 1 || 7).setValue(rivalGoals);
        updates++;
      }
      return;
    }

    // No existe → insertar resultado nuevo
    var arg = _argDateTime(ev);
    var rel = _rival(ev);
    sheet.appendRow(
      _c(
        "Finalizado",
        arg.fecha,
        arg.hora,
        rel.condicion,
        rel.rival,
        bocaGoals,
        rivalGoals,
        _leagueLabel(ev.strLeague),
        _fase(ev),
      ),
    );
    inserts++;
  });

  Logger.log(
    "actualizarResultadosBoca → updates=%s inserts=%s",
    updates,
    inserts,
  );
}

/* ------------------------- próximo partido (si falta) ------------------------- */

/**
 * Si la hoja NO tiene ningún partido futuro (Próximo/Confirmado) y la API
 * devuelve el próximo evento, lo inserta como "Próximo".
 */
function insertarProximoSiFalta() {
  var ctx = _ctx();
  if (_tieneFuturos(ctx.data)) {
    Logger.log("insertarProximoSiFalta → ya hay futuros, no hago nada");
    return;
  }

  var json = _fetch("eventsnext");
  if (!json || !json.events) return;
  var ev = json.events[0];
  if (!_esDeBoca(ev)) return;

  // No insertar si el evento ya tiene resultado o quedó en el pasado.
  if (ev.intHomeScore !== null && ev.intHomeScore !== undefined) return;
  var arg = _argDateTime(ev);
  var hoy = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
  if (!arg.fecha || arg.fecha < hoy) return;
  if (_rowExists(ctx.data, ev) > 0) return;

  var rel = _rival(ev);
  _sheet().appendRow(
    _c(
      "Próximo",
      arg.fecha,
      arg.hora,
      rel.condicion,
      rel.rival,
      "",
      "",
      _leagueLabel(ev.strLeague),
      _fase(ev),
    ),
  );
  Logger.log(
    "insertarProximoSiFalta → insertado próximo: " +
      rel.rival +
      " " +
      arg.fecha,
  );
}

function _tieneFuturos(data) {
  for (var r = 1; r < data.length; r++) {
    var estado = String(data[r][0] || "")
      .trim()
      .toLowerCase();
    var fecha = _cellDate(data[r][1]);
    var hoy = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");
    if (
      (estado === "próximo" ||
        estado === "proximo" ||
        estado === "confirmado" ||
        estado === "previsto") &&
      fecha >= hoy
    ) {
      return true;
    }
  }
  return false;
}

function _esDeBoca(ev) {
  var home = String(ev.strHomeTeam || "");
  var away = String(ev.strAwayTeam || "");
  return home === BOCA_NAME || away === BOCA_NAME;
}

/* ------------------------------ red + ayuda ------------------------------ */

function _fetch(kind) {
  var url =
    "https://www.thesportsdb.com/api/v1/json/3/" + kind + ".php?id=" + BOCA_ID;
  try {
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return null;
    return JSON.parse(res.getContentText());
  } catch (e) {
    Logger.log("Error fetch " + kind + ": " + e.toString());
    return null;
  }
}

/** Ejecuta todo en una llamada (útil para probar o para un solo activador). */
function actualizarTodo() {
  limpiarDuplicados(); // quita duplicados que hayan quedado
  actualizarResultadosBoca();
  limpiarDuplicados(); // por si la API vino con eventos repetidos
  insertarProximoSiFalta();
  limpiarHistorial();
}

/* ------------------------- limpieza de duplicados ------------------------- */

/**
 * Borra filas duplicadas.
 *
 * Detecta dos casos:
 *   1) filas exactamente iguales (mismos 9 primeros campos);
 *   2) MISMO PARTIDO (misma Fecha + Hora) con distinto rival/estado, p. ej. la
 *      fila "Próximo" y la "Finalizado" del mismo partido. En ese caso conserva
 *      la fila que tiene resultado y borra la otra.
 */
function limpiarDuplicados() {
  var sheet = _sheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  var seen = {};
  var porPartido = {}; // "fecha|hora" -> índice de la fila buena
  var aBorrar = [];

  for (var r = 1; r < data.length; r++) {
    // Ignora filas totalmente vacías.
    var filaVacia = data[r].every(function (c) {
      return String(c || "").trim() === "";
    });
    if (filaVacia) continue;

    // 1) Duplicado exacto.
    var key = data[r].slice(0, 9).join("|").toLowerCase();
    if (seen[key]) {
      aBorrar.push(r);
      continue;
    }
    seen[key] = true;

    // 2) Mismo partido (fecha + hora).
    var fecha = _cellDate(data[r][1]);
    var hora = _cellTime(data[r][2]);
    if (!fecha || !hora) continue;
    var pk = fecha + "|" + hora;

    if (porPartido[pk] === undefined) {
      porPartido[pk] = r;
      continue;
    }

    var prev = porPartido[pk];
    if (_tieneResultado(data[r]) && !_tieneResultado(data[prev])) {
      aBorrar.push(prev);
      porPartido[pk] = r;
    } else {
      aBorrar.push(r);
    }
  }

  aBorrar.sort(function (a, b) {
    return b - a;
  }); // de abajo hacia arriba
  aBorrar.forEach(function (rowIdx) {
    sheet.deleteRow(rowIdx + 1);
  });

  if (aBorrar.length > 0)
    Logger.log("limpiarDuplicados → borradas=%s", aBorrar.length);
}

/** ¿La fila ya tiene resultado o está marcada como Finalizado? */
function _tieneResultado(row) {
  var estado = _norm(row[0]);
  var gb = String(row[5] || "").trim();
  var gr = String(row[6] || "").trim();
  return estado === "finalizado" || (gb !== "" && gr !== "");
}

/* ------------------------- limpieza de historial ------------------------- */

/**
 * Borra filas Finalizado que NO estén entre las 2 más recientes por fecha.
 * Nunca toca Próximo / Confirmado / previsto.
 */
function limpiarHistorial() {
  var sheet = _sheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 3) return; // header + 1 fila como mínimo, no hay nada que podar

  var finalizados = [];
  for (var r = 1; r < data.length; r++) {
    if (_norm(data[r][0]) === "finalizado") {
      var fecha = _cellDate(data[r][1]);
      if (fecha) finalizados.push({ row: r, fecha: fecha });
    }
  }
  if (finalizados.length <= 2) return;

  finalizados.sort(function (a, b) {
    return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0;
  });

  var aBorrar = finalizados
    .slice(2) // descarta los 2 más recientes
    .map(function (x) {
      return x.row;
    })
    .sort(function (a, b) {
      return b - a;
    }); // de abajo hacia arriba

  aBorrar.forEach(function (rowIdx) {
    sheet.deleteRow(rowIdx + 1); // getValues es 0-based, hoja es 1-based
  });

  Logger.log("limpiarHistorial → borradas=%s", aBorrar.length);
}
