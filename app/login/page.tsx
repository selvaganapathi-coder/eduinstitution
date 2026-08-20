"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Institution = { id: string; name: string; slug: string };

const colors = {
  ink: "#17352d",
  muted: "#5f6f69",
  border: "#d9e4df",
  green: "#0c6b4f",
};

function InstitutionMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-11 w-11 items-center justify-center rounded-xl ${inverse ? "bg-white/10 text-white" : "bg-[#e9f5ef] text-[#0c6b4f]"}`}
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
        <path d="M16 4 3 10v3h26v-3L16 4Zm-9 11v10H5v3h22v-3h-2V15h-4v10h-3V15h-4v10h-3V15H7Z" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [institutionStep, setInstitutionStep] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function readJson(response: Response) {
    return (await response.json()) as { error?: string; institutions?: Institution[] };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!institutionStep) {
        const response = await fetch("/api/auth/institutions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const result = await readJson(response);

        if (!response.ok) {
          setError(result.error ?? "Unable to verify your credentials");
          return;
        }

        const available = result.institutions ?? [];
        if (available.length === 1) {
          await signIn(available[0].id);
          return;
        }

        if (available.length === 0) {
          setError("Your account does not have an active institution membership");
          return;
        }

        setInstitutions(available);
        setTenantId(available[0].id);
        setInstitutionStep(true);
        return;
      }

      await signIn(tenantId);
    } catch {
      setError("Unable to sign in right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function signIn(selectedTenantId: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, tenantId: selectedTenantId }),
    });
    const result = await readJson(response);

    if (!response.ok) {
      setError(result.error ?? "Unable to sign in");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7fbf8] px-4 py-4 text-[#17352d] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1240px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(7,84,63,0.10)] lg:min-h-[calc(100vh-4rem)] lg:flex-row">
        <section className="relative flex min-h-[460px] w-full flex-col overflow-hidden bg-[#076653] p-7 text-white sm:p-10 lg:w-[43%] lg:p-12">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border-[70px] border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#0c7b59]/60 blur-sm" />
          <div className="relative z-10 flex items-center gap-3">
            <InstitutionMark inverse />
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em]">EduInstitution</p>
              <p className="text-xs text-white/65">Institution management platform</p>
            </div>
          </div>
          <div className="relative z-10 mt-auto max-w-md pb-8 pt-20 lg:pt-28">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-[#dff51f]">Built for education</p>
            <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
              Empowering education.<span className="block text-[#dff51f]">Together.</span>
            </h2>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/75">A unified workspace for institutions, educators, students, and administrators.</p>
            <div className="mt-8 flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dff51f] text-[#07543f]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2"><path d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
              </div>
              <div><p className="text-sm font-medium">Secure by design</p><p className="text-xs leading-5 text-white/60">Tenant-scoped access and protected sessions.</p></div>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center bg-white px-6 py-10 sm:px-10 lg:w-[57%] lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-9 flex items-center gap-3 lg:hidden"><InstitutionMark /><div><p className="font-semibold tracking-[-0.02em]" style={{ color: colors.ink }}>EduInstitution</p><p className="text-xs" style={{ color: colors.muted }}>Institution management platform</p></div></div>
            <div className="mb-8">
              <h1 className="text-[32px] font-semibold tracking-[-0.035em]" style={{ color: colors.ink }}>{institutionStep ? "Choose institution" : "Sign in"}</h1>
              <p className="mt-2 text-[15px] leading-6" style={{ color: colors.muted }}>{institutionStep ? "Select the institution you want to access." : "Welcome back. Sign in to continue to your institution workspace."}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!institutionStep ? <>
                <label className="block"><span className="mb-2 block text-sm font-medium" style={{ color: colors.ink }}>Email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border bg-white px-4 text-[15px] outline-none transition placeholder:text-[#8a9993] focus:border-[#0c6b4f] focus:ring-4 focus:ring-[#0c6b4f]/10" style={{ borderColor: colors.border }} placeholder="you@institution.edu" /></label>
                <label className="block"><span className="mb-2 block text-sm font-medium" style={{ color: colors.ink }}>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border bg-white px-4 text-[15px] outline-none transition placeholder:text-[#8a9993] focus:border-[#0c6b4f] focus:ring-4 focus:ring-[#0c6b4f]/10" style={{ borderColor: colors.border }} placeholder="Enter your password" /></label>
              </> : <label className="block"><span className="mb-2 block text-sm font-medium" style={{ color: colors.ink }}>Institution</span><select required value={tenantId} onChange={(event) => setTenantId(event.target.value)} className="h-12 w-full rounded-xl border bg-white px-4 text-[15px] outline-none transition focus:border-[#0c6b4f] focus:ring-4 focus:ring-[#0c6b4f]/10" style={{ borderColor: colors.border }}>{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}</select></label>}

              {error ? <div role="alert" className="rounded-xl border border-[#f3c7c2] bg-[#fff6f5] px-4 py-3 text-sm leading-5 text-[#a5271d]">{error}</div> : null}
              <button type="submit" disabled={loading} className="h-12 w-full rounded-xl px-6 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(12,107,79,0.18)] transition hover:bg-[#07543f] focus:outline-none focus:ring-4 focus:ring-[#0c6b4f]/20 disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: colors.green }}>{loading ? "Checking…" : institutionStep ? "Sign in" : "Continue"}</button>
              {institutionStep ? <button type="button" onClick={() => { setInstitutionStep(false); setError(""); }} className="w-full text-sm font-medium text-[#0c6b4f]">Back</button> : null}
            </form>

            <div className="my-7 flex items-center gap-4"><div className="h-px flex-1 bg-[#e5ece8]" /><span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Secure access</span><div className="h-px flex-1 bg-[#e5ece8]" /></div>
            <div className="flex items-start gap-3 rounded-xl bg-[#f5faf7] px-4 py-3.5"><div className="mt-0.5 text-[#0c6b4f]"><svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></div><p className="text-xs leading-5" style={{ color: colors.muted }}>Your session is protected with tenant-scoped authentication and an HTTP-only security cookie.</p></div>
            <p className="mt-8 text-center text-xs leading-5" style={{ color: colors.muted }}>Need access? Contact your institution administrator.</p>
          </div>
        </section>
      </div>
      <footer className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-3 px-2 py-5 text-xs sm:flex-row" style={{ color: colors.muted }}><span>© 2026 EduInstitution. All rights reserved.</span><div className="flex flex-wrap items-center justify-center gap-5"><span>Secure authentication</span><span>Tenant isolated</span><span>Cloud ready</span></div></footer>
    </main>
  );
}
