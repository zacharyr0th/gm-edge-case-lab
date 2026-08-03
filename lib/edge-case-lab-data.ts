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
    scenario:
      "Ondo has announced that tokens representing several underlying assets return underlyingMarket: null with the basket listed in constituentTokens.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/market" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/assets/EXMPLon/market → 200 (announced shape, illustrative values)", body: compositeMarket }],
    naiveAssumption: "Every token has exactly one underlying stock, so underlyingMarket.ticker is always safe to read.",
    naive: () => {
      const parsed = compositeMarket as unknown as { underlyingMarket: { ticker: string; name: string } };
      return `${parsed.underlyingMarket.ticker} · ${parsed.underlyingMarket.name}`;
    },
    verdict: "crashes",
    correct: [
      "Treat underlyingMarket as nullable now — Ondo's rollout note says the null case appears only once basket products launch, so the fix ships before the first crash.",
      "When underlyingMarket is null, render constituentTokens as a basket and resolve each symbol through the same market endpoint.",
      "Add the basket case to contract tests so the first multi-asset listing is a product moment, not an incident.",
    ],
    impact: {
      wallet: "The token detail screen throws on first render of the first basket product — a white screen on launch day.",
      exchange: "The listing pipeline rejects the new asset and users see “Unknown asset” while competitors list it.",
      fintech: "Portfolio rows render a blank ticker and the sync job dies mid-run, leaving stale balances.",
    },
    userCopy: "EXMPL is a basket of AAPLon, MSFTon, and NVDAon. Tap any constituent to see its market.",
  },
  {
    id: "strict-parser",
    category: "Schema evolution",
    title: "Strict parsers reject the new constituentTokens field",
    scenario:
      "Rollout starts by adding constituentTokens: [] to every market response. Ondo explicitly warns that parsers must not reject responses that include it.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/market" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/assets/AAPLon/market → 200 (after additive rollout)", body: singleStockMarket }],
    naiveAssumption: "The response schema is closed, so validation should fail on any field we did not model.",
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
      "Parse tolerantly: unknown fields are ignored and logged, missing required fields alert.",
      "Pin contract tests to the documented required set, not to an exhaustive field list.",
      "This is the cheap fix — it turns every future additive change into a non-event.",
    ],
    impact: {
      wallet: "Every market call in the app fails simultaneously on Ondo's rollout day, with no code deployed on your side.",
      exchange: "Market-data ingestion halts across all Ondo listings at once; alerting reads like an Ondo outage.",
      fintech: "The nightly sync marks every Ondo asset invalid and downstream statements go out without them.",
    },
    userCopy: "No user-facing copy needed — handled correctly, this rollout is invisible.",
  },
  {
    id: "session-mismatch",
    category: "Market state",
    title: "Market is open, but this asset isn't tradable this session",
    scenario:
      "The overnight session is live, yet the specific asset does not trade overnight. Tradability is per-asset (tradableSessions), and limits return ASSET_CLOSED_FOR_SESSION.",
    endpoints: [
      { method: "GET", path: "/v1/status/market" },
      { method: "GET", path: "/v1/limits/trading" },
    ],
    doc: { label: "Get Trading Limits", url: "https://docs.ondo.finance/api-reference/limits/get-trading-limits" },
    fixtures: [
      { label: "GET /v1/status/market → 200", body: overnightMarketStatus },
      { label: "GET /v1/limits/trading?symbol=KOon&side=buy → 200 (illustrative)", body: overnightLimits },
    ],
    naiveAssumption: "status/market says isOpen: true, and one global flag is enough to enable the Buy button.",
    naive: () => {
      const market = overnightMarketStatus as { isOpen: boolean; marketStatus: string };
      return market.isOpen
        ? `isOpen: true → Buy enabled for KOon in the ${market.marketStatus} session. The order fails at attestation with ASSET_CLOSED_FOR_SESSION.`
        : "Buy disabled";
    },
    verdict: "wrong",
    correct: [
      "Treat /v1/limits/trading as the authority for “can this user trade this asset right now” — isAssetTradingOpen plus reason.",
      "Read per-asset tradableSessions from the market response instead of assuming one global calendar.",
      "Disable the action with the session explanation before the user commits, not after the failed transaction.",
    ],
    impact: {
      wallet: "Users sign a transaction that predictably fails — the worst kind of wallet error, because it costs trust and gas.",
      exchange: "Order tickets accepted at the UI layer bounce at execution, inflating support volume every evening.",
      fintech: "Scheduled buys queued overnight silently fail and users find out days later.",
    },
    userCopy: "KO trades 4:00 AM – 8:00 PM ET. Overnight trading isn't available for this stock — the next window opens at 4:00 AM ET.",
  },
  {
    id: "weekend-offhours",
    category: "Market state",
    title: "Weekend: equities closed, but the off-hours venue is open",
    scenario:
      "On a weekend, top-level isOpen is false — while the required offhours object reports its own venue open with its own window. The response has two venues in it.",
    endpoints: [{ method: "GET", path: "/v1/status/market" }],
    doc: { label: "Get Current Market Status", url: "https://docs.ondo.finance/api-reference/status/get-current-market-status" },
    fixtures: [{ label: "GET /v1/status/market → 200 (Sunday)", body: weekendMarketStatus }],
    naiveAssumption: "isOpen: false means nothing is tradable, so show the classic “come back Monday” state.",
    naive: () => {
      const market = weekendMarketStatus as { isOpen: boolean };
      return market.isOpen
        ? "Trading enabled"
        : "isOpen: false → “Markets are closed. Come back Monday at 9:30 AM ET.” The offhours.isOpen: true field is never read.";
    },
    verdict: "wrong",
    correct: [
      "Model off-hours as a distinct venue with its own isOpen / nextOpen / nextClose — the schema marks the offhours object required for a reason.",
      "On weekends, surface off-hours availability with its limits instead of hiding the product's differentiator.",
      "Expect tighter size caps out here (see the off-hours exposure check below): hedging is constrained while the underlying market is closed.",
    ],
    impact: {
      wallet: "The wallet tells users the market is closed while Ondo is actually quoting — the one weekend feature goes unshipped.",
      exchange: "Weekend flow routes to competitors that read the offhours block correctly.",
      fintech: "Recurring weekend investments error out instead of executing through the available venue.",
    },
    userCopy: "U.S. markets are closed, but AAPLon still trades through off-hours liquidity. Size limits are tighter until markets reopen Monday 9:30 AM ET.",
  },
  {
    id: "earnings-limited",
    category: "Corporate actions",
    title: "Asset limited during an earnings window",
    scenario:
      "Asset status stays “active” — the restriction arrives as a scheduled event with reason ASSET_LIMITED and a start/end window. Ondo's docs name earnings announcements as a standard cause.",
    endpoints: [{ method: "GET", path: "/v1/status/assets" }],
    doc: { label: "Get Asset Statuses", url: "https://docs.ondo.finance/api-reference/status/get-asset-statuses" },
    fixtures: [{ label: "GET /v1/status/assets → 200 (one event, illustrative)", body: [earningsStatusEvent] }],
    naiveAssumption: "status: \"active\" means fully tradable; the reason, start, and end fields are metadata we can skip.",
    naive: () => {
      const event = earningsStatusEvent as { status: string; symbol: string };
      return event.status === "active"
        ? `status: "active" → ${event.symbol} rendered fully tradable, no badge, during its earnings window. Attestations start failing at 20:00Z with no explanation on screen.`
        : "Restriction shown";
    },
    verdict: "wrong",
    correct: [
      "Read status rows as restriction events: reason.code + window, keyed by eventId — not as a single tradable/untradable flag.",
      "Distinguish ASSET_LIMITED (reduced) from ASSET_PAUSED (halted) from delisted — three different UX states.",
      "Scheduled events are known in advance: announce the window in the UI before it starts.",
    ],
    impact: {
      wallet: "Trades fail during the highest-attention hours of the quarter — right when the user is watching the stock.",
      exchange: "Market-making and user orders hit limits with generic errors during earnings, the peak-volume window.",
      fintech: "Price-triggered automations fire into a limited market and fail silently.",
    },
    userCopy: "Trading in TSLAon is limited today 4:00 – 8:30 PM ET around Tesla's earnings report. You can still hold, view prices, and queue orders.",
  },
  {
    id: "pause-no-end",
    category: "Corporate actions",
    title: "Unscheduled pause with no end time",
    scenario:
      "Unscheduled events may omit end entirely — the contract only requires symbol, status, and type. A pause can have no known resume time.",
    endpoints: [{ method: "GET", path: "/v1/status/assets" }],
    doc: { label: "Get Asset Statuses", url: "https://docs.ondo.finance/api-reference/status/get-asset-statuses" },
    fixtures: [{ label: "GET /v1/status/assets → 200 (no `end` field)", body: [unscheduledPauseEvent] }],
    naiveAssumption: "Every event has an end timestamp, so we can always render “resumes at …”.",
    naive: () => {
      const event = unscheduledPauseEvent as unknown as { end: string };
      return `Paused — resumes at ${new Date(event.end).toString()}`;
    },
    verdict: "wrong",
    correct: [
      "Treat end as optional; only render a resume time when the field exists.",
      "For open-ended pauses, poll /v1/status/assets and notify on resume instead of promising a time you don't have.",
      "Reassure on the part you do know: balances are unaffected, the pause is operational.",
    ],
    impact: {
      wallet: "“Resumes at Invalid Date” ships to production — screenshot material that erodes trust in every number you show.",
      exchange: "Status pages display garbage timestamps during an incident, exactly when users scrutinize them most.",
      fintech: "Notification jobs schedule against NaN and either spam immediately or never fire.",
    },
    userCopy: "AAPLon trading is temporarily paused for maintenance. Your balance is unaffected — we'll notify you the moment trading resumes.",
  },
  {
    id: "dividend-multiplier",
    category: "Corporate actions",
    title: "Dividend event changes the shares multiplier",
    scenario:
      "A scheduled event carries updateSharesMultiplier: true. Dividends accrue into the token via the multiplier — token count stays the same while each token represents more shares.",
    endpoints: [
      { method: "GET", path: "/v1/status/assets" },
      { method: "GET", path: "/v1/assets/{symbol}/shares-multiplier" },
    ],
    doc: { label: "Corporate Actions", url: "https://docs.ondo.finance/ondo-stocks/corporate-actions" },
    fixtures: [
      { label: "GET /v1/status/assets → 200 (updateSharesMultiplier: true)", body: [dividendStatusEvent] },
      { label: "GET /v1/assets/AAPLon/shares-multiplier → 200 (after the event, illustrative)", body: multiplierHistory },
    ],
    naiveAssumption: "One token equals one share forever, so shares-per-token can be cached at listing time.",
    naive: () => {
      const cachedMultiplier = 1;
      const tokens = 10;
      return `Balance: ${tokens} AAPLon = ${(tokens * cachedMultiplier).toFixed(3)} AAPL shares — stale. After the event each token represents 1.0132 shares, so the true figure is ${(tokens * 1.0132).toFixed(3)}.`;
    },
    verdict: "wrong",
    correct: [
      "Subscribe to updateSharesMultiplier events and refetch the multiplier history after the window ends.",
      "Display share-equivalents and cost basis through the current multiplier, never a cached constant.",
      "Explain the jump to users — an unexplained balance-value change reads as a bug or a hack.",
    ],
    impact: {
      wallet: "Balances “jump” after dividend events with no explanation, or worse, keep showing the stale share count.",
      exchange: "Index and NAV calculations drift from truth on every dividend across every tokenized equity you list.",
      fintech: "Statements and tax lots are computed on the wrong share count — a books-and-records problem, not a UI bug.",
    },
    userCopy: "AAPL paid a dividend. Your AAPLon now represents more AAPL shares (multiplier 1.0000 → 1.0132) — the value accrued into your token instead of a cash payout.",
  },
  {
    id: "display-vs-executable",
    category: "Prices & quotes",
    title: "Display price is not the executable price",
    scenario:
      "Ondo says the price endpoints are display-only and must not be used as an oracle. Executable pricing comes from attestation quotes — and the two endpoints even use different timestamp units (seconds vs milliseconds).",
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
    naiveAssumption: "The price endpoint is the price. Bind it to the trade ticket, and timestamps are always milliseconds.",
    naive: () => {
      const view = latestPrice as { primaryMarket: { price: string }; timestamp: number };
      return `Trade ticket: “Buy at $${view.primaryMarket.price}” · “as of ${new Date(view.timestamp).toUTCString()}” — the display price was quoted as executable, and the seconds timestamp was read as milliseconds.`;
    },
    verdict: "wrong",
    correct: [
      "Preview with the display price, execute on the soft-attestation quote — and reconcile the difference as expected spread, not an error.",
      "Parse the quote price as an 18-decimal integer string with big-number math; parseFloat loses precision exactly where money is involved.",
      "Normalize timestamp units per endpoint: prices/latest returns seconds, limits and market data return milliseconds.",
    ],
    impact: {
      wallet: "The confirm screen shows one price and the fill comes back different every single time — users call it slippage you can't explain.",
      exchange: "Display prices used as an oracle for collateral or liquidations import weekend staleness straight into risk decisions.",
      fintech: "A “price as of Jan 21, 1970” caption ships because seconds were parsed as milliseconds.",
    },
    userCopy: "Estimated price $195.34 · updated 12s ago. Your final price locks when you confirm the quote.",
  },
  {
    id: "offhours-exposure",
    category: "Limits & quotes",
    title: "Off-hours exposure limit reached",
    scenario:
      "During off-hours the venue caps exposure — hedging is constrained while the underlying market is closed. Limits return isAssetTradingOpen: false with OFFHOURS_EXPOSURE_LIMIT_REACHED.",
    endpoints: [{ method: "GET", path: "/v1/limits/trading" }],
    doc: { label: "Get Trading Limits", url: "https://docs.ondo.finance/api-reference/limits/get-trading-limits" },
    fixtures: [{ label: "GET /v1/limits/trading?symbol=AAPLon&side=buy → 200", body: offhoursExposureLimits }],
    naiveAssumption: "Trades either work or fail; a failed submit gets a generic “try again” toast.",
    naive: () => {
      const limits = offhoursExposureLimits as { isAssetTradingOpen: boolean; reason: { message: string } };
      return limits.isAssetTradingOpen
        ? "Order accepted"
        : `Toast: “Trade failed. Please try again.” — reason.message (“${limits.reason.message}”) is never surfaced, and retrying is exactly what won't help.`;
    },
    verdict: "degraded",
    correct: [
      "Pre-check /v1/limits/trading before enabling the ticket; show remaining capacity from maxTokens / maxNotionalValue.",
      "Explain the cap honestly — size limits protect pricing while hedging is constrained — and offer the next window.",
      "Distinguish “retry won't help” reasons (exposure caps) from transient ones; only the latter deserve a retry button.",
    ],
    impact: {
      wallet: "Users retry a capped trade into repeated failures on a Sunday and conclude the product is broken.",
      exchange: "Weekend inventory limits surface as generic errors, so flow keeps hammering an intentionally closed door.",
      fintech: "Automated orders retry against a hard cap, burning rate limit budget and filling error logs all weekend.",
    },
    userCopy: "Off-hours buying for AAPLon is at capacity right now. You can trade when U.S. markets reopen Monday 4:00 AM ET, or set an alert for when capacity frees up.",
  },
  {
    id: "attestation-budget",
    category: "Limits & quotes",
    title: "Attestation budget exhausted by treating quotes as a price feed",
    scenario:
      "Quotes are a metered execution resource: limits expose remainingAttestations, and over-polling ends in MAX_ATTESTATIONS and 429 RATE_LIMITED.",
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
    naiveAssumption: "Soft quotes are free, so refresh one on every price tick to keep the preview accurate.",
    naive: () =>
      `429 RATE_LIMITED → retry() → 429 → retry() → 429 … The spinner never resolves; remainingAttestations ("0") was available the whole time and never checked.`,
    verdict: "degraded",
    correct: [
      "Drive the live preview from prices/latest; request a soft quote only when the user reaches the confirm step.",
      "Track remainingAttestations and degrade gracefully before hitting zero, not after.",
      "Back off on 429 with a visible state — an honest “quote limit reached” beats an infinite spinner.",
    ],
    impact: {
      wallet: "The trade screen burns the session's quote budget on ambient refreshes, then can't quote the one trade that mattered.",
      exchange: "Per-user attestation budgets exhaust during volatility spikes — peak demand becomes peak failure.",
      fintech: "Background jobs poll quotes for display, get rate limited, and block interactive users behind batch traffic.",
    },
    userCopy: "Quote limit reached for this session. Your price preview stays live — you can request a fresh executable quote in a moment.",
  },
  {
    id: "unknown-reason",
    category: "Schema evolution",
    title: "A reason code your switch statement has never seen",
    scenario:
      "Today's contract has eight TradingLimitsReasonCode values. Ondo's upcoming-changes page proves the contract grows — a ninth code will arrive eventually. (CORPORATE_ACTION_PENDING below is hypothetical.)",
    endpoints: [{ method: "GET", path: "/v1/limits/trading" }],
    doc: { label: "Upcoming API changes", url: "https://docs.ondo.finance/api-reference/upcoming-changes" },
    fixtures: [{ label: "GET /v1/limits/trading → 200 (hypothetical future code)", body: futureReasonLimits }],
    naiveAssumption: "The reason-code enum is final, so an exhaustive switch with a throwing default is safe.",
    naive: () => {
      const { code } = (futureReasonLimits as { reason: { code: string } }).reason;
      if (!knownReasonCodes.includes(code)) {
        throw new Error(`Unhandled TradingLimitsReasonCode: "${code}"`);
      }
      return "Reason rendered";
    },
    verdict: "crashes",
    correct: [
      "Every reason carries message and documentation — that's the guaranteed fallback for codes you don't recognize.",
      "Special-case the codes you know; render the server's message with its documentation link for the ones you don't.",
      "Log unknown codes for triage so new states become roadmap items instead of incidents.",
    ],
    impact: {
      wallet: "The trade screen crashes on the first new restriction type Ondo ships, months after your last deploy.",
      exchange: "Order gating throws on an unrecognized code and takes the whole trading pair offline.",
      fintech: "The status banner component crashes the dashboard for every user holding the affected asset.",
    },
    userCopy: "Trading for AAPLon is paused: corporate action pending. Learn more → (rendered from the server's own message and documentation link)",
  },
  {
    id: "solana-jit",
    category: "Chain infrastructure",
    title: "Solana preflight says a valid trade will fail",
    scenario:
      "GM tokens on Solana mint just-in-time at execution. A standard simulateTransaction preflight sees a token account that doesn't exist yet and reports failure — Ondo ships a dedicated simulator for exactly this.",
    endpoints: [{ method: "GET", path: "/v1/assets/{symbol}/addresses" }],
    doc: { label: "ondoprotocol/gm-solana-simulator", url: "https://github.com/ondoprotocol/gm-solana-simulator" },
    fixtures: [
      { label: "GET /v1/assets/AAPLon/addresses → 200 (chains incl. solana-900, illustrative)", body: solanaAddresses },
      { label: "Wallet preflight (simulated, not an Ondo API response)", body: solanaPreflight },
    ],
    naiveAssumption: "If simulateTransaction errors, warn the user the transaction is likely to fail.",
    naive: () => {
      const preflight = solanaPreflight as { simulationResult: { err: string } };
      return `Preflight err: "${preflight.simulationResult.err}" → “⚠️ This transaction is likely to fail.” shown before a trade that would have succeeded.`;
    },
    verdict: "wrong",
    correct: [
      "Detect GM-program transactions and route preflight through Ondo's gm-solana-simulator instead of a raw simulateTransaction.",
      "Never show a scary failure warning off a preflight pattern the issuer has documented as expected.",
      "Same lesson at the API layer: simulation output is data to interpret, not a verdict to forward to users.",
    ],
    impact: {
      wallet: "Every first-time Solana buyer sees a likely-to-fail warning on a valid trade — most of them stop right there.",
      exchange: "Withdrawal and transfer flows to Solana flag valid transactions, spiking manual review queues.",
      fintech: "If you settle on Solana, risk checks built on raw simulation reject legitimate settlement transactions.",
    },
    userCopy: "This trade mints your AAPLon at execution, so wallet simulators may not recognize it in advance. It's expected behavior for Ondo Stocks on Solana.",
  },
];

export const labEndpointDirectory: { path: string; note: string }[] = [
  { path: "GET /v1/status/market", note: "Market + off-hours venue state, session, next open/close" },
  { path: "GET /v1/status/assets", note: "Per-asset restriction events: reason, window, multiplier flag" },
  { path: "GET /v1/assets/{symbol}/market", note: "Market data; where underlyingMarket becomes nullable" },
  { path: "GET /v1/assets/{symbol}/prices/latest", note: "Display price — explicitly not an oracle; timestamp in seconds" },
  { path: "GET /v1/assets/{symbol}/shares-multiplier", note: "Shares-per-token history after corporate actions" },
  { path: "GET /v1/assets/{symbol}/dividends", note: "Yield, payout frequency, last payment" },
  { path: "GET /v1/assets/{symbol}/addresses", note: "Token addresses across ethereum-1, bsc-56, solana-900" },
  { path: "GET /v1/limits/trading", note: "Real-time tradability: isAssetTradingOpen, caps, reason codes" },
  { path: "GET /v1/limits/session", note: "Static per-session maximums for planning UIs" },
  { path: "POST /v1/attestations/soft", note: "Executable quote preview without creating an attestation" },
  { path: "POST /v1/attestations", note: "Signed mint/redeem authorization, short or long duration" },
];
