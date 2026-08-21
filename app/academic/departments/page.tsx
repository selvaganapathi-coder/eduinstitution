"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { MoreVertOutlined } from "@ant-design/icons";
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
    setSelectedId(item.id); setEditingDepartmentId(item.id); setEditingProgramId(null);
    setDepartment({ name: item.name, code: item.code, description: item.description ?? "" }); setProgram(emptyProgram);
    setNotice({ kind: "info", text: "Edit the department details, then select Save department." });
  }

  function startProgramEdit(item: Program) {
    setSelectedId(item.department.id); setEditingProgramId(item.id); setEditingDepartmentId(null);
    setProgram({ name: item.name, code: item.code, type: item.type, durationMonths: item.durationMonths?.toString() ?? "" }); setDepartment(emptyDepartment);
    setNotice({ kind: "info", text: "Edit the program details, then select Save program." });
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
      if (!response.ok) throw new Error(data.error ?? "We couldn't save the department. Please try again.");
      setDepartments((items) => editing ? items.map((item) => item.id === data.department.id ? data.department : item) : [...items, data.department]);
      setSelectedId(data.department.id); setDepartment(emptyDepartment); setEditingDepartmentId(null);
      setNotice({ kind: "success", text: editing ? "Department updated successfully." : "Department created successfully." });
    } catch (error) { setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't save the department. Please try again." }); }
    finally { setSaving(false); }
  }

  async function archiveDepartment(id = selectedId) {
    const target = departments.find((item) => item.id === id);
    if (!target) return;
    if (!window.confirm(`Archive ${target.name}? Programs must be archived first.`)) return;
    setSaving(true); setNotice(null);
    try {
      const response = await fetch(`/api/academic/departments/${target.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't archive the department. Please try again.");
      const remaining = departments.filter((item) => item.id !== target.id);
      setDepartments(remaining); setSelectedId(remaining[0]?.id ?? ""); cancelEdit();
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
      if (!response.ok) throw new Error(data.error ?? "We couldn't save the program. Please try again.");
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

  const departmentMenu = (item: Department): MenuProps["items"] => [
    { key: "edit", label: "Edit department", onClick: () => startDepartmentEdit(item) },
    { type: "divider" },
    { key: "archive", label: "Archive department", danger: true, onClick: () => void archiveDepartment(item.id) },
  ];
  const programMenu = (item: Program): MenuProps["items"] => [
    { key: "edit", label: "Edit program", onClick: () => startProgramEdit(item) },
    { type: "divider" },
    { key: "archive", label: "Archive program", danger: true, onClick: () => void archiveProgram(item) },
  ];

  return <ApplicationShell pageTitle="Departments & programs" pageContext="Organize your institution's academic structure" selectedKey="departments">
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Home</Link><span className="mx-2">/</span><span className="text-[#202124]">Departments & programs</span></nav>
      <header className="mb-6"><h1 className="m-0 text-[28px] font-normal tracking-[-0.02em] text-[#202124]">Departments & programs</h1><p className="mt-2 mb-0 text-sm text-[#5f6368]">Manage the academic units and programs offered by your institution.</p></header>
      {notice && <div role="status" className={`mb-5 rounded-lg border px-4 py-3 text-sm ${notice.kind === "success" ? "border-[#c6e7d0] bg-[#e6f4ea] text-[#137333]" : notice.kind === "error" ? "border-[#f1c6c6] bg-[#fce8e6] text-[#a50e0e]" : "border-[#c6dafc] bg-[#e8f0fe] text-[#174ea6]"}`}>{notice.text}</div>}
      {loading ? <div className="border-y border-[#dadce0] bg-white px-4 py-10 text-center text-sm text-[#5f6368]">Loading academic structure...</div> : <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="m-0 text-base font-medium text-[#202124]">Departments</h2><span className="text-sm text-[#5f6368]">{departments.length}</span></div>
          <div className="border-y border-[#dadce0] bg-white">
            {departments.length ? departments.map((item) => <div key={item.id} className={`group flex items-center border-b border-[#e8eaed] last:border-0 ${selectedId === item.id ? "bg-[#f1f3f4]" : "hover:bg-[#f8f9fa]"}`}>
              <button type="button" onClick={() => { setSelectedId(item.id); cancelEdit(); }} className="min-w-0 flex-1 px-3 py-3 text-left"><span className="block truncate text-sm font-medium text-[#202124]">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item._count.programs} {item._count.programs === 1 ? "program" : "programs"}</span></button>
              <Dropdown trigger={["click"]} menu={{ items: departmentMenu(item) }} placement="bottomRight"><button type="button" aria-label={`More actions for ${item.name}`} className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#e8eaed] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"><MoreVertOutlined /></button></Dropdown>
            </div>) : <div className="px-4 py-8 text-center text-sm text-[#5f6368]">No active departments yet.</div>}
          </div>
          <div className="mt-8"><div className="mb-3 flex items-center justify-between"><h2 className="m-0 text-base font-medium text-[#202124]">{editingDepartmentId ? "Edit department" : "Add department"}</h2>{editingDepartmentId && <button type="button" onClick={cancelEdit} className="text-sm text-[#1a73e8] hover:underline">Cancel</button>}</div>
            <div className="space-y-4"><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Department name</span><input value={department.name} onChange={(e) => setDepartment({ ...department, name: e.target.value })} className="h-10 w-full rounded-md border border-[#dadce0] px-3 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Department code</span><input value={department.code} onChange={(e) => setDepartment({ ...department, code: e.target.value })} className="h-10 w-full rounded-md border border-[#dadce0] px-3 text-sm uppercase text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Description <span className="font-normal">(optional)</span></span><textarea value={department.description} onChange={(e) => setDepartment({ ...department, description: e.target.value })} rows={3} className="w-full rounded-md border border-[#dadce0] px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]" /></label><button disabled={saving} onClick={() => void createOrUpdateDepartment()} className="h-10 rounded-md bg-[#1a73e8] px-5 text-sm font-medium text-white hover:bg-[#185abc] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : editingDepartmentId ? "Save department" : "Add department"}</button></div>
          </div>
        </section>
        <section className="min-w-0">
          {selected ? <><div className="flex items-start justify-between border-b border-[#dadce0] pb-5"><div><h2 className="m-0 text-xl font-normal text-[#202124]">{selected.name}</h2><p className="mt-1 mb-0 text-sm text-[#5f6368]">{selected.description || "Programs offered by this department."}</p><p className="mt-2 mb-0 text-xs text-[#5f6368]">Code: {selected.code} · {selected._count.programs} {selected._count.programs === 1 ? "program" : "programs"}</p></div><Dropdown trigger={["click"]} menu={{ items: departmentMenu(selected) }} placement="bottomRight"><button type="button" aria-label={`More actions for ${selected.name}`} className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"><MoreVertOutlined /></button></Dropdown></div>
            <div className="py-7"><div className="mb-3 flex items-center justify-between"><h3 className="m-0 text-base font-medium text-[#202124]">Programs</h3><span className="text-sm text-[#5f6368]">{visible.length}</span></div>{visible.length ? <div className="divide-y divide-[#e8eaed] border-y border-[#dadce0] bg-white">{visible.map((item) => <div key={item.id} className="flex items-center gap-3 px-3 py-4 hover:bg-[#f8f9fa]"><div className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[#202124]">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item.type.toLowerCase()}{item.durationMonths ? ` · ${item.durationMonths} months` : ""}</span></div><Dropdown trigger={["click"]} menu={{ items: programMenu(item) }} placement="bottomRight"><button type="button" aria-label={`More actions for ${item.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#e8eaed] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"><MoreVertOutlined /></button></Dropdown></div>)}</div> : <div className="border-y border-dashed border-[#dadce0] px-4 py-10 text-center text-sm text-[#5f6368]">No active programs yet. Add a program below.</div>}</div>
            <div className="border-t border-[#dadce0] pt-7"><div className="mb-4 flex items-center justify-between"><div><h3 className="m-0 text-base font-medium text-[#202124]">{editingProgramId ? "Edit program" : "Add program"}</h3><p className="mt-1 mb-0 text-sm text-[#5f6368]">{editingProgramId ? "Update the program details." : "Add a program offered by this department."}</p></div>{editingProgramId && <button type="button" onClick={cancelEdit} className="text-sm text-[#1a73e8] hover:underline">Cancel</button>}</div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program name</span><input value={program.name} onChange={(e) => setProgram({ ...program, name: e.target.value })} className="h-10 w-full rounded-md border border-[#dadce0] px-3 text-sm outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program code</span><input value={program.code} onChange={(e) => setProgram({ ...program, code: e.target.value })} className="h-10 w-full rounded-md border border-[#dadce0] px-3 text-sm uppercase outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program type</span><select value={program.type} onChange={(e) => setProgram({ ...program, type: e.target.value })} className="h-10 w-full rounded-md border border-[#dadce0] bg-white px-3 text-sm outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]">{["DEGREE", "DIPLOMA", "CERTIFICATE", "OTHER"].map((value) => <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Duration <span className="font-normal">(months)</span></span><input type="number" min="1" value={program.durationMonths} onChange={(e) => setProgram({ ...program, durationMonths: e.target.value })} className="h-10 w-full rounded-md border border-[#dadce0] px-3 text-sm outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]" /></label></div><button disabled={saving} onClick={() => void createOrUpdateProgram()} className="mt-4 h-10 rounded-md bg-[#1a73e8] px-5 text-sm font-medium text-white hover:bg-[#185abc] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : editingProgramId ? "Save program" : "Add program"}</button></div>
          </> : <div className="border-y border-[#dadce0] px-6 py-16 text-center text-sm text-[#5f6368]">Select a department to view its programs.</div>}
        </section>
      </div>}
    </div>
  </ApplicationShell>;
}
