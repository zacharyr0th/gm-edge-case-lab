# GM Edge-Case Lab

A one-page compatibility suite for [Ondo Stocks (Global Markets)](https://docs.ondo.finance/) API integrations. It replays 12 documented production states — schema evolution, market and session state, corporate actions, limits, quotes, and chain infrastructure — against a happy-path integration, executes the failure in your browser, and shows what to ship instead.

Each state includes the wrong assumption, the actual runtime result, the correct handling, impact by integrator type (wallet, exchange, fintech app), suggested user-facing copy, the endpoints involved, and the contract-faithful fixture payload.

## Why

No single endpoint answers "can this user trade this asset right now." Tradability is the composition of market status, per-asset events, session rules, trading limits, and quote availability. Integrations that read one flag ship bugs that surface as user confusion, failed transactions, or wrong financial figures.

## Fixtures

Fixtures are modeled field-for-field on Ondo's published OpenAPI specification (GM Backend API v1.0.0, fetched August 2, 2026) and the [announced upcoming changes](https://docs.ondo.finance/api-reference/upcoming-changes). The live API requires an `x-api-key`, so the lab runs on labeled demo fixtures with illustrative values. The runner is one adapter away from live endpoints.

## Run

```bash
bun install
bun run dev
```

Open http://127.0.0.1:3452.

## Status

Independent prototype by [Zachary Roth](https://github.com/zacharyr0th). Not affiliated with or endorsed by Ondo Finance.
