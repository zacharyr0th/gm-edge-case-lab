import verificationRecord from "./contract-verification.json";

/**
 * The last recorded `bun run verify:contract` run. Rendered on the page so a
 * visitor sees the result rather than a claim that the checks exist.
 */
export const verification = verificationRecord;

export type IntegrationMode = "wallet" | "exchange" | "fintech";

export type LabVerdict = "crashes" | "wrong" | "degraded";

export type LabEndpoint = { method: "GET" | "POST" | "RPC"; path: string };

export type LabFixture = { label: string; body: unknown };

export type LabCheck = {
  id: string;
  category: string;
  title: string;
  scenario: string;
  endpoints: LabEndpoint[];
  doc: { label: string; url: string };
  fixtures: LabFixture[];
  naiveAssumption: string;
  naive: () => string;
  verdict: LabVerdict;
  correct: string[];
  impact: Record<IntegrationMode, string>;
  userCopy: string;
};

export type LabRun = { threw: boolean; output: string };

export function runNaive(check: LabCheck): LabRun {
  try {
    return { threw: false, output: check.naive() };
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return { threw: true, output: message };
  }
}

export const integrationModes: { id: IntegrationMode; label: string }[] = [
  { id: "wallet", label: "Wallet" },
  { id: "exchange", label: "Exchange" },
  { id: "fintech", label: "Fintech app" },
];

const compositeMarket = {
  primaryMarket: {
    symbol: "EXMPLon",
    price: "148.72",
    priceChange24h: "1.94",
    priceChangePct24h: "1.32",
    priceHistory24h: [{ timestamp: 1785694800000, price: "146.78" }],
    totalHolders: 312,
    sharesMultiplier: "1",
    tradableSessions: ["premarket", "regular", "postmarket", "overnight"],
  },
  underlyingMarket: null,
  constituentTokens: ["AAPLon", "MSFTon", "NVDAon"],
  timestamp: 1785694800000,
};

const singleStockMarket = {
  primaryMarket: {
    symbol: "AAPLon",
    price: "195.34",
    priceChange24h: "0.123",
    priceChangePct24h: "5.45",
    priceHistory24h: [{ timestamp: 1785694800000, price: "195.22" }],
    totalHolders: 1234,
    sharesMultiplier: "1",
    tradableSessions: ["premarket", "regular", "postmarket", "overnight"],
  },
  underlyingMarket: {
    ticker: "AAPL",
    name: "Apple Inc",
    price: "195.34",
    priceHigh52w: "259.47",
    priceLow52w: "168.99",
    volume: "43020691",
    averageVolume: "38390632",
    sharesOutstanding: "14935800000",
    marketCap: "2934137946000",
  },
  constituentTokens: [],
  timestamp: 1785694800000,
};

const overnightMarketStatus = {
  timestamp: "2026-08-04T02:20:00Z",
  isOpen: true,
  marketStatus: "overnight",
  nextOpenSession: "premarket",
  nextOpen: "2026-08-04T08:00:00Z",
  nextClose: "2026-08-04T07:59:00Z",
  offhours: { isOpen: false, nextOpen: "2026-08-08T00:05:00Z", nextClose: "2026-08-09T23:55:00Z" },
};

const overnightLimits = {
  timestamp: 1785694800000,
  symbol: "KOon",
  side: "buy",
  maxTokens: "0.000000000000000000",
  maxNotionalValue: "0.000000000000000000",
  remainingAttestations: "3",
  isAssetTradingOpen: false,
  reason: {
    code: "ASSET_CLOSED_FOR_SESSION",
    message: "Asset is not tradable in the overnight session",
    documentation: "https://docs.ondo.finance/",
  },
};

const weekendMarketStatus = {
  timestamp: "2026-08-02T18:20:00Z",
  isOpen: false,
  marketStatus: "offhours",
  nextOpenSession: "premarket",
  nextOpen: "2026-08-03T08:00:00Z",
  nextClose: "2026-08-03T13:29:00Z",
  reason: { code: "MARKET_CLOSED", message: "Weekend/Holiday", documentation: "https://docs.ondo.finance/" },
  offhours: { isOpen: true, nextOpen: "2026-08-01T00:05:00Z", nextClose: "2026-08-02T23:55:00Z" },
};

const earningsStatusEvent = {
  symbol: "TSLAon",
  status: "active",
  type: "scheduled",
  reason: {
    code: "ASSET_LIMITED",
    message: "Earnings announcement window",
    documentation: "https://docs.ondo.finance/",
  },
  start: "2026-08-03T20:00:00Z",
  end: "2026-08-04T00:30:00Z",
  eventId: "94fe2f8f-e69c-45a5-9e48-dd8226dd8e67",
  updateSharesMultiplier: false,
};

const unscheduledPauseEvent = {
  symbol: "AAPLon",
  status: "active",
  type: "unscheduled",
  reason: { code: "ASSET_PAUSED", message: "Maintenance", documentation: "https://docs.ondo.finance/" },
  start: "2026-08-03T15:12:00Z",
  eventId: "b3c1a7d2-4e5f-4a86-9c0d-1f2e3a4b5c6d",
  updateSharesMultiplier: false,
};

const dividendStatusEvent = {
  symbol: "AAPLon",
  status: "active",
  type: "scheduled",
  reason: { code: "ASSET_PAUSED", message: "Dividend distribution", documentation: "https://docs.ondo.finance/" },
  start: "2026-08-06T08:00:00Z",
  end: "2026-08-06T09:00:00Z",
  eventId: "5d9e8f7a-6b5c-4d3e-2f1a-0b9c8d7e6f5a",
  updateSharesMultiplier: true,
};

const multiplierHistory = {
  history: [
    { sharesMultiplier: "1", changeTimestamp: 1750000000000 },
    { sharesMultiplier: "1.0132", changeTimestamp: 1786003200000 },
  ],
  timestamp: 1786003200000,
};

const latestPrice = {
  primaryMarket: { symbol: "AAPLon", price: "195.34" },
  underlyingMarket: { ticker: "AAPL", price: "195.31" },
  timestamp: 1785694800000,
};

const softQuote = {
  chainId: "1",
  symbol: "AAPLon",
  ticker: "AAPL",
  assetAddress: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
  side: "0",
  tokenAmount: "5000000000000000000",
  price: "195834151158540753535",
};

const offhoursExposureLimits = {
  timestamp: 1785694800000,
  symbol: "AAPLon",
  side: "buy",
  maxTokens: "0.000000000000000000",
  maxNotionalValue: "0.000000000000000000",
  remainingAttestations: "3",
  isAssetTradingOpen: false,
  reason: {
    code: "OFFHOURS_EXPOSURE_LIMIT_REACHED",
    message: "Off-hours exposure limit reached",
    documentation: "https://docs.ondo.finance/",
  },
};

const exhaustedAttestations = {
  timestamp: 1785694800000,
  symbol: "AAPLon",
  side: "buy",
  maxTokens: "100.000000000000000000",
  maxNotionalValue: "19534.000000000000000000",
  remainingAttestations: "0",
  isAssetTradingOpen: false,
  reason: { code: "MAX_ATTESTATIONS", message: "Attestation limit reached", documentation: "https://docs.ondo.finance/" },
};

const rateLimitedError = {
  code: "RATE_LIMITED",
  message: "Too many requests",
  documentation: "https://docs.ondo.finance/",
};

const redeemOnlyLimits = {
  timestamp: 1785694800000,
  symbol: "AAPLon",
  side: "buy",
  maxTokens: "0.000000000000000000",
  maxNotionalValue: "0.000000000000000000",
  remainingAttestations: "3",
  isAssetTradingOpen: false,
  reason: {
    code: "ASSET_REDEEM_ONLY",
    message: "asset is redeem-only",
    documentation: "https://docs.ondo.finance/api-reference/error-codes#asset_redeem_only",
  },
};

/**
 * Codes the Error Codes page documents that the TradingLimitsReasonCode enum
 * does not carry. verify:contract re-derives this list from both sources.
 */
export const documentedCodesOutsideTheEnum = [
  "ASSET_REDEEM_ONLY",
  "SESSION_LIMIT_REACHED",
  "INSUFFICIENT_LIQUIDITY",
  "GAS_FEE_EXCEEDS_ORDER_VALUE",
  "INVALID_ADDRESS",
  "PAUSED_GM_CHAIN",
];

/** The pair list in the INVALID_INTERVAL_RANGE_PAIR error message, which is not the OpenAPI list. */
export const ohlcPairsPerErrorMessage = [
  "1min/1day",
  "5min/1day",
  "15min/1day",
  "1hour/1month",
  "4hour/3month",
  "12hour/6month",
  "1day/1year",
  "1day/all",
];

const invalidPairError = {
  code: "INVALID_INTERVAL_RANGE_PAIR",
  message:
    "invalid interval/range pair: 1min/1year; valid pairs: 1min/1day, 5min/1day, 15min/1day, 1hour/1month, 4hour/3month, 12hour/6month, 1day/1year, 1day/all",
  documentation: "https://docs.ondo.finance/api-reference/error-codes#invalid_interval_range_pair",
};

const cachedMarketRead = {
  endpoint: "GET /v1/assets/AAPLon/market",
  cacheTtlSeconds: 60,
  tradableSessions: ["premarket", "regular", "postmarket", "overnight"],
  note: "Cached for 1 minute. Reflects the asset as it was up to 60s ago.",
};

const uncachedLimitsRead = {
  endpoint: "GET /v1/limits/trading?symbol=AAPLon&side=buy",
  cacheTtlSeconds: 0,
  isAssetTradingOpen: false,
  reason: { code: "ASSET_PAUSED", message: "cash_dividend", documentation: "https://docs.ondo.finance/api-reference/error-codes#asset_paused" },
  note: "Not cached; the docs call these values critical for risk management.",
};

const priceUpdateFrame = {
  updates: [
    { ticker: "AAPL", symbol: "AAPLon", stock_price: "195.31", token_price: "195.34", timestamp: 1785694800123456789 },
  ],
};

const ohlcPartials = [
  { primary_market: { symbol: "AAPLon", open: "195.10", high: "195.28", low: "195.02", close: "195.22" }, is_closed: false, timestamp: 1785694800000000000 },
  { primary_market: { symbol: "AAPLon", open: "195.10", high: "195.41", low: "195.02", close: "195.39" }, is_closed: false, timestamp: 1785694800000000000 },
  { primary_market: { symbol: "AAPLon", open: "195.10", high: "195.44", low: "195.02", close: "195.44" }, is_closed: true, timestamp: 1785694800000000000 },
];

const softQuoteDepth = {
  symbol: "AAPLon",
  ticker: "AAPL",
  session_type: "regular",
  error: "",
  timestamp: 1785694800123456789,
  bids: [
    { price: "195.20", quantity: "40" },
    { price: "195.05", quantity: "160" },
  ],
  asks: [
    { price: "195.48", quantity: "40" },
    { price: "195.63", quantity: "160" },
  ],
};

const softQuoteDepthError = {
  symbol: "KOon",
  ticker: "KO",
  session_type: "overnight",
  error: "asset is not tradable in this session",
  timestamp: 1785694800123456789,
  bids: [],
  asks: [],
};

const signedAttestation = {
  attestationId: "229852750420835981756873903928305653446",
  userId: "0x474d0000000000009310097834e2c7af00000000000000000000000000000000",
  chainId: "1",
  symbol: "AAPLon",
  ticker: "AAPL",
  assetAddress: "0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c",
  side: "0",
  tokenAmount: "5000000000000000000",
  price: "195340000000000000000",
  expiration: 1786003200,
  signature: "kMecIrsGFdoAdxzRq2bPo07FWP2QyrxWfjrSMAdIZXNq3bXQnWx27aTKyt9fJiXWrzShYemxA/0RengNqNJ6bBs=",
  additionalData: "",
};

const replayedAttestationRequest = {
  chainId: "1",
  symbol: "AAPLon",
  side: "0",
  tokenAmount: "5000000000000000000",
};

const invalidParameterError = {
  code: "INVALID_SYMBOL",
  message: "One of the request parameters is invalid.",
  documentation: "https://docs.ondo.finance/api-reference/error-codes#invalid_symbol",
};

const solanaAttestationRequest = {
  chainId: "solana-900",
  symbol: "AAPLon",
  side: "buy",
  tokenAmount: "5.000000000000000000",
};

const missingUserAddressError = {
  code: "MISSING_USER_ADDRESS",
  message: "missing user address",
  documentation: "https://docs.ondo.finance/api-reference/error-codes#missing_user_address",
};

const minimalPauseEvent = {
  symbol: "NVDAon",
  status: "active",
  type: "unscheduled",
};

/** IntervalEnum and RangeEnum, cross-checked against the live spec by verify:contract. */
export const ohlcIntervals = ["1min", "5min", "15min", "1hour", "4hour", "12hour", "1day"];
export const ohlcRanges = ["1day", "1month", "3month", "6month", "1year", "all"];

/** The pairs the endpoint description lists as supported. Prose only — not in the schema. */
export const ohlcValidPairs = [
  "1min/1day",
  "5min/1day",
  "15min/1day",
  "1hour/1month",
  "4hour/1month",
  "12hour/3month",
  "1day/3month",
  "1day/6month",
  "1day/1year",
  "1day/all",
];

const deadManSwitchSubscribe = {
  op: "subscribe",
  channel: "cancelAllOrdersAfterPerps",
};

const batchOrderResponse = {
  success: true,
  result: {
    addedOrders: [
      { orderId: "70a37d8f972f2494837f9dba8364cbb4", market: "AAPL-USD.P", side: "buy", price: "232.00", size: "10.00", status: "open" },
      { orderId: "8b41c5e0a1d34f2b9c7e6a5d4f3b2a19", market: "AAPL-USD.P", side: "buy", price: "231.50", size: "10.00", status: "open" },
    ],
    failedOrders: [
      { order: { market: "AAPL-USD.P", side: "buy", price: "231.00", size: "10.00" }, error: "insufficient margin", errorCode: "insufficient_margin" },
      { order: { market: "AAPL-USD.P", side: "buy", price: "230.50", size: "10.00" }, error: "insufficient margin", errorCode: "insufficient_margin" },
    ],
  },
};

const batchCancelResponse = {
  success: true,
  result: {
    successfulCancels: [{ orderId: "70a37d8f972f2494837f9dba8364cbb4", status: "canceled" }],
    failedCancels: [
      { orderId: "8b41c5e0a1d34f2b9c7e6a5d4f3b2a19", error: "order_already_fully_filled", errorCode: "order_already_fully_filled" },
    ],
  },
};

const partiallyFilledOrder = {
  orderId: "70a37d8f972f2494837f9dba8364cbb4",
  market: "AAPL-USD.P",
  side: "buy",
  type: "limit",
  price: "232.00",
  size: "20.300",
  filledSize: "5.403",
  filledCost: "1253.50",
  status: "open",
  timeInForce: "GTC",
};

const marketsConfig = {
  perps: {
    tradingPairs: [{ market: "AAPL-USD.P", baseIncrement: "0.01", quoteIncrement: "0.01", minBaseSize: "0.01", maxLeverage: 20 }],
  },
};

const wsConnectionRules = {
  url: "wss://api.ondoperps.xyz/ws",
  idleTimeoutSeconds: 180,
  heartbeat: { send: { op: "ping" }, expect: { type: "pong" } },
  maxMessageBytes: 32768,
  rateLimit: { perSecond: 25, burst: 50 },
  privateChannelsRequire: { op: "login" },
};

export const knownReasonCodes = [
  "MARKET_CLOSED",
  "MARKET_PAUSED",
  "ASSET_PAUSED",
  "ASSET_CLOSED_FOR_SESSION",
  "ASSET_LIMITED",
  "MAX_LIMIT_REACHED",
  "MAX_ATTESTATIONS",
  "OFFHOURS_EXPOSURE_LIMIT_REACHED",
];

const solanaAddresses = [
  { networkChainId: "ethereum-1", address: "0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c", decimals: 18 },
  { networkChainId: "bsc-56", address: "0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4", decimals: 18 },
  { networkChainId: "solana-900", address: "GmAAPL111111111111111111111111111111111111", decimals: 9 },
];

const solanaPreflight = {
  simulationResult: {
    err: "AccountNotFound",
    logs: ["Program log: token account does not exist yet"],
  },
  note: "Typical wallet preflight output, not an Ondo API response. GM tokens mint just-in-time at execution.",
};

export const labChecks: LabCheck[] = [
  {
    id: "null-underlying",
    category: "Schema evolution",
    title: "underlyingMarket is null for basket tokens",
    scenario:
      "Shipped: the published contract now marks underlyingMarket required and nullable. Basket tokens return null there, with the basket in constituentTokens.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/market" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/assets/EXMPLon/market → 200 (contract shape, illustrative values)", body: compositeMarket }],
    naiveAssumption: "Every token has one underlying stock, so underlyingMarket.ticker is always safe.",
    naive: () => {
      const parsed = compositeMarket as unknown as { underlyingMarket: { ticker: string; name: string } };
      return `${parsed.underlyingMarket.ticker} · ${parsed.underlyingMarket.name}`;
    },
    verdict: "crashes",
    correct: [
      "Treat underlyingMarket as nullable; render constituentTokens as a basket.",
      "The contract already allows null, so a basket token can appear without further notice.",
    ],
    impact: {
      wallet: "Token detail screen white-screens on launch day.",
      exchange: "Listing pipeline rejects the asset; users see “Unknown asset.”",
      fintech: "Portfolio sync dies mid-run; balances go stale.",
    },
    userCopy: "EXMPL is a basket of AAPLon, MSFTon, and NVDAon.",
  },
  {
    id: "strict-parser",
    category: "Schema evolution",
    title: "Strict parsers reject the new constituentTokens field",
    scenario:
      "constituentTokens is now required on every market response, including single-stock tokens, where it is empty. A closed parser rejects it today.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/market" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/assets/AAPLon/market → 200 (current contract shape)", body: singleStockMarket }],
    naiveAssumption: "The schema is closed — reject any field we didn't model.",
    naive: () => {
      const allowed = new Set(["primaryMarket", "underlyingMarket", "timestamp"]);
      for (const key of Object.keys(singleStockMarket as Record<string, unknown>)) {
        if (!allowed.has(key)) {
          throw new Error(`Strict schema rejected market response: unrecognized key "${key}"`);
        }
      }
      return "Market response parsed";
    },
    verdict: "crashes",
    correct: [
      "Parse tolerantly: ignore unknown fields, alert on missing required ones.",
      "That one change turns every future additive rollout into a non-event.",
    ],
    impact: {
      wallet: "Every market call fails the day the field lands — with no deploy on your side.",
      exchange: "Market-data ingestion halts across all listings at once.",
      fintech: "The nightly sync marks every Ondo asset invalid.",
    },
    userCopy: "Handled correctly: nothing — the rollout is invisible.",
  },
  {
    id: "session-mismatch",
    category: "Market state",
    title: "Market is open, but this asset isn't tradable this session",
    scenario: "The overnight session is live, but this asset doesn't trade overnight. Tradability is per-asset.",
    endpoints: [
      { method: "GET", path: "/v1/status/market" },
      { method: "GET", path: "/v1/limits/trading" },
      { method: "GET", path: "/v1/limits/session" },
    ],
    doc: { label: "Get Trading Limits", url: "https://docs.ondo.finance/api-reference/limits/get-trading-limits" },
    fixtures: [
      { label: "GET /v1/status/market → 200", body: overnightMarketStatus },
      { label: "GET /v1/limits/trading?symbol=KOon&side=buy → 200 (illustrative)", body: overnightLimits },
    ],
    naiveAssumption: "status/market isOpen: true is enough to enable the Buy button.",
    naive: () => {
      const market = overnightMarketStatus as { isOpen: boolean; marketStatus: string };
      return market.isOpen
        ? `isOpen: true → Buy enabled for KOon in the ${market.marketStatus} session. The order fails at attestation with ASSET_CLOSED_FOR_SESSION.`
        : "Buy disabled";
    },
    verdict: "wrong",
    correct: [
      "Gate the ticket on /v1/limits/trading: isAssetTradingOpen plus reason.",
      "Read per-asset tradableSessions and explain before the user commits.",
      "/v1/limits/session is static and theoretical — it says what is possible, not what is permitted right now.",
    ],
    impact: {
      wallet: "Users sign a transaction that predictably fails.",
      exchange: "Accepted tickets bounce at execution every evening.",
      fintech: "Queued overnight buys fail silently.",
    },
    userCopy: "KO trades 4:00 AM – 8:00 PM ET. The next window opens at 4:00 AM ET.",
  },
  {
    id: "weekend-offhours",
    category: "Market state",
    title: "Weekend: equities closed, but the off-hours venue is open",
    scenario: "On a weekend, top-level isOpen is false while the required offhours object reports its venue open.",
    endpoints: [{ method: "GET", path: "/v1/status/market" }],
    doc: { label: "Get Current Market Status", url: "https://docs.ondo.finance/api-reference/status/get-current-market-status" },
    fixtures: [{ label: "GET /v1/status/market → 200 (Sunday)", body: weekendMarketStatus }],
    naiveAssumption: "isOpen: false means nothing trades — show “come back Monday.”",
    naive: () => {
      const market = weekendMarketStatus as { isOpen: boolean };
      return market.isOpen
        ? "Trading enabled"
        : "isOpen: false → “Markets are closed. Come back Monday at 9:30 AM ET.” The offhours.isOpen: true field is never read.";
    },
    verdict: "wrong",
    correct: [
      "Model off-hours as its own venue: isOpen, nextOpen, nextClose.",
      "Surface weekend trading with its tighter limits instead of hiding the differentiator.",
    ],
    impact: {
      wallet: "The one weekend feature goes unshipped.",
      exchange: "Weekend flow routes to competitors.",
      fintech: "Weekend recurring buys error out.",
    },
    userCopy: "U.S. markets are closed, but AAPLon still trades off-hours with tighter size limits.",
  },
  {
    id: "stale-cache",
    category: "Market state",
    title: "Tradability read from a cached endpoint is a minute behind",
    scenario:
      "Market data is cached for one minute. Trading limits are not cached at all — the docs call those values critical for risk management. Gate the Buy button on the cached endpoint and you gate it on the past.",
    endpoints: [
      { method: "GET", path: "/v1/assets/{symbol}/market" },
      { method: "GET", path: "/v1/limits/trading" },
    ],
    doc: { label: "Endpoint Caching", url: "https://docs.ondo.finance/api-reference/endpoint-caching" },
    fixtures: [
      { label: "The cached read", body: cachedMarketRead },
      { label: "The live read, same moment", body: uncachedLimitsRead },
    ],
    naiveAssumption: "One market call per screen is enough, and tradableSessions tells me whether it trades.",
    naive: () => {
      const ttl = cachedMarketRead.cacheTtlSeconds;
      return `Buy enabled from a ${ttl}s-cached market response. The asset paused ${Math.round(ttl / 2)}s ago; /v1/limits/trading is uncached and already returns ${uncachedLimitsRead.reason.code}. The two endpoints disagree for up to ${ttl}s, every time.`;
    },
    verdict: "wrong",
    correct: [
      "Gate execution on /v1/limits/trading, the one endpoint with no cache. Use market data for display.",
      "Do not poll faster than the TTL — a 1s poll on a 60s cache spends rate limit on identical bytes.",
      "OHLC carries up to 11 seconds of lag (1s cache plus 5–10s upstream), so treat a missing last candle as normal.",
    ],
    impact: {
      wallet: "A minute-long window after every pause where the app still takes orders.",
      exchange: "Risk reads stale tradability into the matching path.",
      fintech: "Scheduled buys fire against a snapshot that has already changed.",
    },
    userCopy: "Checking current trading status…",
  },
  {
    id: "earnings-limited",
    category: "Corporate actions",
    title: "Asset limited during an earnings window",
    scenario:
      "Status stays “active” — the restriction is an event: reason ASSET_LIMITED with a start/end window. ASSET_LIMITED is also the one restriction code the docs give an HTTP 200, so nothing about the response says “handle me”.",
    endpoints: [{ method: "GET", path: "/v1/status/assets" }],
    doc: { label: "Get Asset Statuses", url: "https://docs.ondo.finance/api-reference/status/get-asset-statuses" },
    fixtures: [{ label: "GET /v1/status/assets → 200 (one event, illustrative)", body: [earningsStatusEvent] }],
    naiveAssumption: "status: \"active\" means fully tradable; reason and window are skippable metadata.",
    naive: () => {
      const event = earningsStatusEvent as { status: string; symbol: string };
      return event.status === "active"
        ? `status: "active" → ${event.symbol} rendered fully tradable during its earnings window. Attestations fail at 20:00Z with nothing on screen.`
        : "Restriction shown";
    },
    verdict: "wrong",
    correct: [
      "Read rows as restriction events keyed by reason.code and window; announce scheduled windows before they start.",
      "ASSET_LIMITED, ASSET_PAUSED, and delisted are three different UX states.",
      "Do not gate on HTTP status: this restriction ships inside a 200.",
    ],
    impact: {
      wallet: "Trades fail during the stock's highest-attention hours.",
      exchange: "Generic errors exactly at peak volume.",
      fintech: "Price triggers fire into a limited market.",
    },
    userCopy: "Trading in TSLAon is limited 4:00 – 8:30 PM ET around Tesla's earnings.",
  },
  {
    id: "pause-no-end",
    category: "Corporate actions",
    title: "Unscheduled pause with no end time",
    scenario:
      "Unscheduled events can omit end entirely. The required set is exactly symbol, status, and type, so reason is optional too.",
    endpoints: [{ method: "GET", path: "/v1/status/assets" }],
    doc: { label: "Get Asset Statuses", url: "https://docs.ondo.finance/api-reference/status/get-asset-statuses" },
    fixtures: [
      { label: "GET /v1/status/assets → 200 (no `end` field)", body: [unscheduledPauseEvent] },
      { label: "The minimum legal event — every other field is optional", body: [minimalPauseEvent] },
    ],
    naiveAssumption: "Every event has an end, so always render “resumes at …”.",
    naive: () => {
      const event = unscheduledPauseEvent as unknown as { end: string };
      return `Paused — resumes at ${new Date(event.end).toString()}`;
    },
    verdict: "wrong",
    correct: [
      "Render a resume time only when end exists; otherwise poll status and notify on resume.",
      "Treat reason as optional as well — three fields is a complete event.",
    ],
    impact: {
      wallet: "“Resumes at Invalid Date” ships to production.",
      exchange: "The status page shows garbage mid-incident.",
      fintech: "Notification jobs schedule against NaN.",
    },
    userCopy: "AAPLon is paused for maintenance. Your balance is unaffected — we'll notify you on resume.",
  },
  {
    id: "dividend-multiplier",
    category: "Corporate actions",
    title: "Dividend event changes the shares multiplier",
    scenario: "Dividends accrue via the shares multiplier — token count stays the same, each token represents more shares.",
    endpoints: [
      { method: "GET", path: "/v1/status/assets" },
      { method: "GET", path: "/v1/assets/{symbol}/shares-multiplier" },
    ],
    doc: { label: "Corporate Actions", url: "https://docs.ondo.finance/ondo-stocks/corporate-actions" },
    fixtures: [
      { label: "GET /v1/status/assets → 200 (updateSharesMultiplier: true)", body: [dividendStatusEvent] },
      { label: "GET /v1/assets/AAPLon/shares-multiplier → 200 (after the event, illustrative)", body: multiplierHistory },
    ],
    naiveAssumption: "One token equals one share forever — cache it at listing time.",
    naive: () => {
      const cachedMultiplier = 1;
      const tokens = 10;
      return `Balance: ${tokens} AAPLon = ${(tokens * cachedMultiplier).toFixed(3)} AAPL shares — stale. After the event it's ${(tokens * 1.0132).toFixed(3)}.`;
    },
    verdict: "wrong",
    correct: [
      "On updateSharesMultiplier events, refetch the multiplier and recompute share-equivalents.",
      "Explain the jump — an unexplained balance change reads as a bug.",
    ],
    impact: {
      wallet: "Balances jump with no explanation, or stay stale.",
      exchange: "NAV and index math drift on every dividend.",
      fintech: "Statements and tax lots use the wrong share count.",
    },
    userCopy: "AAPL paid a dividend. Your AAPLon now represents more shares (1.0000 → 1.0132).",
  },
  {
    id: "display-vs-executable",
    category: "Prices & quotes",
    title: "Display price is not the executable price",
    scenario:
      "Price endpoints are display-only; execution prices on the attestation quote. The gap between them is spread, and the spec is its own trap here: AssetPrice.timestamp is documented in milliseconds under a 10-digit seconds example.",
    endpoints: [
      { method: "GET", path: "/v1/assets/{symbol}/prices/latest" },
      { method: "POST", path: "/v1/attestations/soft" },
    ],
    doc: {
      label: "Get Current Price for an Asset",
      url: "https://docs.ondo.finance/api-reference/assets/get-current-price-for-an-asset",
    },
    fixtures: [
      { label: "GET /v1/assets/AAPLon/prices/latest → 200 (milliseconds, per the endpoint\u2019s own example)", body: latestPrice },
      { label: "POST /v1/attestations/soft → 200 (price is an 18-decimal integer string)", body: softQuote },
    ],
    naiveAssumption: "The price endpoint is the price the user will execute at.",
    naive: () => {
      const view = latestPrice as { primaryMarket: { price: string } };
      const executable = (Number(softQuote.price) / 1e18).toFixed(2);
      return `Trade ticket: “Buy AAPLon at $${view.primaryMarket.price}” — the display price quoted as executable. The attestation prices it at $${executable}; the confirm screen and the fill disagree by $${(Number(executable) - Number(view.primaryMarket.price)).toFixed(2)}.`;
    },
    verdict: "wrong",
    correct: [
      "Preview with prices/latest, execute on the soft quote — the gap is spread, not an error.",
      "Big-number math for the 18-decimal quote price; parseFloat drops the tail.",
      "Normalize units at the edge: REST is milliseconds, Attestation.expiration is seconds, and the gRPC streams are nanoseconds.",
    ],
    impact: {
      wallet: "The confirm screen never matches the fill.",
      exchange: "Display prices used as an oracle import weekend staleness into risk.",
      fintech: "Statements and receipts show a price no user was ever filled at.",
    },
    userCopy: "Estimated $195.34 · updated 12s ago. Your final price locks when you confirm.",
  },
  {
    id: "attestation-replay",
    category: "Prices & quotes",
    title: "The attestation response can\u2019t be replayed as a request",
    scenario:
      "Requests take side \"buy\" and chainId \"ethereum-1\"; the response returns side \"0\" and chainId \"1\". expiration is the only timestamp in the spec with no unit stated, and it is seconds.",
    endpoints: [{ method: "POST", path: "/v1/attestations" }],
    doc: {
      label: "Request a Mint or Redeem Attestation",
      url: "https://docs.ondo.finance/api-reference/attestations/request-a-mint-or-redeem-attestation",
    },
    fixtures: [
      { label: "POST /v1/attestations \u2192 200 (contract shape, illustrative values)", body: signedAttestation },
      { label: "The response fed back in as a request \u2192 400", body: replayedAttestationRequest },
      { label: "400 body", body: invalidParameterError },
    ],
    naiveAssumption: "The response echoes the request, so it can be re-sent \u2014 and expiration is milliseconds like every other timestamp.",
    naive: () => {
      const attestation = signedAttestation;
      return `Expires ${new Date(attestation.expiration).toUTCString()} \u2014 read as long past, so the client re-quotes with {"chainId": "${attestation.chainId}", "side": "${attestation.side}"} \u2192 400. Neither value belongs to its request enum.`;
    },
    verdict: "wrong",
    correct: [
      "Keep the request\u2019s own side and chainId; the response carries on-chain encodings, not request values.",
      "Multiply expiration by 1000 before comparing it to Date.now().",
      "price and tokenAmount come back as 18-decimal integer strings, not decimals.",
    ],
    impact: {
      wallet: "Every attestation looks expired on arrival, so the client re-quotes until the budget is gone.",
      exchange: "The retry path builds requests the API rejects, so a failed mint never recovers.",
      fintech: "Expiry monitoring fires on 1970 and cancels valid orders.",
    },
    userCopy: "Your quote is locked for 30 seconds.",
  },
  {
    id: "ohlc-pairs",
    category: "Prices & quotes",
    title: "42 interval/range combinations typecheck, and the docs disagree on which work",
    scenario:
      "interval and range are both required and independently enumerated, so generated types allow every pairing. Worse, the two published lists differ: the OpenAPI description names ten pairs, the INVALID_INTERVAL_RANGE_PAIR message names eight — and they are not a subset of each other.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/prices/ohlc" }],
    doc: {
      label: "Get OHLC Data for an Asset",
      url: "https://docs.ondo.finance/api-reference/assets/get-ohlc-open-high-low-close-data-for-an-asset",
    },
    fixtures: [
      { label: "GET /v1/assets/AAPLon/prices/ohlc?interval=1min&range=1year → 400", body: invalidPairError },
      { label: "Pairs per the OpenAPI description", body: ohlcValidPairs },
      { label: "Pairs per the error message — 4hour and 12hour differ, two 1day pairs are missing", body: ohlcPairsPerErrorMessage },
    ],
    naiveAssumption: "Both parameters are enums, so any interval works with any range.",
    naive: () => {
      const combinations = ohlcIntervals.length * ohlcRanges.length;
      const disputed = ohlcValidPairs.filter((pair) => !ohlcPairsPerErrorMessage.includes(pair));
      return `Range switcher generated from IntervalEnum × RangeEnum → ${combinations} combinations offered. “1min” and “1year” are each valid members and together a 400. The two published lists also disagree on ${disputed.length} pairs (${disputed.join(", ")}), so neither document alone defines the contract.`;
    },
    verdict: "degraded",
    correct: [
      "Model the supported pairs as one union instead of letting the two enums vary independently.",
      "Where the two lists disagree, probe once and cache the answer — the documents cannot both be right.",
      "range=1day means a rolling calendar day for off-hours-tradable assets and a market-hours day for the rest, so candle counts differ per asset and gaps are not errors.",
    ],
    impact: {
      wallet: "The 1Y button returns nothing on the minute chart.",
      exchange: "Backfill jobs 400 across most of the grid they enumerate.",
      fintech: "Chart ranges silently miss data and read as an outage.",
    },
    userCopy: "1Y is available on the daily chart.",
  },
  {
    id: "offhours-exposure",
    category: "Limits & quotes",
    title: "Off-hours exposure limit reached",
    scenario: "Off-hours caps size while hedging is constrained: isAssetTradingOpen: false, OFFHOURS_EXPOSURE_LIMIT_REACHED.",
    endpoints: [{ method: "GET", path: "/v1/limits/trading" }],
    doc: { label: "Get Trading Limits", url: "https://docs.ondo.finance/api-reference/limits/get-trading-limits" },
    fixtures: [{ label: "GET /v1/limits/trading?symbol=AAPLon&side=buy → 200", body: offhoursExposureLimits }],
    naiveAssumption: "Failures are transient — show a “try again” toast.",
    naive: () => {
      const limits = offhoursExposureLimits as { isAssetTradingOpen: boolean; reason: { message: string } };
      return limits.isAssetTradingOpen
        ? "Order accepted"
        : `Toast: “Trade failed. Please try again.” — reason.message (“${limits.reason.message}”) never surfaced, and retrying won't help.`;
    },
    verdict: "degraded",
    correct: [
      "Pre-check limits; show remaining capacity and the next window.",
      "Only transient errors deserve a retry button — exposure caps don't.",
    ],
    impact: {
      wallet: "Users retry a capped trade into repeated failures.",
      exchange: "Flow keeps hammering an intentionally closed door.",
      fintech: "Automated retries burn rate limits all weekend.",
    },
    userCopy: "Off-hours buying for AAPLon is at capacity. Trading reopens Monday 4:00 AM ET.",
  },
  {
    id: "attestation-budget",
    category: "Limits & quotes",
    title: "Attestation budget exhausted by treating quotes as a price feed",
    scenario: "Quotes are metered: limits expose remainingAttestations, then MAX_ATTESTATIONS and 429 RATE_LIMITED.",
    endpoints: [
      { method: "GET", path: "/v1/limits/trading" },
      { method: "POST", path: "/v1/attestations/soft" },
    ],
    doc: {
      label: "Request a Soft Attestation Quote",
      url: "https://docs.ondo.finance/api-reference/attestations/request-a-soft-attestation-quote",
    },
    fixtures: [
      { label: "GET /v1/limits/trading → 200 (remainingAttestations: \"0\")", body: exhaustedAttestations },
      { label: "POST /v1/attestations/soft → 429", body: rateLimitedError },
    ],
    naiveAssumption: "Soft quotes are free — refresh one on every price tick.",
    naive: () =>
      `429 RATE_LIMITED → retry() → 429 → retry() → 429 … remainingAttestations ("0") was available the whole time and never checked.`,
    verdict: "degraded",
    correct: [
      "Preview from prices/latest; request a quote only at the confirm step.",
      "Track remainingAttestations and back off visibly on 429.",
    ],
    impact: {
      wallet: "Ambient refreshes burn the budget before the trade that matters.",
      exchange: "Budgets exhaust exactly during volatility spikes.",
      fintech: "Batch polling blocks interactive users.",
    },
    userCopy: "Quote limit reached. Your preview stays live — request a fresh quote in a moment.",
  },
  {
    id: "unknown-reason",
    category: "Schema evolution",
    title: "A reason code your switch statement has never seen",
    scenario:
      "The TradingLimitsReasonCode enum has eight members. The Error Codes page documents six more restriction codes that are not in it, including ASSET_REDEEM_ONLY — an asset you can sell but not buy. This is not a hypothetical about future growth; the gap is in the published contract today.",
    endpoints: [{ method: "GET", path: "/v1/limits/trading" }],
    doc: { label: "Error Codes", url: "https://docs.ondo.finance/api-reference/error-codes" },
    fixtures: [
      { label: "GET /v1/limits/trading → 200, carrying a documented code the enum omits", body: redeemOnlyLimits },
      { label: "Documented restriction codes absent from TradingLimitsReasonCode", body: documentedCodesOutsideTheEnum },
    ],
    naiveAssumption: "The enum is final — exhaustive switch with a throwing default.",
    naive: () => {
      const { code } = (redeemOnlyLimits as { reason: { code: string } }).reason;
      if (!knownReasonCodes.includes(code)) {
        throw new Error(`Unhandled TradingLimitsReasonCode: "${code}"`);
      }
      return "Reason rendered";
    },
    verdict: "crashes",
    correct: [
      "Special-case known codes; for unknown ones fall back to the guaranteed message + documentation link, and log for triage.",
      "Generate the switch from the Error Codes page, not from the enum — the enum is the smaller list.",
      "Redeem-only is a distinct state: keep Sell live while disabling Buy, rather than blocking the asset.",
    ],
    impact: {
      wallet: "The trade screen crashes on the first new restriction type.",
      exchange: "Order gating takes the whole pair offline.",
      fintech: "The status banner crashes the dashboard.",
    },
    userCopy: "AAPLon is sell-only right now. You can redeem your position; new purchases are paused.",
  },
  {
    id: "solana-jit",
    category: "Chain infrastructure",
    title: "Solana preflight says a valid trade will fail",
    scenario: "GM tokens on Solana mint at execution, so standard preflight sees a missing account and predicts failure. Ondo ships a dedicated simulator.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/addresses" }],
    doc: { label: "ondoprotocol/gm-solana-simulator", url: "https://github.com/ondoprotocol/gm-solana-simulator" },
    fixtures: [
      { label: "GET /v1/assets/AAPLon/addresses → 200 (chains incl. solana-900, illustrative)", body: solanaAddresses },
      { label: "Wallet preflight (simulated, not an Ondo API response)", body: solanaPreflight },
    ],
    naiveAssumption: "If simulateTransaction errors, warn the user.",
    naive: () => {
      const preflight = solanaPreflight as { simulationResult: { err: string } };
      return `Preflight err: "${preflight.simulationResult.err}" → “⚠️ This transaction is likely to fail.” shown before a trade that would have succeeded.`;
    },
    verdict: "wrong",
    correct: ["Route GM-program preflights through gm-solana-simulator; never forward raw simulation verdicts to users."],
    impact: {
      wallet: "Every first-time Solana buyer sees “likely to fail” on a valid trade.",
      exchange: "Valid withdrawals spike the manual review queue.",
      fintech: "Risk checks reject legitimate settlement transactions.",
    },
    userCopy: "This trade mints your AAPLon at execution — simulators may not recognize it. That's expected.",
  },
  {
    id: "solana-user-address",
    category: "Chain infrastructure",
    title: "userAddress is optional in the schema and required on Solana",
    scenario:
      "userAddress is absent from the attestation request\u2019s required array, so generated clients make it optional. On solana-900 it is mandatory, and that appears only in the endpoint\u2019s 400 examples.",
    endpoints: [{ method: "POST", path: "/v1/attestations" }],
    doc: { label: "Error Codes", url: "https://docs.ondo.finance/api-reference/error-codes" },
    fixtures: [
      { label: "POST /v1/attestations (generated client, optional field omitted)", body: solanaAttestationRequest },
      { label: "\u2192 400, on solana-900 only", body: missingUserAddressError },
    ],
    naiveAssumption: "The required array is the contract \u2014 optional fields can be skipped.",
    naive: () => {
      const body = solanaAttestationRequest as Record<string, unknown>;
      return "userAddress" in body
        ? "Attestation requested"
        : "Same request body: 200 on ethereum-1, 200 on bsc-56, 400 MISSING_USER_ADDRESS on solana-900. Nothing in the schema marks the difference.";
    },
    verdict: "wrong",
    correct: [
      "Require userAddress whenever chainId is solana-900; schema-level optionality is not per-chain optionality.",
      "Exercise all three chains in integration tests \u2014 two of them pass with the field missing.",
    ],
    impact: {
      wallet: "Solana support ships broken while the EVM tests stay green.",
      exchange: "The Solana venue 400s on every mint after launch.",
      fintech: "A chain rollout gets reverted for a one-field fix.",
    },
    userCopy: "Connect your Solana wallet to continue.",
  },
  {
    id: "dead-man-switch",
    category: "Perps",
    title: "The dead man's switch example omits the field that arms it",
    scenario:
      "cancelAllOrdersAfterPerps cancels every resting order if the client stops checking in. Its description says timeout_seconds is required. The example subscribe message in the same document does not include it, and the update payload is typed as a bare object, so nothing confirms the switch is armed.",
    endpoints: [{ method: "RPC", path: "WS cancelAllOrdersAfterPerps" }],
    doc: { label: "Ondo Perps WebSocket API", url: "https://docs.ondo.finance/api-reference/ws-spec.json" },
    fixtures: [
      { label: "The spec's own subscribe example — no timeout_seconds", body: deadManSwitchSubscribe },
      { label: "Transport rules the switch depends on", body: wsConnectionRules },
    ],
    naiveAssumption: "Copy the example from the docs and the switch is armed.",
    naive: () => {
      const sent = deadManSwitchSubscribe as Record<string, unknown>;
      return "timeout_seconds" in sent
        ? "Switch armed"
        : `Sent ${JSON.stringify(sent)} — the documented example. timeout_seconds is described as required and is absent here, and the update payload is an untyped object, so nothing tells the client whether the switch took. An unarmed switch leaves every resting order working after the process dies.`;
    },
    verdict: "wrong",
    correct: [
      "Send timeout_seconds explicitly and treat the subscription as unarmed until an update confirms it.",
      "Renew well inside the timeout; the same socket that carries the renewal is the one that dies in the failure you are protecting against.",
      "Decide deliberately what an unarmed switch means for you — orders surviving a crash is a position, not an outage.",
    ],
    impact: {
      wallet: "A crashed client leaves leveraged orders resting with nobody watching.",
      exchange: "Market-making quotes stay live through a deploy that took the quoter down.",
      fintech: "Automated strategies keep working orders after the strategy process is gone.",
    },
    userCopy: "Auto-cancel is active. Orders cancel if we lose connection for more than 60 seconds.",
  },
  {
    id: "batch-partial-failure",
    category: "Perps",
    title: "Batch orders return 200 with the failures inside the body",
    scenario:
      "POST and DELETE on /v1/perps/orders/batch both answer 200 with success: true, then split the outcome into addedOrders/failedOrders and successfulCancels/failedCancels. The HTTP status describes the request, not the orders.",
    endpoints: [
      { method: "POST", path: "/v1/perps/orders/batch" },
      { method: "GET", path: "/v1/markets" },
    ],
    doc: { label: "Ondo Perps REST API", url: "https://docs.ondo.finance/api-reference/rest-spec.json" },
    fixtures: [
      { label: "POST /v1/perps/orders/batch → 200, two of four rejected", body: batchOrderResponse },
      { label: "DELETE /v1/perps/orders/batch → 200, one cancel failed", body: batchCancelResponse },
    ],
    naiveAssumption: "res.ok and success: true mean every order in the batch went through.",
    naive: () => {
      const { addedOrders, failedOrders } = batchOrderResponse.result;
      const submitted = addedOrders.length + failedOrders.length;
      const cancelFailed = batchCancelResponse.result.failedCancels.length;
      return `success: true → “${submitted} orders placed.” ${failedOrders.length} were rejected for ${failedOrders[0].errorCode}, so the book carries ${addedOrders.length}/${submitted} of the intended size. The cancel path is worse: ${cancelFailed} cancel failed, so the client believes it is flat while a filled order stands.`;
    },
    verdict: "wrong",
    correct: [
      "Reconcile every batch against its response arrays; the status code cannot tell you what happened to order three.",
      "Treat a failed cancel as an open position until positions confirm otherwise, not as a retryable error.",
      "errorCode is documented as empty when the failure is not semantic, so branch on the array, not on truthiness.",
    ],
    impact: {
      wallet: "The ladder the user placed is half the size they asked for.",
      exchange: "Quote refreshes silently thin out until inventory is lopsided.",
      fintech: "A flatten-everything routine reports success while leverage stays on.",
    },
    userCopy: "2 of 4 orders were placed. The rest need more margin.",
  },
  {
    id: "order-status-open",
    category: "Perps",
    title: "“open” covers partially filled, and the status enum cannot say so",
    scenario:
      "ApiOrder.status is one of open, fullyfilled, canceled, pending, untriggered. There is no partial state. A half-filled order stays open, and only filledSize records that anything traded.",
    endpoints: [{ method: "POST", path: "/v1/perps/orders" }],
    doc: { label: "Ondo Perps REST API", url: "https://docs.ondo.finance/api-reference/rest-spec.json" },
    fixtures: [{ label: "GET order → 200, status open, a quarter filled", body: partiallyFilledOrder }],
    naiveAssumption: "status open means nothing has traded, so cancelling costs nothing.",
    naive: () => {
      const order = partiallyFilledOrder;
      const remaining = (Number(order.size) - Number(order.filledSize)).toFixed(3);
      return `status: "${order.status}" → cancelled as untouched. ${order.filledSize} of ${order.size} had already traded, so the cancel only removes the ${remaining} remainder and leaves a ${order.filledSize} position the client never recorded opening.`;
    },
    verdict: "wrong",
    correct: [
      "Read filledSize on every order, including ones you are about to cancel; status is not a fill indicator.",
      "Reconcile against positions after cancelling, because the cancel only removes the remainder.",
      "Note the spelling: the status is fullyfilled while the error code is order_already_fully_filled.",
    ],
    impact: {
      wallet: "Users hold a position they believe they cancelled.",
      exchange: "Inventory drifts from the model on every partial fill.",
      fintech: "Risk reports understate exposure by the filled remainder.",
    },
    userCopy: "Cancelled. 5.403 of 20.30 had already filled and is now an open position.",
  },
  {
    id: "untyped-increments",
    category: "Perps",
    title: "Orders must align to increments the spec never types",
    scenario:
      "AddOrderReq requires price aligned with quoteIncrement and size aligned with baseIncrement, both “from /v1/markets”. MarketsResult types tradingPairs as an array of bare objects, so those values exist only in an example. AddOrderReq itself only requires side and market.",
    endpoints: [
      { method: "GET", path: "/v1/markets" },
      { method: "POST", path: "/v1/perps/orders" },
    ],
    doc: { label: "Ondo Perps REST API", url: "https://docs.ondo.finance/api-reference/rest-spec.json" },
    fixtures: [{ label: "The increments, which live only in the example", body: marketsConfig }],
    naiveAssumption: "The generated client types everything I need to build a valid order.",
    naive: () => {
      const pair = marketsConfig.perps.tradingPairs[0];
      return `Order priced at 232.005 on ${pair.market} → rejected. quoteIncrement is ${pair.quoteIncrement}, but tradingPairs is typed as a bare object, so codegen produces unknown and the increment never reaches the rounding code. The request also validates with only side and market set, which is not an order.`;
    },
    verdict: "wrong",
    correct: [
      "Hand-model the market config; the generated type for tradingPairs carries none of the fields you must read.",
      "Round to quoteIncrement and baseIncrement before sending, and re-read on reconnect — increments are per-market.",
      "Do not trust AddOrderReq.required: it lists side and market, while a limit order needs price and size and a market buy may use quoteSize instead.",
    ],
    impact: {
      wallet: "Every order from a price slider is rejected until rounding is added by hand.",
      exchange: "Onboarding a new market fails on the first order rather than at config time.",
      fintech: "Order sizing derived from notional lands off-increment and bounces.",
    },
    userCopy: "Price must be in increments of $0.01.",
  },
  {
    id: "ws-idle-close",
    category: "Perps",
    title: "A quiet market and a dead socket look identical",
    scenario:
      "The socket closes after 180 seconds idle. The client must send {op: ping} and expect {type: pong}; private channels need a login message before subscribing. Nothing about a silent connection distinguishes a calm market from a closed one.",
    endpoints: [{ method: "RPC", path: "WS ordersPerps" }],
    doc: { label: "Ondo Perps WebSocket API", url: "https://docs.ondo.finance/api-reference/ws-spec.json" },
    fixtures: [{ label: "Connection rules, from the spec description", body: wsConnectionRules }],
    naiveAssumption: "Subscribe once and the socket stays up as long as the process does.",
    naive: () => {
      const rules = wsConnectionRules;
      return `Subscribed to ordersPerps, then waited. No ${JSON.stringify(rules.heartbeat.send)} sent, so the server closed the socket at ${rules.idleTimeoutSeconds}s of quiet. Fill notifications stop arriving; no error is raised, and the client cannot tell this from a market with no activity.`;
    },
    verdict: "degraded",
    correct: [
      "Ping on a timer well inside 180s and treat a missing pong as a dead connection, not a quiet one.",
      "Send login before subscribing to any private channel, and re-login on every reconnect before resubscribing.",
      "Respect the documented ceilings: 25 requests per second with a burst of 50, and 32 KB per message.",
      "Reconcile orders and positions over REST after any reconnect — the socket does not replay what you missed.",
    ],
    impact: {
      wallet: "Fill notifications stop and the app shows stale orders indefinitely.",
      exchange: "The order feed dies during exactly the quiet period before a move.",
      fintech: "Position state freezes while the strategy keeps trading against it.",
    },
    userCopy: "Reconnecting to live updates…",
  },
  {
    id: "stream-timestamps",
    category: "Streaming",
    title: "Three timestamp units in one API",
    scenario:
      "REST timestamps are milliseconds. Attestation.expiration is seconds. Every gRPC stream field is uint64 nanoseconds. One shared normalizer produces three different wrong answers.",
    endpoints: [{ method: "RPC", path: "BackendService/StreamPriceUpdates" }],
    doc: { label: "Protobuf Schema", url: "https://docs.ondo.finance/api-reference/protobuf-schema" },
    fixtures: [{ label: "StreamPriceUpdatesResponse frame (nanosecond timestamp)", body: priceUpdateFrame }],
    naiveAssumption: "A timestamp is a timestamp — hand it to new Date().",
    naive: () => {
      const [update] = priceUpdateFrame.updates;
      const asIs = new Date(update.timestamp).toUTCString();
      const normalized = new Date(update.timestamp / 1e6).toUTCString();
      return `new Date(timestamp) on a stream tick → “${asIs}” — the nanosecond value overflows the Date range entirely. Divide by 1e6 and it is ${normalized}.`;
    },
    verdict: "wrong",
    correct: [
      "Normalize at the transport boundary, not at the call site: nanoseconds from gRPC, milliseconds from REST, seconds from attestation expiry.",
      "Prices carry three encodings too — plain decimal strings on REST, 18-decimal integer strings on attestations, human decimals on the depth stream.",
    ],
    impact: {
      wallet: "Every streamed price renders “Invalid Date” next to a correct number.",
      exchange: "Tick ordering and staleness checks silently never fire.",
      fintech: "Time-series storage takes nanoseconds into a milliseconds column.",
    },
    userCopy: "Updated just now.",
  },
  {
    id: "stream-partial-candles",
    category: "Streaming",
    title: "Partial candles reuse one timestamp until is_closed",
    scenario:
      "StreamOHLC revises the current minute on every tick. All partials carry the same bucket timestamp and is_closed marks the final emission. Append instead of upsert and one minute becomes several candles.",
    endpoints: [{ method: "RPC", path: "BackendService/StreamOHLC" }],
    doc: { label: "OHLC Streaming", url: "https://docs.ondo.finance/api-reference/ohlc-streaming" },
    fixtures: [{ label: "Three frames for one minute bucket — the last one closes it", body: ohlcPartials }],
    naiveAssumption: "Each stream message is a new candle.",
    naive: () => {
      const buckets = new Set(ohlcPartials.map((update) => update.timestamp)).size;
      const first = ohlcPartials[0].primary_market;
      const closed = ohlcPartials[ohlcPartials.length - 1].primary_market;
      return `chart.push() per frame → ${ohlcPartials.length} candles drawn for ${buckets} minute. The bar shows a high of ${first.high} instead of ${closed.high}, and every indicator averages over ${ohlcPartials.length}× the bars it should.`;
    },
    verdict: "wrong",
    correct: [
      "Upsert by bucket timestamp; the same timestamp is a revision, never a new bar.",
      "Treat is_closed as the only commit signal — compute indicators off closed buckets.",
    ],
    impact: {
      wallet: "The intraday chart grows extra bars while the user watches it.",
      exchange: "Candle stores accumulate duplicates at one row per tick.",
      fintech: "Moving averages drift because the bar count is wrong.",
    },
    userCopy: "Live — this candle is still forming.",
  },
  {
    id: "stream-reconnect-gap",
    category: "Streaming",
    title: "The stream never backfills, so every reconnect leaves a hole",
    scenario:
      "The stream does not replay history, and the docs pair it with the REST OHLC endpoint for exactly that reason. No heartbeat is documented, so a dropped stream is silent: no error, just no more messages.",
    endpoints: [
      { method: "RPC", path: "BackendService/StreamOHLC" },
      { method: "GET", path: "/v1/assets/{symbol}/prices/ohlc" },
    ],
    doc: { label: "OHLC Streaming", url: "https://docs.ondo.finance/api-reference/ohlc-streaming" },
    fixtures: [{ label: "Last bucket received before the drop", body: ohlcPartials[ohlcPartials.length - 1] }],
    naiveAssumption: "Reconnect and carry on — the stream will catch me up.",
    naive: () => {
      const lastClosed = ohlcPartials[ohlcPartials.length - 1].timestamp / 1e6;
      return `Stream drops after ${new Date(lastClosed).toISOString()}; client reconnects and resumes from the next message. The minutes in between never arrive, nothing throws, and the gap only shows up as missing bars.`;
    },
    verdict: "degraded",
    correct: [
      "Checkpoint the last is_closed bucket. Reconnect with exponential backoff on UNAVAILABLE, and reset the backoff once the connection is accepted.",
      "Refill from the REST OHLC endpoint starting one bucket before the checkpoint, so the refetch overlaps the gap rather than abutting it.",
      "Overlap means duplicates by design — dedupe by bucket timestamp before the data reaches the chart.",
      "Add your own liveness timer; with no documented heartbeat, silence is indistinguishable from a quiet market.",
    ],
    impact: {
      wallet: "Charts develop gaps after every network blip and never heal.",
      exchange: "Candle history diverges between replicas that reconnected at different times.",
      fintech: "Backfill jobs abut the gap instead of covering it, so the hole survives the repair.",
    },
    userCopy: "Reconnecting…",
  },
  {
    id: "depth-ladder",
    category: "Streaming",
    title: "Depth bids are the redeem side, and each level is a marginal price",
    scenario:
      "SoftQuoteDepth labels bids the sell/redeem side and asks the buy/mint side. Each level price is the marginal price for that increment, not a running average. When error is set, both arrays are empty.",
    endpoints: [{ method: "RPC", path: "BackendService/StreamSoftQuoteDepth" }],
    doc: { label: "Soft Quote Depth Streaming", url: "https://docs.ondo.finance/api-reference/soft-quote-depth-streaming" },
    fixtures: [
      { label: "SoftQuoteDepth frame", body: softQuoteDepth },
      { label: "The same message with an asset-level error — bids and asks are empty", body: softQuoteDepthError },
    ],
    naiveAssumption: "Top of book × size is the cost, and an empty ladder means no liquidity.",
    naive: () => {
      const want = 200;
      const flat = Number(softQuoteDepth.asks[0].price) * want;
      const walked = softQuoteDepth.asks.reduce(
        (acc, level) => {
          const take = Math.min(want - acc.filled, Number(level.quantity));
          return { filled: acc.filled + take, cost: acc.cost + take * Number(level.price) };
        },
        { filled: 0, cost: 0 },
      );
      return `Quote for ${want} AAPLon from asks[0] → $${flat.toFixed(2)}. Walking the ladder → $${walked.cost.toFixed(2)}, because each level is marginal. The preview understates the cost by $${(walked.cost - flat).toFixed(2)}.`;
    },
    verdict: "wrong",
    correct: [
      "Walk the ladder and weight by quantity; level price is marginal, not cumulative.",
      "Label the sides by the user's action — bids redeem, asks mint — rather than by exchange habit.",
      "Read error before rendering: an empty book is an asset-level failure, not thin liquidity, and it arrives as a plain string with no enum.",
      "Depth is indicative. The executable number still comes from a soft quote.",
    ],
    impact: {
      wallet: "The cost preview is always optimistic, and the book renders inverted.",
      exchange: "Synthetic depth feeds a router that reads the sides backwards.",
      fintech: "“No liquidity” shows for an asset that is merely paused.",
    },
    userCopy: "Estimated cost for 200 AAPLon: $39,120. Final price locks when you confirm.",
  },
];

export const labEndpointDirectory: { path: string; note: string }[] = [
  { path: "GET /v1/status/market", note: "Venue state and sessions" },
  { path: "GET /v1/status/assets", note: "Restriction events and windows" },
  { path: "GET /v1/assets/{symbol}/market", note: "Market data; nullable underlyingMarket" },
  { path: "GET /v1/assets/{symbol}/prices/latest", note: "Display price, not executable" },
  { path: "GET /v1/assets/{symbol}/prices/ohlc", note: "Historical candles; ten valid interval/range pairs" },
  { path: "GET /v1/assets/{symbol}/shares-multiplier", note: "Shares-per-token history" },
  { path: "GET /v1/assets/{symbol}/dividends", note: "Yield and payouts" },
  { path: "GET /v1/assets/{symbol}/addresses", note: "Token addresses on three chains" },
  { path: "GET /v1/limits/trading", note: "Real-time tradability and caps" },
  { path: "GET /v1/limits/session", note: "Static session maximums" },
  { path: "POST /v1/attestations/soft", note: "Executable quote preview" },
  { path: "POST /v1/attestations", note: "Signed mint/redeem authorization" },
];

/** The streaming surface, which the OpenAPI document does not describe at all. */
export const labStreamDirectory: { path: string; note: string }[] = [
  { path: "RPC BackendService/HealthCheck", note: "Status; the one call that needs no API key" },
  { path: "RPC BackendService/StreamPriceUpdates", note: "Batched price ticks, nanosecond timestamps" },
  { path: "RPC BackendService/StreamOHLC", note: "Minute buckets, partial until is_closed" },
  { path: "RPC BackendService/StreamSoftQuoteDepth", note: "Synthetic ladder; bids redeem, asks mint" },
];

/** Ondo Exchange (Perps). A separate product, a separate spec pair, and no prose docs at all. */
export const labPerpsDirectory: { path: string; note: string }[] = [
  { path: "GET /v1/markets", note: "Increments, min size, leverage — untyped in the schema" },
  { path: "POST /v1/perps/orders", note: "Single order; only side and market are required" },
  { path: "POST /v1/perps/orders/batch", note: "200 with addedOrders and failedOrders" },
  { path: "GET /v1/perps/positions", note: "Open positions and margin" },
  { path: "WS cancelAllOrdersAfterPerps", note: "Dead man's switch; timeout_seconds required" },
  { path: "WS ordersPerps", note: "Private channel; login first, ping inside 180s" },
];

/**
 * The published contract these conditions were read from.
 * `bun run verify:contract` re-checks every structural claim the lab makes
 * against the live spec and fails when one drifts.
 */
export const contractSource = {
  spec: "https://docs.ondo.finance/openapi.json",
  proto: "https://docs.ondo.finance/api-reference/protobuf-schema.md",
  errorCodes: "https://docs.ondo.finance/api-reference/error-codes.md",
  caching: "https://docs.ondo.finance/api-reference/endpoint-caching.md",
  perpsRest: "https://docs.ondo.finance/api-reference/rest-spec.json",
  perpsWs: "https://docs.ondo.finance/api-reference/ws-spec.json",
  title: "GM Backend API",
  version: "1.0.0",
  verifiedAt: "2026-08-19",
} as const;
