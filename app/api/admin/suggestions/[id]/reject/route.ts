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
    | { reviewer_note?: string }
    | null;
  const note = body?.reviewer_note?.trim() ?? "";
  if (note.length < 5 || note.length > 100) {
    return NextResponse.json({ error: "理由需要 5-100 字" }, { status: 400 });
  }

  const { error } = await ctx.supabase
    .from("question_suggestions")
    .update({
      status: "rejected",
      reviewer_id: ctx.user.id,
      reviewer_note: note,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
