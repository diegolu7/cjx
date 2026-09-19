import type { Match } from "../types/match";
import { rivalOf } from "./match";

export function slugify(s: string): string {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface Group {
  name: string;
  slug: string;
  matches: Match[];
}

function groupBy(
  matches: Match[],
  nameOf: (m: Match) => string,
): Group[] {
  const map = new Map<string, Group>();
  for (const m of matches) {
    const name = nameOf(m);
    const slug = slugify(name);
    if (!slug) continue;
    if (!map.has(slug)) map.set(slug, { name, slug, matches: [] });
    map.get(slug)!.matches.push(m);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function groupByRival(matches: Match[]): Group[] {
  return groupBy(matches, (m) => rivalOf(m));
}

export function groupByTorneo(matches: Match[]): Group[] {
  return groupBy(matches, (m) => m.competition);
}
