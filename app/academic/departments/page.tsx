"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApplicationShell } from "@/components/application-shell";

type Department = { id: string; name: string; code: string; description: string | null; status: string; _count: { programs: number } };
type Program = { id: string; name: string; code: string; type: string; durationMonths: number | null; status?: string; department: { id: string; name: string; code: string } };
type Notice = { kind: "success" | "error" | "info"; text: string };
type DepartmentForm = { name: string; code: string; description: string };
type ProgramForm = { name: string; code: string; type: string; durationMonths: string };

const emptyDepartment: DepartmentForm = { name: "", code: "", description: "" };
const emptyProgram: ProgramForm = { name: "", code: "", type: "DEGREE", durationMonths: "" };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [department, setDepartment] = useState<DepartmentForm>(emptyDepartment);
  const [program, setProgram] = useState<ProgramForm>(emptyProgram);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dr, pr] = await Promise.all([fetch("/api/academic/departments", { cache: "no-store" }), fetch("/api/academic/programs", { cache: "no-store" })]);
        const dd = await dr.json(); const pd = await pr.json();
        if (!dr.ok) throw new Error(dd.error ?? "Unable to load departments.");
        if (!pr.ok) throw new Error(pd.error ?? "Unable to load programs.");
        if (!cancelled) {
          const activeDepartments = dd.departments.filter((item: Department) => item.status === "ACTIVE");
          setDepartments(activeDepartments);
          setPrograms(pd.programs.filter((item: Program) => item.status !== "ARCHIVED"));
          setSelectedId(activeDepartments[0]?.id ?? "");
        }
      } catch (error) { if (!cancelled) setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't load the academic structure. Please try again." }); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  function startDepartmentEdit(item: Department) {
    setEditingDepartmentId(item.id); setEditingProgramId(null);
    setDepartment({ name: item.name, code: item.code, description: item.description ?? "" });
    setProgram(emptyProgram);
    setNotice({ kind: "info", text: "You are editing this department. Save your changes when you're ready." });
  }

  function startProgramEdit(item: Program) {
    setEditingProgramId(item.id); setEditingDepartmentId(null);
    setProgram({ name: item.name, code: item.code, type: item.type, durationMonths: item.durationMonths?.toString() ?? "" });
    setDepartment(emptyDepartment);
    setNotice({ kind: "info", text: "You are editing this program. Save your changes when you're ready." });
  }

  function cancelEdit() {
    setEditingDepartmentId(null); setEditingProgramId(null); setDepartment(emptyDepartment); setProgram(emptyProgram); setNotice(null);
  }

  async function createOrUpdateDepartment() {
    setSaving(true); setNotice(null);
    try {
      const editing = Boolean(editingDepartmentId);
      const response = await fetch(editing ? `/api/academic/departments/${editingDepartmentId}` : "/api/academic/departments", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(department) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `We couldn't ${editing ? "update" : "create"} the department. Please try again.`);
      setDepartments((items) => editing ? items.map((item) => item.id === data.department.id ? data.department : item) : [...items, data.department]);
      setSelectedId(data.department.id); setDepartment(emptyDepartment); setEditingDepartmentId(null);
      setNotice({ kind: "success", text: editing ? "Department updated successfully." : "Department created successfully." });
    } catch (error) { setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't save the department. Please try again." }); }
    finally { setSaving(false); }
  }

  async function archiveDepartment() {
    if (!selected) return;
    if (!window.confirm(`Archive ${selected.name}? Existing programs must be archived first.`)) return;
    setSaving(true); setNotice(null);
    try {
      const response = await fetch(`/api/academic/departments/${selected.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't archive the department. Please try again.");
      const remaining = departments.filter((item) => item.id !== selected.id);
      setDepartments(remaining); setSelectedId(remaining[0]?.id ?? "");
      setNotice({ kind: "success", text: "Department archived successfully." });
    } catch (error) { setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't archive the department. Please try again." }); }
    finally { setSaving(false); }
  }

  async function createOrUpdateProgram() {
    if (!selectedId) { setNotice({ kind: "error", text: "Create or select a department before adding a program." }); return; }
    setSaving(true); setNotice(null);
    try {
      const editing = Boolean(editingProgramId);
      const response = await fetch(editing ? `/api/academic/programs/${editingProgramId}` : "/api/academic/programs", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...program, departmentId: selectedId, durationMonths: program.durationMonths ? Number(program.durationMonths) : null }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `We couldn't ${editing ? "update" : "create"} the program. Please try again.`);
      setPrograms((items) => editing ? items.map((item) => item.id === data.program.id ? data.program : item) : [...items, data.program]);
      setProgram(emptyProgram); setEditingProgramId(null);
      setNotice({ kind: "success", text: editing ? "Program updated successfully." : "Program created successfully." });
    } catch (error) { setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't save the program. Please try again." }); }
    finally { setSaving(false); }
  }

  async function archiveProgram(item: Program) {
    if (!window.confirm(`Archive ${item.name}? Existing records will not be deleted.`)) return;
    setSaving(true); setNotice(null);
    try {
      const response = await fetch(`/api/academic/programs/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't archive the program. Please try again.");
      setPrograms((items) => items.filter((programItem) => programItem.id !== item.id));
      setDepartments((items) => items.map((departmentItem) => departmentItem.id === item.department.id ? { ...departmentItem, _count: { programs: Math.max(0, departmentItem._count.programs - 1) } } : departmentItem));
      if (editingProgramId === item.id) cancelEdit();
      setNotice({ kind: "success", text: "Program archived successfully." });
    } catch (error) { setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't archive the program. Please try again." }); }
    finally { setSaving(false); }
  }

  const selected = departments.find((item) => item.id === selectedId);
  const visible = programs.filter((item) => item.department.id === selectedId);

  return <ApplicationShell pageTitle="Departments & programs" pageContext="Organize your institution's academic structure" selectedKey="departments">
    <div className="mx-auto max-w-6xl space-y-6">
      <nav className="text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Home</Link><span className="mx-2">/</span><span className="text-[#202124]">Departments & programs</span></nav>
      <div><h1 className="mb-1 text-[28px] font-medium text-[#202124]">Departments & programs</h1><p className="m-0 text-sm text-[#5f6368]">Create departments first, then add the programs offered by each department.</p></div>
      {notice && <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-[#c6e7d0] bg-[#e6f4ea] text-[#137333]" : notice.kind === "error" ? "border-[#f1c6c6] bg-[#fce8e6] text-[#a50e0e]" : "border-[#c6dafc] bg-[#e8f0fe] text-[#174ea6]"}`}>{notice.text}</div>}
      {loading ? <div className="rounded-2xl border border-[#dadce0] bg-white p-8 text-center text-sm text-[#5f6368]">Loading academic structure...</div> : <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-[#dadce0] bg-white p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-medium">Departments</h2><span className="text-xs text-[#5f6368]">{departments.length}</span></div>
          {departments.length ? departments.map((item) => <div key={item.id} className="mb-2 flex items-stretch gap-1"><button type="button" onClick={() => { setSelectedId(item.id); cancelEdit(); }} className={`min-w-0 flex-1 rounded-l-xl border px-3 py-3 text-left ${selectedId === item.id ? "border-[#a8c7fa] bg-[#e8f0fe]" : "border-[#dadce0]"}`}><span className="block truncate text-sm font-medium">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item._count.programs} programs</span></button><button type="button" onClick={() => startDepartmentEdit(item)} aria-label={`Edit ${item.name}`} className="rounded-r-xl border border-l-0 border-[#dadce0] px-3 text-xs font-medium text-[#1a73e8] hover:bg-[#f8f9fa]">Edit</button></div>) : <div className="rounded-xl border border-dashed border-[#dadce0] p-4 text-center text-sm text-[#5f6368]">No active departments yet.</div>}
          <div className="mt-5 border-t border-[#e8eaed] pt-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-medium">{editingDepartmentId ? "Edit department" : "Add department"}</h3>{editingDepartmentId && <button type="button" onClick={cancelEdit} className="text-xs text-[#5f6368] hover:text-[#202124]">Cancel</button>}</div><div className="space-y-3"><input value={department.name} onChange={(e) => setDepartment({ ...department, name: e.target.value })} placeholder="Department name" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm" /><input value={department.code} onChange={(e) => setDepartment({ ...department, code: e.target.value })} placeholder="Code" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm uppercase" /><textarea value={department.description} onChange={(e) => setDepartment({ ...department, description: e.target.value })} placeholder="Description (optional)" rows={3} className="w-full rounded-lg border border-[#dadce0] px-3 py-2 text-sm" /><button disabled={saving} onClick={() => void createOrUpdateDepartment()} className="h-10 w-full rounded-lg bg-[#188038] text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : editingDepartmentId ? "Save department" : "Create department"}</button></div></div>
        </aside>
        <section className="rounded-2xl border border-[#dadce0] bg-white p-5 sm:p-6">
          {selected ? <>
            <div className="flex flex-col gap-4 border-b border-[#e8eaed] pb-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-medium">{selected.name}</h2><p className="mt-1 text-sm text-[#5f6368]">{selected.description || "Programs offered by this department."}</p><p className="mt-2 text-xs text-[#5f6368]">Code: {selected.code} · {selected._count.programs} programs</p></div><button type="button" disabled={saving} onClick={() => void archiveDepartment()} className="h-9 rounded-lg border border-[#dadce0] px-3 text-sm font-medium text-[#a50e0e] hover:bg-[#fce8e6] disabled:opacity-50">Archive department</button></div>
            <div className="py-5"><h3 className="mb-3 text-base font-medium">Programs</h3>{visible.length ? visible.map((item) => <div key={item.id} className="mb-2 flex items-center gap-3 rounded-xl border border-[#e8eaed] p-4"><div className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item.type.toLowerCase()}{item.durationMonths ? ` · ${item.durationMonths} months` : ""}</span></div><div className="flex shrink-0 items-center gap-3"><button type="button" onClick={() => startProgramEdit(item)} className="text-sm font-medium text-[#1a73e8] hover:underline">Edit</button><button type="button" disabled={saving} onClick={() => void archiveProgram(item)} className="text-sm font-medium text-[#a50e0e] hover:underline disabled:opacity-50">Archive</button></div></div>) : <div className="rounded-xl border border-dashed border-[#dadce0] bg-[#f8f9fa] p-6 text-center text-sm text-[#5f6368]">No active programs have been added yet.</div>}</div>
            <div className="border-t border-[#e8eaed] pt-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="text-base font-medium">{editingProgramId ? "Edit program" : "Add program"}</h3><p className="mt-1 text-xs text-[#5f6368]">{editingProgramId ? "Update the program details below." : "Add a program offered by this department."}</p></div>{editingProgramId && <button type="button" onClick={cancelEdit} className="text-xs text-[#5f6368] hover:text-[#202124]">Cancel</button>}</div><div className="grid gap-3 sm:grid-cols-2"><input value={program.name} onChange={(e) => setProgram({ ...program, name: e.target.value })} placeholder="Program name" className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm" /><input value={program.code} onChange={(e) => setProgram({ ...program, code: e.target.value })} placeholder="Program code" className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm uppercase" /><select value={program.type} onChange={(e) => setProgram({ ...program, type: e.target.value })} className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm"><option value="DEGREE">Degree</option><option value="DIPLOMA">Diploma</option><option value="CERTIFICATE">Certificate</option><option value="OTHER">Other</option></select><input type="number" min="1" value={program.durationMonths} onChange={(e) => setProgram({ ...program, durationMonths: e.target.value })} placeholder="Duration in months" className="h-10 rounded-lg border border-[#dadce0] px-3 text-sm" /></div><button disabled={saving} onClick={() => void createOrUpdateProgram()} className="mt-3 h-10 rounded-lg bg-[#188038] px-5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : editingProgramId ? "Save program" : "Create program"}</button></div>
          </> : <div className="py-20 text-center text-sm text-[#5f6368]">Create a department to start building your academic structure.</div>}
        </section>
      </div>}
    </div>
  </ApplicationShell>;
}
