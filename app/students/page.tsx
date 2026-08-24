"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Button, Drawer, Input, Modal, Pagination, Select, Spin, notification } from "antd";
import { EditOutlined, PlusOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";

type AcademicYear = { id: string; name: string; status: string; isCurrent: boolean };
type Department = { id: string; name: string; code: string; status: string };
type Program = { id: string; name: string; code: string; department: { id: string; name: string; code: string }; status?: string };
type Enrollment = { id: string; enrollmentNumber: string; academicYear: { id: string; name: string }; department: { id: string; name: string; code: string }; program: { id: string; name: string; code: string } };
type Student = { id: string; studentNumber: string; firstName: string; lastName: string; email: string | null; phone: string | null; photoUrl: string | null; status: string; enrollments: Enrollment[] };
type FormState = { studentNumber: string; firstName: string; lastName: string; email: string; phone: string; photoUrl: string; academicYearId: string; departmentId: string; programId: string; enrollmentNumber: string };

const emptyForm: FormState = { studentNumber: "", firstName: "", lastName: "", email: "", phone: "", photoUrl: "", academicYearId: "", departmentId: "", programId: "", enrollmentNumber: "" };

export default function StudentsPage() {
  const [api, contextHolder] = notification.useNotification();
  const [students, setStudents] = useState<Student[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const notify = useCallback((type: "success" | "error" | "warning" | "info", message: string) => {
    api[type]({ message, placement: "bottomRight", duration: 4 });
  }, [api]);

  const buildStudentQuery = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim()) params.set("search", search.trim());
    if (academicYearId) params.set("academicYearId", academicYearId);
    if (departmentId) params.set("departmentId", departmentId);
    if (programId) params.set("programId", programId);
    return params;
  }, [academicYearId, departmentId, page, pageSize, programId, search]);

  const refreshStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/students?${buildStudentQuery()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't load students. Please try again.");
      setStudents(data.students ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "We couldn't load students. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [buildStudentQuery, notify]);

  useEffect(() => {
    let cancelled = false;
    const params = buildStudentQuery();

    void fetch(`/api/students?${params}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "We couldn't load students. Please try again.");
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setStudents(data.students ?? []);
          setTotal(data.pagination?.total ?? 0);
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          notify("error", error instanceof Error ? error.message : "We couldn't load students. Please try again.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [buildStudentQuery, notify]);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      fetch("/api/academic/years", { cache: "no-store" }),
      fetch("/api/academic/departments", { cache: "no-store" }),
      fetch("/api/academic/programs", { cache: "no-store" }),
    ])
      .then(async ([yearResponse, departmentResponse, programResponse]) => {
        const [yearData, departmentData, programData] = await Promise.all([yearResponse.json(), departmentResponse.json(), programResponse.json()]);
        if (!yearResponse.ok || !departmentResponse.ok || !programResponse.ok) {
          throw new Error(yearData.error ?? departmentData.error ?? programData.error ?? "Unable to load academic options.");
        }
        return { yearData, departmentData, programData };
      })
      .then(({ yearData, departmentData, programData }) => {
        if (!cancelled) {
          setYears((yearData.academicYears ?? []).filter((item: AcademicYear) => item.status === "ACTIVE"));
          setDepartments((departmentData.departments ?? []).filter((item: Department) => item.status === "ACTIVE"));
          setPrograms((programData.programs ?? []).filter((item: Program) => item.status !== "ARCHIVED"));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) notify("error", error instanceof Error ? error.message : "Unable to load academic options.");
      });

    return () => { cancelled = true; };
  }, [notify]);

  const visiblePrograms = useMemo(() => programs.filter((item) => !departmentId || item.department.id === departmentId), [departmentId, programs]);
  const formPrograms = useMemo(() => programs.filter((item) => !form.departmentId || item.department.id === form.departmentId), [form.departmentId, programs]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, academicYearId: years.find((item) => item.isCurrent)?.id ?? years[0]?.id ?? "" });
    setDrawerOpen(true);
  }

  function openEdit(student: Student) {
    const enrollment = student.enrollments[0];
    setEditing(student);
    setForm({ studentNumber: student.studentNumber, firstName: student.firstName, lastName: student.lastName, email: student.email ?? "", phone: student.phone ?? "", photoUrl: student.photoUrl ?? "", academicYearId: enrollment?.academicYear.id ?? "", departmentId: enrollment?.department.id ?? "", programId: enrollment?.program.id ?? "", enrollmentNumber: enrollment?.enrollmentNumber ?? "" });
    setDrawerOpen(true);
  }

  async function saveStudent() {
    if (!form.studentNumber || !form.firstName || !form.lastName || !form.academicYearId || !form.departmentId || !form.programId || !form.enrollmentNumber) {
      notify("warning", "Complete the required student and enrollment details.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(editing ? `/api/students/${editing.id}` : "/api/students", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't save the student. Please try again.");
      setDrawerOpen(false);
      setEditing(null);
      setForm(emptyForm);
      notify("success", editing ? "Student updated successfully." : "Student created successfully.");
      await refreshStudents();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "We couldn't save the student. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function archiveStudent(student: Student) {
    Modal.confirm({
      title: "Archive student?",
      content: `${student.firstName} ${student.lastName} will be removed from active student management.`,
      okText: "Archive",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error ?? "We couldn't archive the student.");
          notify("success", "Student archived successfully.");
          await refreshStudents();
        } catch (error) {
          notify("error", error instanceof Error ? error.message : "We couldn't archive the student.");
        }
      },
    });
  }

  return (
    <ApplicationShell pageTitle="Students" pageContext="Student management" selectedKey="students">
      {contextHolder}
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="m-0 text-[28px] font-normal tracking-[-0.02em] text-[#202124]">Students</h1><p className="mb-0 mt-1 max-w-2xl text-sm leading-6 text-[#4b5563]">Manage student records, profile photos, and academic enrollment in one place.</p></div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="!h-10 !rounded-lg !bg-[#188038] hover:!bg-[#137333]">Add student</Button>
        </header>

        <section className="rounded-2xl border border-[#dadce0] bg-white p-4 shadow-[0_1px_2px_rgba(60,64,67,.06)]"><div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_220px]">
          <Input allowClear value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} prefix={<SearchOutlined />} placeholder="Search name, student number, email or phone" className="!h-10" />
          <Select allowClear value={academicYearId || undefined} onChange={(value) => { setAcademicYearId(value ?? ""); setPage(1); }} placeholder="Academic year" options={years.map((item) => ({ value: item.id, label: item.name }))} />
          <Select allowClear value={departmentId || undefined} onChange={(value) => { setDepartmentId(value ?? ""); setProgramId(""); setPage(1); }} placeholder="Department" options={departments.map((item) => ({ value: item.id, label: item.name }))} />
          <Select allowClear value={programId || undefined} onChange={(value) => { setProgramId(value ?? ""); setPage(1); }} placeholder="Program" options={visiblePrograms.map((item) => ({ value: item.id, label: item.name }))} />
        </div></section>

        <section className="overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-[0_1px_2px_rgba(60,64,67,.06)]">
          {loading ? <div className="flex min-h-[360px] items-center justify-center"><Spin size="large" /></div> : students.length === 0 ? <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center"><Avatar size={52} icon={<UserOutlined />} className="mb-4 !bg-[#e6f4ea] !text-[#137333]" /><h2 className="m-0 text-lg font-medium text-[#202124]">No students found</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#4b5563]">Add your first student or change the current search and filters.</p><Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="mt-4 !bg-[#188038]">Add student</Button></div> : <>
            <div className="overflow-x-auto"><table className="min-w-[980px] w-full border-collapse"><thead className="bg-[#f8f9fa]"><tr className="text-left text-xs font-medium uppercase tracking-wide text-[#374151]"><th className="px-5 py-3">Student</th><th className="px-5 py-3">Program</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Academic year</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{students.map((student) => {
              const enrollment = student.enrollments[0];
              const initials = `${student.firstName[0] ?? ""}${student.lastName[0] ?? ""}`.toUpperCase();
              return <tr key={student.id} className="border-b border-[#eef0f1] last:border-b-0 hover:bg-[#f8faf8]"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar size={42} src={student.photoUrl || undefined} icon={!student.photoUrl ? <UserOutlined /> : undefined}>{!student.photoUrl ? initials : null}</Avatar><div className="min-w-0"><div className="font-medium text-[#202124]">{student.firstName} {student.lastName}</div><div className="text-sm text-[#4b5563]">{student.studentNumber}</div></div></div></td><td className="px-5 py-4 text-sm text-[#374151]"><div>{enrollment?.program.name ?? "—"}</div><div className="text-[#4b5563]">{enrollment?.department.name ?? "No active enrollment"}</div></td><td className="px-5 py-4 text-sm text-[#4b5563]">{student.email ?? student.phone ?? "—"}</td><td className="px-5 py-4 text-sm text-[#374151]">{enrollment?.academicYear.name ?? "—"}</td><td className="px-5 py-4"><span className="rounded-full bg-[#e6f4ea] px-2.5 py-1 text-xs font-medium text-[#137333]">{student.status === "ARCHIVED" ? "Archived" : "Active"}</span></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><Button type="text" icon={<EditOutlined />} aria-label={`Edit ${student.firstName} ${student.lastName}`} onClick={() => openEdit(student)} /><Button danger type="text" onClick={() => archiveStudent(student)}>Archive</Button></div></td></tr>;
            })}</tbody></table></div>
            <div className="flex flex-col gap-3 border-t border-[#eef0f1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-[#4b5563]">{total} student{total === 1 ? "" : "s"}</span><Pagination current={page} pageSize={pageSize} total={total} showSizeChanger onChange={(nextPage, nextSize) => { setPage(nextSize !== pageSize ? 1 : nextPage); setPageSize(nextSize); }} pageSizeOptions={[10, 20, 50, 100]} /></div>
          </>}
        </section>
      </div>

      <Drawer title={editing ? "Edit student" : "Add student"} placement="right" width={520} open={drawerOpen} onClose={() => setDrawerOpen(false)} extra={<Button type="primary" loading={saving} onClick={() => void saveStudent()} className="!bg-[#188038]">Save</Button>}>
        <div className="space-y-5">
          <div className="rounded-xl border border-[#eef0f1] p-4"><div className="mb-3 flex items-center gap-3"><Avatar size={52} src={form.photoUrl || undefined} icon={!form.photoUrl ? <UserOutlined /> : undefined} /><div><div className="font-medium text-[#202124]">Student photo</div><div className="text-sm text-[#4b5563]">Paste a hosted image URL for now.</div></div></div><Input value={form.photoUrl} onChange={(event) => setForm({ ...form, photoUrl: event.target.value })} placeholder="https://example.com/student-photo.jpg" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#374151]">Student number<Input className="mt-1.5" value={form.studentNumber} onChange={(event) => setForm({ ...form, studentNumber: event.target.value })} placeholder="Example: STU-2026-001" /></label>
            <label className="text-sm font-medium text-[#374151]">Enrollment number<Input className="mt-1.5" value={form.enrollmentNumber} onChange={(event) => setForm({ ...form, enrollmentNumber: event.target.value })} placeholder="Example: ENR-2026-001" /></label>
            <label className="text-sm font-medium text-[#374151]">First name<Input className="mt-1.5" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
            <label className="text-sm font-medium text-[#374151]">Last name<Input className="mt-1.5" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
            <label className="text-sm font-medium text-[#374151]">Email<Input className="mt-1.5" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className="text-sm font-medium text-[#374151]">Phone<Input className="mt-1.5" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          </div>
          <div className="border-t border-[#eef0f1] pt-5"><h3 className="m-0 text-base font-medium text-[#202124]">Academic enrollment</h3><p className="mt-1 text-sm text-[#4b5563]">Select the active academic context for this student.</p><div className="mt-4 grid gap-4">
            <label className="text-sm font-medium text-[#374151]">Academic year<Select className="mt-1.5 w-full" value={form.academicYearId || undefined} onChange={(value) => setForm({ ...form, academicYearId: value })} options={years.map((item) => ({ value: item.id, label: item.name }))} /></label>
            <label className="text-sm font-medium text-[#374151]">Department<Select className="mt-1.5 w-full" value={form.departmentId || undefined} onChange={(value) => setForm({ ...form, departmentId: value, programId: "" })} options={departments.map((item) => ({ value: item.id, label: item.name }))} /></label>
            <label className="text-sm font-medium text-[#374151]">Program<Select className="mt-1.5 w-full" value={form.programId || undefined} onChange={(value) => setForm({ ...form, programId: value })} options={formPrograms.map((item) => ({ value: item.id, label: item.name }))} /></label>
          </div></div>
        </div>
      </Drawer>
    </ApplicationShell>
  );
}
