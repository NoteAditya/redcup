import Link from "next/link";
import { formatINR } from "@/lib/money";

export type BountyCardProps = {
  href: string;
  title: string;
  brandName?: string;
  status: string;
  budgetPaise: number;
  slots: number;
  niche?: string;
};

export function BountyCard({
  href,
  title,
  brandName,
  status,
  budgetPaise,
  slots,
  niche,
}: BountyCardProps) {
  const isLive = ["live", "shortlisted", "in_production", "tracking"].includes(status);
  const chipClass = isLive ? "chip chip-ok" : "chip";

  return (
    <Link href={href} className="bounty-card" prefetch>
      <div className="bounty-card-top">
        <div>
          <strong className="bounty-card-title">{title}</strong>
          <div className="bounty-card-sub">
            {brandName || "Brand"}
            {niche ? ` · ${niche}` : ""} · {slots} slot{slots === 1 ? "" : "s"}
          </div>
        </div>
        <span className={chipClass}>{status.replace(/_/g, " ")}</span>
      </div>

      <div className="bounty-card-foot">
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
            Creator Pool
          </span>
          <div className="bounty-card-budget">{formatINR(budgetPaise)}</div>
        </div>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--accent)" }}>
          View Details
        </span>
      </div>
    </Link>
  );
}
