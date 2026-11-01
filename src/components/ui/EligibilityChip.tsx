import type { EligibilityStatus } from "@/lib/types";

const LABEL: Record<EligibilityStatus, string> = {
  ELIGIBLE: "Eligible",
  ALMOST: "Almost Eligible",
  NOT_ELIGIBLE: "Not Eligible",
  INCOMPLETE: "Incomplete Profile",
  NOT_VERIFIED: "Not Verified",
};

export function EligibilityChip({ status }: { status: EligibilityStatus }) {
  const cls =
    status === "ELIGIBLE"
      ? "chip chip-ok"
      : status === "ALMOST"
        ? "chip chip-warn"
        : "chip chip-bad";
  return <span className={cls}>{LABEL[status]}</span>;
}
