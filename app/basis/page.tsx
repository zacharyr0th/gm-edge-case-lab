import { redirect } from "next/navigation";

// The basis monitor moved to the root; keep the old path working.
export default function BasisRedirect() {
  redirect("/");
}
