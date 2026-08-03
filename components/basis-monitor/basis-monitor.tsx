import { ArrowUpRight, Clock3 } from "lucide-react";
import { OUTLIER_BPS, type BasisData, type BasisRow } from "@/lib/basis-data";
import styles from "./basis-monitor.module.css";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const utcTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const utcDay = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });

function formatUtc(seconds: number | null): string {
  return seconds === null ? "—" : `${utcTime.format(new Date(seconds * 1000))} UTC`;
}

function formatDay(seconds: number | null): string | null {
  return seconds === null ? null : utcDay.format(new Date(seconds * 1000));
}

function basisChip(row: BasisRow) {
  if (row.basisBps === null) return { label: "no data", className: styles.basisFlat };
  const rounded = Math.round(row.basisBps * 10) / 10;
  if (Math.abs(rounded) >= OUTLIER_BPS) {
    return { label: `${rounded >= 0 ? "+" : ""}${rounded.toFixed(0)} bps · split or stale print`, className: styles.basisOutlier };
  }
  if (Math.abs(rounded) < 2) return { label: `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)} bps · flat`, className: styles.basisFlat };
  if (rounded > 0) return { label: `+${rounded.toFixed(1)} bps premium`, className: styles.basisPremium };
  return { label: `${rounded.toFixed(1)} bps discount`, className: styles.basisDiscount };
}

export function BasisMonitor({ data }: { data: BasisData }) {
  const clean = data.rows.filter((row) => row.basisBps !== null && Math.abs(row.basisBps) < OUTLIER_BPS);
  const widest = clean.length
    ? clean.reduce((max, row) => (Math.abs(row.basisBps!) > Math.abs(max.basisBps!) ? row : max))
    : null;

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <Clock3 size={20} strokeWidth={1.7} />
          <div>
            <strong>GM Weekend Basis</strong>
            <span>Unofficial · public data only</span>
          </div>
        </div>
        <nav className={styles.topNav}>
          <a className={styles.navLink} href="/">Edge-case lab</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Live from public sources</span>
            <h1>Is the weekend priced in?</h1>
            <p>
              When U.S. markets close, GM tokens keep trading. This page charts the gap: token price vs the
              underlying&rsquo;s last close. That gap is the risk Ondo&rsquo;s off-hours exposure limits manage.
            </p>
          </div>
          {widest ? (
            <div className={styles.heroStat}>
              <span>Widest basis right now</span>
              <strong>{basisChip(widest).label}</strong>
              <em>{widest.symbol} vs {widest.ticker} · {data.rows.length} assets tracked</em>
            </div>
          ) : null}
        </section>

        {data.rows.length ? (
          <p className={styles.tableNote}>
            All {data.rows.length} GM tokens in CoinGecko&rsquo;s &ldquo;Ondo Tokenized Assets&rdquo; category, sorted
            by widest basis.
          </p>
        ) : null}
        <section className={styles.table} aria-label="Weekend basis by asset">
          <div className={`${styles.row} ${styles.rowHead}`}>
            <span>Asset</span>
            <span>Token price</span>
            <span>Last U.S. close</span>
            <span>Basis</span>
            <span>Token updated</span>
          </div>
          {data.rows.map((row) => {
            const chip = basisChip(row);
            return (
              <div key={row.symbol} className={styles.row}>
                <div className={styles.asset}>
                  <strong>{row.symbol}</strong>
                  <span>{row.name}</span>
                </div>
                <span className={styles.price}>{row.tokenPrice === null ? "—" : usd.format(row.tokenPrice)}</span>
                <span className={styles.price}>
                  {row.underlyingClose === null ? "—" : usd.format(row.underlyingClose)}
                  {formatDay(row.underlyingCloseTime) ? <em className={styles.closeDay}>{formatDay(row.underlyingCloseTime)}</em> : null}
                </span>
                <span className={`${styles.basis} ${chip.className}`}>{chip.label}</span>
                <span className={styles.updated}>{formatUtc(row.tokenUpdatedAt)}</span>
              </div>
            );
          })}
        </section>

        <section className={styles.sources}>
          <div className={data.coingeckoOk ? styles.sourceOk : styles.sourceDown}>
            <i />CoinGecko (GM token prices): {data.coingeckoOk ? "live" : "unavailable — showing no token prices rather than stale ones"}
          </div>
          <div className={data.yahooOk ? styles.sourceOk : styles.sourceDown}>
            <i />Yahoo Finance (underlying closes): {data.yahooOk ? "live" : "unavailable — basis cannot be computed"}
          </div>
        </section>

        <footer className={styles.methodology}>
          <span>Methodology</span>
          <p>
            Assets are discovered live from CoinGecko&rsquo;s &ldquo;Ondo Tokenized Assets&rdquo; category; each
            underlying ticker derives from the token&rsquo;s &ldquo;on&rdquo; suffix, and closes come from Yahoo Finance
            (tickers Yahoo can&rsquo;t match show &ldquo;no data&rdquo;). Data refreshes about every 5 minutes. During U.S. market hours the
            &ldquo;last close&rdquo; is the live regular-session price, so the basis is most meaningful on nights and
            weekends. Known residual: the basis assumes 1 token = 1 share, but GM tokens accrue dividends via a shares
            multiplier — for dividend payers (AAPL, SPY), part of a persistent premium is accrued dividends, and the
            multiplier endpoint requires an API key, so it is not applied here. Non-payers (TSLA, MSTR, CRCL) are clean
            reads. Gaps beyond ±{OUTLIER_BPS} bps are flagged and sorted last — at that size the cause is usually a
            stock split carried in the multiplier or a thin, stale token print, not weekend pricing. Informational only
            — not pricing or investment advice. Independent prototype by Zachary Roth, not
            affiliated with Ondo Finance. <a href="/" className={styles.inlineLink}>See the integration edge-case lab <ArrowUpRight size={12} /></a>
          </p>
        </footer>
      </main>
    </div>
  );
}
