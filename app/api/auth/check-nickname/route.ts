import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const nickname = new URL(req.url).searchParams.get("nickname")?.trim() ?? "";

  if (nickname.length < 2 || nickname.length > 12) {
    return NextResponse.json({
      available: false,
      reason: "length",
    });
  }

  const supabase = await createClient();
  // Use public_profiles view — anon-readable + no email exposure.
  const { count } = await supabase
    .from("public_profiles")
    .select("*", { count: "exact", head: true })
    .eq("nickname", nickname);

  return NextResponse.json({
    available: (count ?? 0) === 0,
  });
}
