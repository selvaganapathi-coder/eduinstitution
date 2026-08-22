"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";

type Department = { id: string; name: string; code: string; description: string | null; status: string; _count: { programs: number } };
type Program = { id: string; name: string; code: string; type: string; durationMonths: number | null; status?: string; department: { id: string; name: string; code: string } };
type Notice = { kind: "success" | "error" | "info"; text: string };
type DepartmentForm = { name: string; code: string; description: string };
type ProgramForm = { name: string; code: string; type: string; durationMonths: string };
type InstitutionType = { name: string } | null;

const emptyDepartment: DepartmentForm = { name: "", code: "", description: "" };
const emptyProgram: ProgramForm = { name: "", code: "", type: "DEGREE", durationMonths: "" };

function guidance(type: string) {
  const name = type.toLowerCase();
  if (name.includes("pharmacy")) return { department: "Example: Pharmacy", program: "Example: B.Pharm", tip: "Start with the main academic department, then add the programs offered under it." };
  if (name.includes("engineering")) return { department: "Example: Computer Science and Engineering", program: "Example: B.E. Computer Science and Engineering", tip: "Use the department for the academic branch and the program for the qualification students enroll in." };
  if (name.includes("school")) return { department: "Example: Science", program: "Example: Grade 10", tip: "You can use departments for subject groups and programs for grades or academic levels." };
  if (name.includes("arts") || name.includes("science")) return { department: "Example: Computer Science", program: "Example: B.Sc. Computer Science", tip: "Keep department names broad and add each degree or diploma as a program." };
  return { department: "Example: Computer Science", program: "Example: B.Sc. Computer Science", tip: "Create a department first. Then add the active programs offered by that department." };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [institutionType, setInstitutionType] = useState<InstitutionType>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [department, setDepartment] = useState<DepartmentForm>(emptyDepartment);
  const [program, setProgram] = useState<ProgramForm>(emptyProgram);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  const help = useMemo(() => guidance(institutionType?.name ?? ""), [institutionType?.name]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dr, pr, tr] = await Promise.all([
          fetch("/api/academic/departments", { cache: "no-store" }),
          fetch("/api/academic/programs", { cache: "no-store" }),
          fetch("/api/institution/type", { cache: "no-store" }),
        ]);
        const dd = await dr.json();
        const pd = await pr.json();
        const td = await tr.json();
        if (!dr.ok) throw new Error(dd.error ?? "We couldn't load departments. Please try again.");
        if (!pr.ok) throw new Error(pd.error ?? "We couldn't load programs. Please try again.");
        if (!cancelled) {
          const activeDepartments = dd.departments.filter((item: Department) => item.status === "ACTIVE");
          setDepartments(activeDepartments);
          setPrograms(pd.programs.filter((item: Program) => item.status === "ACTIVE"));
          setInstitutionType(td.institutionType ?? null);
          setSelectedId(activeDepartments[0]?.id ?? "");
        }
      } catch (error) {
        if (!cancelled) setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't load the academic structure. Please try again." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  function cancelEdit(clearNotice = true) {
    setEditingDepartmentId(null);
    setEditingProgramId(null);
    setDepartment(emptyDepartment);
    setProgram(emptyProgram);
    if (clearNotice) setNotice(null);
  }

  function editDepartment(item: Department) {
    setSelectedId(item.id);
    setEditingDepartmentId(item.id);
    setEditingProgramId(null);
    setDepartment({ name: item.name, code: item.code, description: item.description ?? "" });
    setProgram(emptyProgram);
    setNotice({ kind: "info", text: "You are editing this department. Save when the details are correct." });
  }

  function editProgram(item: Program) {
    setSelectedId(item.department.id);
    setEditingProgramId(item.id);
    setEditingDepartmentId(null);
    setProgram({ name: item.name, code: item.code, type: item.type, durationMonths: item.durationMonths?.toString() ?? "" });
    setDepartment(emptyDepartment);
    setNotice({ kind: "info", text: "You are editing this program. Save when the details are correct." });
  }

  async function saveDepartment() {
    setSaving(true);
    setNotice(null);
    try {
      const editing = Boolean(editingDepartmentId);
      const response = await fetch(editing ? `/api/academic/departments/${editingDepartmentId}` : "/api/academic/departments", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(department),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't save the department. Please try again.");
      setDepartments((items) => editing ? items.map((item) => item.id === data.department.id ? data.department : item) : [...items, data.department]);
      setSelectedId(data.department.id);
      cancelEdit(false);
      setNotice({ kind: "success", text: editing ? "Department updated successfully." : "Department added successfully." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't save the department. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function archiveDepartment(item: Department) {
    if (!window.confirm(`Archive ${item.name}? Active programs must be archived first.`)) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/academic/departments/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't archive the department. Please try again.");
      const remaining = departments.filter((departmentItem) => departmentItem.id !== item.id);
      setDepartments(remaining);
      setPrograms((items) => items.filter((programItem) => programItem.department.id !== item.id));
      setSelectedId(remaining[0]?.id ?? "");
      cancelEdit(false);
      setNotice({ kind: "success", text: "Department archived successfully." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't archive the department. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function saveProgram() {
    if (!selectedId) {
      setNotice({ kind: "error", text: "Select a department before adding a program." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const editing = Boolean(editingProgramId);
      const response = await fetch(editing ? `/api/academic/programs/${editingProgramId}` : "/api/academic/programs", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...program, departmentId: selectedId, durationMonths: program.durationMonths ? Number(program.durationMonths) : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't save the program. Please try again.");
      setPrograms((items) => editing ? items.map((item) => item.id === data.program.id ? data.program : item) : [...items, data.program]);
      cancelEdit(false);
      setNotice({ kind: "success", text: editing ? "Program updated successfully." : "Program added successfully." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't save the program. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function archiveProgram(item: Program) {
    if (!window.confirm(`Archive ${item.name}? Existing records will not be deleted.`)) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/academic/programs/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't archive the program. Please try again.");
      setPrograms((items) => items.filter((programItem) => programItem.id !== item.id));
      setDepartments((items) => items.map((departmentItem) => departmentItem.id === item.department.id ? { ...departmentItem, _count: { programs: Math.max(0, departmentItem._count.programs - 1) } } : departmentItem));
      if (editingProgramId === item.id) cancelEdit(false);
      setNotice({ kind: "success", text: "Program archived successfully." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't archive the program. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const selected = departments.find((item) => item.id === selectedId);
  const activePrograms = programs.filter((item) => item.department.id === selectedId);
  const departmentMenu = (item: Department): MenuProps["items"] => [
    { key: "edit", label: "Edit department", onClick: () => editDepartment(item) },
    { type: "divider" },
    { key: "archive", label: "Archive department", danger: true, onClick: () => void archiveDepartment(item) },
  ];
  const programMenu = (item: Program): MenuProps["items"] => [
    { key: "edit", label: "Edit program", onClick: () => editProgram(item) },
    { type: "divider" },
    { key: "archive", label: "Archive program", danger: true, onClick: () => void archiveProgram(item) },
  ];

  return (
    <ApplicationShell pageTitle="Departments & programs" pageContext="Academic setup" selectedKey="academic">
      <div className="mx-auto max-w-6xl space-y-5">
        <nav aria-label="Breadcrumb" className="text-sm text-[#5f6368]"><Link href="/" className="hover:text-[#1a73e8]">Dashboard</Link><span className="mx-2">/</span><span className="text-[#202124]">Departments & programs</span></nav>
        <header>
          <h1 className="m-0 text-[28px] font-normal tracking-[-0.02em] text-[#202124]">Departments & programs</h1>
          <p className="mt-1 mb-0 max-w-2xl text-sm leading-6 text-[#5f6368]">Set up your academic structure in a simple order: create a department, then add the active programs offered by it.</p>
        </header>

        {notice ? <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-[#c6e7d0] bg-[#e6f4ea] text-[#137333]" : notice.kind === "error" ? "border-[#f1c6c6] bg-[#fce8e6] text-[#a50e0e]" : "border-[#c6dafc] bg-[#e8f0fe] text-[#174ea6]"}`}>{notice.text}</div> : null}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-[300px_1fr]" aria-label="Loading academic structure">
            <div className="h-[420px] animate-pulse rounded-2xl border border-[#dadce0] bg-[#f8f9fa]" />
            <div className="h-[420px] animate-pulse rounded-2xl border border-[#dadce0] bg-[#f8f9fa]" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
            <section className="rounded-2xl border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,.06)]">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="m-0 text-base font-medium text-[#202124]">Departments</h2><p className="mt-1 mb-0 text-xs text-[#5f6368]">Active departments</p></div><span className="rounded-full bg-[#f1f3f4] px-2.5 py-1 text-xs text-[#5f6368]">{departments.length}</span></div>
              {departments.length ? <div className="space-y-1">{departments.map((item) => <div key={item.id} className={`flex items-center rounded-xl ${selectedId === item.id ? "bg-[#e6f4ea]" : "hover:bg-[#f8f9fa]"}`}><button type="button" onClick={() => { setSelectedId(item.id); cancelEdit(); }} className="min-w-0 flex-1 rounded-l-xl px-3 py-3 text-left"><span className="block truncate text-sm font-medium text-[#202124]">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item._count.programs} active {item._count.programs === 1 ? "program" : "programs"}</span></button><Dropdown trigger={["click"]} menu={{ items: departmentMenu(item) }} placement="bottomRight"><button type="button" aria-label={`More actions for ${item.name}`} className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#dadce0] focus:outline-none focus:ring-2 focus:ring-[#188038]"><MoreOutlined /></button></Dropdown></div>)}</div> : <div className="rounded-xl border border-dashed border-[#dadce0] bg-[#f8f9fa] p-5 text-center"><p className="m-0 text-sm font-medium text-[#202124]">No active departments</p><p className="mt-1 text-xs leading-5 text-[#5f6368]">Add your first department using the form below.</p></div>}

              <div className="mt-6 border-t border-[#e8eaed] pt-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="m-0 text-sm font-medium text-[#202124]">{editingDepartmentId ? "Edit department" : "Add department"}</h3><p className="mt-1 mb-0 text-xs text-[#5f6368]">{editingDepartmentId ? "Update the details and save." : "Create the main academic unit."}</p></div>{editingDepartmentId ? <button type="button" onClick={() => cancelEdit()} className="text-xs font-medium text-[#1a73e8] hover:underline">Cancel</button> : null}</div><div className="space-y-3"><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Department name</span><input value={department.name} onChange={(e) => setDepartment({ ...department, name: e.target.value })} placeholder={help.department} className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Department code</span><input value={department.code} onChange={(e) => setDepartment({ ...department, code: e.target.value })} placeholder="Example: CSE" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm uppercase text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Description <span className="font-normal">(optional)</span></span><textarea value={department.description} onChange={(e) => setDepartment({ ...department, description: e.target.value })} placeholder="Example: Department responsible for teaching and managing this academic area." rows={3} className="w-full rounded-lg border border-[#dadce0] px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><button type="button" disabled={saving} onClick={() => void saveDepartment()} className="h-10 rounded-lg bg-[#188038] px-5 text-sm font-medium text-white hover:bg-[#137333] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : editingDepartmentId ? "Save department" : "Add department"}</button></div></div>
            </section>

            <section className="rounded-2xl border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,.06)] sm:p-6">
              {selected ? <>
                <div className="flex items-start justify-between border-b border-[#e8eaed] pb-5"><div className="min-w-0"><h2 className="m-0 truncate text-xl font-medium text-[#202124]">{selected.name}</h2><p className="mt-1 mb-0 text-sm leading-6 text-[#5f6368]">{selected.description || "Manage the active programs offered by this department."}</p><p className="mt-2 mb-0 text-xs text-[#5f6368]">Code: {selected.code}</p></div><Dropdown trigger={["click"]} menu={{ items: departmentMenu(selected) }} placement="bottomRight"><button type="button" aria-label={`More actions for ${selected.name}`} className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"><MoreOutlined /></button></Dropdown></div>

                <div className="my-5 rounded-xl border border-[#e8eaed] bg-[#f8f9fa] p-4"><p className="m-0 text-xs font-medium uppercase tracking-wide text-[#5f6368]">Example</p><p className="mt-1 mb-0 text-sm font-medium text-[#202124]">{help.department} → {help.program}</p><p className="mt-1 mb-0 text-xs leading-5 text-[#5f6368]">{help.tip}</p></div>

                <div className="py-2"><div className="mb-3 flex items-center justify-between"><div><h3 className="m-0 text-base font-medium text-[#202124]">Active programs</h3><p className="mt-1 mb-0 text-xs text-[#5f6368]">Only active programs are shown here.</p></div><span className="text-xs text-[#5f6368]">{activePrograms.length}</span></div>{activePrograms.length ? <div className="space-y-2">{activePrograms.map((item) => <div key={item.id} className="flex items-center rounded-xl border border-[#dadce0] p-4 hover:border-[#b7d7c2] hover:bg-[#f8fbf9]"><div className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[#202124]">{item.name}</span><span className="text-xs text-[#5f6368]">{item.code} · {item.type.toLowerCase()}{item.durationMonths ? ` · ${item.durationMonths} months` : ""}</span></div><Dropdown trigger={["click"]} menu={{ items: programMenu(item) }} placement="bottomRight"><button type="button" aria-label={`More actions for ${item.name}`} className="ml-3 flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"><MoreOutlined /></button></Dropdown></div>)}</div> : <div className="rounded-xl border border-dashed border-[#dadce0] bg-[#f8f9fa] p-6 text-center"><p className="m-0 text-sm font-medium text-[#202124]">No active programs yet</p><p className="mt-1 text-xs text-[#5f6368]">Add the first program using the form below.</p></div>}</div>

                <div className="mt-6 border-t border-[#e8eaed] pt-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="m-0 text-base font-medium text-[#202124]">{editingProgramId ? "Edit program" : "Add program"}</h3><p className="mt-1 mb-0 text-xs text-[#5f6368]">{editingProgramId ? "Update the program details below." : "Add a qualification or academic level offered by this department."}</p></div>{editingProgramId ? <button type="button" onClick={() => cancelEdit()} className="text-xs font-medium text-[#1a73e8] hover:underline">Cancel</button> : null}</div><div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program name</span><input value={program.name} onChange={(e) => setProgram({ ...program, name: e.target.value })} placeholder={help.program} className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program code</span><input value={program.code} onChange={(e) => setProgram({ ...program, code: e.target.value })} placeholder="Example: BSC-CS" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm uppercase text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program type</span><select value={program.type} onChange={(e) => setProgram({ ...program, type: e.target.value })} className="h-10 w-full rounded-lg border border-[#dadce0] bg-white px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]"><option value="DEGREE">Degree</option><option value="DIPLOMA">Diploma</option><option value="CERTIFICATE">Certificate</option><option value="OTHER">Other</option></select></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Duration (months) <span className="font-normal">(optional)</span></span><input type="number" min="1" value={program.durationMonths} onChange={(e) => setProgram({ ...program, durationMonths: e.target.value })} placeholder="Example: 48" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label></div><button type="button" disabled={saving} onClick={() => void saveProgram()} className="mt-4 h-10 rounded-lg bg-[#188038] px-5 text-sm font-medium text-white hover:bg-[#137333] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : editingProgramId ? "Save program" : "Add program"}</button></div>
              </> : <div className="py-16 text-center"><p className="m-0 text-sm font-medium text-[#202124]">Select a department</p><p className="mt-1 text-sm text-[#5f6368]">Choose a department to view its active programs and manage them.</p></div>}
            </section>
          </div>
        )}
      </div>
    </ApplicationShell>
  );
}
