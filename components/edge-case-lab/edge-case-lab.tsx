"use client";

import {
  ArrowUpRight,
  Braces,
  Building2,
  ChevronDown,
  ClipboardCheck,
  CircleAlert,
  CircleX,
  RotateCcw,
  Smartphone,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppFooter } from "@/components/ui/app-footer";
import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
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

const verdictMeta: Record<LabVerdict, { label: string; icon: typeof CircleX }> = {
  crashes: { label: "Crashes", icon: CircleX },
  wrong: { label: "Silently wrong", icon: TriangleAlert },
  degraded: { label: "Degraded", icon: CircleAlert },
};

const modeIcons: Record<IntegrationMode, typeof Wallet> = {
  wallet: Wallet,
  exchange: Building2,
  fintech: Smartphone,
};

const impactLabel: Record<IntegrationMode, string> = {
  wallet: "Wallet impact",
  exchange: "Exchange impact",
  fintech: "Fintech impact",
};

export function EdgeCaseLab() {
  const [mode, setMode] = useState<IntegrationMode>("wallet");
  const [runId, setRunId] = useState(0);
  const [openId, setOpenId] = useState<string | null>(labChecks[0]?.id ?? null);
  const [results, setResults] = useState<LabRun[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setResults(labChecks.map((check) => runNaive(check))), 350);
    return () => window.clearTimeout(timer);
  }, [runId]);

  const crashCount = labChecks.filter((check) => check.verdict === "crashes").length;
  const wrongCount = labChecks.filter((check) => check.verdict === "wrong").length;
  const degradedCount = labChecks.filter((check) => check.verdict === "degraded").length;

  function replay() {
    setResults(null);
    setRunId((value) => value + 1);
  }

  return (
    <div className={styles.shell}>
      <AppHeader active="lab" />
      <main className={styles.main}>
        <section className={styles.statusBar} aria-label="Lab summary">
          <ClipboardCheck size={17} />
          <div className={styles.statusCopy}>
            <strong>Production matrix sign-off</strong>
            <span>Twelve public-docs-derived launch conditions for Ondo Stocks partner products.</span>
          </div>
          <div className={styles.headingActions}>
            <a href="https://docs.ondo.finance/openapi.json" target="_blank" rel="noreferrer">
              OpenAPI <ArrowUpRight size={14} />
            </a>
            <Button type="button" onClick={replay}><RotateCcw size={14} /> Replay</Button>
          </div>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.tableSection}>
            <div className={styles.statsLine}>
              <span><strong>{labChecks.length}</strong> production states</span>
              <span><strong>{labEndpointDirectory.length}</strong> API endpoints</span>
              <span><strong>3</strong> chains</span>
              <span><strong>{crashCount}</strong> crash · <strong>{wrongCount}</strong> wrong · <strong>{degradedCount}</strong> degrade</span>
            </div>

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
                      <Icon size={15} /> {item.label}
                    </button>
                  );
                })}
              </div>
              <p>Open a row to inspect the failure and fix.</p>
            </section>

            <div className={styles.matrix} key={runId}>
          <div className={styles.matrixHead}>
            <span>#</span>
            <span>Production state</span>
            <span>Verdict</span>
            <span>Fix</span>
            <span />
          </div>
          {labChecks.map((check, index) => {
            const result = results?.[index];
            const verdict = verdictMeta[check.verdict];
            const VerdictIcon = verdict.icon;
            const open = openId === check.id;
            return (
              <div key={check.id} className={styles.matrixItem}>
                <button
                  type="button"
                  className={`${styles.matrixRow} ${open ? styles.matrixRowOpen : ""}`}
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : check.id)}
                >
                  <span className={styles.mNum}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.mState}>
                    <strong>{check.title}</strong>
                    <em>{check.category}</em>
                  </span>
                  <span className={styles.verdictChip}><VerdictIcon size={13} /> {verdict.label}</span>
                  <span className={styles.mFix}>{check.correct[0]}</span>
                  <ChevronDown size={16} className={styles.mChev} />
                </button>

                {open ? (
                  <div className={styles.matrixDetail}>
                    <div className={styles.checkBody}>
                      <div className={styles.checkMainCol}>
                        <p className={styles.detailScenario}>{check.scenario}</p>
                        <section className={styles.naiveBlock}>
                          <span>The happy path assumes</span>
                          <p>{check.naiveAssumption}</p>
                          <div className={styles.naiveOutput}>
                            <span>{result ? (result.threw ? "Thrown in your browser" : "What renders") : "Running…"}</span>
                            <code>{result ? result.output : "…"}</code>
                          </div>
                        </section>
                        <section className={styles.correctBlock}>
                          <span>Ship instead</span>
                          <ul>{check.correct.map((point) => <li key={point}>{point}</li>)}</ul>
                        </section>
                      </div>

                      <aside className={styles.checkAside}>
                        <div><span>{impactLabel[mode]}</span><p>{check.impact[mode]}</p></div>
                        <div><span>Say to users</span><p>&ldquo;{check.userCopy}&rdquo;</p></div>
                        <div className={styles.endpointPills}>
                          <span>Endpoints</span>
                          {check.endpoints.map((endpoint) => <code key={endpoint.path}>{endpoint.method} {endpoint.path}</code>)}
                          <a href={check.doc.url} target="_blank" rel="noreferrer">{check.doc.label} <ArrowUpRight size={13} /></a>
                        </div>
                      </aside>
                    </div>
                    <details className={styles.fixtureDetails}>
                      <summary><Braces size={14} /> API responses ({check.fixtures.length})</summary>
                      {check.fixtures.map((fixture) => (
                        <div key={fixture.label} className={styles.fixture}>
                          <span>{fixture.label}</span>
                          <pre>{JSON.stringify(fixture.body, null, 2)}</pre>
                        </div>
                      ))}
                    </details>
                  </div>
                ) : null}
              </div>
            );
          })}
            </div>
          </div>

          <aside className={styles.purposePanel} aria-labelledby="purpose-title">
            <div className={styles.purposeIntro}>
              <span>What this is</span>
              <h2 id="purpose-title">A production-readiness tool, not an endpoint demo.</h2>
              <p>
                The matrix models conditions an integration should explicitly handle, based on Ondo&rsquo;s public API,
                product documentation, and chain-specific execution behavior.
              </p>
              <p>
                It checks whether the product stays safe when markets close, assets are restricted, token economics
                change, quotes diverge, limits are reached, schemas evolve, or simulation produces a false warning.
              </p>
            </div>
            <div className={styles.purposeOutcomes}>
              <span>Use the matrix to create</span>
              <div className={styles.outcomeGrid}>
                <div><strong>01</strong><p>Partner acceptance criteria</p></div>
                <div><strong>02</strong><p>Repeatable test fixtures</p></div>
                <div><strong>03</strong><p>Launch gates and sign-off</p></div>
                <div><strong>04</strong><p>Post-launch monitoring</p></div>
              </div>
            </div>
            <div className={styles.coverageLine}>
              <span>Coverage</span>
              <p>Schema evolution · Market and asset states · Corporate actions · Quote semantics · Risk limits · Unknown enums · Chain-specific UX</p>
            </div>
          </aside>
        </section>

        <details className={styles.directory}>
          <summary>{labEndpointDirectory.length} endpoints in the contract surface <ChevronDown size={15} /></summary>
          <div className={styles.directoryGrid}>
            {labEndpointDirectory.map((endpoint) => (
              <div key={endpoint.path}><code>{endpoint.path}</code><p>{endpoint.note}</p></div>
            ))}
          </div>
        </details>

        <details className={styles.methodology}>
          <summary>Methodology and sources <ChevronDown size={15} /></summary>
          <p>
            Fixtures mirror Ondo&rsquo;s published OpenAPI contract and announced changes. Values are illustrative; the live
            API requires an <code>x-api-key</code>. Independent prototype by Zachary Roth, not affiliated with Ondo Finance.
          </p>
        </details>
      </main>
      <AppFooter page="lab" />
    </div>
  );
}
