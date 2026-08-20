import { FlaskConical, Gauge } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import styles from "./ui.module.css";

export function AppHeader({ active }: { active: "basis" | "lab" }) {
  const isBasis = active === "basis";
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a className={styles.brand} href={isBasis ? "/basis" : "/"} aria-label="GM tools home">
          <span className={styles.brandMark}>GM</span>
          <span>
            <strong>{isBasis ? "GM Off-Hours Monitor" : "GM Edge-Case Lab"}</strong>
            <em>{isBasis ? "Weekend price dislocation" : "Integration compatibility"}</em>
          </span>
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          <a className={isBasis ? styles.navActive : styles.navLink} href="/basis">
            <Gauge size={15} /> Basis
          </a>
          <a className={!isBasis ? styles.navActive : styles.navLink} href="/">
            <FlaskConical size={15} /> Lab
          </a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
