"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Underlying-company marks, used descriptively to identify each row's issuer.
 * The source covers most listed tickers but not every newly launched fund, so
 * a monogram stands in rather than leaving a hole in the column.
 */
export function CompanyLogo({
  ticker,
  name,
  className,
}: {
  ticker: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-[9px] font-semibold tracking-tight text-muted-foreground",
          className,
        )}
      >
        {ticker.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={`https://images.financialmodelingprep.com/symbol/${encodeURIComponent(ticker)}.png`}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      width={28}
      height={28}
      onError={() => setFailed(true)}
      className={cn("size-7 shrink-0 rounded-md border bg-white object-contain p-0.5", className)}
      title={name}
    />
  );
}
