"use client";

import { useEffect, useState } from "react";
import { App, Alert, Button, Card, Empty, Form, Input, Modal, Tag } from "antd";

type Term = { id: string; name: string; startDate: string; endDate: string; sortOrder: number; status: "ACTIVE" | "ARCHIVED" };
type Year = { id: string; name: string; startDate: string; endDate: string };
type Values = { name: string; startDate: string; endDate: string; sortOrder: number };

function date(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
function dateInput(value: string) { return new Date(value).toISOString().slice(0, 10); }

export function TermManagement({ id }: { id: string }) {
  const { message } = App.useApp();
  const [year, setYear] = useState<Year | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Term | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm<Values>();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/academic/years/${id}/terms`, { cache: "no-store" });
        const result = (await response.json()) as { academicYear?: Year; terms?: Term[] };
        if (!response.ok || !result.academicYear) throw new Error("We couldn't load the terms. Please try again.");
        setYear(result.academicYear); setTerms(result.terms ?? []);
      } catch { setError("We couldn't load the terms. Please try again."); }
      finally { setLoading(false); }
    }
    void load();
  }, [id]);

  async function reload() {
    const response = await fetch(`/api/academic/years/${id}/terms`, { cache: "no-store" });
    const result = (await response.json()) as { academicYear?: Year; terms?: Term[] };
    if (!response.ok || !result.academicYear) throw new Error("We couldn't refresh the terms. Please try again.");
    setYear(result.academicYear); setTerms(result.terms ?? []);
  }

  async function save(values: Values) {
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/academic/years/${id}/terms/${editing.id}` : `/api/academic/years/${id}/terms`;
      const response = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      if (!response.ok) { setError("We couldn't save the term. Please review the details and try again."); return; }
      setEditing(null); setFormOpen(false); form.resetFields(); await reload();
      message.success(editing ? "Term updated successfully." : "Term created successfully.");
    } catch { setError("We couldn't save the term. Check your connection and try again."); } finally { setSaving(false); }
  }

  async function archive(term: Term) {
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/academic/years/${id}/terms/${term.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "archive" }) });
      if (!response.ok) { setError("We couldn't archive the term. Please try again."); return; }
      await reload();
      message.success("Term archived successfully.");
    } catch { setError("We couldn't archive the term. Check your connection and try again."); } finally { setSaving(false); }
  }

  function openAdd() { setEditing(null); form.resetFields(); form.setFieldValue("sortOrder", terms.length + 1); setFormOpen(true); }
  function openEdit(term: Term) { setEditing(term); form.setFieldsValue({ name: term.name, startDate: dateInput(term.startDate), endDate: dateInput(term.endDate), sortOrder: term.sortOrder }); setFormOpen(true); }

  if (loading) return <Card className="!rounded-2xl !border-[#dadce0]"><div className="h-40 animate-pulse rounded-xl bg-[#f1f3f4]" /></Card>;
  if (!year) return <Alert type="error" showIcon message="We couldn't open this academic year." description="Please return to the academic year list and try again." className="feedback-error" />;

  return <div className="space-y-5">
    {error ? <Alert type="error" showIcon message="We couldn't complete that action." description={error} className="feedback-error" /> : null}
    <Card className="!rounded-2xl !border-[#dadce0]" title={<span className="font-medium text-[#202124]">Terms</span>} extra={<Button type="primary" onClick={openAdd}>Add term</Button>}>
      {terms.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false}><div className="mx-auto max-w-md"><h3 className="text-base font-medium text-[#202124]">No terms have been added yet</h3><p className="mt-1 text-sm leading-6 text-[#5f6368]">Add the first term for this academic year to organize your teaching periods.</p><Button type="primary" onClick={openAdd}>Add term</Button></div></Empty> : <div className="divide-y divide-[#dadce0]">{terms.map((term) => <div key={term.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="m-0 font-medium text-[#202124]">{term.name}</p><Tag color={term.status === "ACTIVE" ? "success" : "default"}>{term.status === "ACTIVE" ? "Active" : "Archived"}</Tag></div><p className="m-0 mt-1 text-sm text-[#5f6368]">{date(term.startDate)} – {date(term.endDate)}</p></div><div className="flex gap-2"><Button size="small" disabled={term.status === "ARCHIVED"} onClick={() => openEdit(term)}>Edit</Button>{term.status === "ACTIVE" ? <Button danger size="small" loading={saving} onClick={() => Modal.confirm({ title: `Archive ${term.name}?`, content: "This term will be kept for historical records. You can no longer edit it after archiving.", okText: "Archive term", okButtonProps: { danger: true }, onOk: () => archive(term) })}>Archive</Button> : null}</div></div>)}</div>}
    </Card>
    <Modal open={formOpen} title={editing ? "Edit term" : "Add term"} onCancel={() => setFormOpen(false)} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={save} className="pt-3" requiredMark="optional">
        <Form.Item name="name" label="Term name" extra="Use a name staff and students will recognize, such as Semester 1." rules={[{ required: true, message: "Enter a term name." }]}><Input placeholder="Example: Semester 1" size="large" /></Form.Item>
        <div className="grid gap-4 sm:grid-cols-2"><Form.Item name="startDate" label="Start date" rules={[{ required: true, message: "Choose a start date." }]}><Input type="date" size="large" /></Form.Item><Form.Item name="endDate" label="End date" rules={[{ required: true, message: "Choose an end date." }]}><Input type="date" size="large" /></Form.Item></div>
        <Form.Item name="sortOrder" label="Display order" extra="This controls the order in which terms appear." rules={[{ required: true, message: "Enter the display order." }]}><Input type="number" min={1} size="large" /></Form.Item>
        <div className="mb-4 rounded-xl bg-[#e8f0fe] px-4 py-3 text-sm leading-6 text-[#174ea6]">Changes will apply to this academic year only.</div>
        <div className="flex justify-end gap-3"><Button onClick={() => setFormOpen(false)}>Cancel</Button><Button type="primary" htmlType="submit" loading={saving}>{editing ? "Save changes" : "Add term"}</Button></div>
      </Form>
    </Modal>
  </div>;
}
