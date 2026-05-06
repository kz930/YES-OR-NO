import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getContext(paramsPromise: Promise<{ id: string }>) {
  const { id } = await paramsPromise;
  if (!id) {
    return { error: NextResponse.json({ error: "Invalid id" }, { status: 400 }) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { argumentId: id, supabase, user };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getContext(params);
  if ("error" in ctx) return ctx.error;
  const { argumentId, supabase, user } = ctx;

  const { error } = await supabase.from("argument_likes").insert({
    user_id: user.id,
    argument_id: argumentId,
  });
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getContext(params);
  if ("error" in ctx) return ctx.error;
  const { argumentId, supabase, user } = ctx;

  const { error } = await supabase
    .from("argument_likes")
    .delete()
    .eq("user_id", user.id)
    .eq("argument_id", argumentId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
