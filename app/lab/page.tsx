import { redirect } from "next/navigation";

// The lab moved to the root; keep the old path working.
export default function LabRedirect() {
  redirect("/");
}
