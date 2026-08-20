# Ondo Integration Lab

The things that break when you integrate with Ondo's APIs, and what to ship instead.

Two pages, both `noindex`:

| Path | What it is |
| --- | --- |
| `/` | Live off-hours gap between GM token quotes and the last completed U.S. close. |
| `/lab` | The matrix. 25 production states replayed against a happy-path integration. |
| `/basis` | Redirect to `/`, kept so older links still resolve. |

## The matrix

No single endpoint answers "can this user trade this asset right now." Tradability is the composition of market status, per-asset events, session rules, trading limits, and quote availability. Integrations that read one flag ship bugs that reach users as confusion, failed transactions, or wrong numbers.

Each condition names the wrong assumption, runs the failure in your browser, and shows the handling that avoids it — plus impact by integrator type (wallet, exchange, fintech app), suggested user-facing copy, the endpoints involved, and the fixture payload. Filter by area, or link straight to one condition: `#dead-man-switch` opens that row on load.

Eight areas: schema evolution, market state, corporate actions, prices and quotes, limits and quotes, chain infrastructure, the gRPC streams, and Perps.

## What it reads

Ondo publishes more than the one OpenAPI document, and the extra surfaces are where most of the sharp edges are.

| Source | What it adds |
| --- | --- |
| `openapi.json` | GM Stocks REST — 20 endpoints |
| `protobuf-schema` | Four gRPC streams the OpenAPI document never mentions |
| Error Codes | ~40 codes against a reason enum with 8 |
| Endpoint Caching | Which reads are stale, and by how long |
| `rest-spec.json` | Ondo Perps REST — 74 paths |
| `ws-spec.json` | Ondo Perps WebSocket — 21 channels |

Both Perps specs are served from the docs site with no prose pages describing either.

Fixtures are modeled on those documents field for field. The live APIs need credentials, so the lab runs on labeled demo payloads with illustrative values. The runner is one adapter away from live endpoints.

## Verified, not asserted

Every condition claims something structural — that `underlyingMarket` is nullable, that stream timestamps are nanoseconds, that the Perps order status enum has no partial-fill state. Claims like that rot silently when a spec moves, so they are checked:

```bash
bun run verify:contract
```

It fetches all six sources, re-checks 58 claims and 22 routes, and exits non-zero on drift. CI runs it on every push and weekly. Each run writes `lib/contract-verification.json`, which the page renders — so a visitor sees the result rather than a promise that checks exist.

The usual tooling for this (`oasdiff`, Spectral, Schemathesis) reads one OpenAPI document and compares shapes. That misses two things here: it cannot see the streaming or Perps surfaces, because they are not in that document, and it cannot catch meaning changing under a stable shape — a number that changes units, an enum that is a subset of the real one.

One group of checks is deliberately inverted. It pins places where Ondo's own documents contradict each other: a schema that declares an object beside an array example, a field spelled two ways, two different lists of valid OHLC interval/range pairs, a dead man's switch whose example omits the field that arms it. Those checks fail the day Ondo fixes them, which is the signal to drop the caveat.

Last run: 2026-08-20, all 58 claims held.

## Using the fixtures

Every payload the matrix renders is exported as one file, rebuilt on each deploy from the same data:

```bash
curl -O https://basis-integration.vercel.app/fixtures.json
```

It carries all 25 conditions — id, verdict, the assumption that breaks, what to ship instead, the endpoints, a permalink back to the row, and the fixture bodies. Loop it against your own client:

```ts
import { describe, expect, test } from "bun:test";
import fixtures from "./fixtures.json";
import { handleOndoResponse } from "../src/ondo";

for (const condition of fixtures.conditions) {
  describe(condition.id, () => {
    for (const fixture of condition.fixtures) {
      test(fixture.label, () => {
        expect(() => handleOndoResponse(fixture.body)).not.toThrow();
      });
    }
  });
}
```

That is the whole test for the three conditions that throw. The other twenty-two fail quietly — nothing throws, the answer is just wrong — so those need an assertion about your own behaviour, and `shipInstead` says what that behaviour is.

There is no package to install. The export is the interface.

## Basis monitor

The homepage charts the premium or discount of GM tokens against each underlying's latest completed U.S. close. Assets come from CoinGecko's "Ondo Tokenized Assets" category; closes come from Yahoo Finance.

The page leads with session clocks: which GM session is live (premarket, regular, postmarket, overnight, off-hours) and whether Tokyo, Hong Kong, London, Frankfurt and New York are open. That strip is the explanation for the numbers under it. GM keeps trading after the U.S. close, and while it does, Asia and Europe take their turns — so a token that moved overnight usually moved because one of those was open.

That changes what the gap column means, and the page says so. During the regular session nothing is priced. While GM trades and U.S. equities are shut, the column reads **Move since close** and the headline stats read biggest gain and drop, because a difference against a stale close is a move, not a mispricing. Only when both sides are shut does it read **Premium vs close**. Rows whose underlying trades around the clock — spot crypto funds, crypto-treasury companies — carry a `24/7` tag, because their move since the close is the underlying repricing and never evidence of a GM premium.

Most of the work is deciding when *not* to print a number. Basis is paused while the U.S. regular session is open. The current session is omitted until it closes. Rows whose token-to-share ratio lands on a split-like factor are dropped, because resolving them needs Ondo's authenticated shares multiplier. Rows whose token quote predates the close are listed but left unpriced, because differencing them would report the underlying's own move as a dislocation. None of those contribute to the headline.

Every reason a row carries no number is a condition in the matrix, so the Withheld view breaks the rows down by reason and links each to the condition that explains it. The monitor is the live instance; the matrix is the explanation.

If CoinGecko or Yahoo Finance is unavailable, the page says so rather than rendering an empty table.

## Run

```bash
bun install
bun run dev
```

http://127.0.0.1:3452 for the monitor, http://127.0.0.1:3452/lab for the matrix.

## Status

Independent prototype by [Zachary Roth](https://github.com/zacharyr0th). Not affiliated with or endorsed by Ondo Finance. "Ondo", "Global Markets", "GM", and "Perps" refer to that company's products and are used here only to describe what this tool reads.

## License

[MIT](LICENSE).
