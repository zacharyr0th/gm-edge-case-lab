import type { Metadata } from "next";
import { EdgeCaseLab } from "@/components/edge-case-lab/edge-case-lab";

export const metadata: Metadata = {
  title: "Ondo Integration Lab",
  description:
    "Unofficial compatibility matrix: documented Ondo Stocks production states replayed against a happy-path integration.",
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return <EdgeCaseLab />;
}
