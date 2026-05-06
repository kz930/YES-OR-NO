import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getContext(
  req: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  const { id } = await paramsPromise;
  const questionId = Number(id);
  if (!Number.isFinite(questionId)) {
    return { error: NextResponse.json({ error: "Invalid id" }, { status: 400 }) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { questionId, supabase, user };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getContext(req, params);
  if ("error" in ctx) return ctx.error;
  const { questionId, supabase, user } = ctx;

  const { error } = await supabase.from("question_likes").insert({
    user_id: user.id,
    question_id: questionId,
  });
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getContext(req, params);
  if ("error" in ctx) return ctx.error;
  const { questionId, supabase, user } = ctx;

  const { error } = await supabase
    .from("question_likes")
    .delete()
    .eq("user_id", user.id)
    .eq("question_id", questionId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
