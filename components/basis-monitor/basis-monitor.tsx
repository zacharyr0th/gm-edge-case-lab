"use client";

import { ArrowUpRight, ChevronDown, CircleHelp, Clock3, Search, X } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { labChecks } from "@/lib/edge-case-lab-data";
import { type BasisData, type BasisRow } from "@/lib/basis-data";
import { type GmSessionState, gmSessionAt } from "@/lib/sessions";
import { SessionClocks } from "@/components/basis-monitor/session-clocks";
import { AppFooter } from "@/components/ui/app-footer";
import { AppHeader } from "@/components/ui/app-header";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DEFAULT_ROW_CAP = 60;
/** A quote this far behind the freshest one is worth naming on its own row. */
const STALE_QUOTE_SECONDS = 3600;

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const utcTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatUtc(seconds: number | null): string {
  return seconds === null ? "—" : `${utcTime.format(new Date(seconds * 1000))} UTC`;
}

type Withheld = Exclude<BasisRow["basisStatus"], "comparable">;

const withheldLabel: Record<Withheld, string> = {
  "market-open": "Session open",
  "pre-close": "Stale print",
  "multiplier-required": "Multiplier required",
  "no-data": "No close",
};

const withheldReason: Record<Withheld, string> = {
  "market-open":
    "The U.S. regular session is open, so the underlying is moving against a close that is no longer current.",
  "pre-close":
    "The latest public token quote predates the completed close it would be measured against. Differencing them would report a price move as a dislocation.",
  "multiplier-required":
    "Token and share units differ by a factor that only Ondo's authenticated shares multiplier can resolve.",
  "no-data": "No completed underlying close was available for this ticker.",
};

/**
 * Every reason a row is withheld is a condition the lab documents. The monitor
 * is the live instance; the lab is the explanation. Link them.
 */
const withheldConditionId: Record<Withheld, string | null> = {
  "market-open": "weekend-offhours",
  "pre-close": "display-vs-executable",
  "multiplier-required": "dividend-multiplier",
  "no-data": null,
};

function conditionFor(status: Withheld): { id: string; title: string } | null {
  const id = withheldConditionId[status];
  const match = id === null ? undefined : labChecks.find((check) => check.id === id);
  return match ? { id: match.id, title: match.title } : null;
}

function dislocationOf(row: BasisRow) {
  // A premium is only meaningful when both legs describe the same moment and
  // the same unit. Every other status is reported as a status, never a number.
  if (row.basisStatus !== "comparable") return null;
  if (row.tokenPrice === null || row.underlyingClose === null || row.underlyingClose === 0) return null;
  const percent = (row.tokenPrice / row.underlyingClose - 1) * 100;
  return { percent, label: percent >= 0 ? "Premium" : "Discount", premium: percent >= 0 };
}

function WithheldChip({ status }: { status: Withheld }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-muted-foreground gap-1 px-1.5 py-0 text-[10px] font-medium">
          <span className="border-muted-foreground size-1 rounded-full border" />
          {withheldLabel[status]}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">{withheldReason[status]}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The gap is the number the page exists to report, so it gets its own column
 * and a diverging bar. Scale is shared across rows, which makes relative size
 * readable without reading digits.
 */
function GapCell({ row, maxAbs }: { row: BasisRow; maxAbs: number }) {
  const dislocation = dislocationOf(row);
  if (!dislocation) return <WithheldChip status={row.basisStatus as Withheld} />;
  const fraction = maxAbs > 0 ? Math.min(1, Math.abs(dislocation.percent) / maxAbs) : 0;
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "w-12 shrink-0 text-right font-mono text-[12px] font-semibold tabular-nums",
          dislocation.premium ? "text-premium" : "text-discount",
        )}
      >
        {dislocation.percent >= 0 ? "+" : ""}
        {dislocation.percent.toFixed(1)}%
      </span>
      <span className="bg-muted relative hidden h-1.5 w-24 shrink-0 rounded-full sm:block" aria-hidden>
        <span className="bg-border absolute inset-y-0 left-1/2 w-px" />
        <span
          className={cn("absolute inset-y-0 rounded-full", dislocation.premium ? "bg-premium" : "bg-discount")}
          style={
            dislocation.premium
              ? { left: "50%", width: `${fraction * 50}%` }
              : { right: "50%", width: `${fraction * 50}%` }
          }
        />
      </span>
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
  asset,
  onSelect,
}: {
  label: string;
  value: string;
  hint?: string;
  /** When a card points at one asset, identify it the way every other row does. */
  asset?: BasisRow;
  onSelect?: () => void;
}) {
  const body = (
    <>
      <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">{label}</p>
      <p className="mt-1 font-mono text-lg leading-tight font-semibold tabular-nums">{value}</p>
      {asset ? (
        <span className="text-muted-foreground mt-1 flex items-center gap-1.5 font-mono text-[10px]">
          <CompanyLogo
            ticker={asset.ticker}
            name={asset.name}
            className="size-4 rounded-[3px] p-0 text-[6px]"
          />
          {asset.symbol}
        </span>
      ) : hint ? (
        <p className="text-muted-foreground mt-0.5 text-[10px]">{hint}</p>
      ) : null}
    </>
  );
  return (
    <Card className="gap-0 rounded-lg py-0 shadow-none">
      <CardContent className="p-0">
        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            className="hover:bg-muted/50 focus-visible:ring-ring w-full rounded-lg px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {body}
          </button>
        ) : (
          <div className="px-4 py-3">{body}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ComparisonPanel({ row, onClose }: { row: BasisRow; onClose: () => void }) {
  const dislocation = dislocationOf(row);
  return (
    <Card className="gap-0 rounded-lg py-0 shadow-none lg:sticky lg:top-24">
      <div className="flex flex-row items-start justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo ticker={row.ticker} name={row.name} className="size-9" />
          <div className="min-w-0">
            <h2 className="truncate font-mono text-lg leading-tight font-semibold">{row.symbol}</h2>
            <p className="text-muted-foreground truncate text-xs">{row.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close comparison details">
          <X />
        </Button>
      </div>
      <Separator />
      <CardContent className="grid grid-cols-2 gap-4 px-5 py-4">
        <div>
          <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Token price / token</p>
          <p className="mt-1 font-mono text-base font-semibold tabular-nums">
            {row.tokenPrice === null ? "—" : usd.format(row.tokenPrice)}
          </p>
          <p className="text-muted-foreground text-[10px]">quote {formatUtc(row.tokenUpdatedAt)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Underlying close / share</p>
          <p className="mt-1 font-mono text-base font-semibold tabular-nums">
            {row.underlyingClose === null ? "—" : usd.format(row.underlyingClose)}
          </p>
          <p className="text-muted-foreground text-[10px]">close {formatUtc(row.underlyingCloseTime)}</p>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="px-5 py-4">
        <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Versus latest U.S. close</p>
        {dislocation ? (
          <>
            <p
              className={cn(
                "mt-1 font-mono text-2xl font-semibold tabular-nums",
                dislocation.premium ? "text-premium" : "text-discount",
              )}
            >
              {dislocation.label} {dislocation.percent >= 0 ? "+" : ""}
              {dislocation.percent.toFixed(1)}%
            </p>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              {`The latest token quote is ${Math.abs(dislocation.percent).toFixed(1)}% ${
                dislocation.premium ? "above" : "below"
              } the underlying asset’s latest completed U.S. session close.`}
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-2xl font-semibold">Not comparable</p>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              {withheldReason[row.basisStatus as Withheld]}
            </p>
            {(() => {
              const condition = conditionFor(row.basisStatus as Withheld);
              return condition ? (
                <Link
                  href={`/#${condition.id}`}
                  className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1 text-[11px] underline underline-offset-2"
                >
                  {condition.title} <ArrowUpRight className="size-3" />
                </Link>
              ) : null;
            })()}
          </>
        )}
      </CardContent>
      <Separator />
      <CardContent className="px-5 py-4">
        <p className="text-muted-foreground text-[10px] tracking-wide uppercase">How to read this</p>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          Token price is the latest public GM token quote. Underlying close is the latest completed U.S. session
          close for the referenced stock or ETF. The monitor shows the two source values without inventing a
          conversion.
        </p>
        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
          Both figures are <strong className="text-foreground font-medium">display prices</strong>, not executable
          quotes. An integration that treats a number on this page as tradable has made the mistake the lab
          documents.
        </p>
        <Link
          href="/lab#display-vs-executable"
          className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1 text-[11px] underline underline-offset-2"
        >
          Display price is not the executable price <ArrowUpRight className="size-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

type Framing = { column: string; median: string; up: string; down: string; blurb: string };

/**
 * Outside the regular session the token keeps trading while the close stands
 * still, so the difference is a move, not a mispricing. Only when both sides are
 * shut does the word "premium" mean anything.
 */
function framingFor(session: GmSessionState | null): Framing {
  if (session === null || session.underlyingLive) {
    return {
      column: "Gap vs close",
      median: "Median gap",
      up: "Widest premium",
      down: "Widest discount",
      blurb: "Public GM token quotes shown with the latest completed U.S. close.",
    };
  }
  if (session.trading) {
    return {
      column: "Move since close",
      median: "Median move",
      up: "Biggest gain",
      down: "Biggest drop",
      blurb:
        "GM is trading and U.S. equities are shut, so these are moves since the close — not premiums. Rows tagged 24/7 track an underlying that never stopped, so their move is the asset repricing.",
    };
  }
  return {
    column: "Premium vs close",
    median: "Median premium",
    up: "Widest premium",
    down: "Widest discount",
    blurb: "Nothing is trading on either side, so the difference is the standing premium or discount.",
  };
}

export function BasisMonitor({ data }: { data: BasisData }) {
  // Units that only Ondo's authenticated multiplier can reconcile are dropped
  // outright; everything else stays on the page with its status shown.
  const rows = useMemo(() => data.rows.filter((row) => !row.multiplierRequired), [data.rows]);
  const priced = useMemo(() => rows.filter((row) => row.basisStatus === "comparable"), [rows]);

  const withheldBreakdown = useMemo(() => {
    const counts = new Map<Withheld, number>();
    for (const row of data.rows) {
      if (row.basisStatus === "comparable") continue;
      counts.set(row.basisStatus, (counts.get(row.basisStatus) ?? 0) + 1);
    }
    return (Object.keys(withheldLabel) as Withheld[])
      .map((status) => ({ status, count: counts.get(status) ?? 0 }))
      .filter((entry) => entry.count > 0);
  }, [data.rows]);

  // One clock drives both the session strip and the wording of the gap column.
  // It starts null so the server render and the first client render agree.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const session = useMemo(() => (now === null ? null : gmSessionAt(now)), [now]);
  const framing = useMemo(() => framingFor(session), [session]);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "priced" | "withheld">("all");
  const [showAll, setShowAll] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const visibleRows = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (scope === "priced" && row.basisStatus !== "comparable") return false;
      if (scope === "withheld" && row.basisStatus === "comparable") return false;
      if (!needle) return true;
      return row.symbol.toLowerCase().includes(needle) || row.name.toLowerCase().includes(needle);
    });
  }, [rows, scope, deferredQuery]);

  // Rows are already ordered by how far the token sits from its close, so the
  // head of the list is the whole point. Rendering all of them by default costs
  // one third-party logo request per row and buries the signal; the rest stay a
  // click or a search away.
  const capped = showAll ? visibleRows : visibleRows.slice(0, DEFAULT_ROW_CAP);
  const hiddenCount = visibleRows.length - capped.length;

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(rows[0]?.symbol ?? null);
  const selected = rows.find((row) => row.symbol === selectedSymbol) ?? null;

  const stats = useMemo(() => {
    const scored = priced
      .map((row) => ({ row, percent: dislocationOf(row)?.percent }))
      .filter((entry): entry is { row: BasisRow; percent: number } => typeof entry.percent === "number")
      .sort((a, b) => a.percent - b.percent);
    if (scored.length === 0) return null;
    const absSorted = scored.map((entry) => Math.abs(entry.percent)).sort((a, b) => a - b);
    return {
      median: absSorted[Math.floor(absSorted.length / 2)],
      maxAbs: absSorted[absSorted.length - 1],
      widestPremium: scored[scored.length - 1],
      widestDiscount: scored[0],
    };
  }, [priced]);

  const freshestQuote = useMemo(() => {
    const stamps = data.rows.map((row) => row.tokenUpdatedAt).filter((v): v is number => v !== null);
    return stamps.length === 0 ? null : Math.max(...stamps);
  }, [data.rows]);

  /** Reveal a row's own quote time only when it lags the freshest one. */
  function laggingQuote(row: BasisRow) {
    if (row.tokenUpdatedAt === null || freshestQuote === null) return false;
    return freshestQuote - row.tokenUpdatedAt > STALE_QUOTE_SECONDS;
  }

  function reveal(symbol: string) {
    setSelectedSymbol(symbol);
    if (!capped.some((row) => row.symbol === symbol)) {
      setQuery("");
      setScope("all");
      setShowAll(true);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader active="basis" />
      <main className="mx-auto w-full max-w-[1384px] flex-1 px-5 py-6 sm:px-6">
        <SessionClocks now={now} session={session} />

        <section
          className="bg-muted/50 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3"
          aria-label="Market status"
        >
          <Clock3 className="text-muted-foreground size-4" />
          <strong className="text-sm">
            {data.marketOpen ? "U.S. market open" : session ? `${session.label} session` : "Latest completed U.S. close"}
          </strong>
          <span className="text-muted-foreground text-xs">
            {data.marketOpen ? "No row is priced while the regular session is open." : framing.blurb}
          </span>
          <span className="text-muted-foreground ml-auto text-xs">
            Freshest quote {formatUtc(freshestQuote)}
          </span>
        </section>

        {stats ? (
          <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Summary">
            <Stat label="Priced" value={String(priced.length)} hint={`of ${rows.length} listed`} />
            <Stat label={framing.median} value={`${stats.median.toFixed(2)}%`} hint="absolute, priced rows only" />
            <Stat
              label={framing.up}
              value={`+${stats.widestPremium.percent.toFixed(1)}%`}
              asset={stats.widestPremium.row}
              onSelect={() => reveal(stats.widestPremium.row.symbol)}
            />
            <Stat
              label={framing.down}
              value={`${stats.widestDiscount.percent.toFixed(1)}%`}
              asset={stats.widestDiscount.row}
              onSelect={() => reveal(stats.widestDiscount.row.symbol)}
            />
          </section>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by ticker or company"
                  aria-label="Filter by ticker or company"
                  className="pl-9"
                />
              </div>
              <ToggleGroup
                type="single"
                value={scope}
                onValueChange={(value) => value && setScope(value as typeof scope)}
                variant="outline"
                size="sm"
                className="max-sm:w-full max-sm:*:flex-1"
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="priced">Priced</ToggleGroupItem>
                <ToggleGroupItem value="withheld">Withheld</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {scope === "withheld" && withheldBreakdown.length > 0 ? (
              <div className="mt-3 rounded-lg border p-3">
                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  Why these rows carry no number
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {withheldBreakdown.map(({ status, count }) => {
                    const condition = conditionFor(status);
                    return (
                      <li key={status} className="flex items-baseline gap-2 text-xs">
                        <strong className="text-foreground tabular-nums">{count}</strong>
                        <span className="text-muted-foreground">{withheldLabel[status]}</span>
                        {condition ? (
                          <Link
                            href={`/#${condition.id}`}
                            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
                          >
                            {condition.title} <ArrowUpRight className="size-3" />
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-muted-foreground mt-2.5 text-[11px] leading-relaxed">
                  Multiplier-required rows are dropped from the table entirely, because resolving them needs Ondo&rsquo;s
                  authenticated shares multiplier. Each count above is a condition from the lab, happening right now.
                </p>
              </div>
            ) : null}

            <p className="text-muted-foreground mt-3 text-xs" role="status">
              {capped.length === visibleRows.length
                ? `${visibleRows.length} shown`
                : `${capped.length} of ${visibleRows.length} shown`}{" "}
              · {priced.length} directly comparable · {rows.length - priced.length} listed without a basis
              {data.rows.length > rows.length
                ? ` · ${data.rows.length - rows.length} dropped pending the shares multiplier`
                : ""}{" "}
              ·
              CoinGecko {data.coingeckoOk ? "available" : "unavailable"} · Yahoo Finance{" "}
              {data.yahooOk ? "available" : "unavailable"}
            </p>

            <div className="mt-2 overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[200px]">Asset</TableHead>
                    <TableHead className="min-w-[110px]">Token price</TableHead>
                    <TableHead className="min-w-[110px]">Underlying close</TableHead>
                    <TableHead className="min-w-[170px]">{framing.column}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capped.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="text-muted-foreground py-10 text-center text-xs">
                        {!data.coingeckoOk
                          ? "CoinGecko did not return the Ondo tokenized-asset list, so there are no token quotes to compare. Nothing is being withheld — the upstream is unavailable."
                          : !data.yahooOk
                            ? "Token quotes loaded, but Yahoo Finance returned no completed closes to compare them against."
                            : "No asset matches this filter."}
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {capped.map((row) => (
                    <TableRow
                      key={row.symbol}
                      tabIndex={0}
                      aria-selected={row.symbol === selectedSymbol}
                      data-state={row.symbol === selectedSymbol ? "selected" : undefined}
                      onClick={() => setSelectedSymbol(row.symbol)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedSymbol(row.symbol);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <span className="flex items-center gap-2.5">
                          <CompanyLogo ticker={row.ticker} name={row.name} />
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5">
                              <span className="font-mono text-[13px] font-semibold">{row.symbol}</span>
                              {row.continuousUnderlying ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal">
                                      24/7
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-72">
                                    The underlying trades around the clock, so this move happened while U.S.
                                    equities were shut. It is the asset repricing, not a GM premium.
                                  </TooltipContent>
                                </Tooltip>
                              ) : null}
                            </span>
                            <span className="text-muted-foreground block truncate text-[11px]">{row.name}</span>
                            {laggingQuote(row) ? (
                              <span className="text-muted-foreground block font-mono text-[10px]">
                                quote {formatUtc(row.tokenUpdatedAt)}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[13px] tabular-nums">
                        {row.tokenPrice === null ? "—" : usd.format(row.tokenPrice)}
                      </TableCell>
                      <TableCell className="font-mono text-[13px] tabular-nums">
                        {row.underlyingClose === null ? "—" : usd.format(row.underlyingClose)}
                      </TableCell>
                      <TableCell>
                        <GapCell row={row} maxAbs={stats?.maxAbs ?? 0} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {hiddenCount > 0 ? (
                <div className="flex items-center justify-center border-t p-3">
                  <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
                    Show {hiddenCount} more
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {selected ? (
            <div className="min-w-0">
              <ComparisonPanel row={selected} onClose={() => setSelectedSymbol(null)} />
            </div>
          ) : null}
        </div>

        <Collapsible className="mt-6 rounded-lg border">
          <CollapsibleTrigger className="text-muted-foreground flex w-full items-center gap-2 px-4 py-3 text-xs [&[data-state=open]>svg:last-child]:rotate-180">
            <CircleHelp className="size-4" />
            Methodology
            <ChevronDown className="ml-auto size-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-muted-foreground px-4 pb-4 text-xs leading-relaxed">
            Token prices come from CoinGecko and underlying closes from Yahoo Finance. Every row shares the same
            completed close, shown once above; a row prints its own quote time only when that quote lags the
            freshest one. Premium or discount is the raw percentage difference between the two, and the bar scales
            each row against the widest gap on the page. A row is priced only when both legs are comparable. Rows
            needing an authenticated shares multiplier are dropped, because their per-token and per-share values
            are on different scales. Rows whose token quote predates the completed close are listed but left
            unpriced, because the difference would be the underlying&rsquo;s own move rather than a dislocation.
            While the U.S. regular session is open no row is priced at all. Every figure here is a display price,
            not an executable quote. Company marks identify the underlying issuer and imply no affiliation.
            Informational only — not pricing or investment advice.
          </CollapsibleContent>
        </Collapsible>
      </main>
      <AppFooter page="basis" />
    </div>
  );
}
