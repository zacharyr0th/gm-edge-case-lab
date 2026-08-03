"use client";

import {
  ArrowUpRight,
  Braces,
  Building2,
  CircleAlert,
  CircleX,
  FlaskConical,
  RotateCcw,
  Smartphone,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  integrationModes,
  labChecks,
  labEndpointDirectory,
  runNaive,
  type IntegrationMode,
  type LabRun,
  type LabVerdict,
} from "@/lib/edge-case-lab-data";
import styles from "./edge-case-lab.module.css";

const verdictMeta: Record<LabVerdict, { label: string; icon: typeof CircleX; className: string }> = {
  crashes: { label: "Crashes", icon: CircleX, className: styles.verdictCrashes },
  wrong: { label: "Silently wrong", icon: TriangleAlert, className: styles.verdictWrong },
  degraded: { label: "Degraded", icon: CircleAlert, className: styles.verdictDegraded },
};

const modeIcons: Record<IntegrationMode, typeof Wallet> = {
  wallet: Wallet,
  exchange: Building2,
  fintech: Smartphone,
};

const impactLabel: Record<IntegrationMode, string> = {
  wallet: "If you ship a wallet",
  exchange: "If you run an exchange",
  fintech: "If you build a fintech app",
};

export function EdgeCaseLab() {
  const [mode, setMode] = useState<IntegrationMode>("wallet");
  const [runId, setRunId] = useState(0);
  const [results, setResults] = useState<LabRun[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResults(labChecks.map((check) => runNaive(check)));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [runId]);

  function replay() {
    setResults(null);
    setRunId((value) => value + 1);
  }
  const crashCount = labChecks.filter((check) => check.verdict === "crashes").length;
  const wrongCount = labChecks.filter((check) => check.verdict === "wrong").length;
  const degradedCount = labChecks.filter((check) => check.verdict === "degraded").length;

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <FlaskConical size={20} strokeWidth={1.7} />
          <div>
            <strong>GM Edge-Case Lab</strong>
            <span>Unofficial · built on Ondo&rsquo;s published API contract</span>
          </div>
        </div>
        <a className={styles.specLink} href="https://docs.ondo.finance/openapi.json" target="_blank" rel="noreferrer">
          openapi.json <ArrowUpRight size={14} />
        </a>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Integration compatibility suite</span>
            <h1>Will your Ondo Stocks integration survive production?</h1>
            <p>
              A correct happy-path integration can still break users when market state, corporate actions, limits, or
              the schema itself moves. This lab replays {labChecks.length} documented production states against a
              happy-path integration and shows what to ship instead.
            </p>
          </div>
          <div className={styles.heroPanel}>
            <div className={styles.heroStats}>
              <div><strong>{labChecks.length}</strong><span>production states</span></div>
              <div><strong>{labEndpointDirectory.length}</strong><span>API endpoints</span></div>
              <div><strong>3</strong><span>chains</span></div>
            </div>
            <button type="button" className={styles.replayButton} onClick={replay}>
              <RotateCcw size={15} /> Replay the run
            </button>
          </div>
        </section>

        <section className={styles.controls}>
          <div className={styles.modePicker} role="group" aria-label="Integration type">
            <span>Audit as</span>
            {integrationModes.map((item) => {
              const Icon = modeIcons[item.id];
              return (
                <button
                  type="button"
                  key={item.id}
                  className={mode === item.id ? styles.modeActive : ""}
                  aria-pressed={mode === item.id}
                  onClick={() => setMode(item.id)}
                >
                  <Icon size={16} strokeWidth={1.8} /> {item.label}
                </button>
              );
            })}
          </div>
          <p className={styles.summaryLine}>
            A happy-path integration mishandles <strong>all {labChecks.length}</strong> states:{" "}
            <em className={styles.summaryCrash}>{crashCount} crash</em>,{" "}
            <em className={styles.summaryWrong}>{wrongCount} render wrong</em>,{" "}
            <em className={styles.summaryDegraded}>{degradedCount} degrade</em>.
          </p>
        </section>

        <div className={styles.checkList} key={runId}>
          {labChecks.map((check, index) => {
            const result = results?.[index];
            const verdict = verdictMeta[check.verdict];
            const VerdictIcon = verdict.icon;
            return (
              <article key={check.id} className={styles.checkCard} style={{ "--i": index } as React.CSSProperties}>
                <header className={styles.checkHeader}>
                  <span className={styles.checkNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <em>{check.category}</em>
                    <h2>{check.title}</h2>
                  </div>
                  <span className={`${styles.verdictChip} ${verdict.className}`}>
                    <VerdictIcon size={14} strokeWidth={2.2} /> {verdict.label}
                  </span>
                </header>

                <p className={styles.scenario}>{check.scenario}</p>

                <div className={styles.checkBody}>
                  <div className={styles.checkMainCol}>
                    <div className={styles.naiveBlock}>
                      <span>The happy-path assumption</span>
                      <p>{check.naiveAssumption}</p>
                      <div className={`${styles.naiveOutput} ${result?.threw ? styles.naiveThrew : ""}`}>
                        <span>
                          {result ? (result.threw ? "Thrown in your browser just now" : "What actually renders") : "Running the happy-path parser…"}
                        </span>
                        <code>{result ? result.output : "…"}</code>
                      </div>
                    </div>
                    <div className={styles.correctBlock}>
                      <span>What to ship instead</span>
                      <ul>
                        {check.correct.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <aside className={styles.checkAside}>
                    <div>
                      <span>{impactLabel[mode]}</span>
                      <p>{check.impact[mode]}</p>
                    </div>
                    <div className={styles.userCopy}>
                      <span>Copy that survives this state</span>
                      <p>&ldquo;{check.userCopy}&rdquo;</p>
                    </div>
                    <div className={styles.endpointPills}>
                      <span>Contract surface</span>
                      {check.endpoints.map((endpoint) => (
                        <code key={endpoint.path}>{endpoint.method} {endpoint.path}</code>
                      ))}
                      <a href={check.doc.url} target="_blank" rel="noreferrer">
                        {check.doc.label} <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </aside>
                </div>

                <details className={styles.fixtureDetails}>
                  <summary><Braces size={14} /> Fixture payloads ({check.fixtures.length})</summary>
                  {check.fixtures.map((fixture) => (
                    <div key={fixture.label} className={styles.fixture}>
                      <span>{fixture.label}</span>
                      <pre>{JSON.stringify(fixture.body, null, 2)}</pre>
                    </div>
                  ))}
                </details>
              </article>
            );
          })}
        </div>

        <section className={styles.endpointDirectory}>
          <div className={styles.directoryHeading}>
            <span>Contract surface</span>
            <h2>The states above compose from {labEndpointDirectory.length} endpoints</h2>
            <p>
              No single endpoint answers &ldquo;can this user trade this asset right now.&rdquo; Tradability is the
              composition of market state, per-asset events, session rules, limits, and quote availability.
            </p>
          </div>
          <div className={styles.directoryGrid}>
            {labEndpointDirectory.map((endpoint) => (
              <div key={endpoint.path}>
                <code>{endpoint.path}</code>
                <p>{endpoint.note}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className={styles.methodology}>
          <div>
            <span>Methodology &amp; honesty</span>
            <p>
              Fixtures are modeled field-for-field on Ondo&rsquo;s published OpenAPI specification (GM Backend API
              v1.0.0, fetched August 2, 2026) and the documented upcoming changes. The live API requires an
              <code> x-api-key</code>, so this lab runs on labeled demo fixtures; numeric values are illustrative. The
              runner is a single adapter away from live endpoints. Independent prototype by Zachary Roth — not
              affiliated with or endorsed by Ondo Finance.
            </p>
          </div>
          <div className={styles.methodologyLinks}>
            <a href="https://docs.ondo.finance/api-reference/upcoming-changes" target="_blank" rel="noreferrer">
              Upcoming API changes <ArrowUpRight size={13} />
            </a>
            <a href="https://docs.ondo.finance/llms.txt" target="_blank" rel="noreferrer">
              Documentation index <ArrowUpRight size={13} />
            </a>
            <a href="https://github.com/ondoprotocol/gm-solana-simulator" target="_blank" rel="noreferrer">
              gm-solana-simulator <ArrowUpRight size={13} />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
