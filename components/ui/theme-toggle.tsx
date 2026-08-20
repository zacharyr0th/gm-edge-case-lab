"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./ui.module.css";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const active: Theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", active === "dark" ? "#09090b" : "#ffffff");
    setTheme(active);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `gm-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#09090b" : "#ffffff");
    setTheme(next);
  }

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
