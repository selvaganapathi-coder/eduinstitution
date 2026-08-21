"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApplicationShell } from "@/components/application-shell";

type Department = { id: string; name: string; code: string; description: string | null; status: string; _count: { programs: number } };
type Program = { id: string; name: string; code: string; type: string; durationMonths: number | null; department: { id: string; name: string; code: string } };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [department, setDepartment] = useState({ name: "", code: "", description: "" });
  const [program, setProgram] = useState({ name: "", code: "", type: "DEGREE", durationMonths: "" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dr, pr] = await Promise.all([fetch("/api/academic/departments", { cache: "no-store" }), fetch("/api/academic/programs", { cache: "no-store" })]);
        const dd = await dr.json(); const pd = await pr.json();
        if (!dr.ok) throw new Error(dd.error ?? "Unable to load departments.");
        if (!pr.ok) throw new Error(pd.error ?? "Unable to load programs.");
        if (!cancelled) { setDepartments(dd.departments); setPrograms(pd.programs); setSelectedId(dd.departments[0]?.id ?? ""); }
      } catch (error) { if (!cancelled) setMessage(error instanceof Error ? error.message : "We couldn't load the academic structure. Please try again."); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function createDepartment() {
    setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/academic/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(department) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "We couldn't create the department. Please try again.");
      setDepartments((items) => [...items, data.department]); setSelectedId(data.department.id); setDepartment({ name: "", code: "", description: "" }); setMessage("Department created successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "We couldn't create the department. Please try again."); }
    finally { setSaving(false); }
  }

  async function createProgram() {
    if (!selectedId) { setMessage("Create or select a department before adding a program."); return; }
    setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/academic/programs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...program, departmentId: selectedId, durationMonths: program.durationMonths ? Number(program.durationMonths) : null }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "We couldn't create the program. Please try again.");
      setPrograms((items) => [...items, data.program]); setProgram({ name: "", code: "", type: "DEGREE", durationMonths: "" }); setMessage("Program created successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "We couldn't create the program. Please try again."); }
    finally { setSaving(false); }
  }

  const selected = departments.find((item) => item.id === selectedId);
  const visible = programs.filter((item) => item.department.id === selectedId);

  return <ApplicationShell pageTitle="Departments & programs" pageContext="Organize your institution's academic structure" selectedKey="academic">
    <div className="mx-auto max-w-6xl space-y-6">
      <nav className="text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Home</Link><span className="mx-2">/</span><span className="text-[#202124]">Departments & programs</span></nav>
      <div><h1 className="mb-1 text-[28px] font-medium text-[#202124]">Departments & programs</h1><p className="m-0 text-sm text-[#5f6368]">Create departments first, then add the programs offered by each department.</p></div>
      {message && <div role="status" className="rounded-xl border border-[#dadce0] bg-[#f8f9fa] px-4 py-3 text-sm text-[#202124]">{message}</div>}
      {loading ? <div className="rounded-2xl border border-[#dadce0] bg-white p-8 text-center text-sm text-[#5f6368]">Loading academic structure...</div> : <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-[#dadce0] bg-white p-4"><h2 className="mb-3 text-base font-medium">Departments</h2>{departments.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`mb-2 w-full rounded-xl border px-3 py-3 text-left ${selectedId === item.id ? "border-[#a8c7fa] bg-[#e8f0fe]" : "border-[#dadce0]"}`}><span className="block text-sm font-medium">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item._count.programs} programs</span></button>)}<div className="mt-5 border-t border-[#e8eaed] pt-5"><h3 className="mb-3 text-sm font-medium">Add department</h3><div className="space-y-3"><input value={department.name} onChange={(e) => setDepartment({ ...department, name: e.target.value })} placeholder="Department name" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm" /><input value={department.code} onChange={(e) => setDepartment({ ...department, code: e.target.value })} placeholder="Code" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm uppercase" /><textarea value={department.description} onChange={(e) => setDepartment({ ...department, description: e.target.value })} placeholder="Description (optional)" rows={3} className="w-full rounded-lg border border-[#dadce0] px-3 py-2 text-sm" /><button disabled={saving} onClick={() => void createDepartment()} className="h-10 w-full rounded-lg bg-[#188038] text-sm font-medium text-white disabled:opacity-50">Create department</button></div></div></aside>
        <section className="rounded-2xl border border-[#dadce0] bg-white p-5 sm:p-6">{selected ? <><div className="border-b border-[#e8eaed] pb-5"><h2 className="text-xl font-medium">{selected.name}</h2><p className="mt-1 text-sm text-[#5f6368]">{selected.description || "Programs offered by this department."}</p></div><div className="py-5"><h3 className="mb-3 text-base font-medium">Programs</h3>{visible.length ? visible.map((item) => <div key={item.id} className="mb-2 rounded-xl border border-[#e8eaed] p-4"><span className="block text-sm font-medium">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item.type.toLowerCase()}{item.durationMonths ? ` · ${item.durationMonths} months` : ""}</span></div>) : <div className="rounded-xl border border-dashed border-[#dadce0] bg-[#f8f9fa] p-6 text-center text-sm text-[#5f6368]">No programs have been added yet.</div>}</div><div className="border-t border-[#e8eaed] pt-5"><h3 className="mb-3 text-base font-medium">Add program</h3><div className="grid gap-3 sm:grid-cols-2"><input value={program.name} onChange={(e) => setProgram({ ...program, name: e.target.value })} placeholder="Program name" className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm" /><input value={program.code} onChange={(e) => setProgram({ ...program, code: e.target.value })} placeholder="Program code" className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm uppercase" /><select value={program.type} onChange={(e) => setProgram({ ...program, type: e.target.value })} className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm"><option value="DEGREE">Degree</option><option value="DIPLOMA">Diploma</option><option value="CERTIFICATE">Certificate</option><option value="OTHER">Other</option></select><input type="number" min="1" value={program.durationMonths} onChange={(e) => setProgram({ ...program, durationMonths: e.target.value })} placeholder="Duration in months" className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm" /></div><button disabled={saving} onClick={() => void createProgram()} className="mt-3 h-10 rounded-lg bg-[#188038] px-5 text-sm font-medium text-white disabled:opacity-50">Create program</button></div></> : <div className="py-20 text-center text-sm text-[#5f6368]">Create a department to start building your academic structure.</div>}</section>
      </div>}
    </div>
  </ApplicationShell>;
}
