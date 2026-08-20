import styles from "./ui.module.css";

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        Independent prototype by{" "}
        <a href="https://github.com/zacharyr0th" target="_blank" rel="noreferrer">
          Zachary Roth
        </a>
        . Not affiliated with or endorsed by Ondo Finance.
      </p>
      <a href="https://github.com/zacharyr0th/gm-edge-case-lab" target="_blank" rel="noreferrer">
        Source
      </a>
    </footer>
  );
}
