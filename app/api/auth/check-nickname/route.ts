import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_LEN = 50;

function makeCandidates(base: string): string[] {
  // base + 1..9, each truncated to fit MAX_LEN total
  const out: string[] = [];
  for (let i = 1; i <= 9; i++) {
    const suffix = String(i);
    const trimmedBase = base.slice(0, MAX_LEN - suffix.length);
    out.push(trimmedBase + suffix);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const nickname = new URL(req.url).searchParams.get("nickname")?.trim() ?? "";

  if (nickname.length < 2 || nickname.length > MAX_LEN) {
    return NextResponse.json({
      available: false,
      reason: "length",
    });
  }

  const supabase = await createClient();

  // Check exact name. Use select+limit instead of count+head — more reliable.
  const { data: existing, error } = await supabase
    .from("public_profiles")
    .select("nickname")
    .eq("nickname", nickname)
    .limit(1);

  if (error) {
    // Don't block signup on a DB hiccup — let the unique-violation catch
    // at signup time handle it. Frontend treats this as 'idle'.
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!existing || existing.length === 0) {
    return NextResponse.json({ available: true });
  }

  // Taken — find a few free suggestions in one round trip
  const candidates = makeCandidates(nickname);
  const { data: takenRows } = await supabase
    .from("public_profiles")
    .select("nickname")
    .in("nickname", candidates);
  const takenSet = new Set((takenRows ?? []).map((r) => r.nickname));
  const suggestions = candidates
    .filter((c) => !takenSet.has(c))
    .slice(0, 3);

  return NextResponse.json({
    available: false,
    suggestions,
  });
}
