export type MatchStatus = "finished" | "next" | "scheduled";

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

/** Contenido rico cargado a mano en la pestaña "Detalles" del Sheet. */
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
  notes?: string;
  /** Puntaje de contenido (define index/noindex). */
  score: number;
}

export interface Match {
  id: string;
  /** Slug estable para la URL: `{fecha}-{rival}`. */
  slug: string;
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
  venue?: string;

  status: MatchStatus;

  /** Solo presente en la pata de Vuelta de un cruce de ida y vuelta. */
  aggregate?: MatchAggregate;

  /** Forma reciente de Boca (últimos resultados: W/D/L). */
  bocaForm?: string[];

  /** Contenido rico (solo si hay fila en la pestaña "Detalles"). */
  details?: MatchDetails;

  /** ¿La página debe indexarse? (define index/noindex). */
  indexable?: boolean;
}
