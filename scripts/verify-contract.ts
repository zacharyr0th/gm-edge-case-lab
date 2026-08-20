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
import { contractSource, knownReasonCodes, labChecks, labEndpointDirectory } from "../lib/edge-case-lab-data";

type Json = Record<string, any>;

const failures: string[] = [];
const notes: string[] = [];

function check(claim: string, ok: boolean, detail?: string) {
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
    const present = Boolean(spec.paths?.[endpoint.path]?.[endpoint.method.toLowerCase()]);
    if (!present) check(`${condition.id} → ${endpoint.method} ${endpoint.path}`, false, "not in live spec");
  }
}

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

const uncovered = [...specPaths].filter(
  (p) => !labEndpointDirectory.some((e) => e.path.endsWith(` ${p}`)),
);
console.log(
  `\n${labEndpointDirectory.length} of ${specPaths.size} documented endpoints are in the directory.`,
);
if (uncovered.length) console.log(`Not covered: ${uncovered.join(", ")}`);

for (const note of notes) console.log(`\nnote: ${note}`);

if (failures.length) {
  console.error(`\n${failures.length} claim(s) drifted from the live contract:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nAll structural claims still hold.\n");
