export type BasisRow = {
  symbol: string;
  name: string;
  ticker: string;
  tokenPrice: number | null;
  tokenUpdatedAt: number | null;
  underlyingClose: number | null;
  underlyingCloseTime: number | null;
  basisBps: number | null;
  stalePrint: boolean;
};

export type BasisData = {
  rows: BasisRow[];
  coingeckoOk: boolean;
  yahooOk: boolean;
};

export const OUTLIER_BPS = 500;

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

type SparkClose = { close: number; time: number | null };

async function fetchSparkChunk(tickers: string[]): Promise<Record<string, SparkClose>> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${tickers.join(",")}&range=1d&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0 (basis-monitor)" }, next: { revalidate: 300 } },
    );
    if (!res.ok) return {};
    const json = (await res.json()) as Record<string, { timestamp?: number[]; close?: (number | null)[] }>;
    const out: Record<string, SparkClose> = {};
    for (const [ticker, series] of Object.entries(json)) {
      const closes = series?.close ?? [];
      for (let i = closes.length - 1; i >= 0; i--) {
        const value = closes[i];
        if (typeof value === "number") {
          out[ticker] = { close: value, time: series.timestamp?.[i] ?? null };
          break;
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function fetchSessionCloseTime(): Promise<number | null> {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=1d&interval=1d", {
      headers: { "User-Agent": "Mozilla/5.0 (basis-monitor)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { chart?: { result?: { meta?: { regularMarketTime?: number } }[] } };
    const time = json.chart?.result?.[0]?.meta?.regularMarketTime;
    return typeof time === "number" ? time : null;
  } catch {
    return null;
  }
}

async function fetchSparkCloses(tickers: string[]): Promise<Record<string, SparkClose>> {
  const chunks: string[][] = [];
  for (let i = 0; i < tickers.length; i += 20) chunks.push(tickers.slice(i, i + 20));
  const out: Record<string, SparkClose> = {};
  for (let i = 0; i < chunks.length; i += 8) {
    const batch = chunks.slice(i, i + 8);
    const results = await Promise.all(batch.map((chunk) => fetchSparkChunk(chunk)));
    Object.assign(out, ...results);
  }
  return out;
}

export async function loadBasisData(): Promise<BasisData> {
  const markets = await fetchOndoMarkets();
  if (markets === null) return { rows: [], coingeckoOk: false, yahooOk: false };

  const items = markets
    .filter((item) => (item.symbol ?? "").toUpperCase().endsWith("ON"))
    .map((item) => ({
      ticker: item.symbol.toUpperCase().slice(0, -2),
      name: item.name.replace(/\s*\(Ondo Tokenized[^)]*\)\s*$/, ""),
      tokenPrice: typeof item.current_price === "number" ? item.current_price : null,
      tokenUpdatedAt: item.last_updated ? Math.floor(Date.parse(item.last_updated) / 1000) : null,
    }));

  const [closes, sessionCloseTime] = await Promise.all([
    fetchSparkCloses(items.map((item) => item.ticker)),
    fetchSessionCloseTime(),
  ]);

  const rows: BasisRow[] = items.map((item) => {
    const close = closes[item.ticker] ?? null;
    const underlyingClose = close?.close ?? null;
    // Spark bar timestamps mark the session OPEN; the true close moment comes
    // from SPY's regularMarketTime, falling back to open + 6.5h.
    const closeMoment =
      sessionCloseTime ?? (close?.time != null ? close.time + 23400 : null);
    const basisBps =
      item.tokenPrice !== null && underlyingClose !== null && underlyingClose > 0
        ? ((item.tokenPrice - underlyingClose) / underlyingClose) * 10000
        : null;
    const stalePrint =
      basisBps !== null &&
      item.tokenUpdatedAt !== null &&
      closeMoment !== null &&
      item.tokenUpdatedAt < closeMoment;
    return {
      symbol: `${item.ticker}on`,
      name: item.name,
      ticker: item.ticker,
      tokenPrice: item.tokenPrice,
      tokenUpdatedAt: item.tokenUpdatedAt,
      underlyingClose,
      underlyingCloseTime: closeMoment,
      basisBps,
      stalePrint,
    };
  });

  const rank = (row: BasisRow) =>
    row.basisBps === null ? 3 : row.stalePrint ? 2 : Math.abs(row.basisBps) >= OUTLIER_BPS ? 1 : 0;
  rows.sort((a, b) => {
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;
    if (a.basisBps === null || b.basisBps === null) return a.symbol.localeCompare(b.symbol);
    return Math.abs(b.basisBps) - Math.abs(a.basisBps);
  });

  return {
    rows,
    coingeckoOk: true,
    yahooOk: Object.keys(closes).length > 0,
  };
}
