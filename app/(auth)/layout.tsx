export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">假设</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            5 分钟,一道脑洞题,先选边再开战。
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
