export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-forest leading-none">
            YES OR NO
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            一道脑洞题,你站哪边?
          </p>
        </div>
        <div className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border/60">
          {children}
        </div>
      </div>
    </main>
  );
}
