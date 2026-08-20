# GM Edge-Case Lab

A one-page compatibility suite for [Ondo Stocks (Global Markets)](https://docs.ondo.finance/) API integrations, served at `/`. It replays 12 documented production states — schema evolution, market and session state, corporate actions, limits, quotes, and chain infrastructure — against a happy-path integration, executes the failure in your browser, and shows what to ship instead.

Each state includes the wrong assumption, the actual runtime result, the correct handling, impact by integrator type (wallet, exchange, fintech app), suggested user-facing copy, the endpoints involved, and the contract-faithful fixture payload.

Filter by area, and link straight to a single condition — every row has a stable id and a copy-link button, so `#dividend-multiplier` opens that condition on load. Fixtures are copyable as JSON.

## Weekend Basis Monitor

`/basis` charts the live premium or discount of GM tokens vs each underlying's latest completed U.S. close. Assets are discovered from CoinGecko's "Ondo Tokenized Assets" category; closes come from Yahoo Finance. Basis is paused while the U.S. regular session is open, and the current session is omitted until it closes. Rows whose token-to-share ratio lands on a split-like factor are dropped, because resolving them needs Ondo's authenticated shares multiplier. Rows whose token quote predates the completed close are listed but left unpriced, because differencing them would report the underlying's own move as a dislocation. Neither group contributes to the headline count.

## Why

No single endpoint answers "can this user trade this asset right now." Tradability is the composition of market status, per-asset events, session rules, trading limits, and quote availability. Integrations that read one flag ship bugs that surface as user confusion, failed transactions, or wrong financial figures.

## Fixtures

Fixtures are modeled field-for-field on Ondo's published OpenAPI specification (GM Backend API v1.0.0). The live API requires an `x-api-key`, so the lab runs on labeled demo fixtures with illustrative values. The runner is one adapter away from live endpoints.

## Verifying the contract

Every condition asserts something structural about the published API — that `underlyingMarket` is nullable, that `end` is absent from the required set on an unscheduled pause, that the trading-limits reason enum has exactly eight members. Those claims rot silently when the spec moves, so they are checked rather than trusted:

```bash
bun run verify:contract
```

It fetches the live spec, re-checks each claim, reports which documented endpoints the matrix does not yet cover, and exits non-zero on drift. CI runs it on every push and weekly.

Last verified against the live spec on August 19, 2026: all claims held, and the basket-token rollout that conditions 01 and 02 describe has since shipped — `underlyingMarket` and `constituentTokens` are both required in the current contract.

## Run

```bash
bun install
bun run dev
```

Open http://127.0.0.1:3452 for the lab, or http://127.0.0.1:3452/basis for the monitor.

## Routes

| Path | What it is |
| --- | --- |
| `/` | The edge-case matrix. Twelve production states, each with the wrong assumption, the runtime result, the correct handling, impact by integrator type, and suggested user-facing copy. |
| `/basis` | The off-hours basis monitor. Live GM token quotes against each underlying's latest completed U.S. close. |
| `/lab` | Redirect to `/`, kept so older links still resolve. |

Both pages send `noindex, nofollow`.

## Status

Independent prototype by [Zachary Roth](https://github.com/zacharyr0th). Not affiliated with or endorsed by Ondo Finance. "Ondo", "Global Markets", and "GM" refer to that company's products and are used here only to describe what this tool reads.

The monitor depends on two public upstreams it does not control. If CoinGecko or Yahoo Finance is unavailable, `/basis` says so rather than rendering an empty table.

## License

[MIT](LICENSE).
