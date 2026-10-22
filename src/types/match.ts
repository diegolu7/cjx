export type MatchStatus = "finished" | "live" | "next" | "scheduled";

/** Resultado global de un cruce de ida y vuelta (se muestra en la Vuelta). */
export interface MatchAggregate {
  bocaScore: number;
  rivalScore: number;
  penaltyBoca?: number;
  penaltyRival?: number;
}

/** Evento de un partido (gol, tarjeta, cambio, etc.). */
export interface MatchEvent {
  minute: string;
  /** Tipo en texto (español, del snapshot). */
  type: string;
  /** Código del tipo ("goal", "yellow-card", "substitution"…) → permite traducirlo. */
  typeCode?: string;
  team: string;
  player: string;
  detail?: string;
  /** Jugador que sale (cambios). */
  playerOut?: string;
  /** Jugador que entra (cambios). */
  playerIn?: string;
}

/** Statísticas del partido (valor de Boca y del rival). */
export interface MatchStat {
  label: string;
  /** Código de la estadística (nombre de ESPN) → permite traducirla. */
  labelCode?: string;
  boca?: string;
  rival?: string;
}

/** Contenido rico del partido (lineups, eventos y stats desde ESPN). */
export interface MatchDetails {
  preview?: string;
  facts?: string[];
  referee?: string;
  h2h?: string;
  formationBoca?: string;
  formationRival?: string;
  startersBoca?: string[];
  subsBoca?: string[];
  startersRival?: string[];
  subsRival?: string[];
  events?: MatchEvent[];
  stats?: MatchStat[];
  notes?: string;
  /** Puntaje de contenido (define index/noindex). */
  score: number;
}

export interface Match {
  id: string;
  /** ID del partido en el proveedor (ESPN). */
  espnId?: string;
  /** Origen del dato ("espn"). */
  source?: string;
  /** Slug estable para la URL: `{fecha}-{rival}`. */
  slug: string;
  date: string;
  dayLabel?: string;
  time?: string;

  homeTeam: string;
  awayTeam: string;

  homeScore?: number;
  awayScore?: number;

  /** Escudo (URL del CDN del proveedor). */
  homeLogo?: string;
  awayLogo?: string;

  /** Competition en texto (del snapshot). Se usa como fallback si no hay código. */
  competition: string;
  /** Código de la competition ("arg.1", "conmebol.libertadores") → permite traducirla. */
  competitionCode?: string;

  /** Ronda en texto (del snapshot). Fallback cuando no hay código de fase. */
  round?: string;
  /** Tipo de ronda: "matchday" (liga) o "phase" (copa). */
  roundType?: "matchday" | "phase";
  /** Número de fecha (ligas): 13 → "Fecha 13" / "Matchday 13". */
  roundNumber?: number;
  /** Slug de la fase (copas): "semifinals", "final", "group-stage"… */
  roundPhase?: string;
  /** Pata del cruce de ida y vuelta: "first" | "second". */
  leg?: "first" | "second";

  channel?: string;
  venue?: string;
  venueCity?: string;

  status: MatchStatus;

  /** Solo presente en la pata de Vuelta de un cruce de ida y vuelta. */
  aggregate?: MatchAggregate;

  /** Forma reciente de Boca (últimos resultados: W/D/L). */
  bocaForm?: string[];

  /** Contenido rico (lineups, eventos, stats). */
  details?: MatchDetails;

  /** ¿La página debe indexarse? (define index/noindex). */
  indexable?: boolean;
}
