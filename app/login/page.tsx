"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(tenantId.trim() ? { tenantId: tenantId.trim() } : {}),
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to sign in");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafd] px-4 py-10 text-[#202124] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-[28px] border border-[#dadce0] bg-white px-7 py-9 shadow-[0_2px_8px_rgba(60,64,67,0.08)] sm:px-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-xl font-semibold text-[#1a73e8]">
              E
            </div>
            <h1 className="text-[28px] font-normal tracking-[-0.02em] text-[#202124]">Sign in</h1>
            <p className="mt-2 text-sm text-[#5f6368]">Access your institution workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#3c4043]">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-lg border border-[#dadce0] bg-white px-4 text-[15px] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15"
                placeholder="you@institution.edu"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#3c4043]">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-lg border border-[#dadce0] bg-white px-4 text-[15px] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15"
                placeholder="Enter your password"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#3c4043]">Institution ID</span>
              <input
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                className="h-12 w-full rounded-lg border border-[#dadce0] bg-white px-4 text-[15px] outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15"
                placeholder="Optional when you have one membership"
              />
              <span className="mt-2 block text-xs leading-5 text-[#5f6368]">
                If your account belongs to multiple institutions, enter the institution ID you want to use.
              </span>
            </label>

            {error ? (
              <div role="alert" className="rounded-lg bg-[#fce8e6] px-4 py-3 text-sm text-[#b3261e]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-[#1a73e8] px-6 text-sm font-medium text-white transition hover:bg-[#185abc] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-[#5f6368]">
            Your institution access is protected by tenant-scoped authentication and authorization.
          </p>
        </section>
      </div>
    </main>
  );
}
