const sourceNote = {
  lab: "Fixtures mirror Ondo’s published OpenAPI contract; values are illustrative.",
  basis: "Token prices from CoinGecko; underlying closes from Yahoo Finance.",
} as const;

export function AppFooter({ page }: { page: keyof typeof sourceNote }) {
  return (
    <footer className="text-muted-foreground mx-auto mt-8 flex w-full max-w-[1384px] flex-wrap items-baseline justify-between gap-x-5 gap-y-1.5 border-t px-5 py-4 text-[11px] max-md:mb-20 sm:px-6">
      <p>Independent prototype by Zachary Roth. Not affiliated with or endorsed by Ondo Finance.</p>
      <span>
        {sourceNote[page]}{" "}
        <a
          href="https://github.com/zacharyr0th/gm-edge-case-lab"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground underline underline-offset-2"
        >
          Source
        </a>
      </span>
    </footer>
  );
}
