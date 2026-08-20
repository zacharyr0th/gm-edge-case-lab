export type BasisRow = {
  symbol: string;
  name: string;
  ticker: string;
  tokenPrice: number | null;
  tokenUpdatedAt: number | null;
  underlyingClose: number | null;
  underlyingCloseTime: number | null;
  basisBps: number | null;
  multiplierRequired: boolean;
  /** Underlying trades around the clock, so a move since the close is expected. */
  continuousUnderlying: boolean;
  inferredMultiplier: number | null;
  basisStatus: "comparable" | "market-open" | "pre-close" | "multiplier-required" | "no-data";
};

/**
 * Wrappers whose underlying keeps trading when U.S. equities are shut: spot
 * crypto funds and companies whose value is mostly a crypto balance sheet. Their
 * move since the close is the underlying's own move, so it is not evidence of a
 * GM premium. Hand-maintained — there is no public field that marks this.
 */
const CONTINUOUS_UNDERLYINGS = new Set([
  "IBIT", "FBTC", "GBTC", "BITB", "ARKB", "BTCO",
  "ETHA", "ETHE", "FSOL", "BSOL",
  "MSTR", "BMNR", "SBET",
  "STRC", "STRK", "STRF", "STRD",
]);

export type BasisData = {
  rows: BasisRow[];
  coingeckoOk: boolean;
  yahooOk: boolean;
  marketOpen: boolean;
};

const SPLIT_MULTIPLIERS = [0.05, 1 / 15, 0.1, 0.2, 0.25, 0.5, 2, 3, 4, 5, 10, 15, 20];

function inferSplitMultiplier(tokenPrice: number | null, underlyingClose: number | null): number | null {
  if (tokenPrice === null || underlyingClose === null || underlyingClose <= 0) return null;
  const ratio = tokenPrice / underlyingClose;
  const candidate = SPLIT_MULTIPLIERS.reduce((closest, value) =>
    Math.abs(value - ratio) < Math.abs(closest - ratio) ? value : closest,
  );
  return Math.abs(ratio - candidate) / candidate <= 0.08 ? candidate : null;
}

type MarketItem = {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  last_updated: string | null;
};

async function fetchMarketsPage(page: number): Promise<MarketItem[] | null> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=ondo-tokenized-assets&per_page=250&page=${page}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as MarketItem[];
  } catch {
    return null;
  }
}

async function fetchOndoMarkets(): Promise<MarketItem[] | null> {
  const first = await fetchMarketsPage(1);
  if (first === null) return null;
  if (first.length < 250) return first;
  const second = await fetchMarketsPage(2);
  return second === null ? first : [...first, ...second];
}

type SparkSeries = { close?: (number | null)[]; timestamp?: number[] };
type SparkClose = { close: number; time: number };
type MarketSession = { start: number; end: number; isOpen: boolean };

async function fetchSparkChunk(
  tickers: string[],
  currentSession: MarketSession | null,
): Promise<Record<string, SparkClose>> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${tickers.join(",")}&range=5d&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0 (basis-monitor)" }, next: { revalidate: 300 } },
    );
    if (!res.ok) return {};
    const json = (await res.json()) as Record<string, SparkSeries>;
    const out: Record<string, SparkClose> = {};
    for (const [ticker, series] of Object.entries(json)) {
      const closes = series?.close ?? [];
      for (let i = closes.length - 1; i >= 0; i--) {
        const value = closes[i];
        const sessionOpen = series.timestamp?.[i];
        if (typeof value === "number" && typeof sessionOpen === "number") {
          const sessionClose = sessionOpen + 23400;
          const isCurrentIncompleteSession =
            currentSession !== null && sessionOpen === currentSession.start && Date.now() / 1000 < currentSession.end;
          if (isCurrentIncompleteSession) continue;
          out[ticker] = {
            close: value,
            time: currentSession !== null && sessionOpen === currentSession.start ? currentSession.end : sessionClose,
          };
          break;
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function fetchCurrentSession(): Promise<MarketSession | null> {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=1d&interval=1d", {
      headers: { "User-Agent": "Mozilla/5.0 (basis-monitor)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: { result?: { meta?: { currentTradingPeriod?: { regular?: { start?: number; end?: number } } } }[] };
    };
    const regular = json.chart?.result?.[0]?.meta?.currentTradingPeriod?.regular;
    if (typeof regular?.start !== "number" || typeof regular.end !== "number") return null;
    const now = Date.now() / 1000;
    return { start: regular.start, end: regular.end, isOpen: now >= regular.start && now < regular.end };
  } catch {
    return null;
  }
}

async function fetchSparkCloses(
  tickers: string[],
  currentSession: MarketSession | null,
): Promise<Record<string, SparkClose>> {
  const chunks: string[][] = [];
  for (let i = 0; i < tickers.length; i += 20) chunks.push(tickers.slice(i, i + 20));
  const out: Record<string, SparkClose> = {};
  for (let i = 0; i < chunks.length; i += 8) {
    const batch = chunks.slice(i, i + 8);
    const results = await Promise.all(batch.map((chunk) => fetchSparkChunk(chunk, currentSession)));
    Object.assign(out, ...results);
  }
  return out;
}

export async function loadBasisData(): Promise<BasisData> {
  const markets = await fetchOndoMarkets();
  if (markets === null) return { rows: [], coingeckoOk: false, yahooOk: false, marketOpen: false };

  const items = markets
    .filter((item) => (item.symbol ?? "").toUpperCase().endsWith("ON"))
    .map((item) => ({
      ticker: item.symbol.toUpperCase().slice(0, -2),
      name: item.name.replace(/\s*\(Ondo Tokenized[^)]*\)\s*$/, ""),
      tokenPrice: typeof item.current_price === "number" ? item.current_price : null,
      tokenUpdatedAt: item.last_updated ? Math.floor(Date.parse(item.last_updated) / 1000) : null,
    }));

  const currentSession = await fetchCurrentSession();
  const closes = await fetchSparkCloses(items.map((item) => item.ticker), currentSession);

  const rows: BasisRow[] = items.map((item) => {
    const close = closes[item.ticker] ?? null;
    const underlyingClose = close?.close ?? null;
    // Daily Spark timestamps mark the session open. fetchSparkChunk converts
    // them to the close and omits today's bar until the regular session ends.
    const closeMoment = close?.time ?? null;
    const basisBps =
      item.tokenPrice !== null && underlyingClose !== null && underlyingClose > 0
        ? ((item.tokenPrice - underlyingClose) / underlyingClose) * 10000
        : null;
    const stalePrint =
      basisBps !== null &&
      item.tokenUpdatedAt !== null &&
      closeMoment !== null &&
      item.tokenUpdatedAt < closeMoment;
    // Public prices do not include Ondo's authenticated shares multiplier. Only
    // classify obvious split-like unit ratios; a normal 5–20% move is not proof.
    const inferredMultiplier = inferSplitMultiplier(item.tokenPrice, underlyingClose);
    const multiplierRequired = inferredMultiplier !== null;
    const basisStatus =
      basisBps === null
        ? "no-data"
        : currentSession?.isOpen
          ? "market-open"
          : stalePrint
            ? "pre-close"
            : multiplierRequired
              ? "multiplier-required"
              : "comparable";
    return {
      symbol: `${item.ticker}on`,
      name: item.name,
      ticker: item.ticker,
      tokenPrice: item.tokenPrice,
      tokenUpdatedAt: item.tokenUpdatedAt,
      underlyingClose,
      underlyingCloseTime: closeMoment,
      basisBps,
      multiplierRequired,
      continuousUnderlying: CONTINUOUS_UNDERLYINGS.has(item.ticker),
      inferredMultiplier,
      basisStatus,
    };
  });

  const rank = (row: BasisRow) =>
    row.basisStatus === "comparable"
      ? 0
      : row.basisStatus === "multiplier-required"
        ? 1
        : row.basisStatus === "pre-close" || row.basisStatus === "market-open"
          ? 2
          : 3;
  rows.sort((a, b) => {
    if (currentSession?.isOpen) {
      const mismatchRank = Number(b.multiplierRequired) - Number(a.multiplierRequired);
      return mismatchRank || a.symbol.localeCompare(b.symbol);
    }
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;
    if (a.basisBps === null || b.basisBps === null) return a.symbol.localeCompare(b.symbol);
    return Math.abs(b.basisBps) - Math.abs(a.basisBps);
  });

  return {
    rows,
    coingeckoOk: true,
    yahooOk: Object.keys(closes).length > 0,
    marketOpen: currentSession?.isOpen ?? false,
  };
}
