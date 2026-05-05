export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-xl space-y-6">
        <p className="text-sm font-semibold tracking-wider text-emerald-600 uppercase">
          假设 · MVP scaffold
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          5 分钟,一道脑洞题,
          <br />
          先选边再开战。
        </h1>
        <p className="text-lg text-muted-foreground">
          工程骨架已就绪。下一步:配置 Supabase 项目,把环境变量填入{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            .env.local
          </code>
          ,然后开始 Sprint 1。
        </p>
      </div>
    </main>
  );
}
