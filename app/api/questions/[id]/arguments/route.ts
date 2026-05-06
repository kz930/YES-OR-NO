import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const questionId = Number(id);
  if (!Number.isFinite(questionId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { content?: string } | null;
  if (!body?.content || body.content.trim().length === 0) {
    return NextResponse.json({ error: "评论不能为空" }, { status: 400 });
  }
  if (body.content.length > 200) {
    return NextResponse.json({ error: "评论最多 200 字" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Must have voted on this question first
  const { data: vote } = await supabase
    .from("votes")
    .select("current_side")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (!vote) {
    return NextResponse.json(
      { error: "先投票才能评论" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("arguments").insert({
    user_id: user.id,
    question_id: questionId,
    side: vote.current_side,
    content: body.content.trim(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
