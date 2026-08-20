"use client";

import { ChevronDown, CircleHelp, Clock3, Info, X } from "lucide-react";
import { useMemo, useState } from "react";
import { type BasisData, type BasisRow } from "@/lib/basis-data";
import { AppFooter } from "@/components/ui/app-footer";
import { AppHeader } from "@/components/ui/app-header";
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
const utcDay = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatUtc(seconds: number | null): string {
  return seconds === null ? "—" : `${utcTime.format(new Date(seconds * 1000))} UTC`;
}

function formatDay(seconds: number | null): string | null {
  return seconds === null ? null : utcDay.format(new Date(seconds * 1000));
}

const notComparableLabel: Record<Exclude<BasisRow["basisStatus"], "comparable">, string> = {
  "market-open": "U.S. session open",
  "pre-close": "Stale print",
  "multiplier-required": "Multiplier required",
  "no-data": "No close",
};

const notComparableReason: Record<Exclude<BasisRow["basisStatus"], "comparable">, string> = {
  "market-open": "The U.S. regular session is open, so the underlying is moving against a close that is no longer current.",
  "pre-close": "The latest public token quote predates the completed close it would be measured against. Differencing them would report a price move as a dislocation.",
  "multiplier-required": "Token and share units differ by a factor that only Ondo's authenticated shares multiplier can resolve.",
  "no-data": "No completed underlying close was available for this ticker.",
};

function getDislocation(row: BasisRow) {
  // A premium is only meaningful when both legs describe the same moment and the
  // same unit. Every other status is reported as a status, never as a number.
  if (row.basisStatus !== "comparable") return null;
  if (row.tokenPrice === null || row.underlyingClose === null || row.underlyingClose === 0) return null;
  const percent = ((row.tokenPrice / row.underlyingClose) - 1) * 100;
  return {
    percent,
    label: percent >= 0 ? "Premium" : "Discount",
    className: percent >= 0 ? styles.premium : styles.discount,
  };
}

function ComparisonPanel({ row, onClose }: { row: BasisRow; onClose: () => void }) {
  const dislocation = getDislocation(row);
  return (
    <aside className={styles.detailPanel} aria-label={`${row.symbol} comparison details`}>
      <div className={styles.detailHeader}>
        <div>
          <h2>{row.symbol}</h2>
          <p>{row.name}</p>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close comparison details">
          <X size={16} />
        </button>
      </div>

      <div className={styles.pricePair}>
        <div>
          <span>Token price / token</span>
          <strong>{row.tokenPrice === null ? "—" : usd.format(row.tokenPrice)}</strong>
        </div>
        <div>
          <span>Underlying close / share</span>
          <strong>{row.underlyingClose === null ? "—" : usd.format(row.underlyingClose)}</strong>
          <em>{formatDay(row.underlyingCloseTime)}</em>
        </div>
      </div>

      {dislocation ? (
        <div className={styles.detailSection}>
          <span>Versus latest U.S. close</span>
          <strong className={`${styles.detailSignal} ${dislocation.className}`}>
            {dislocation.label} {dislocation.percent >= 0 ? "+" : ""}{dislocation.percent.toFixed(1)}%
          </strong>
          <p>
            {`The latest token quote is ${Math.abs(dislocation.percent).toFixed(1)}% ${
              dislocation.percent >= 0 ? "above" : "below"
            } the underlying asset\u2019s latest completed U.S. session close.`}
          </p>
        </div>
      ) : (
        <div className={styles.detailSection}>
          <span>Versus latest U.S. close</span>
          <strong className={styles.detailSignal}>Not comparable</strong>
          <p>{notComparableReason[row.basisStatus === "comparable" ? "no-data" : row.basisStatus]}</p>
        </div>
      )}

      <div className={styles.detailSection}>
        <span>How to read this</span>
        <p>
          Token price is the latest public GM token quote. Underlying close is the latest completed U.S. session close
          for the referenced stock or ETF. The monitor shows the two source values without inventing a conversion.
        </p>
        <div className={styles.formula}>
          <Info size={15} />
          <span>Only rows whose public token and share units can be shown directly are included.</span>
        </div>
      </div>

      <div className={styles.detailFooter}>Token updated {formatUtc(row.tokenUpdatedAt)}</div>
    </aside>
  );
}

export function BasisMonitor({ data }: { data: BasisData }) {
  const visibleRows = useMemo(() => data.rows.filter((row) => !row.multiplierRequired), [data.rows]);
  const comparableCount = useMemo(
    () => visibleRows.filter((row) => row.basisStatus === "comparable").length,
    [visibleRows],
  );
  const withheldCount = visibleRows.length - comparableCount;
  const initialSymbol = useMemo(
    () => (visibleRows.find((row) => row.basisStatus === "comparable") ?? visibleRows[0])?.symbol ?? null,
    [visibleRows],
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(initialSymbol);
  const selected = visibleRows.find((row) => row.symbol === selectedSymbol) ?? null;

  return (
    <div className={styles.shell}>
      <AppHeader active="basis" />
      <main className={styles.main}>
        <section className={styles.statusBar} aria-label="Market status">
          <Clock3 size={17} />
          <strong>{data.marketOpen ? "U.S. market open" : "Latest completed U.S. close"}</strong>
          <span>
            {data.marketOpen
              ? "Live GM token quotes shown with the latest completed U.S. close."
              : "Public GM token quotes shown with the latest completed U.S. close."}
          </span>
          <span className={styles.statusUpdated}>Updated {formatUtc(data.rows[0]?.tokenUpdatedAt ?? null)}</span>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.tableSection}>
            <div className={styles.tableMeta}>
              <span>{comparableCount} directly comparable tokens</span>
              {withheldCount > 0 ? <span>{withheldCount} listed without a basis</span> : null}
              <span>CoinGecko {data.coingeckoOk ? "available" : "unavailable"}</span>
              <span>Yahoo Finance {data.yahooOk ? "available" : "unavailable"}</span>
            </div>
            <div className={styles.table} role="table" aria-label="Off-hours prices by asset">
              <div className={`${styles.row} ${styles.rowHead}`} role="row">
                <span role="columnheader">Asset</span>
                <span role="columnheader">Token price / token</span>
                <span role="columnheader">Underlying close / share</span>
                <span role="columnheader">Updated</span>
              </div>
              {visibleRows.map((row) => {
                const selectedRow = row.symbol === selectedSymbol;
                const dislocation = getDislocation(row);
                return (
                  <button
                    type="button"
                    key={row.symbol}
                    className={`${styles.row} ${styles.dataRow} ${selectedRow ? styles.rowSelected : ""}`}
                    onClick={() => setSelectedSymbol(row.symbol)}
                    aria-pressed={selectedRow}
                  >
                    <span className={styles.asset}>
                      <strong>{row.symbol}</strong>
                      <em>{row.name}</em>
                    </span>
                    <span className={styles.price}>
                      {row.tokenPrice === null ? "—" : usd.format(row.tokenPrice)}
                      {dislocation ? (
                        <span className={`${styles.dislocation} ${dislocation.className}`}>
                          {dislocation.label} {dislocation.percent >= 0 ? "+" : ""}{dislocation.percent.toFixed(1)}%
                        </span>
                      ) : row.basisStatus !== "comparable" ? (
                        <span className={`${styles.dislocation} ${styles.notComparable}`}>
                          {notComparableLabel[row.basisStatus]}
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.price}>
                      {row.underlyingClose === null ? "—" : usd.format(row.underlyingClose)}
                      <em>{formatDay(row.underlyingCloseTime)}</em>
                    </span>
                    <span className={styles.updated}>{formatUtc(row.tokenUpdatedAt)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selected ? <ComparisonPanel row={selected} onClose={() => setSelectedSymbol(null)} /> : null}
        </section>

        <details className={styles.methodology}>
          <summary><CircleHelp size={16} /> Methodology <ChevronDown size={15} /></summary>
          <p>
            Token prices come from CoinGecko and underlying closes from Yahoo Finance. Premium or discount is the raw
            percentage difference between the latest token quote and the underlying asset&rsquo;s latest completed U.S.
            session close. A row is priced only when both legs are comparable. Rows needing an authenticated shares
            multiplier are dropped, because their per-token and per-share values are on different scales. Rows whose
            token quote predates the completed close are listed but left unpriced, because the difference would be the
            underlying&rsquo;s own move rather than a dislocation. While the U.S. regular session is open no row is priced
            at all. Informational only — not pricing or investment advice.
          </p>
        </details>
      </main>
      <AppFooter />
    </div>
  );
}
