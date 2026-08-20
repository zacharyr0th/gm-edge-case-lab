/**
 * Machine-readable export of the matrix, so a dev can pull every fixture into
 * their own test suite with one curl instead of copying rows by hand.
 *
 * Deliberately not an npm package: the payload is the contract, and it is
 * regenerated from `labChecks` on every build, so it cannot drift from the page.
 */
import { labChecks, contractSource } from "@/lib/edge-case-lab-data";
import verification from "@/lib/contract-verification.json";

export const dynamic = "force-static";

const SITE = "https://ondo-integration-lab.vercel.app";

export function GET() {
  return Response.json(
    {
      about:
        "Payloads the Ondo APIs can return, one group per documented failure condition. " +
        "Feed them to your own client and assert it survives. See " +
        SITE,
      source: SITE,
      readme: "https://github.com/zacharyr0th/ondo-integration-lab",
      contract: {
        verifiedAt: verification.verifiedAt,
        claims: verification.claimChecks,
        holding: verification.ok,
        sources: verification.sources,
        specVersion: contractSource.version,
      },
      conditions: labChecks.map((check) => ({
        id: check.id,
        title: check.title,
        area: check.category,
        // crashes | wrong | degraded — what the naive handling does with these payloads.
        verdict: check.verdict,
        assumptionThatBreaks: check.naiveAssumption,
        shipInstead: check.correct,
        userCopy: check.userCopy,
        endpoints: check.endpoints,
        doc: check.doc,
        permalink: `${SITE}/#${check.id}`,
        fixtures: check.fixtures,
      })),
    },
    { headers: { "cache-control": "public, max-age=0, must-revalidate" } },
  );
}
