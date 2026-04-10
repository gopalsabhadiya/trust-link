export function DashboardSkeleton() {
  return (
    <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-slate-50">
      <aside className="hidden h-full min-h-0 w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="h-16 shrink-0 animate-pulse border-b border-slate-100 bg-slate-100" />
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <div className="h-9 animate-pulse rounded-md bg-slate-100" />
          <div className="h-9 animate-pulse rounded-md bg-slate-100" />
          <div className="h-9 animate-pulse rounded-md bg-slate-100" />
        </div>
      </aside>
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <header className="h-16 shrink-0 animate-pulse border-b border-slate-200 bg-white" />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 animate-pulse rounded-md bg-slate-200/80" />
            <div className="h-32 animate-pulse rounded-md bg-slate-200/80" />
            <div className="h-32 animate-pulse rounded-md bg-slate-200/80" />
          </div>
          <div className="mt-6 h-64 animate-pulse rounded-md bg-slate-200/60" />
        </main>
      </div>
    </div>
  );
}
