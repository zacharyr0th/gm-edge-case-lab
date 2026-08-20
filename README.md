# GM Edge-Case Lab

A one-page compatibility suite for [Ondo Stocks (Global Markets)](https://docs.ondo.finance/) API integrations, served at `/`. It replays 25 documented production states — schema evolution, market and session state, corporate actions, limits, quotes, chain infrastructure, the gRPC streams, and Ondo Perps — against a happy-path integration, executes the failure in your browser, and shows what to ship instead.

Each state includes the wrong assumption, the actual runtime result, the correct handling, impact by integrator type (wallet, exchange, fintech app), suggested user-facing copy, the endpoints involved, and the contract-faithful fixture payload.

Filter by area, and link straight to a single condition — every row has a stable id and a copy-link button, so `#dividend-multiplier` opens that condition on load. Fixtures are copyable as JSON.

## Streaming

The OpenAPI document describes 20 REST endpoints. It does not mention the streaming surface at all: four gRPC RPCs at `grpc.gm.ondo.finance:443`, published separately as a `.proto`. Four conditions cover it, because it is where the unit and lifecycle assumptions break — timestamps are nanoseconds there and milliseconds over REST, OHLC candles are revised in place until `is_closed`, the stream never backfills after a reconnect, and depth `bids` are the redeem side with marginal per-level prices.

## Perps

Ondo Exchange is a separate product with its own published pair of specs — `rest-spec.json` (74 paths) and `ws-spec.json` (21 channels) — served from the same docs site with no prose pages describing either. Five conditions cover it, weighted toward the places where a mistake costs money rather than pixels: a dead man's switch whose own subscribe example omits the field that arms it, batch order and cancel endpoints that answer `200` with the failures inside the body, an order status enum with no partial-fill state, order increments the schema never types, and a socket that closes after 180 seconds of quiet.

## Weekend Basis Monitor

`/basis` charts the live premium or discount of GM tokens vs each underlying's latest completed U.S. close. Assets are discovered from CoinGecko's "Ondo Tokenized Assets" category; closes come from Yahoo Finance. Basis is paused while the U.S. regular session is open, and the current session is omitted until it closes. Rows whose token-to-share ratio lands on a split-like factor are dropped, because resolving them needs Ondo's authenticated shares multiplier. Rows whose token quote predates the completed close are listed but left unpriced, because differencing them would report the underlying's own move as a dislocation. Neither group contributes to the headline count.

Every reason a row carries no number is a condition the matrix documents, so the Withheld view breaks the rows down by reason and links each one to the condition that explains it. The monitor is the live instance; the lab is the explanation.

## Why

No single endpoint answers "can this user trade this asset right now." Tradability is the composition of market status, per-asset events, session rules, trading limits, and quote availability. Integrations that read one flag ship bugs that surface as user confusion, failed transactions, or wrong financial figures.

## Fixtures

Fixtures are modeled field-for-field on Ondo's published OpenAPI specification (GM Backend API v1.0.0). The live API requires an `x-api-key`, so the lab runs on labeled demo fixtures with illustrative values. The runner is one adapter away from live endpoints.

## Verifying the contract

Every condition asserts something structural about the published API — that `underlyingMarket` is nullable, that `end` is absent from the required set on an unscheduled pause, that the trading-limits reason enum has exactly eight members while the Error Codes page documents six more, that stream timestamps are `uint64` nanoseconds, that depth `bids` are the redeem side. Those claims rot silently when the spec moves, so they are checked rather than trusted:

```bash
bun run verify:contract
```

It fetches all six published sources — the GM OpenAPI document, the streaming `.proto`, the Error Codes and Endpoint Caching pages, and the Perps REST and WebSocket specs — re-checks each claim, reports which documented endpoints the matrix does not yet cover, and exits non-zero on drift. CI runs it on every push and weekly.

The usual stack for this — `oasdiff` for breaking-change detection, Spectral for linting, Schemathesis for property tests — reads one OpenAPI document and compares shapes. That misses this API in two ways. It cannot see the streaming surface or the error catalogue, because neither is in the OpenAPI document. And it cannot catch semantic drift under an unchanged shape: a `number` that changes units, an enum that is a subset of the real one. Those are the claims here.

One group of checks is different in kind: it pins places where Ondo's published documents disagree with each other — a response schema that declares an object beside an array example, a field spelled two ways, a seconds example under a milliseconds description, a `Pagination` schema no endpoint references, and two different lists of which OHLC interval/range pairs are valid. Those checks fail the day Ondo fixes them, which is the signal to drop the caveat from the matrix.

Each run records its result to `lib/contract-verification.json`, and the page renders that record — claim count, sources, pass or fail, run date — so a visitor sees the run rather than a claim that the checks exist.

Last verified on August 20, 2026: all 58 claims held across the six sources, and the basket-token rollout that conditions 01 and 02 describe has since shipped — `underlyingMarket` and `constituentTokens` are both required in the current contract.

## Run

```bash
bun install
bun run dev
```

Open http://127.0.0.1:3452 for the lab, or http://127.0.0.1:3452/basis for the monitor.

## Routes

| Path | What it is |
| --- | --- |
| `/` | The edge-case matrix. Twenty-five production states, each with the wrong assumption, the runtime result, the correct handling, impact by integrator type, and suggested user-facing copy. |
| `/basis` | The off-hours basis monitor. Live GM token quotes against each underlying's latest completed U.S. close. |
| `/lab` | Redirect to `/`, kept so older links still resolve. |

Both pages send `noindex, nofollow`.

## Status

Independent prototype by [Zachary Roth](https://github.com/zacharyr0th). Not affiliated with or endorsed by Ondo Finance. "Ondo", "Global Markets", and "GM" refer to that company's products and are used here only to describe what this tool reads.

The monitor depends on two public upstreams it does not control. If CoinGecko or Yahoo Finance is unavailable, `/basis` says so rather than rendering an empty table.

## License

[MIT](LICENSE).
