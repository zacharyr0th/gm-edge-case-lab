import { FlaskConical, Gauge } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navLink =
  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors";

export function AppHeader({ active }: { active: "basis" | "lab" }) {
  const isBasis = active === "basis";
  return (
    // A backdrop filter makes this element the containing block for any fixed
    // descendant, which would dock the mobile nav inside the header instead of
    // the viewport. Solid background below md, blur only where the nav is static.
    <header className="bg-background sticky top-0 z-40 border-b md:bg-background/80 md:backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[1384px] grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 sm:px-6 md:grid-cols-[minmax(200px,1fr)_auto_minmax(200px,1fr)]">
        <Link href={isBasis ? "/" : "/lab"} className="flex min-w-0 items-center gap-2.5">
          <span className="bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold max-md:hidden">
            ON
          </span>
          <span className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight">
              {isBasis ? "GM Off-Hours Monitor" : "Ondo Integration Lab"}
            </h1>
            <span className="text-muted-foreground block truncate text-[11px] max-md:hidden">
              {isBasis ? "Weekend price dislocation" : "Integration compatibility"}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className={cn(
            "bg-muted flex items-center gap-1 rounded-lg border p-1",
            // The header sets a backdrop filter, which would otherwise become the
            // containing block for a fixed child and dock this inside the header.
            "max-md:fixed max-md:inset-x-3 max-md:top-auto max-md:bottom-3 max-md:z-50 max-md:justify-center max-md:shadow-lg max-md:bg-background",
          )}
        >
          <Link
            href="/"
            aria-current={isBasis ? "page" : undefined}
            className={cn(
              navLink,
              "max-md:w-1/2 max-md:justify-center",
              isBasis ? "bg-background text-foreground border shadow-xs max-md:bg-muted" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Gauge className="size-4" /> Basis
          </Link>
          <Link
            href="/lab"
            aria-current={!isBasis ? "page" : undefined}
            className={cn(
              navLink,
              "max-md:w-1/2 max-md:justify-center",
              !isBasis ? "bg-background text-foreground border shadow-xs max-md:bg-muted" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FlaskConical className="size-4" /> Lab
          </Link>
        </nav>

        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
