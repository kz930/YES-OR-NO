import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const [{ count: voteCount }, { count: argumentCount }] = await Promise.all([
    supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("arguments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {profile?.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.nickname} />
            )}
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
              {profile?.nickname?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile?.nickname}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="投票" value={voteCount ?? 0} />
          <Stat label="论点" value={argumentCount ?? 0} />
        </div>
      </Card>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
