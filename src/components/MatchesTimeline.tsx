import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Match, MatchStatus } from "../types/match";

type Tab = "TODOS" | "ANTERIORES" | "PRÓXIMOS";

const TABS: Tab[] = ["ANTERIORES", "TODOS", "PRÓXIMOS"];

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

const cn = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

const BASE = import.meta.env.BASE_URL;

function parseISO(date: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Card estándar: día numérico + mes textual (design.md §18/§43). */
function standardDate(m: Match): { day: string; month: string } {
  const iso = parseISO(m.date);
  if (iso) {
    return { day: pad2(iso.d), month: MESES[iso.m - 1] ?? "" };
  }
  const slash = m.date.split("/");
  if (slash.length === 2) {
    const day = slash[0].trim();
    const mmText = slash[1].trim();
    const mm = parseInt(mmText, 10);
    return { day, month: Number.isNaN(mm) ? mmText : (MESES[mm - 1] ?? mmText) };
  }
  const parts = m.date.split(/\s+/);
  if (parts.length === 2) return { day: parts[0], month: parts[1] };
  return { day: m.date, month: "" };
}

/** Card destacada: día de semana + dd/mm + hora (design.md §23.6). */
function featuredDate(m: Match): { day: string; date: string; time?: string } {
  const iso = parseISO(m.date);
  const dd = iso ? pad2(iso.d) : (m.date.split("/")[0]?.trim() || m.date);
  const mm = iso ? pad2(iso.m) : (m.date.split("/")[1]?.trim() || "");
  return { day: m.dayLabel ?? "", date: `${dd}/${mm}`, time: m.time };
}

function StatusBadge({ status }: { status: MatchStatus }) {
  const label = status === "finished" ? "FINAL" : status === "next" ? "PRÓXIMO" : "PREVISTO";
  const base =
    "inline-flex items-center justify-center h-7 px-[10px] rounded-[4px] text-[10px] font-semibold tracking-[0.03em] uppercase";
  const styles =
    status === "finished"
      ? "text-text-secondary border border-border bg-[rgba(167,182,200,0.03)]"
      : status === "next"
        ? "text-bg border border-accent bg-accent hover:bg-accent-strong hover:border-accent-strong transition-colors duration-[160ms]"
        : "text-accent-secondary border border-[rgba(95,168,211,0.72)] bg-[rgba(95,168,211,0.05)]";
  return <span className={cn(base, styles)}>{label}</span>;
}

function TvIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function teamsLine(m: Match, featured: boolean): string {
  if (featured) {
    return `${m.homeTeam.toUpperCase()} vs ${m.awayTeam.toUpperCase()}`;
  }
  if (m.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined) {
    return `${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`;
  }
  return `${m.homeTeam} vs ${m.awayTeam}`;
}

function rivalOf(m: Match): string {
  return m.homeTeam === "Boca" ? m.awayTeam : m.homeTeam;
}

/** Resultado global del cruce de ida y vuelta (se muestra en la Vuelta). */
function GlobalLine({ match, compact = false }: { match: Match; compact?: boolean }) {
  const agg = match.aggregate;
  if (!agg) return null;

  const rival = rivalOf(match);
  const hasPens = agg.penaltyBoca !== undefined && agg.penaltyRival !== undefined;

  let leader: string;
  if (agg.bocaScore > agg.rivalScore) {
    leader = "Boca lidera";
  } else if (agg.bocaScore < agg.rivalScore) {
    leader = "Boca abajo";
  } else if (hasPens) {
    leader = (agg.penaltyBoca as number) > (agg.penaltyRival as number) ? "Boca lidera" : "Boca abajo";
  } else {
    leader = "Serie igualada";
  }

  if (compact) {
    return (
      <p className="mt-1 text-[12px] leading-[1.45] text-accent-secondary">
        Global {agg.bocaScore}-{agg.rivalScore}
        {hasPens ? ` · Pen ${agg.penaltyBoca}-${agg.penaltyRival}` : ""}
      </p>
    );
  }

  return (
    <p className="mt-1 text-[12px] leading-[1.45] text-accent-secondary">
      Global: Boca {agg.bocaScore} - {agg.rivalScore} {rival}
      {hasPens ? ` · Penales ${agg.penaltyBoca}-${agg.penaltyRival}` : ""}
      <span className="text-text-muted"> · {leader}</span>
    </p>
  );
}

function NodeCell({ active, isFirst, isLast }: { active: boolean; isFirst: boolean; isLast: boolean }) {
  return (
    <div className="hidden lg:block relative self-stretch" aria-hidden="true">
      {/* Segmento superior: línea hasta el nodo (solo si hay fila previa) */}
      {!isFirst && (
        <span className="absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 w-px bg-border-strong" />
      )}
      {/* Segmento inferior: se extiende 10px hacia el gap para no cortar la línea */}
      {!isLast && (
        <span className="absolute top-1/2 -bottom-[10px] left-1/2 -translate-x-1/2 w-px bg-border-strong" />
      )}
      {/* Nodo centrado verticalmente en la card */}
      <span
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
          active
            ? "w-[14px] h-[14px] bg-accent shadow-[0_0_14px_rgba(217,164,65,0.30)]"
            : "w-[10px] h-[10px] border border-accent-secondary bg-bg",
        )}
      />
    </div>
  );
}

export default function MatchesTimeline({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState<Tab>("TODOS");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Al cambiar de tab, volver al inicio de la lista (evita quedar en el fondo).
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [tab]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "ANTERIORES":
        return matches.filter((m) => m.status === "finished");
      case "PRÓXIMOS":
        return matches.filter((m) => m.status === "next" || m.status === "scheduled");
      default:
        return matches;
    }
  }, [matches, tab]);

  const grouped = useMemo(() => {
    const items: { match: Match; label: string; active: boolean; showLabel: boolean }[] = [];
    let seenAnteriores = false;
    let seenProximo = false;
    let seenProximos = false;

    for (const m of filtered) {
      let label = "";
      if (m.status === "finished" && !seenAnteriores) {
        label = "ANTERIORES";
        seenAnteriores = true;
      } else if (m.status === "next" && !seenProximo) {
        label = "PRÓXIMO";
        seenProximo = true;
      } else if (m.status === "scheduled" && !seenProximos) {
        label = "PRÓXIMOS";
        seenProximos = true;
      }
      const active = m.status === "next";
      items.push({ match: m, label, active, showLabel: label !== "" });
    }
    return items;
  }, [filtered]);

  const activeIdx = TABS.indexOf(tab);

  // ¿Hay al menos un partido futuro/próximo? Si hay resultados pero ninguno
  // por venir, mostramos un aviso arriba conservando los resultados.
  const hasUpcoming = useMemo(
    () => matches.some((m) => m.status === "next" || m.status === "scheduled"),
    [matches],
  );
  // Aviso "sin próximos": depende de los datos (no de la tab) para que no
  // aparezca/desaparezca al cambiar de filtro y no altere la altura.
  const showNoUpcoming = matches.length > 0 && !hasUpcoming;

  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
        next = (idx + 1) % TABS.length;
        break;
      case "ArrowLeft":
        next = (idx - 1 + TABS.length) % TABS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = TABS.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setTab(TABS[next]);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  }

  return (
    <section aria-labelledby="matches-heading" className="w-full">
      <h2 id="matches-heading" className="sr-only">
        Próximos partidos de Boca Juniors
      </h2>

      {/* Tabs mobile */}
      <div
        role="tablist"
        aria-label="Filtrar partidos"
        className="lg:hidden grid grid-cols-3 h-11 border border-border rounded-[6px] overflow-hidden mb-5"
        data-cjx-tabs
      >
        {TABS.map((t, i) => {
          const active = t === tab;
          return (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`tab-${i}`}
              role="tab"
              aria-selected={active}
              aria-controls="matches-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(t)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={cn(
                "flex items-center justify-center text-[12px] font-semibold tracking-[0.04em] transition-colors duration-[160ms] ease-linear cursor-pointer",
                active
                  ? "text-text-primary bg-[rgba(95,168,211,0.07)] shadow-[inset_0_-2px_0_var(--color-accent-secondary)]"
                  : "text-text-muted",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Estados de datos (design.md §39) */}
      {showNoUpcoming && (
        <p className="mb-5 text-[13px] leading-relaxed text-text-muted border border-border bg-surface rounded-md px-4 py-3">
          No hay próximos partidos por el momento. La agenda se actualiza automáticamente cuando se
          confirme una nueva fecha.
        </p>
      )}
      <div
        id="matches-panel"
        ref={panelRef}
        role="tabpanel"
        aria-labelledby={`tab-${activeIdx}`}
        className="outline-none h-[64vh] overflow-y-auto lg:h-auto lg:overflow-visible"
      >
        {grouped.length === 0 && (
          <p className="text-text-secondary text-sm">No hay partidos disponibles por el momento.</p>
        )}

        {/* Timeline/Lista */}
        {grouped.length > 0 && (
          <ol className="list-none p-0 m-0">
            {grouped.map(({ match, label, active, showLabel }, i) => (
              <MatchRow
                key={match.id}
                match={match}
                label={label}
                active={active}
                showLabel={showLabel}
                isFirst={i === 0}
                isLast={i === grouped.length - 1}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function MatchRow({
  match,
  label,
  active,
  showLabel,
  isFirst,
  isLast,
}: {
  match: Match;
  label: string;
  active: boolean;
  showLabel: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const featured = active;
  const meta = match.round ? `${match.competition} · ${match.round}` : match.competition;

  return (
    <li className="grid grid-cols-1 lg:grid-cols-[120px_32px_minmax(0,1fr)] lg:gap-x-4 mb-3 lg:mb-[10px] last:mb-0 items-start">
      {/* Timeline label (desktop), alineado al centro con su nodo */}
      <div className="hidden lg:flex self-stretch items-center">
        {showLabel && (
          <span className="text-[13px] font-semibold tracking-[0.03em] uppercase text-text-secondary">
            {label}
          </span>
        )}
      </div>

      {/* Node + línea continua (desktop) */}
      <NodeCell active={featured} isFirst={isFirst} isLast={isLast} />

      {/* Card (enlaza a la página del partido) */}
      <a
        href={`${BASE}partidos/${match.slug}`}
        className="group block rounded-lg"
        aria-label={`Ver detalle: ${teamsLine(match, featured)}`}
      >
        {featured ? (
          <FeaturedCard match={match} />
        ) : (
          <article className="match-card rounded-lg border border-border bg-surface shadow-card px-3 py-[14px] lg:px-[14px] lg:py-[10px] min-h-[78px] lg:min-h-[64px] transition-all duration-[160ms] ease-linear hover:-translate-y-px hover:bg-surface-hover hover:border-accent-secondary hover:shadow-hover">
            <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] lg:grid-cols-[64px_minmax(0,1fr)_auto] gap-3 items-center">
              <StandardDateBlock match={match} />
              <div className="min-w-0">
                <p className="text-[15px] leading-[1.25] font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  {teamsLine(match, false)}
                </p>
                <p className="mt-1 text-[12px] leading-[1.45] text-text-secondary truncate">{meta}</p>
                <GlobalLine match={match} compact />
              </div>
              <div className="justify-self-end flex items-center gap-2">
                <StatusBadge status={match.status} />
                <span className="text-text-muted transition-transform duration-[160ms] ease-linear group-hover:translate-x-[2px] group-hover:text-accent-secondary">
                  <ChevronRight />
                </span>
              </div>
            </div>
          </article>
        )}
      </a>
    </li>
  );
}

function StandardDateBlock({ match }: { match: Match }) {
  const { day, month } = standardDate(match);
  return (
    <div className="flex flex-col justify-center self-stretch border-r border-border pr-3 pl-1 min-w-0">
      <span className="text-[18px] leading-[1.05] font-semibold text-text-primary">{day}</span>
      <span className="mt-[2px] text-[12px] leading-[1.45] text-text-secondary">{month}</span>
    </div>
  );
}

function FeaturedCard({ match }: { match: Match }) {
  const { day, date, time } = featuredDate(match);

  return (
    <article className="featured-match rounded-lg border-2 border-accent bg-gradient-to-br from-surface to-surface-elevated shadow-featured px-3 py-4 lg:px-[18px] lg:py-4 min-h-[132px] lg:min-h-[126px] transition-[border-color] duration-[160ms] ease-linear hover:border-accent-strong">
      <div className="grid grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[82px_minmax(0,1fr)_112px] gap-3 items-center">
        <div className="flex flex-col justify-center self-stretch border-r border-border pr-3 min-w-0">
          <span className="text-[16px] lg:text-[17px] leading-[1.35] font-semibold tracking-[0.02em] text-accent-strong uppercase">
            {day}
          </span>
          <span className="mt-1 text-[16px] lg:text-[17px] leading-[1.35] font-semibold tracking-[0.02em] text-accent-strong">
            {date}
          </span>
          {time ? (
            <span className="mt-1 text-[16px] lg:text-[17px] leading-[1.35] font-semibold tracking-[0.02em] text-accent-strong">
              {time}
            </span>
          ) : (
            <span className="mt-1 text-[12px] leading-[1.35] text-text-secondary">Horario a confirmar</span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[18px] lg:text-[20px] font-bold leading-[1.2] text-text-primary uppercase whitespace-nowrap overflow-hidden text-ellipsis">
            {teamsLine(match, true)}
          </p>
          <p className="mt-1.5 text-[12px] leading-[1.45] text-text-secondary">{match.competition}</p>
          {match.round && (
            <p className="text-[12px] leading-[1.45] text-text-secondary">{match.round}</p>
          )}
          <GlobalLine match={match} />
          <div className="mt-2.5 flex items-center gap-3">
            {match.channel && (
              <p className="flex items-center gap-1.5 text-[12px] text-text-primary">
                <span className="text-accent-secondary">
                  <TvIcon />
                </span>
                {match.channel}
              </p>
            )}
            {/* Badge PRÓXIMO en mobile (design.md §26) */}
            <span className="ml-auto flex items-center gap-2 lg:hidden">
              <StatusBadge status="next" />
              <span className="text-accent-strong transition-transform duration-[160ms] ease-linear group-hover:translate-x-[2px]">
                <ChevronRight />
              </span>
            </span>
          </div>
        </div>

        {/* Badge PRÓXIMO en desktop */}
        <div className="hidden lg:flex items-center justify-end gap-2">
          <StatusBadge status="next" />
          <span className="text-accent-strong transition-transform duration-[160ms] ease-linear group-hover:translate-x-[2px]">
            <ChevronRight />
          </span>
        </div>
      </div>
    </article>
  );
}
