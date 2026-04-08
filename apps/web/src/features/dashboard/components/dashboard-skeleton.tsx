export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:block">
          <div className="h-16 animate-pulse border-b border-slate-100 bg-slate-100" />
          <div className="space-y-3 p-4">
            <div className="h-9 animate-pulse rounded-md bg-slate-100" />
            <div className="h-9 animate-pulse rounded-md bg-slate-100" />
            <div className="h-9 animate-pulse rounded-md bg-slate-100" />
          </div>
        </aside>
        <div className="min-h-screen flex-1">
          <header className="h-16 animate-pulse border-b border-slate-200 bg-white" />
          <main className="p-6">
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
    </div>
  );
}
