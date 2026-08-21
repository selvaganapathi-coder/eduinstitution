"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";

type Capability = { id: string; code: string; name: string; description: string | null };
type TypeCapability = { capabilityId: string; enabled: boolean; capability: Capability };
type InstitutionType = { id: string; code: string; name: string; description: string | null; status: string; capabilities: TypeCapability[]; _count?: { tenants: number } };

export default function InstitutionTypesPage() {
  const [types, setTypes] = useState<InstitutionType[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);

  const selected = useMemo(() => types.find((item) => item.id === selectedId) ?? null, [types, selectedId]);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/platform/institution-types", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load institution types");
      setTypes(data.institutionTypes);
      const first = data.institutionTypes[0] as InstitutionType | undefined;
      if (first) {
        setSelectedId(first.id);
        setDraft(Object.fromEntries(first.capabilities.map((item) => [item.capabilityId, item.enabled])));
      }
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "We couldn't load institution types. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function selectType(item: InstitutionType) {
    setSelectedId(item.id);
    setDraft(Object.fromEntries(item.capabilities.map((capability) => [capability.capabilityId, capability.enabled])));
    setMessage(null);
  }

  async function saveCapabilities() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/platform/institution-types/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capabilities: Object.entries(draft).map(([capabilityId, enabled]) => ({ capabilityId, enabled })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't update capabilities. Please try again.");
      setTypes((current) => current.map((item) => item.id === selected.id ? data.institutionType : item));
      setMessage({ kind: "success", text: "Capabilities updated successfully." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "We couldn't update capabilities. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ApplicationShell pageTitle="Institution types" pageContext="Choose which features are available to each type of institution" selectedKey="institution">
      <div className="mx-auto max-w-6xl space-y-6">
        <nav aria-label="Breadcrumb" className="text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Home</Link><span className="mx-2">/</span><span className="text-[#202124]">Institution types</span></nav>
        <div>
          <h1 className="mb-1 text-[28px] font-medium tracking-[-0.02em] text-[#202124]">Institution types</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[#5f6368]">Manage the institution categories supported by EduInstitution and choose the features available to each category.</p>
        </div>

        {message ? <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${message.kind === "success" ? "border-[#c6e7d0] bg-[#e6f4ea] text-[#137333]" : message.kind === "error" ? "border-[#f1c6c6] bg-[#fce8e6] text-[#a50e0e]" : "border-[#c2d7ff] bg-[#e8f0fe] text-[#174ea6]"}`}>{message.text}</div> : null}

        {loading ? <div className="flex min-h-40 items-center justify-center rounded-2xl border border-[#dadce0] bg-white text-sm text-[#5f6368]"><LoadingOutlined className="mr-2" />Loading institution types...</div> : null}

        {!loading && !types.length ? <div className="rounded-2xl border border-dashed border-[#dadce0] bg-[#f8f9fa] p-8 text-center"><h2 className="mb-2 text-base font-medium text-[#202124]">No institution types are available</h2><p className="m-0 text-sm text-[#5f6368]">Add an institution type before configuring capabilities.</p></div> : null}

        {!loading && types.length ? <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-2">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#5f6368]">Institution types</p>
            {types.map((item) => <button key={item.id} type="button" onClick={() => selectType(item)} className={`w-full rounded-xl border px-4 py-3 text-left transition ${item.id === selectedId ? "border-[#a8c7fa] bg-[#e8f0fe]" : "border-[#dadce0] bg-white hover:border-[#bdc1c6]"}`}><div className="font-medium text-[#202124]">{item.name}</div><div className="mt-1 text-xs text-[#5f6368]">{item._count?.tenants ?? 0} institution{item._count?.tenants === 1 ? "" : "s"}</div></button>)}
          </aside>

          {selected ? <section className="rounded-2xl border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,.06)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-[#e8eaed] pb-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="m-0 text-xl font-medium text-[#202124]">{selected.name}</h2><p className="mt-1 mb-0 text-sm leading-6 text-[#5f6368]">{selected.description ?? "Configure the features available to this institution type."}</p></div><span className="inline-flex w-fit rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-medium text-[#137333]">{selected.status === "ACTIVE" ? "Active" : "Archived"}</span></div>
            <div className="py-5"><h3 className="mb-1 text-base font-medium text-[#202124]">Available features</h3><p className="mb-4 text-sm text-[#5f6368]">Turn features on or off for this institution type. This does not delete existing data.</p><div className="divide-y divide-[#e8eaed] rounded-xl border border-[#dadce0]">{selected.capabilities.map((item) => <label key={item.capabilityId} className="flex cursor-pointer items-start gap-3 p-4 hover:bg-[#f8f9fa]"><input type="checkbox" checked={draft[item.capabilityId] ?? false} onChange={(event) => setDraft((current) => ({ ...current, [item.capabilityId]: event.target.checked }))} className="mt-1 h-4 w-4 accent-[#188038]" /><span className="min-w-0"><span className="block text-sm font-medium text-[#202124]">{item.capability.name}</span><span className="mt-1 block text-xs leading-5 text-[#5f6368]">{item.capability.description ?? "Available as part of this institution type."}</span></span></label>)}</div></div>
            <div className="flex flex-col-reverse gap-3 border-t border-[#e8eaed] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="m-0 text-xs leading-5 text-[#5f6368]"><CheckOutlined className="mr-1 text-[#188038]" />Changes apply to this institution type.</p><button type="button" onClick={() => void saveCapabilities()} disabled={saving} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#188038] px-5 text-sm font-medium text-white transition hover:bg-[#137333] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button></div>
          </section> : null}
        </div> : null}
      </div>
    </ApplicationShell>
  );
}
