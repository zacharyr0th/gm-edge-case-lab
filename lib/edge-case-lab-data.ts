export type IntegrationMode = "wallet" | "exchange" | "fintech";

export type LabVerdict = "crashes" | "wrong" | "degraded";

export type LabEndpoint = { method: "GET" | "POST"; path: string };

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
  timestamp: 1785694800,
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

const futureReasonLimits = {
  timestamp: 1785694800000,
  symbol: "AAPLon",
  side: "buy",
  maxTokens: "0.000000000000000000",
  maxNotionalValue: "0.000000000000000000",
  remainingAttestations: "3",
  isAssetTradingOpen: false,
  reason: {
    code: "CORPORATE_ACTION_PENDING",
    message: "Corporate action pending",
    documentation: "https://docs.ondo.finance/ondo-stocks/corporate-actions",
  },
};

const knownReasonCodes = [
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
    scenario: "Announced change: basket tokens return underlyingMarket: null, with the basket in constituentTokens.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/market" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/assets/EXMPLon/market → 200 (announced shape, illustrative values)", body: compositeMarket }],
    naiveAssumption: "Every token has one underlying stock, so underlyingMarket.ticker is always safe.",
    naive: () => {
      const parsed = compositeMarket as unknown as { underlyingMarket: { ticker: string; name: string } };
      return `${parsed.underlyingMarket.ticker} · ${parsed.underlyingMarket.name}`;
    },
    verdict: "crashes",
    correct: [
      "Treat underlyingMarket as nullable; render constituentTokens as a basket.",
      "Ship before the first basket token launches — the rollout note says null appears only then.",
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
    scenario: "The rollout first adds constituentTokens: [] to every market response. Ondo: parsers must not reject it.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/market" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/assets/AAPLon/market → 200 (after additive rollout)", body: singleStockMarket }],
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
      wallet: "Every market call fails on Ondo's rollout day — with no deploy on your side.",
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
    id: "earnings-limited",
    category: "Corporate actions",
    title: "Asset limited during an earnings window",
    scenario: "Status stays “active” — the restriction is an event: reason ASSET_LIMITED with a start/end window.",
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
    scenario: "Unscheduled events can omit end entirely — only symbol, status, and type are required.",
    endpoints: [{ method: "GET", path: "/v1/status/assets" }],
    doc: { label: "Get Asset Statuses", url: "https://docs.ondo.finance/api-reference/status/get-asset-statuses" },
    fixtures: [{ label: "GET /v1/status/assets → 200 (no `end` field)", body: [unscheduledPauseEvent] }],
    naiveAssumption: "Every event has an end, so always render “resumes at …”.",
    naive: () => {
      const event = unscheduledPauseEvent as unknown as { end: string };
      return `Paused — resumes at ${new Date(event.end).toString()}`;
    },
    verdict: "wrong",
    correct: ["Render a resume time only when end exists; otherwise poll status and notify on resume."],
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
    scenario: "Price endpoints are display-only; execution uses attestation quotes. Even the timestamp units differ (seconds vs milliseconds).",
    endpoints: [
      { method: "GET", path: "/v1/assets/{symbol}/prices/latest" },
      { method: "POST", path: "/v1/attestations/soft" },
    ],
    doc: {
      label: "Get Current Price for an Asset",
      url: "https://docs.ondo.finance/api-reference/assets/get-current-price-for-an-asset",
    },
    fixtures: [
      { label: "GET /v1/assets/AAPLon/prices/latest → 200 (timestamp in seconds)", body: latestPrice },
      { label: "POST /v1/attestations/soft → 200 (price is an 18-decimal integer string)", body: softQuote },
    ],
    naiveAssumption: "The price endpoint is the price, and timestamps are always milliseconds.",
    naive: () => {
      const view = latestPrice as { primaryMarket: { price: string }; timestamp: number };
      return `Trade ticket: “Buy at $${view.primaryMarket.price}” · “as of ${new Date(view.timestamp).toUTCString()}” — display price quoted as executable, seconds read as milliseconds.`;
    },
    verdict: "wrong",
    correct: [
      "Preview with prices/latest, execute on the soft quote — the gap is spread, not an error.",
      "Big-number math for 18-decimal prices; normalize timestamp units per endpoint.",
    ],
    impact: {
      wallet: "The confirm screen never matches the fill.",
      exchange: "Display prices used as an oracle import weekend staleness into risk.",
      fintech: "A “price as of Jan 21, 1970” caption ships.",
    },
    userCopy: "Estimated $195.34 · updated 12s ago. Your final price locks when you confirm.",
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
    scenario: "Eight reason codes exist today; the contract grows. (CORPORATE_ACTION_PENDING below is hypothetical.)",
    endpoints: [{ method: "GET", path: "/v1/limits/trading" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/limits/trading → 200 (hypothetical future code)", body: futureReasonLimits }],
    naiveAssumption: "The enum is final — exhaustive switch with a throwing default.",
    naive: () => {
      const { code } = (futureReasonLimits as { reason: { code: string } }).reason;
      if (!knownReasonCodes.includes(code)) {
        throw new Error(`Unhandled TradingLimitsReasonCode: "${code}"`);
      }
      return "Reason rendered";
    },
    verdict: "crashes",
    correct: [
      "Special-case known codes; for unknown ones fall back to the guaranteed message + documentation link, and log for triage.",
    ],
    impact: {
      wallet: "The trade screen crashes on the first new restriction type.",
      exchange: "Order gating takes the whole pair offline.",
      fintech: "The status banner crashes the dashboard.",
    },
    userCopy: "Trading paused: corporate action pending. Learn more → (the server's own message)",
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
];

export const labEndpointDirectory: { path: string; note: string }[] = [
  { path: "GET /v1/status/market", note: "Venue state and sessions" },
  { path: "GET /v1/status/assets", note: "Restriction events and windows" },
  { path: "GET /v1/assets/{symbol}/market", note: "Market data; nullable underlyingMarket" },
  { path: "GET /v1/assets/{symbol}/prices/latest", note: "Display price (seconds timestamps)" },
  { path: "GET /v1/assets/{symbol}/shares-multiplier", note: "Shares-per-token history" },
  { path: "GET /v1/assets/{symbol}/dividends", note: "Yield and payouts" },
  { path: "GET /v1/assets/{symbol}/addresses", note: "Token addresses on three chains" },
  { path: "GET /v1/limits/trading", note: "Real-time tradability and caps" },
  { path: "GET /v1/limits/session", note: "Static session maximums" },
  { path: "POST /v1/attestations/soft", note: "Executable quote preview" },
  { path: "POST /v1/attestations", note: "Signed mint/redeem authorization" },
];
