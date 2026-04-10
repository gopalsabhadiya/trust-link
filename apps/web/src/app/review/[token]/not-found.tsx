import { TrustLinkLogoMark } from "@/components/brand";

export default function ReviewNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 flex items-center justify-center">
          <TrustLinkLogoMark />
        </div>
        <h1 className="text-xl font-semibold text-slate-800">Review link unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">
          This secure review link is invalid, expired, or has already been completed.
        </p>
      </div>
    </main>
  );
}
