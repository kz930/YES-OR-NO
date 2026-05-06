import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Body {
  nickname?: string;
  avatar_url?: string | null;
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const update: { nickname?: string; avatar_url?: string | null } = {};

  if (body.nickname !== undefined) {
    const trimmed = body.nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 12) {
      return NextResponse.json({ error: "昵称需要 2-12 字" }, { status: 400 });
    }
    update.nickname = trimmed;
  }

  if (body.avatar_url !== undefined) {
    // Allow null to clear it
    update.avatar_url = body.avatar_url || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "昵称已被使用,换一个" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
