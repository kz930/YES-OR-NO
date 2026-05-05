"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (nickname.length < 2 || nickname.length > 12) {
      toast.error("昵称需要 2-12 个字符");
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
        data: { nickname },
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
        <Label htmlFor="nickname">昵称</Label>
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
      <Button type="submit" className="w-full" disabled={loading}>
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
