"use client";

import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";

type Program = { id: string; name: string; code: string; status?: string; department: { id: string; name: string; code: string } };
type Course = { id: string; name: string; code: string; description: string | null; type: string; credits: number | null; weeklyHours: number | null; status?: string; program: Program };
type Notice = { kind: "success" | "error" | "info"; text: string };
type Form = { name: string; code: string; description: string; type: string; credits: string; weeklyHours: string; programId: string };
type InstitutionType = { name: string } | null;

const empty: Form = { name: "", code: "", description: "", type: "CORE", credits: "", weeklyHours: "", programId: "" };

function guidance(type: string) {
  const name = type.toLowerCase();
  if (name.includes("pharmacy")) return { course: "Example: Pharmaceutical Chemistry", tip: "Add the subjects students study within the selected program, such as Pharmaceutics, Pharmacology, or Pharmaceutical Chemistry." };
  if (name.includes("engineering")) return { course: "Example: Data Structures", tip: "Choose the program first, then add each subject taught in that program." };
  if (name.includes("school")) return { course: "Example: Mathematics", tip: "For schools, a course can represent a subject such as Mathematics, Science, or English." };
  if (name.includes("arts") || name.includes("science")) return { course: "Example: Database Management Systems", tip: "Keep the course name clear enough for administrators and teachers to recognize later." };
  return { course: "Example: Database Management Systems", tip: "Choose the program first. Then add the active courses or subjects taught in that program." };
}

export default function CoursesPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [institutionType, setInstitutionType] = useState<InstitutionType>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const help = useMemo(() => guidance(institutionType?.name ?? ""), [institutionType?.name]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [pr, cr, tr] = await Promise.all([
          fetch("/api/academic/programs", { cache: "no-store" }),
          fetch("/api/academic/courses", { cache: "no-store" }),
          fetch("/api/institution/type", { cache: "no-store" }),
        ]);
        const pd = await pr.json();
        const cd = await cr.json();
        const td = await tr.json();
        if (!pr.ok) throw new Error(pd.error ?? "We couldn't load programs. Please try again.");
        if (!cr.ok) throw new Error(cd.error ?? "We couldn't load courses. Please try again.");
        if (!cancelled) {
          setPrograms(pd.programs.filter((program: Program) => program.status === "ACTIVE"));
          setCourses(cd.courses.filter((course: Course) => course.status === "ACTIVE"));
          setInstitutionType(td.institutionType ?? null);
        }
      } catch (error) {
        if (!cancelled) setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't load courses. Please try again." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  function editCourse(course: Course) {
    setEditing(course.id);
    setForm({ name: course.name, code: course.code, description: course.description ?? "", type: course.type, credits: course.credits?.toString() ?? "", weeklyHours: course.weeklyHours?.toString() ?? "", programId: course.program.id });
    setNotice({ kind: "info", text: "You are editing this course. Save when the details are correct." });
  }

  function cancel() {
    setEditing(null);
    setForm(empty);
    setNotice(null);
  }

  async function save() {
    if (!form.programId) {
      setNotice({ kind: "error", text: "Select a program before saving the course." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const isEditing = Boolean(editing);
      const response = await fetch(isEditing ? `/api/academic/courses/${editing}` : "/api/academic/courses", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, credits: form.credits ? Number(form.credits) : null, weeklyHours: form.weeklyHours ? Number(form.weeklyHours) : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't save the course. Please try again.");
      setCourses((items) => isEditing ? items.map((item) => item.id === data.course.id ? data.course : item) : [...items, data.course]);
      cancel();
      setNotice({ kind: "success", text: isEditing ? "Course updated successfully." : "Course added successfully." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't save the course. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function archive(course: Course) {
    if (!window.confirm(`Archive ${course.name}? Existing records will not be deleted.`)) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/academic/courses/${course.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't archive the course. Please try again.");
      setCourses((items) => items.filter((item) => item.id !== course.id));
      if (editing === course.id) cancel();
      setNotice({ kind: "success", text: "Course archived successfully." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "We couldn't archive the course. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  const visible = courses.filter((course) => (!programFilter || course.program.id === programFilter) && (!search || `${course.name} ${course.code}`.toLowerCase().includes(search.toLowerCase())));
  const menu = (course: Course): MenuProps["items"] => [
    { key: "edit", label: "Edit course", onClick: () => editCourse(course) },
    { type: "divider" },
    { key: "archive", label: "Archive course", danger: true, onClick: () => void archive(course) },
  ];

  return (
    <ApplicationShell pageTitle="Courses & subjects" pageContext="Academic setup" selectedKey="courses">
      <div className="mx-auto max-w-6xl space-y-5">
        <nav aria-label="Breadcrumb" className="text-sm text-[#5f6368]">Academic <span className="mx-2">/</span><span className="text-[#202124]">Courses & subjects</span></nav>
        <header><h1 className="m-0 text-[28px] font-normal tracking-[-0.02em] text-[#202124]">Courses & subjects</h1><p className="mt-1 mb-0 max-w-2xl text-sm leading-6 text-[#5f6368]">Add the active subjects or courses taught within your programs. Archived courses stay out of the main list.</p></header>
        {notice ? <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-[#c6e7d0] bg-[#e6f4ea] text-[#137333]" : notice.kind === "error" ? "border-[#f1c6c6] bg-[#fce8e6] text-[#a50e0e]" : "border-[#c6dafc] bg-[#e8f0fe] text-[#174ea6]"}`}>{notice.text}</div> : null}
        {loading ? <div className="grid gap-5 lg:grid-cols-[1fr_360px]" aria-label="Loading courses"><div className="h-[560px] animate-pulse rounded-2xl border border-[#dadce0] bg-[#f8f9fa]" /><div className="h-[560px] animate-pulse rounded-2xl border border-[#dadce0] bg-[#f8f9fa]" /></div> : <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,.06)] sm:p-6">
            <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_250px]"><label><span className="mb-1 block text-xs font-medium text-[#5f6368]">Search courses</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Example: Database Management" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><label><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program</span><select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className="h-10 w-full rounded-lg border border-[#dadce0] bg-white px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]"><option value="">All active programs</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name} ({program.code})</option>)}</select></label></div>
            <div className="mb-4 flex items-center justify-between"><div><h2 className="m-0 text-base font-medium text-[#202124]">Active courses</h2><p className="mt-1 mb-0 text-xs text-[#5f6368]">Only active courses are shown.</p></div><span className="text-xs text-[#5f6368]">{visible.length}</span></div>
            {visible.length ? <div className="divide-y divide-[#e8eaed]">{visible.map((course) => <div key={course.id} className="flex items-center gap-3 py-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-medium text-[#202124]">{course.name}</span><span className="rounded-full bg-[#e6f4ea] px-2 py-0.5 text-[11px] font-medium text-[#137333]">{course.type.toLowerCase()}</span></div><p className="mt-1 text-xs text-[#5f6368]">{course.code} · {course.program.name} · {course.program.department.name}</p><p className="mt-1 text-xs text-[#5f6368]">{course.credits ? `${course.credits} credits` : "Credits not set"}{course.weeklyHours ? ` · ${course.weeklyHours} hours/week` : ""}</p></div><Dropdown trigger={["click"]} menu={{ items: menu(course) }} placement="bottomRight"><button type="button" aria-label={`More actions for ${course.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"><MoreOutlined /></button></Dropdown></div>)}</div> : <div className="rounded-xl border border-dashed border-[#dadce0] bg-[#f8f9fa] p-8 text-center"><p className="m-0 text-sm font-medium text-[#202124]">No active courses found</p><p className="mt-1 text-sm text-[#5f6368]">Add a course using the form, or change the search or program filter.</p></div>}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,.06)] sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="m-0 text-base font-medium text-[#202124]">{editing ? "Edit course" : "Add a course"}</h2><p className="mt-1 mb-0 text-xs text-[#5f6368]">{editing ? "Update the details and save." : "Add a subject to an active program."}</p></div>{editing ? <button type="button" onClick={cancel} className="text-xs font-medium text-[#1a73e8] hover:underline">Cancel</button> : null}</div><div className="space-y-3"><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Course name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={help.course} className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Course code</span><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Example: CS301" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm uppercase text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Program</span><select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className="h-10 w-full rounded-lg border border-[#dadce0] bg-white px-3 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]"><option value="">Select an active program</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name} ({program.code})</option>)}</select></label><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Description <span className="font-normal">(optional)</span></span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Example: Introduction to database design, SQL, and data management." rows={3} className="w-full rounded-lg border border-[#dadce0] px-3 py-2 text-sm text-[#202124] outline-none focus:border-[#188038] focus:ring-1 focus:ring-[#188038]" /></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-1 block text-xs font-medium text-[#5f6368]">Course type</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 w-full rounded-lg border border-[#dadce0] bg-white px-2 text-sm text-[#202124]"><option value="CORE">Core</option><option value="ELECTIVE">Elective</option><option value="PRACTICAL">Practical</option><option value="PROJECT">Project</option><option value="OTHER">Other</option></select></label><label><span className="mb-1 block text-xs font-medium text-[#5f6368]">Credits</span><input type="number" min="1" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} placeholder="Example: 4" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm text-[#202124]" /></label></div><label className="block"><span className="mb-1 block text-xs font-medium text-[#5f6368]">Weekly hours <span className="font-normal">(optional)</span></span><input type="number" min="1" value={form.weeklyHours} onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })} placeholder="Example: 5" className="h-10 w-full rounded-lg border border-[#dadce0] px-3 text-sm text-[#202124]" /></label><button type="button" disabled={saving || programs.length === 0} onClick={() => void save()} className="h-10 rounded-lg bg-[#188038] px-5 text-sm font-medium text-white hover:bg-[#137333] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : editing ? "Save course" : "Add course"}</button>{programs.length === 0 ? <p className="m-0 text-xs leading-5 text-[#5f6368]">Add an active program first. Courses can only be added to active programs.</p> : null}</div></section>

            <section className="rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-5"><p className="m-0 text-xs font-medium uppercase tracking-wide text-[#5f6368]">Example & tip</p><p className="mt-1 mb-0 text-sm font-medium text-[#202124]">{help.course}</p><p className="mt-1 mb-0 text-xs leading-5 text-[#5f6368]">{help.tip}</p></section>
            <section className="rounded-2xl border border-[#e8eaed] bg-white p-5"><p className="m-0 text-xs font-medium uppercase tracking-wide text-[#5f6368]">Coming next</p><p className="mt-1 mb-0 text-sm font-medium text-[#202124]">More academic planning tools</p><p className="mt-1 mb-0 text-xs leading-5 text-[#5f6368]">The academic structure will support future features such as term-wise course planning, faculty assignment, timetable, attendance, and examinations.</p></section>
          </aside>
        </div>}
      </div>
    </ApplicationShell>
  );
}
