import styles from "./ui.module.css";

const sourceNote = {
  lab: "Fixtures mirror Ondo’s published OpenAPI contract; values are illustrative.",
  basis: "Token prices from CoinGecko; underlying closes from Yahoo Finance.",
} as const;

export function AppFooter({ page }: { page: keyof typeof sourceNote }) {
  return (
    <footer className={styles.footer}>
      <p>Independent prototype by Zachary Roth. Not affiliated with or endorsed by Ondo Finance.</p>
      <span>{sourceNote[page]}</span>
    </footer>
  );
}
