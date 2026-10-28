import { NextResponse } from "next/server";
import { previewEligibleCount } from "@/server/services/campaigns";
import type { CampaignCriteria } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as CampaignCriteria;
  const count = await previewEligibleCount(body);
  return NextResponse.json({ count });
}
