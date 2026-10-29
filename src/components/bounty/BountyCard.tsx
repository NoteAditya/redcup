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

export function BountyCard({ href, title, brandName, status, budgetPaise, slots, niche }: BountyCardProps) {
  return (
    <Link href={href} className="bounty-card card" prefetch>
      <div className="bounty-card-top">
        <div>
          <strong className="bounty-card-title">{title}</strong>
          <div className="muted bounty-card-sub">
            {brandName || "Brand"}
            {niche ? ` · ${niche}` : ""} · {slots} slot{slots === 1 ? "" : "s"}
          </div>
        </div>
        <span className={`chip status-${status}`}>{status.replace(/_/g, " ")}</span>
      </div>
      <div className="bounty-card-foot">
        <span className="bounty-card-budget">{formatINR(budgetPaise)}</span>
        <span className="bounty-card-cta muted">View details →</span>
      </div>
    </Link>
  );
}
