"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  userId: string;
  initialNickname: string;
  initialAvatarUrl: string | null;
  email: string;
}

export function ProfileEditor({
  userId,
  initialNickname,
  initialAvatarUrl,
  email,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(initialNickname);
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function saveNickname() {
    const next = draftName.trim();
    if (next === nickname) {
      setEditing(false);
      return;
    }
    if (next.length < 2 || next.length > 50) {
      toast.error("昵称需要 2-50 字");
      return;
    }
    setSavingName(true);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: next }),
    });
    setSavingName(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "改名失败");
      return;
    }
    setNickname(next);
    setEditing(false);
    toast.success("昵称已更新");
    router.refresh();
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("只支持 JPG / PNG / WebP");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("文件超过 5 MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadErr) {
        toast.error(`上传失败:${uploadErr.message}`);
        return;
      }

      const { data: pub } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      const newUrl = pub.publicUrl;

      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: newUrl }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "保存头像失败");
        return;
      }

      setAvatarUrl(newUrl);
      toast.success("头像已更新");
      router.refresh();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="group relative shrink-0"
        aria-label="更换头像"
      >
        <Avatar className="h-16 w-16 ring-4 ring-cream transition-opacity group-hover:opacity-80">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={nickname} />}
          <AvatarFallback className="bg-forest text-2xl font-bold text-white">
            {nickname.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? "上传中…" : "换头像"}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPickFile}
        className="hidden"
      />

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={50}
              autoFocus
              disabled={savingName}
              className="w-full max-w-[180px] rounded-lg border border-border bg-card px-2 py-1 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-forest/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNickname();
                if (e.key === "Escape") {
                  setDraftName(nickname);
                  setEditing(false);
                }
              }}
            />
            <button
              type="button"
              onClick={saveNickname}
              disabled={savingName}
              className="rounded-lg bg-forest px-3 py-1 text-xs font-semibold text-white hover:bg-forest-2 disabled:opacity-60"
            >
              {savingName ? "…" : "保存"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftName(nickname);
                setEditing(false);
              }}
              disabled={savingName}
              className="text-xs text-ink-soft hover:text-ink"
            >
              取消
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="truncate text-2xl font-semibold -tracking-[0.01em] text-ink">
              {nickname}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-ink-soft hover:text-forest"
              aria-label="改昵称"
            >
              ✎ 改
            </button>
          </div>
        )}
        <p className="text-sm text-ink-soft">{email}</p>
        <p className="mt-0.5 text-[10px] text-ink-soft">
          邮箱仅你自己可见
        </p>
      </div>
    </div>
  );
}
