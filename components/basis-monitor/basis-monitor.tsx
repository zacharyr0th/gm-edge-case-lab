"use client";

import { ChevronDown, CircleHelp, Clock3, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { type BasisData, type BasisRow } from "@/lib/basis-data";
import { AppFooter } from "@/components/ui/app-footer";
import { AppHeader } from "@/components/ui/app-header";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DEFAULT_ROW_CAP = 60;

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const utcTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const utcDay = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatUtc(seconds: number | null): string {
  return seconds === null ? "—" : `${utcTime.format(new Date(seconds * 1000))} UTC`;
}

function formatDay(seconds: number | null): string | null {
  return seconds === null ? null : utcDay.format(new Date(seconds * 1000));
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

function dislocationOf(row: BasisRow) {
  // A premium is only meaningful when both legs describe the same moment and
  // the same unit. Every other status is reported as a status, never a number.
  if (row.basisStatus !== "comparable") return null;
  if (row.tokenPrice === null || row.underlyingClose === null || row.underlyingClose === 0) return null;
  const percent = (row.tokenPrice / row.underlyingClose - 1) * 100;
  return { percent, label: percent >= 0 ? "Premium" : "Discount", premium: percent >= 0 };
}

function StatusChip({ row }: { row: BasisRow }) {
  const dislocation = dislocationOf(row);
  if (dislocation) {
    return (
      <Badge
        variant="outline"
        className={
          dislocation.premium
            ? "border-premium/40 text-premium gap-1 px-1.5 py-0 text-[9px] font-semibold"
            : "border-discount/40 text-discount gap-1 px-1.5 py-0 text-[9px] font-semibold"
        }
      >
        <span className={`size-1 rounded-full ${dislocation.premium ? "bg-premium" : "bg-discount"}`} />
        {dislocation.label} {dislocation.percent >= 0 ? "+" : ""}
        {dislocation.percent.toFixed(1)}%
      </Badge>
    );
  }
  const status = row.basisStatus as Withheld;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="text-muted-foreground gap-1 px-1.5 py-0 text-[9px] font-semibold"
        >
          <span className="border-muted-foreground size-1 rounded-full border" />
          {withheldLabel[status]}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">{withheldReason[status]}</TooltipContent>
    </Tooltip>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="gap-0 rounded-lg py-3 shadow-none">
      <CardHeader className="px-4 pb-1">
        <CardTitle className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <p className="font-mono text-lg leading-tight font-semibold tabular-nums">{value}</p>
        {hint ? <p className="text-muted-foreground mt-0.5 text-[10px]">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function ComparisonPanel({ row, onClose }: { row: BasisRow; onClose: () => void }) {
  const dislocation = dislocationOf(row);
  return (
    <Card className="gap-0 rounded-lg py-0 shadow-none lg:sticky lg:top-24">
      <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 py-4">
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
      </CardHeader>
      <Separator />
      <CardContent className="grid grid-cols-2 gap-4 px-5 py-4">
        <div>
          <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Token price / token</p>
          <p className="mt-1 font-mono text-base font-semibold tabular-nums">
            {row.tokenPrice === null ? "—" : usd.format(row.tokenPrice)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Underlying close / share</p>
          <p className="mt-1 font-mono text-base font-semibold tabular-nums">
            {row.underlyingClose === null ? "—" : usd.format(row.underlyingClose)}
          </p>
          <p className="text-muted-foreground text-[10px]">{formatDay(row.underlyingCloseTime)}</p>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="px-5 py-4">
        <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Versus latest U.S. close</p>
        {dislocation ? (
          <>
            <p
              className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
                dislocation.premium ? "text-premium" : "text-discount"
              }`}
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
        <p className="text-muted-foreground mt-3 text-[10px]">Token quote {formatUtc(row.tokenUpdatedAt)}</p>
      </CardContent>
    </Card>
  );
}

export function BasisMonitor({ data }: { data: BasisData }) {
  // Units that only Ondo's authenticated multiplier can reconcile are dropped
  // outright; everything else stays on the page with its status shown.
  const rows = useMemo(() => data.rows.filter((row) => !row.multiplierRequired), [data.rows]);
  const priced = useMemo(() => rows.filter((row) => row.basisStatus === "comparable"), [rows]);

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

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(priced[0]?.symbol ?? null);
  const selected = rows.find((row) => row.symbol === selectedSymbol) ?? null;

  const stats = useMemo(() => {
    const spreads = priced
      .map((row) => dislocationOf(row)?.percent)
      .filter((v): v is number => typeof v === "number");
    if (spreads.length === 0) return null;
    const sorted = [...spreads].sort((a, b) => a - b);
    const absSorted = spreads.map(Math.abs).sort((a, b) => a - b);
    const median = absSorted[Math.floor(absSorted.length / 2)];
    return { widestPremium: sorted[sorted.length - 1], widestDiscount: sorted[0], median };
  }, [priced]);

  const freshestQuote = useMemo(() => {
    const stamps = data.rows.map((row) => row.tokenUpdatedAt).filter((v): v is number => v !== null);
    return stamps.length === 0 ? null : Math.max(...stamps);
  }, [data.rows]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader active="basis" />
      <main className="mx-auto w-full max-w-[1384px] flex-1 px-5 py-6 sm:px-6">
        <section
          className="bg-muted/50 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3"
          aria-label="Market status"
        >
          <Clock3 className="text-muted-foreground size-4" />
          <strong className="text-sm">
            {data.marketOpen ? "U.S. market open" : "Latest completed U.S. close"}
          </strong>
          <span className="text-muted-foreground text-xs">
            {data.marketOpen
              ? "No row is priced while the regular session is open."
              : "Public GM token quotes shown with the latest completed U.S. close."}
          </span>
          <span className="text-muted-foreground ml-auto text-xs">
            Freshest quote {formatUtc(freshestQuote)}
          </span>
        </section>

        {stats ? (
          <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Summary">
            <Stat label="Priced" value={String(priced.length)} hint={`of ${rows.length} listed`} />
            <Stat
              label="Median gap"
              value={`${stats.median.toFixed(2)}%`}
              hint="absolute, priced rows only"
            />
            <Stat
              label="Widest premium"
              value={`+${stats.widestPremium.toFixed(1)}%`}
              hint="token above close"
            />
            <Stat
              label="Widest discount"
              value={`${stats.widestDiscount.toFixed(1)}%`}
              hint="token below close"
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

            <p className="text-muted-foreground mt-3 text-xs" role="status">
              {capped.length === visibleRows.length
                ? `${visibleRows.length} shown`
                : `${capped.length} of ${visibleRows.length} shown`}{" "}
              · {priced.length} directly comparable ·{" "}
              {rows.length - priced.length} listed without a basis · CoinGecko{" "}
              {data.coingeckoOk ? "available" : "unavailable"} · Yahoo Finance{" "}
              {data.yahooOk ? "available" : "unavailable"}
            </p>

            <div className="mt-2 overflow-hidden rounded-lg border">
              <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="min-w-[220px]">Asset</TableHead>
                      <TableHead className="min-w-[150px]">Token price / token</TableHead>
                      <TableHead className="min-w-[160px]">Underlying close / share</TableHead>
                      <TableHead className="min-w-[150px]">Token quote</TableHead>
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
                              <span className="block font-mono text-[13px] font-semibold">{row.symbol}</span>
                              <span className="text-muted-foreground block truncate text-[11px]">
                                {row.name}
                              </span>
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block font-mono text-[13px] tabular-nums">
                            {row.tokenPrice === null ? "—" : usd.format(row.tokenPrice)}
                          </span>
                          <span className="mt-1 block">
                            <StatusChip row={row} />
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block font-mono text-[13px] tabular-nums">
                            {row.underlyingClose === null ? "—" : usd.format(row.underlyingClose)}
                          </span>
                          <span className="text-muted-foreground block text-[11px]">
                            {formatDay(row.underlyingCloseTime)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-[11px]">
                          {formatUtc(row.tokenUpdatedAt)}
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
            Token prices come from CoinGecko and underlying closes from Yahoo Finance. Premium or discount is the
            raw percentage difference between the latest token quote and the underlying asset&rsquo;s latest
            completed U.S. session close. A row is priced only when both legs are comparable. Rows needing an
            authenticated shares multiplier are dropped, because their per-token and per-share values are on
            different scales. Rows whose token quote predates the completed close are listed but left unpriced,
            because the difference would be the underlying&rsquo;s own move rather than a dislocation. While the
            U.S. regular session is open no row is priced at all. Company marks identify the underlying issuer and
            imply no affiliation. Informational only — not pricing or investment advice.
          </CollapsibleContent>
        </Collapsible>
      </main>
      <AppFooter page="basis" />
    </div>
  );
}
