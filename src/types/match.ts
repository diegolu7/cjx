export type MatchStatus = "finished" | "next" | "scheduled";

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
}