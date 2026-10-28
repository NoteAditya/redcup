import { NextResponse } from "next/server";
import { dbMode } from "@/server/db/store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "redcup",
    db: dbMode(),
    time: new Date().toISOString(),
  });
}
