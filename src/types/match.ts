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
  type: string;
  team: string;
  player: string;
  detail?: string;
}

/** Statísticas del partido (valor de Boca y del rival). */
export interface MatchStat {
  label: string;
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

  competition: string;
  round?: string;

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
