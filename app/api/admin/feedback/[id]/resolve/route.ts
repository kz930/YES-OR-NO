import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as
    | { admin_reply?: string }
    | null;
  const reply = body?.admin_reply?.trim() ?? "";
  if (reply.length < 1 || reply.length > 1000) {
    return NextResponse.json(
      { error: "回复需要 1-1000 字" },
      { status: 400 }
    );
  }

  const { error } = await ctx.supabase
    .from("feedback")
    .update({
      status: "resolved",
      admin_reply: reply,
      resolver_id: ctx.user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
