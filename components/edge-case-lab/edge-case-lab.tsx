"use client";

import {
  ArrowUpRight,
  Braces,
  Check,
  ChevronDown,
  CircleAlert,
  CircleX,
  ShieldCheck,
  Copy,
  Link2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  integrationModes,
  labChecks,
  labEndpointDirectory,
  labPerpsDirectory,
  labStreamDirectory,
  runNaive,
  verification,
  type IntegrationMode,
  type LabCheck,
  type LabRun,
  type LabVerdict,
} from "@/lib/edge-case-lab-data";
import { AppFooter } from "@/components/ui/app-footer";
import { AppHeader } from "@/components/ui/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const FIXTURES_URL = "https://basis-integration.vercel.app/fixtures.json";
const FEATURED_CHECK_IDS = [
  "null-underlying",
  "session-mismatch",
  "display-vs-executable",
  "dead-man-switch",
  "stream-timestamps",
];

/** Written as lines so the braces and backticks survive being pasted out of the page. */
const testHarness = [
  'import { describe, expect, test } from "bun:test";',
  'import fixtures from "./fixtures.json";',
  'import { handleOndoResponse } from "../src/ondo";',
  "",
  "for (const condition of fixtures.conditions) {",
  "  describe(condition.id + \" — \" + condition.title, () => {",
  "    for (const fixture of condition.fixtures) {",
  "      test(fixture.label, () => {",
  "        expect(() => handleOndoResponse(fixture.body)).not.toThrow();",
  "      });",
  "    }",
  "  });",
  "}",
].join("\n");

const verdictMeta: Record<
  LabVerdict,
  { label: string; icon: typeof CircleX; className: string; explain: string }
> = {
  crashes: {
    label: "Crashes",
    icon: CircleX,
    className: "border-discount/40 text-discount",
    explain: "The happy-path code throws. The failure is loud and immediate.",
  },
  wrong: {
    label: "Silently wrong",
    icon: TriangleAlert,
    className: "border-amber-500/40 text-amber-600 dark:text-amber-400",
    explain: "Nothing throws. The product renders a confident answer that is incorrect.",
  },
  degraded: {
    label: "Degraded",
    icon: CircleAlert,
    className: "text-muted-foreground",
    explain: "It works, but wastes the user's time or a metered budget.",
  },
};

const impactLabel: Record<IntegrationMode, string> = {
  wallet: "Wallet impact",
  exchange: "Exchange impact",
  fintech: "Fintech impact",
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-[11px]"
      onClick={(event) => {
        event.stopPropagation();
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      aria-label={label}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

function CheckDetail({ check, result }: { check: LabCheck; result: LabRun | undefined }) {
  const fixtureJson = useMemo(
    () =>
      JSON.stringify(
        check.fixtures.map((fixture) => ({ label: fixture.label, body: fixture.body })),
        null,
        2,
      ),
    [check.fixtures],
  );

  return (
    <div className="border-t">
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          <p className="text-[13px] leading-relaxed">{check.scenario}</p>

          <section>
            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">The happy path assumes</p>
            <p className="mt-1.5 text-[13px] leading-relaxed">{check.naiveAssumption}</p>
            <div className="bg-muted/60 mt-3 rounded-lg border p-3">
              <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                {result ? (result.threw ? "Thrown in your browser" : "What renders") : "Running…"}
              </p>
              <code className="mt-1.5 block font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap">
                {result ? result.output : "…"}
              </code>
            </div>
          </section>

          <section>
            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Ship instead</p>
            <ul className="mt-1.5 space-y-1.5">
              {check.correct.map((point) => (
                <li key={point} className="flex gap-2 text-[13px] leading-relaxed">
                  <Check className="text-premium mt-0.5 size-3.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 text-[12px]">
          <div>
            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Integration impact</p>
            <div className="mt-1.5 space-y-2.5">
              {integrationModes.map((item) => (
                <div key={item.id}>
                  <p className="font-medium">{impactLabel[item.id]}</p>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{check.impact[item.id]}</p>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Say to users</p>
            <p className="mt-1 leading-relaxed italic">&ldquo;{check.userCopy}&rdquo;</p>
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Endpoints</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {check.endpoints.map((endpoint) => (
                <code
                  key={endpoint.path}
                  className="bg-muted rounded border px-1.5 py-0.5 font-mono text-[10px]"
                >
                  {endpoint.method} {endpoint.path}
                </code>
              ))}
            </div>
            <a
              href={check.doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1 text-[11px] underline underline-offset-2"
            >
              {check.doc.label} <ArrowUpRight className="size-3" />
            </a>
          </div>
        </aside>
      </div>

      <Collapsible className="border-t">
        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 px-5 py-2.5 text-[11px] [&[data-state=open]>svg:last-child]:rotate-180">
          <Braces className="size-3.5" />
          API responses ({check.fixtures.length})
          <ChevronDown className="ml-auto size-3.5 transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-5 pb-4">
          <div className="mb-2 flex justify-end">
            <CopyButton text={fixtureJson} label="Copy fixtures" />
          </div>
          <div className="space-y-3">
            {check.fixtures.map((fixture) => (
              <div key={fixture.label}>
                <p className="text-muted-foreground text-[10px]">{fixture.label}</p>
                <pre className="bg-muted/60 mt-1 overflow-x-auto rounded-lg border p-3 font-mono text-[10px] leading-relaxed">
                  {JSON.stringify(fixture.body, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function EdgeCaseLab() {
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [results, setResults] = useState<LabRun[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setResults(labChecks.map((check) => runNaive(check))), 350);
    return () => window.clearTimeout(timer);
  }, []);

  // A shared link should land on the condition it names, whether it arrives as
  // a cold load or as a hash change on a page that is already open.
  useEffect(() => {
    function openFromHash() {
      const hash = window.location.hash.replace("#", "");
      if (!hash || !labChecks.some((check) => check.id === hash)) return;
      setOpenId(hash);
      setShowAll(true);
      setCategory("all");
      window.requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView({ block: "center" }),
      );
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  const categories = useMemo(
    () => [...new Set(labChecks.map((check) => check.category))],
    [],
  );
  const shown = useMemo(
    () =>
      showAll
        ? labChecks.filter((check) => category === "all" || check.category === category)
        : FEATURED_CHECK_IDS.map((id) => labChecks.find((check) => check.id === id)).filter(
            (check): check is LabCheck => Boolean(check),
          ),
    [category, showAll],
  );

  const counts = useMemo(
    () => ({
      crashes: labChecks.filter((c) => c.verdict === "crashes").length,
      wrong: labChecks.filter((c) => c.verdict === "wrong").length,
      degraded: labChecks.filter((c) => c.verdict === "degraded").length,
    }),
    [],
  );

  const verifiedOn = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
        new Date(verification.verifiedAt),
      ),
    [],
  );
  const verificationSources = useMemo(
    () => verification.sources.map((source) => source.label).join(" · "),
    [],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader active="lab" />
      <main className="mx-auto w-full max-w-[1384px] flex-1 px-5 py-6 sm:px-6">
        <section className="rounded-lg border px-5 py-5" aria-labelledby="lab-intro">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
            <div className="min-w-0 max-w-2xl space-y-2">
              <h2 id="lab-intro" className="text-lg leading-snug font-semibold tracking-tight">
                Five ways Ondo integrations fail
              </h2>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                The happy path misses null data, session rules, executable pricing, safety controls, and mixed
                timestamp units. These five examples show the failure and the handling to ship instead.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAll((value) => !value);
                setCategory("all");
              }}
            >
              {showAll ? "Show five highlights" : `Browse all ${labChecks.length} conditions`}
            </Button>
          </div>
        </section>

        <div className="mt-5">
          <div className="min-w-0">
            {showAll ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  {shown.length} of {labChecks.length} conditions
                </p>
                <label className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Area</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="border-input bg-background h-8 rounded-md border px-2.5 text-xs"
                  >
                    <option value="all">All areas</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Start with the five failures that cut across the stack.</p>
            )}

            <div className="mt-3 overflow-hidden rounded-lg border">
              {shown.map((check) => {
                const index = labChecks.indexOf(check);
                const result = results?.[index];
                const verdict = verdictMeta[check.verdict];
                const VerdictIcon = verdict.icon;
                const open = openId === check.id;
                return (
                  <div key={check.id} id={check.id} className="border-b last:border-b-0 scroll-mt-24">
                    <div
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 transition-colors",
                        open ? "bg-muted/50" : "hover:bg-muted/30",
                      )}
                    >
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`${check.id}-detail`}
                        onClick={() => setOpenId(open ? null : check.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium">{check.title}</span>
                          <span className="text-muted-foreground block text-[11px]">{check.category}</span>
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={cn("shrink-0 gap-1 text-[10px] font-semibold", verdict.className)}
                            >
                              <VerdictIcon className="size-3" /> {verdict.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">{verdict.explain}</TooltipContent>
                        </Tooltip>
                        <span className="text-muted-foreground hidden w-[32%] shrink-0 text-[11px] leading-snug lg:block">
                          {check.correct[0]}
                        </span>
                        <ChevronDown
                          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
                        />
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            aria-label={`Copy link to ${check.title}`}
                            onClick={() => {
                              void navigator.clipboard.writeText(
                                `${window.location.origin}${window.location.pathname}#${check.id}`,
                              );
                              history.replaceState(null, "", `#${check.id}`);
                            }}
                          >
                            <Link2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy link to this condition</TooltipContent>
                      </Tooltip>
                    </div>
                    {open ? (
                      <div id={`${check.id}-detail`}>
                        <CheckDetail check={check} result={result} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <Collapsible className="mt-6 rounded-lg border">
          <CollapsibleTrigger className="text-muted-foreground flex w-full items-center gap-2 px-4 py-3 text-xs [&[data-state=open]>svg:last-child]:rotate-180">
            Everything the conditions read —{" "}
            {labEndpointDirectory.length + labStreamDirectory.length + labPerpsDirectory.length} endpoints, streams,
            and channels
            <ChevronDown className="ml-auto size-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...labEndpointDirectory, ...labStreamDirectory, ...labPerpsDirectory].map((endpoint) => (
              <div key={endpoint.path} className="rounded-md border p-2.5">
                <code className="font-mono text-[10px] break-words">{endpoint.path}</code>
                <p className="text-muted-foreground mt-1 text-[11px]">{endpoint.note}</p>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="mt-3 rounded-lg border">
          <CollapsibleTrigger className="text-muted-foreground flex w-full items-center gap-2 px-4 py-3 text-xs [&[data-state=open]>svg:last-child]:rotate-180">
            Use these fixtures in your own tests
            <ChevronDown className="ml-auto size-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 px-4 pb-4">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Every payload on this page is exported as one file, rebuilt from the same data the matrix renders.
              Pull it into your repo:
            </p>
            <div className="bg-muted/60 rounded-lg border">
              <div className="flex items-center justify-between gap-2 border-b px-3 py-1.5">
                <code className="text-muted-foreground font-mono text-[10px]">shell</code>
                <CopyButton text={`curl -O ${FIXTURES_URL}`} label="Copy" />
              </div>
              <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[10px] leading-relaxed">
                {`curl -O ${FIXTURES_URL}`}
              </pre>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Then loop it. No package to install and nothing to keep in sync — the file carries every condition,
              its fixtures, and a permalink back to the row that explains it.
            </p>
            <div className="bg-muted/60 rounded-lg border">
              <div className="flex items-center justify-between gap-2 border-b px-3 py-1.5">
                <code className="text-muted-foreground font-mono text-[10px]">ondo.test.ts</code>
                <CopyButton text={testHarness} label="Copy" />
              </div>
              <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[10px] leading-relaxed">{testHarness}</pre>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              That asserts your client survives every payload, which is the whole test for the{" "}
              <strong className="text-foreground">{counts.crashes}</strong> conditions that throw. The other{" "}
              <strong className="text-foreground">{counts.wrong + counts.degraded}</strong> fail quietly — nothing
              throws, the answer is just wrong — so those need an assertion about your own behaviour. Each row lists
              what to ship instead, and <code className="font-mono">shipInstead</code> carries the same lines in the
              export.
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="mt-3 rounded-lg border">
          <CollapsibleTrigger className="text-muted-foreground flex w-full items-center gap-2 px-4 py-3 text-xs [&[data-state=open]>svg:last-child]:rotate-180">
            Method, coverage, and verification
            <ChevronDown className="ml-auto size-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-4 pb-4 text-xs leading-relaxed">
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2.5"
              aria-label="Contract verification"
            >
              <ShieldCheck className={verification.ok ? "text-premium size-4" : "text-destructive size-4"} />
              <span>
                <strong>{verification.claimChecks}</strong> claims checked against{" "}
                <strong>{verification.sources.length}</strong> live sources —{" "}
                {verification.ok ? "all holding" : `${verification.failures.length} drifted`}
              </span>
              <span className="text-muted-foreground ml-auto">{verifiedOn}</span>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span><strong className="text-foreground">{labChecks.length}</strong> conditions</span>
              <span><strong className="text-foreground">{labEndpointDirectory.length}</strong> REST endpoints</span>
              <span><strong className="text-foreground">{labStreamDirectory.length}</strong> stream RPCs</span>
              <span><strong className="text-foreground">{labPerpsDirectory.length}</strong> perps routes</span>
              <span>
                <strong className="text-foreground">{counts.crashes}</strong> crash ·{" "}
                <strong className="text-foreground">{counts.wrong}</strong> wrong ·{" "}
                <strong className="text-foreground">{counts.degraded}</strong> degrade
              </span>
            </div>
            <p className="text-muted-foreground">
              Every fixture comes from a document Ondo publishes: the GM OpenAPI contract, streaming{" "}
              <code className="font-mono">.proto</code>, Error Codes, caching guidance, and the Perps REST and
              WebSocket specs. Values are illustrative because the live APIs require credentials.
            </p>
            <p className="text-muted-foreground">{verificationSources}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://docs.ondo.finance/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
              >
                OpenAPI <ArrowUpRight className="size-3.5" />
              </a>
              <a
                href="https://github.com/zacharyr0th/ondo-integration-lab/actions/workflows/verify-contract.yml"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
              >
                Verification CI <ArrowUpRight className="size-3.5" />
              </a>
              <a
                href="https://github.com/zacharyr0th/ondo-integration-lab/blob/main/scripts/verify-contract.ts"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
              >
                Verification source <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </main>
      <AppFooter page="lab" />
    </div>
  );
}
