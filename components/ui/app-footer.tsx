import styles from "./ui.module.css";

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <p>Independent prototype by Zachary Roth. Not affiliated with or endorsed by Ondo Finance.</p>
      <span>Fixtures mirror Ondo&rsquo;s published OpenAPI contract; values are illustrative.</span>
    </footer>
  );
}
