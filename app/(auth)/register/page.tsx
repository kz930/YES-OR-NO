"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type NicknameState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "taken" }
  | { kind: "invalid" };

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [nickState, setNickState] = useState<NicknameState>({ kind: "idle" });
  const [loading, setLoading] = useState(false);

  // Debounced nickname availability check
  useEffect(() => {
    const trimmed = nickname.trim();
    if (trimmed.length === 0) {
      setNickState({ kind: "idle" });
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 12) {
      setNickState({ kind: "invalid" });
      return;
    }
    setNickState({ kind: "checking" });

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-nickname?nickname=${encodeURIComponent(trimmed)}`
        );
        const body = (await res.json().catch(() => ({}))) as {
          available?: boolean;
        };
        if (cancelled) return;
        setNickState({ kind: body.available ? "available" : "taken" });
      } catch {
        if (!cancelled) setNickState({ kind: "idle" });
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nickname]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (nickState.kind === "taken") {
      toast.error("昵称已被使用,换一个");
      return;
    }
    if (nickState.kind === "invalid") {
      toast.error("昵称需要 2-12 个字符");
      return;
    }
    if (nickState.kind === "checking") {
      toast.error("正在检查昵称,稍等一下");
      return;
    }
    if (password.length < 6) {
      toast.error("密码至少 6 位");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nickname.trim() },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("nickname") || error.message.includes("unique")) {
        toast.error("昵称已被使用,换一个");
      } else if (error.message.includes("registered")) {
        toast.error("邮箱已注册,直接登录吧");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("注册成功,欢迎!");
    router.push("/");
    router.refresh();
  }

  const nickHint = (() => {
    switch (nickState.kind) {
      case "checking":
        return { text: "检查中…", color: "text-ink-soft" };
      case "available":
        return { text: "✓ 可以用", color: "text-forest" };
      case "taken":
        return { text: "✗ 已被使用", color: "text-blossom-2" };
      case "invalid":
        return { text: "需要 2-12 字符", color: "text-blossom-2" };
      default:
        return null;
    }
  })();

  const submitDisabled =
    loading ||
    nickState.kind === "checking" ||
    nickState.kind === "taken" ||
    nickState.kind === "invalid" ||
    nickState.kind === "idle";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="nickname">昵称</Label>
          {nickHint && (
            <span className={`text-xs font-medium ${nickHint.color}`}>
              {nickHint.text}
            </span>
          )}
        </div>
        <Input
          id="nickname"
          type="text"
          required
          minLength={2}
          maxLength={12}
          placeholder="2-12 个字符"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="至少 6 位"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitDisabled}>
        {loading ? "注册中..." : "注册"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        已有账号?{" "}
        <Link href="/login" className="font-semibold text-forest hover:underline">
          去登录
        </Link>
      </p>
    </form>
  );
}
