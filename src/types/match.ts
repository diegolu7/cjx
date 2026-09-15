export type MatchStatus = "finished" | "next" | "scheduled";

/** Resultado global de un cruce de ida y vuelta (se muestra en la Vuelta). */
export interface MatchAggregate {
  bocaScore: number;
  rivalScore: number;
  penaltyBoca?: number;
  penaltyRival?: number;
}

export interface Match {
  id: string;
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

  status: MatchStatus;

  /** Solo presente en la pata de Vuelta de un cruce de ida y vuelta. */
  aggregate?: MatchAggregate;
}