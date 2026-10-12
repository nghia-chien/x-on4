import { NextResponse } from "next/server";
import { connectToDatabase, getMongoDiagnostics } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Public DB health check — no secrets, for diagnosing Vercel 503s. */
export async function GET() {
  const before = getMongoDiagnostics();
  if (!before.configured) {
    return NextResponse.json(
      {
        ok: false,
        ...before,
        hint: before.hint,
      },
      { status: 503 }
    );
  }

  const conn = await connectToDatabase();
  const after = getMongoDiagnostics();

  if (!conn) {
    return NextResponse.json(
      {
        ok: false,
        ...after,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    connected: true,
    code: null,
    error: null,
    hint: null,
  });
}
