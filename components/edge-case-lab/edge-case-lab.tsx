"use client";

import {
  ArrowUpRight,
  Braces,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  CircleX,
  ClipboardCheck,
  Copy,
  Link2,
  RotateCcw,
  Smartphone,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  integrationModes,
  labChecks,
  labEndpointDirectory,
  runNaive,
  type IntegrationMode,
  type LabCheck,
  type LabRun,
  type LabVerdict,
} from "@/lib/edge-case-lab-data";
import { AppFooter } from "@/components/ui/app-footer";
import { AppHeader } from "@/components/ui/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

function CheckDetail({ check, result, mode }: { check: LabCheck; result: LabRun | undefined; mode: IntegrationMode }) {
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
            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">{impactLabel[mode]}</p>
            <p className="mt-1 leading-relaxed">{check.impact[mode]}</p>
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
  const [mode, setMode] = useState<IntegrationMode>("wallet");
  const [runId, setRunId] = useState(0);
  const [openId, setOpenId] = useState<string | null>(labChecks[0]?.id ?? null);
  const [category, setCategory] = useState<string>("all");
  const [results, setResults] = useState<LabRun[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setResults(labChecks.map((check) => runNaive(check))), 350);
    return () => window.clearTimeout(timer);
  }, [runId]);

  // A shared link should land on the condition it names, whether it arrives as
  // a cold load or as a hash change on a page that is already open.
  useEffect(() => {
    function openFromHash() {
      const hash = window.location.hash.replace("#", "");
      if (!hash || !labChecks.some((check) => check.id === hash)) return;
      setOpenId(hash);
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
    () => labChecks.filter((check) => category === "all" || check.category === category),
    [category],
  );

  const counts = useMemo(
    () => ({
      crashes: labChecks.filter((c) => c.verdict === "crashes").length,
      wrong: labChecks.filter((c) => c.verdict === "wrong").length,
      degraded: labChecks.filter((c) => c.verdict === "degraded").length,
    }),
    [],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader active="lab" />
      <main className="mx-auto w-full max-w-[1384px] flex-1 px-5 py-6 sm:px-6">
        <section
          className="bg-muted/50 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-4 py-3"
          aria-label="Lab summary"
        >
          <ClipboardCheck className="text-muted-foreground size-4" />
          <div className="min-w-0">
            <strong className="block text-sm">Production matrix sign-off</strong>
            <span className="text-muted-foreground text-xs">
              Twelve public-docs-derived launch conditions for Ondo Stocks partner products.
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://docs.ondo.finance/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline underline-offset-2"
            >
              OpenAPI <ArrowUpRight className="size-3.5" />
            </a>
            <Button variant="outline" size="sm" onClick={() => { setResults(null); setRunId((v) => v + 1); }}>
              <RotateCcw /> Replay
            </Button>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span><strong className="text-foreground">{labChecks.length}</strong> production states</span>
              <span><strong className="text-foreground">{labEndpointDirectory.length}</strong> API endpoints</span>
              <span><strong className="text-foreground">3</strong> chains</span>
              <span>
                <strong className="text-foreground">{counts.crashes}</strong> crash ·{" "}
                <strong className="text-foreground">{counts.wrong}</strong> wrong ·{" "}
                <strong className="text-foreground">{counts.degraded}</strong> degrade
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-[10px] tracking-wide uppercase">Audit as</span>
                <ToggleGroup
                  type="single"
                  value={mode}
                  onValueChange={(value) => value && setMode(value as IntegrationMode)}
                  variant="outline"
                  size="sm"
                >
                  {integrationModes.map((item) => {
                    const Icon = modeIcons[item.id];
                    return (
                      <ToggleGroupItem key={item.id} value={item.id}>
                        <Icon className="size-3.5" /> {item.label}
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-[10px] tracking-wide uppercase">Area</span>
                <ToggleGroup
                  type="single"
                  value={category}
                  onValueChange={(value) => setCategory(value || "all")}
                  variant="outline"
                  size="sm"
                  className="flex-wrap"
                >
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  {categories.map((item) => (
                    <ToggleGroupItem key={item} value={item}>
                      {item}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border" key={runId}>
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
                        <span className="text-muted-foreground hidden w-[34%] shrink-0 text-[11px] leading-snug xl:block">
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
                        <CheckDetail check={check} result={result} mode={mode} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="space-y-4" aria-labelledby="purpose-title">
            <Card className="gap-0 rounded-lg py-5 shadow-none">
              <CardContent className="space-y-3 px-5">
                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">What this is</p>
                <h2 id="purpose-title" className="text-xl leading-snug font-semibold tracking-tight">
                  A production-readiness tool, not an endpoint demo.
                </h2>
                <p className="text-muted-foreground text-[13px] leading-relaxed">
                  The matrix models conditions an integration should explicitly handle, based on Ondo&rsquo;s public
                  API, product documentation, and chain-specific execution behavior.
                </p>
                <p className="text-muted-foreground text-[13px] leading-relaxed">
                  It checks whether the product stays safe when markets close, assets are restricted, token
                  economics change, quotes diverge, limits are reached, schemas evolve, or simulation produces a
                  false warning.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 rounded-lg py-5 shadow-none">
              <CardContent className="px-5">
                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  Use the matrix to create
                </p>
                <ol className="mt-3 space-y-2.5">
                  {[
                    "Partner acceptance criteria",
                    "Repeatable test fixtures",
                    "Launch gates and sign-off",
                    "Post-launch monitoring",
                  ].map((item, i) => (
                    <li key={item} className="flex items-center gap-3 text-[13px]">
                      <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="gap-0 rounded-lg py-5 shadow-none">
              <CardContent className="px-5">
                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Coverage</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {categories.map((item) => (
                    <Badge key={item} variant="secondary" className="text-[10px] font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <Collapsible className="mt-6 rounded-lg border">
          <CollapsibleTrigger className="text-muted-foreground flex w-full items-center gap-2 px-4 py-3 text-xs [&[data-state=open]>svg:last-child]:rotate-180">
            {labEndpointDirectory.length} endpoints in the contract surface
            <ChevronDown className="ml-auto size-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {labEndpointDirectory.map((endpoint) => (
              <div key={endpoint.path} className="rounded-md border p-2.5">
                <code className="font-mono text-[10px] break-words">{endpoint.path}</code>
                <p className="text-muted-foreground mt-1 text-[11px]">{endpoint.note}</p>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="mt-3 rounded-lg border">
          <CollapsibleTrigger className="text-muted-foreground flex w-full items-center gap-2 px-4 py-3 text-xs [&[data-state=open]>svg:last-child]:rotate-180">
            Methodology and sources
            <ChevronDown className="ml-auto size-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="text-muted-foreground px-4 pb-4 text-xs leading-relaxed">
            Fixtures mirror Ondo&rsquo;s published OpenAPI contract and announced changes. Values are illustrative;
            the live API requires an <code className="font-mono">x-api-key</code>. Independent prototype by Zachary
            Roth, not affiliated with Ondo Finance.
          </CollapsibleContent>
        </Collapsible>
      </main>
      <AppFooter page="lab" />
    </div>
  );
}
