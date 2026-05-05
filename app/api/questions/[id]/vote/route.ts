import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Side } from "@/types/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const questionId = Number(id);
  if (!Number.isFinite(questionId)) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { side?: Side } | null;
  if (!body || (body.side !== "a" && body.side !== "b")) {
    return NextResponse.json({ error: "side must be 'a' or 'b'" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify question exists and is published
  const { data: question } = await supabase
    .from("questions")
    .select("id, status")
    .eq("id", questionId)
    .single();
  if (!question || question.status !== "published") {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const { error } = await supabase.from("votes").insert({
    user_id: user.id,
    question_id: questionId,
    initial_side: body.side,
    current_side: body.side,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "你已经投过这道题了" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
