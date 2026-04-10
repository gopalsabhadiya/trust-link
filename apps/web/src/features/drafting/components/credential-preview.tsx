"use client";

import type { ExperienceLetterInput } from "@trustlink/shared";

export function CredentialPreview({ value }: { value: ExperienceLetterInput }) {
  const {
    employeeName,
    designation,
    joiningDate,
    relievingDate,
    keyAchievements,
    companyName,
    hrSignatoryName,
  } = value;

  return (
    <div className="relative mx-auto w-full max-w-[820px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
      <div className="aspect-[1/1.414] w-full overflow-auto p-6 md:p-10">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rotate-[-28deg] select-none text-6xl font-extrabold tracking-widest text-slate-200/60">
            DRAFT
          </span>
        </div>

        <header className="relative z-10 border-b-2 border-brand-blue pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-800">
                {companyName || "Company Name"}
              </p>
              <p className="mt-1 text-sm text-slate-500">Experience Letter</p>
            </div>
            <div className="rounded-md border border-dashed border-slate-300 px-4 py-2 text-xs text-slate-500">
              Company Logo
            </div>
          </div>
        </header>

        <article className="relative z-10 mt-8 font-serif text-[15px] leading-7 text-slate-800">
          <p>To whom it may concern,</p>
          <p className="mt-5">
            This is to certify that <strong>{employeeName || "Employee Name"}</strong> worked
            with <strong>{companyName || "Company Name"}</strong> as{" "}
            <strong>{designation || "Designation"}</strong> from{" "}
            <strong>{joiningDate || "Joining Date"}</strong> to{" "}
            <strong>{relievingDate || "Relieving Date"}</strong>.
          </p>

          <section className="mt-6">
            <h3 className="text-base font-semibold text-slate-800">Key Achievements</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {(keyAchievements.length > 0 ? keyAchievements : [""]).map((item, idx) => (
                <li key={idx}>{item || "Achievement point"}</li>
              ))}
            </ul>
          </section>

          <p className="mt-6">
            We appreciate the employee&apos;s contribution and wish them success in future
            endeavors.
          </p>

          <footer className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-semibold text-slate-800">{hrSignatoryName || "HR Signatory"}</p>
              <p className="text-sm text-slate-500">
                {companyName || "Company Name"} - Authorized Signatory
              </p>
            </div>
            <div className="rounded-md border border-dashed border-brand-green px-3 py-2 text-xs text-slate-500">
              <span className="font-semibold text-brand-green">Digital Trust Seal</span>
              <br />
              Signature Hash: (Generated on issue)
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
