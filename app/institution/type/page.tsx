"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApplicationShell } from "@/components/application-shell";
import { InstitutionNavigation } from "@/components/institution/institution-navigation";

type InstitutionType = { id: string; code: string; name: string; description: string | null; capabilities: Array<{ enabled: boolean; capability: { id: string; name: string } }> };

export default function InstitutionTypePage() {
  const [types, setTypes] = useState<InstitutionType[]>([]);
  const [current, setCurrent] = useState<InstitutionType | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [typesResponse, currentResponse] = await Promise.all([
        fetch("/api/platform/institution-types", { cache: "no-store" }),
        fetch("/api/institution/type", { cache: "no-store" }),
      ]);
      const typesData = await typesResponse.json();
      const currentData = await currentResponse.json();
      if (!typesResponse.ok) throw new Error(typesData.error ?? "Unable to load institution types.");
      if (!currentResponse.ok) throw new Error(currentData.error ?? "Unable to load the current institution type.");
      setTypes(typesData.institutionTypes);
      setCurrent(currentData.institutionType);
      setSelectedId(currentData.institutionType?.id ?? "");
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "We couldn't load the institution type. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    if (!selectedId || selectedId === current?.id) return;
    const selected = types.find((item) => item.id === selectedId);
    if (!selected) return;
    if (!window.confirm("Changing the institution type may change which features are available. Existing records will not be deleted. Continue?")) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/institution/type", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ institutionTypeId: selectedId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't update the institution type. Please try again.");
      setCurrent(data.institutionType);
      setMessage({ kind: "success", text: "Institution type updated successfully." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "We couldn't update the institution type. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ApplicationShell pageTitle="Institution type" pageContext="Choose the category that best describes your institution" selectedKey="institution">
      <div className="mx-auto max-w-5xl space-y-5">
        <nav aria-label="Breadcrumb" className="text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Home</Link><span className="mx-2">/</span><Link href="/institution" className="hover:text-[#1a73e8]">Institution</Link><span className="mx-2">/</span><span className="text-[#202124]">Institution type</span></nav>
        <div><h1 className="mb-1 text-[28px] font-medium tracking-[-0.02em] text-[#202124]">Institution type</h1><p className="m-0 max-w-2xl text-sm leading-6 text-[#5f6368]">This setting helps EduInstitution show the right features for your institution.</p></div>
        <InstitutionNavigation />
        {message ? <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${message.kind === "success" ? "border-[#c6e7d0] bg-[#e6f4ea] text-[#137333]" : "border-[#f1c6c6] bg-[#fce8e6] text-[#a50e0e]"}`}>{message.text}</div> : null}
        <section className="rounded-2xl border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,.06)] sm:p-6">
          {loading ? <p className="m-0 text-sm text-[#5f6368]">Loading institution types...</p> : <>
            <label htmlFor="institution-type" className="block text-sm font-medium text-[#202124]">Institution type</label>
            <p className="mt-1 mb-3 text-xs leading-5 text-[#5f6368]">Choose the category that most closely matches your institution.</p>
            <select id="institution-type" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] sm:max-w-xl">
              <option value="">Select an institution type</option>
              {types.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {types.find((item) => item.id === selectedId)?.description ? <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-[#5f6368]">{types.find((item) => item.id === selectedId)?.description}</p> : null}
            <div className="mt-6 border-t border-[#e8eaed] pt-5"><h2 className="mb-1 text-base font-medium text-[#202124]">What changes when you switch?</h2><p className="m-0 text-sm leading-6 text-[#5f6368]">The selected type determines which platform features are available. Existing records are not deleted when you change this setting.</p></div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => void save()} disabled={saving || !selectedId || selectedId === current?.id} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#188038] px-5 text-sm font-medium text-white transition hover:bg-[#137333] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div>
          </>}
        </section>
      </div>
    </ApplicationShell>
  );
}
