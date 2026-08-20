"use client";

import { Circle } from "lucide-react";
import { type ExchangeState, type GmSessionState, exchangeStatesAt, formatCountdown } from "@/lib/sessions";
import { cn } from "@/lib/utils";

/**
 * The clocks are the explanation for the number in the gap column. GM keeps
 * trading after the U.S. close, and while it does, Tokyo, Hong Kong, London and
 * Frankfurt take their turns. A token that moved overnight usually moved because
 * one of these was open, not because it is mispriced against the close.
 */
export function SessionClocks({ now, session }: { now: Date | null; session: GmSessionState | null }) {
  const exchanges: ExchangeState[] = now ? exchangeStatesAt(now) : [];

  return (
    <section className="rounded-lg border" aria-label="Trading sessions">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">Ondo GM</span>
        {session ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Circle
                className={cn(
                  "size-2",
                  session.trading ? "fill-premium text-premium" : "fill-muted-foreground text-muted-foreground",
                )}
              />
              <strong className="text-sm">{session.label}</strong>
            </span>
            <span className="text-muted-foreground text-xs">
              {session.nextLabel} in {formatCountdown(session.minutesToNext)}
            </span>
            <span className="text-muted-foreground w-full text-xs leading-relaxed sm:w-auto sm:flex-1 sm:text-right">
              {session.note}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">Reading the clock…</span>
        )}
      </div>

      <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        {(now ? exchanges : PLACEHOLDERS).map((exchange) => (
          <div key={exchange.id} className="min-w-0 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Circle
                className={cn(
                  "size-1.5 shrink-0",
                  exchange.open ? "fill-premium text-premium" : "fill-muted-foreground/40 text-muted-foreground/40",
                )}
              />
              <span className="truncate text-[13px] font-medium">{exchange.city}</span>
              <span className="text-muted-foreground ml-auto font-mono text-[11px] tabular-nums">
                {now ? exchange.localTime : "--:--"}
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 pl-3 text-[10px]">
              {now
                ? `${exchange.open ? "closes" : "opens"} in ${formatCountdown(exchange.minutesToNext)}`
                : " "}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Keeps the row height stable between the server render and the first client tick. */
const PLACEHOLDERS: ExchangeState[] = [
  { id: "tokyo", city: "Tokyo", region: "Asia", zone: "", localTime: "--:--", open: false, minutesToNext: 0 },
  { id: "hongkong", city: "Hong Kong", region: "Asia", zone: "", localTime: "--:--", open: false, minutesToNext: 0 },
  { id: "london", city: "London", region: "Europe", zone: "", localTime: "--:--", open: false, minutesToNext: 0 },
  { id: "frankfurt", city: "Frankfurt", region: "Europe", zone: "", localTime: "--:--", open: false, minutesToNext: 0 },
  { id: "newyork", city: "New York", region: "Americas", zone: "", localTime: "--:--", open: false, minutesToNext: 0 },
];
