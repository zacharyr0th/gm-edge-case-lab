export type BasisAsset = {
  symbol: string;
  name: string;
  ticker: string;
  coingeckoId: string;
};

export const basisAssets: BasisAsset[] = [
  { symbol: "AAPLon", name: "Apple", ticker: "AAPL", coingeckoId: "apple-ondo-tokenized-stock" },
  { symbol: "TSLAon", name: "Tesla", ticker: "TSLA", coingeckoId: "tesla-ondo-tokenized-stock" },
  { symbol: "NVDAon", name: "NVIDIA", ticker: "NVDA", coingeckoId: "nvidia-ondo-tokenized-stock" },
  { symbol: "MSTRon", name: "MicroStrategy", ticker: "MSTR", coingeckoId: "microstrategy-ondo-tokenized-stock" },
  { symbol: "CRCLon", name: "Circle", ticker: "CRCL", coingeckoId: "circle-internet-group-ondo-tokenized-stock" },
  { symbol: "SPYon", name: "SPDR S&P 500 ETF", ticker: "SPY", coingeckoId: "spdr-s-p-500-etf-ondo-tokenized-etf" },
];

export type BasisRow = {
  symbol: string;
  name: string;
  ticker: string;
  tokenPrice: number | null;
  tokenUpdatedAt: number | null;
  underlyingClose: number | null;
  underlyingCloseTime: number | null;
  basisBps: number | null;
};

export type BasisData = {
  rows: BasisRow[];
  coingeckoOk: boolean;
  yahooOk: boolean;
};

type CoingeckoPrices = Record<string, { usd?: number; last_updated_at?: number }>;

async function fetchCoingecko(): Promise<CoingeckoPrices | null> {
  try {
    const ids = basisAssets.map((asset) => asset.coingeckoId).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_last_updated_at=true`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as CoingeckoPrices;
  } catch {
    return null;
  }
}

type YahooClose = { close: number; time: number | null };

async function fetchYahooClose(ticker: string): Promise<YahooClose | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=1d`, {
      headers: { "User-Agent": "Mozilla/5.0 (basis-monitor)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: { result?: { meta?: { regularMarketPrice?: number; regularMarketTime?: number } }[] };
    };
    const meta = json.chart?.result?.[0]?.meta;
    if (typeof meta?.regularMarketPrice !== "number") return null;
    return { close: meta.regularMarketPrice, time: typeof meta.regularMarketTime === "number" ? meta.regularMarketTime : null };
  } catch {
    return null;
  }
}

export async function loadBasisData(): Promise<BasisData> {
  const [prices, closes] = await Promise.all([
    fetchCoingecko(),
    Promise.all(basisAssets.map((asset) => fetchYahooClose(asset.ticker))),
  ]);

  const rows: BasisRow[] = basisAssets.map((asset, index) => {
    const price = prices?.[asset.coingeckoId];
    const tokenPrice = typeof price?.usd === "number" ? price.usd : null;
    const tokenUpdatedAt = typeof price?.last_updated_at === "number" ? price.last_updated_at : null;
    const close = closes[index];
    const underlyingClose = close?.close ?? null;
    const basisBps =
      tokenPrice !== null && underlyingClose !== null && underlyingClose > 0
        ? ((tokenPrice - underlyingClose) / underlyingClose) * 10000
        : null;
    return {
      symbol: asset.symbol,
      name: asset.name,
      ticker: asset.ticker,
      tokenPrice,
      tokenUpdatedAt,
      underlyingClose,
      underlyingCloseTime: close?.time ?? null,
      basisBps,
    };
  });

  return {
    rows,
    coingeckoOk: prices !== null,
    yahooOk: closes.some((close) => close !== null),
  };
}
