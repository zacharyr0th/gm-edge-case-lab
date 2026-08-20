/**
 * Re-checks the lab's structural claims against Ondo's live OpenAPI spec.
 *
 * Every condition in the matrix asserts something about the contract: that a
 * field is nullable, that another is absent from `required`, that an enum has
 * exactly these members. Those claims are the whole value of the artifact, and
 * they rot silently when the spec moves. This turns that into a failing check.
 *
 *   bun run verify:contract
 */
import { writeFileSync } from "node:fs";
import {
  contractSource,
  knownReasonCodes,
  labChecks,
  documentedCodesOutsideTheEnum,
  labEndpointDirectory,
  labStreamDirectory,
  ohlcIntervals,
  ohlcPairsPerErrorMessage,
  ohlcRanges,
  ohlcValidPairs,
} from "../lib/edge-case-lab-data";

type Json = Record<string, any>;

const failures: string[] = [];
const notes: string[] = [];
let checksRun = 0;

function check(claim: string, ok: boolean, detail?: string) {
  checksRun += 1;
  if (ok) {
    console.log(`  ok    ${claim}`);
  } else {
    failures.push(detail ? `${claim} — ${detail}` : claim);
    console.log(`  FAIL  ${claim}${detail ? ` — ${detail}` : ""}`);
  }
}

const spec: Json = await fetch(contractSource.spec).then((r) => {
  if (!r.ok) throw new Error(`${contractSource.spec} returned ${r.status}`);
  return r.json();
});

const schemas: Json = spec.components?.schemas ?? {};

/** The streaming surface and the error catalogue are published as prose, so they are fetched as text. */
const [proto, errorDoc, cachingDoc] = await Promise.all(
  [contractSource.proto, contractSource.errorCodes, contractSource.caching].map((url) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${url} returned ${r.status}`);
      return r.text();
    }),
  ),
);

function deref(node: Json | undefined, depth = 0): Json {
  if (!node || depth > 8) return node ?? {};
  if (node.$ref) return deref(schemas[String(node.$ref).split("/").pop()!], depth + 1);
  return node;
}

/** Flattens allOf/anyOf/oneOf so a claim about a field does not depend on how the spec composes it. */
function properties(node: Json | undefined, depth = 0): Json {
  const s = deref(node, depth);
  const out: Json = {};
  for (const key of ["allOf", "anyOf", "oneOf"] as const) {
    for (const sub of s[key] ?? []) Object.assign(out, properties(sub, depth + 1));
  }
  return Object.assign(out, s.properties ?? {});
}

function responseSchema(path: string, method = "get"): Json {
  const json = spec.paths?.[path]?.[method]?.responses?.["200"]?.content?.["application/json"]?.schema;
  const s = deref(json);
  return s.type === "array" ? deref(s.items) : s;
}

console.log(`\n${contractSource.title} — ${contractSource.spec}`);
console.log(`spec version: ${spec.info?.version} (lab recorded ${contractSource.version})\n`);

if (spec.info?.version !== contractSource.version) {
  notes.push(`spec version moved to ${spec.info?.version}; lab records ${contractSource.version}`);
}

console.log("Endpoints referenced by the matrix");
const specPaths = new Set(Object.keys(spec.paths ?? {}));
for (const entry of labEndpointDirectory) {
  const [method, path] = entry.path.split(" ");
  const present = specPaths.has(path) && Boolean(spec.paths[path][method.toLowerCase()]);
  check(entry.path, present, present ? undefined : "not in live spec");
}
for (const condition of labChecks) {
  for (const endpoint of condition.endpoints) {
    if (endpoint.method === "RPC") {
      if (!proto.includes(endpoint.path.split("/").pop()!)) {
        check(`${condition.id} → ${endpoint.path}`, false, "not in the published .proto");
      }
      continue;
    }
    const present = Boolean(spec.paths?.[endpoint.path]?.[endpoint.method.toLowerCase()]);
    if (!present) check(`${condition.id} → ${endpoint.method} ${endpoint.path}`, false, "not in live spec");
  }
}

console.log("\nStreaming RPCs referenced by the matrix");
for (const entry of labStreamDirectory) {
  const rpc = entry.path.replace("RPC BackendService/", "");
  check(entry.path, new RegExp(`rpc\\s+${rpc}\\b`).test(proto), "not declared in the published .proto");
}

const directoryChecks = checksRun;

console.log("\nStructural claims");

const market = responseSchema("/v1/assets/{symbol}/market");
const marketProps = properties(market);
check(
  "null-underlying: underlyingMarket is nullable",
  deref(marketProps.underlyingMarket).nullable === true,
  "spec no longer marks underlyingMarket nullable",
);
check("null-underlying: constituentTokens exists", "constituentTokens" in marketProps);
check(
  "strict-parser: constituentTokens is required, so closed parsers break today",
  (market.required ?? []).includes("constituentTokens"),
  "constituentTokens is no longer required — condition 02 should say 'additive' again",
);

const limits = responseSchema("/v1/limits/trading");
const limitsCodes: string[] = deref(properties(properties(limits).reason).code).enum ?? [];
check(
  `unknown-reason: knownReasonCodes matches the spec enum (${limitsCodes.length})`,
  limitsCodes.length === knownReasonCodes.length && limitsCodes.every((c) => knownReasonCodes.includes(c)),
  `spec=[${limitsCodes.join(", ")}] lab=[${knownReasonCodes.join(", ")}]`,
);
check("session-mismatch: isAssetTradingOpen is required", (limits.required ?? []).includes("isAssetTradingOpen"));

const assetStatus = responseSchema("/v1/status/assets");
const assetStatusProps = properties(assetStatus);
check(
  "pause-no-end: `end` is absent from required",
  !(assetStatus.required ?? []).includes("end") && "end" in assetStatusProps,
  "the spec now requires `end`, so the unscheduled-pause condition no longer holds",
);
check(
  "pause-no-end: the required set is exactly symbol, status, and type, so reason is optional too",
  [...(assetStatus.required ?? [])].sort().join(",") === "status,symbol,type",
  `required=[${(assetStatus.required ?? []).join(", ")}]`,
);
check("dividend-multiplier: updateSharesMultiplier exists", "updateSharesMultiplier" in assetStatusProps);

const marketStatus = responseSchema("/v1/status/market");
check(
  "weekend-offhours: offhours is required",
  (marketStatus.required ?? []).includes("offhours"),
  "offhours is no longer required",
);
const statuses: string[] = deref(properties(marketStatus).marketStatus).enum ?? [];
check("weekend-offhours: marketStatus includes 'offhours'", statuses.includes("offhours"), `enum=[${statuses.join(", ")}]`);

const soft = responseSchema("/v1/attestations/soft", "post");
check("display-vs-executable: soft quote returns its own price", "price" in properties(soft));

const priceTimestamp = deref(properties(responseSchema("/v1/assets/{symbol}/prices/latest")).timestamp);
check(
  "display-vs-executable: AssetPrice.timestamp is documented in milliseconds",
  /millisecond/i.test(String(priceTimestamp.description ?? "")),
  "the description no longer says milliseconds",
);
check(
  "display-vs-executable: its example is still the 10-digit seconds value the condition calls out",
  String(priceTimestamp.example ?? "").length === 10,
  `example=${priceTimestamp.example} — the spec example was corrected; drop the caveat from condition 08`,
);

check(
  "session-mismatch: tradableSessions is on primaryMarket",
  "tradableSessions" in properties(properties(market).primaryMarket),
);

const attestation = deref(schemas.Attestation);
const attestationProps = properties(attestation);
const requestSide: string[] = deref(schemas.SideEnum).enum ?? [];
const responseSide: string[] = deref(attestationProps.side).enum ?? [];
check(
  "attestation-replay: the response encodes side as digits while requests take words",
  responseSide.join(",") === "0,1" && requestSide.join(",") === "buy,sell",
  `response=[${responseSide.join(", ")}] request=[${requestSide.join(", ")}]`,
);
check(
  "attestation-replay: the response chainId is not a GMChains value",
  !("enum" in deref(attestationProps.chainId)),
  "chainId is now enumerated, so the response may be replayable",
);
check(
  "attestation-replay: expiration still states no unit",
  !/millisecond|second/i.test(String(deref(attestationProps.expiration).description ?? "")),
  "expiration now documents its unit — say so in the condition instead of inferring it",
);

const attestationRequest = deref(schemas.AttestationByTokenAmountRequest);
check(
  "solana-user-address: userAddress exists and is absent from required",
  "userAddress" in properties(attestationRequest) &&
    !(attestationRequest.required ?? []).includes("userAddress"),
  "userAddress moved into required, so generated clients now surface it",
);
const attestation400 = Object.keys(
  spec.paths?.["/v1/attestations"]?.post?.responses?.["400"]?.content?.["application/json"]?.examples ?? {},
);
check(
  "solana-user-address: the 400 examples still document the Solana requirement",
  attestation400.includes("missing_user_address"),
  `examples=[${attestation400.join(", ")}]`,
);

const ohlcParams: Json[] = spec.paths?.["/v1/assets/{symbol}/prices/ohlc"]?.get?.parameters ?? [];
const ohlcRequired = ohlcParams.filter((param) => param.required).map((param) => param.name);
check(
  "ohlc-pairs: interval and range are both required",
  ohlcRequired.includes("interval") && ohlcRequired.includes("range"),
  `required=[${ohlcRequired.join(", ")}]`,
);
const specIntervals: string[] = deref(schemas.IntervalEnum).enum ?? [];
const specRanges: string[] = deref(schemas.RangeEnum).enum ?? [];
check(
  `ohlc-pairs: ${specIntervals.length} intervals × ${specRanges.length} ranges = ${specIntervals.length * specRanges.length} combinations, ${ohlcValidPairs.length} supported`,
  specIntervals.join(",") === ohlcIntervals.join(",") && specRanges.join(",") === ohlcRanges.join(","),
  `spec intervals=[${specIntervals.join(", ")}] ranges=[${specRanges.join(", ")}]`,
);

check(
  "attestation-budget: remainingAttestations is required",
  (limits.required ?? []).includes("remainingAttestations"),
);
check(
  "attestation-budget: the soft-quote endpoint still documents 429",
  Boolean(spec.paths?.["/v1/attestations/soft"]?.post?.responses?.["429"]),
);

console.log("\nSpec defects the lab reports (each check fails once Ondo fixes it)");

const sessionContent: Json =
  spec.paths?.["/v1/limits/session"]?.get?.responses?.["200"]?.content?.["application/json"] ?? {};
check(
  "/v1/limits/session declares an object and shows an array",
  deref(sessionContent.schema).type === "object" && Array.isArray(sessionContent.example),
  "the schema and its example now agree — drop this from the note",
);

const metadataExample: Json =
  spec.paths?.["/v1/assets/all/metadata"]?.get?.responses?.["200"]?.content?.["application/json"]?.example?.[0] ?? {};
const metadataProps = properties(schemas.MetadataEntry);
check(
  "the metadata example spells coinmarketCapId, the schema spells coinmarketcapId",
  "coinmarketcapId" in metadataProps && "coinmarketCapId" in metadataExample,
  "the casing now matches — drop this from the note",
);
check(
  "assetClass is 'equities' in the schema example and 'Equities' in the endpoint example",
  deref(properties(metadataProps.tags).assetClass).example === "equities" &&
    metadataExample.tags?.assetClass === "Equities",
  "the examples now agree — drop this from the note",
);

const paginationRefs = JSON.stringify(spec).split('"#/components/schemas/Pagination"').length - 1;
check(
  "the Pagination schema is defined and referenced by no endpoint",
  "Pagination" in schemas && paginationRefs === 0,
  `Pagination is now referenced ${paginationRefs} time(s) — drop this from the note`,
);
const balanceParams: Json[] = spec.paths?.["/v1/chains/{chainId}/balances"]?.get?.parameters ?? [];
check(
  "chain balances takes no required filter, so an unfiltered call returns the whole chain",
  balanceParams.filter((param) => param.required).map((param) => param.name).join(",") === "chainId",
  "the filters are now constrained — drop this from the note",
);

console.log("\nStreaming claims (checked against the published .proto)");
check(
  "stream-timestamps: stream timestamps are uint64 nanoseconds",
  /uint64 timestamp/.test(proto) && /in nanoseconds/.test(proto),
  "the proto no longer describes nanosecond timestamps",
);
check(
  "stream-partial-candles: is_closed marks the final emission and the bucket timestamp is stable",
  /bool is_closed/.test(proto) && /Stable across all partials/.test(proto),
  "the partial-candle contract changed",
);
check(
  "stream-reconnect-gap: an empty symbols list still subscribes to everything",
  /If empty, updates for all assets/.test(proto),
  "the empty-subscription default changed",
);
check(
  "depth-ladder: bids are the redeem side and asks the mint side",
  /Sell side \(redeem\)/.test(proto) && /Buy side \(mint\)/.test(proto),
  "the depth side labels changed",
);
check(
  "depth-ladder: level price is marginal, not cumulative",
  /marginal price for the\s+\/\/ incremental|marginal price/.test(proto),
  "the proto no longer calls the level price marginal",
);
check(
  "depth-ladder: bids and asks are empty when error is set",
  /bids and asks are empty when error is set/.test(proto),
  "the error/empty-book contract changed",
);

console.log("\nCaching claims (checked against the Endpoint Caching page)");
check(
  "stale-cache: market data is cached for 1 minute",
  /## Markets[\s\S]{0,400}?\*\*Cache Duration:\*\* 1 minute/.test(cachingDoc),
  "the market-data TTL changed",
);
check(
  "stale-cache: trading limits are not cached",
  /## Trading Limits[\s\S]{0,400}?\*\*Cache Duration:\*\* None/.test(cachingDoc),
  "trading limits are now cached, so the condition's contrast is gone",
);
check(
  "stale-cache: OHLC still carries up to 11 seconds of effective lag",
  /\*\*Effective Lag:\*\* Up to 11 seconds/.test(cachingDoc),
  "the documented OHLC lag changed",
);

console.log("\nError catalogue vs the OpenAPI enum");
const enumCodes: string[] = deref(schemas.TradingLimitsReasonCode).enum ?? [];
for (const code of documentedCodesOutsideTheEnum) {
  check(
    `unknown-reason: ${code} is documented and absent from the enum`,
    errorDoc.includes(code) && !enumCodes.includes(code),
    errorDoc.includes(code) ? `${code} was added to the enum` : `${code} is no longer documented`,
  );
}

const specPairs = (
  spec.paths?.["/v1/assets/{symbol}/prices/ohlc"]?.get?.description ?? ""
).match(/^- (\S+\/\S+?)(?=\s|\*|$)/gm)?.map((line: string) => line.replace("- ", "")) ?? [];
const messagePairs = (errorDoc.match(/valid pairs: ([^"\n]+)/)?.[1] ?? "")
  .split(",")
  .map((pair) => pair.trim())
  .filter(Boolean);
check(
  `ohlc-pairs: the OpenAPI description still lists the lab's ${ohlcValidPairs.length} pairs`,
  specPairs.join(",") === ohlcValidPairs.join(","),
  `spec=[${specPairs.join(", ")}]`,
);
check(
  `ohlc-pairs: the error message still lists the lab's ${ohlcPairsPerErrorMessage.length} pairs`,
  messagePairs.join(",") === ohlcPairsPerErrorMessage.join(","),
  `message=[${messagePairs.join(", ")}]`,
);
check(
  "ohlc-pairs: the two published lists still disagree",
  specPairs.length > 0 && messagePairs.length > 0 && specPairs.join(",") !== messagePairs.join(","),
  "the two documents now agree — drop the disagreement from condition 11 and the note",
);

const uncovered = [...specPaths].filter(
  (p) => !labEndpointDirectory.some((e) => e.path.endsWith(` ${p}`)),
);
console.log(
  `\n${labEndpointDirectory.length} of ${specPaths.size} documented endpoints are in the directory.`,
);
if (uncovered.length) console.log(`Not covered: ${uncovered.join(", ")}`);

for (const note of notes) console.log(`\nnote: ${note}`);

/**
 * The page renders this file, so a visitor sees the run rather than a claim
 * about it. Regenerated by every local run; CI only cares about the exit code.
 */
const record = {
  verifiedAt: new Date().toISOString(),
  ok: failures.length === 0,
  specVersion: spec.info?.version ?? null,
  sources: [
    { label: "OpenAPI", url: contractSource.spec },
    { label: "Streaming .proto", url: contractSource.proto },
    { label: "Error Codes", url: contractSource.errorCodes },
    { label: "Endpoint Caching", url: contractSource.caching },
  ],
  directoryChecks,
  claimChecks: checksRun - directoryChecks,
  uncoveredEndpoints: uncovered,
  failures,
};
writeFileSync("lib/contract-verification.json", `${JSON.stringify(record, null, 2)}\n`);
console.log(`\nRecorded ${record.claimChecks} claims and ${record.directoryChecks} endpoint checks to lib/contract-verification.json`);

if (failures.length) {
  console.error(`\n${failures.length} claim(s) drifted from the live contract:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nAll structural claims still hold.\n");
