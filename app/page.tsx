import type { Metadata } from "next";
import { BasisMonitor } from "@/components/basis-monitor/basis-monitor";
import { loadBasisData } from "@/lib/basis-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "GM Weekend Basis",
  description: "Live premium or discount of every Ondo GM token vs the underlying's last U.S. close.",
  robots: { index: false, follow: false },
};

export default async function HomePage() {
  const data = await loadBasisData();
  return <BasisMonitor data={data} />;
}
