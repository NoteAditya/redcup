import type { EligibilityStatus } from "@/lib/types";

const LABEL: Record<EligibilityStatus, string> = {
  ELIGIBLE: "Eligible",
  ALMOST: "Almost",
  NOT_ELIGIBLE: "Not eligible",
  INCOMPLETE: "Incomplete profile",
  NOT_VERIFIED: "Not verified",
};

export function EligibilityChip({ status }: { status: EligibilityStatus }) {
  const cls =
    status === "ELIGIBLE"
      ? "chip chip-ok"
      : status === "ALMOST"
        ? "chip chip-almost"
        : "chip chip-no";
  return <span className={cls}>{LABEL[status]}</span>;
}
