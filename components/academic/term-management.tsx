"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Empty, Form, Input, Modal, Tag } from "antd";

type Term = { id: string; name: string; startDate: string; endDate: string; sortOrder: number; status: "ACTIVE" | "ARCHIVED" };
type Year = { id: string; name: string; startDate: string; endDate: string };
type Values = { name: string; startDate: string; endDate: string; sortOrder: number };

function date(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
function dateInput(value: string) { return new Date(value).toISOString().slice(0, 10); }

export function TermManagement({ id }: { id: string }) {
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
        const result = (await response.json()) as { academicYear?: Year; terms?: Term[]; error?: string };
        if (!response.ok || !result.academicYear) throw new Error(result.error ?? "Unable to load terms");
        setYear(result.academicYear); setTerms(result.terms ?? []);
      } catch (reason: unknown) {
        setError(reason instanceof Error ? reason.message : "Unable to load terms");
      } finally { setLoading(false); }
    }
    void load();
  }, [id]);

  async function reload() {
    const response = await fetch(`/api/academic/years/${id}/terms`, { cache: "no-store" });
    const result = (await response.json()) as { academicYear?: Year; terms?: Term[]; error?: string };
    if (!response.ok || !result.academicYear) throw new Error(result.error ?? "Unable to load terms");
    setYear(result.academicYear); setTerms(result.terms ?? []);
  }

  async function save(values: Values) {
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/academic/years/${id}/terms/${editing.id}` : `/api/academic/years/${id}/terms`;
      const response = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) { setError(result.error ?? "We couldn't save the term."); return; }
      setEditing(null); setFormOpen(false); form.resetFields(); await reload();
    } catch { setError("We couldn't save the term. Try again."); } finally { setSaving(false); }
  }

  async function archive(term: Term) {
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/academic/years/${id}/terms/${term.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "archive" }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) { setError(result.error ?? "We couldn't archive the term."); return; }
      await reload();
    } catch { setError("We couldn't archive the term. Try again."); } finally { setSaving(false); }
  }

  function openAdd() { setEditing(null); form.resetFields(); form.setFieldValue("sortOrder", terms.length + 1); setFormOpen(true); }
  function openEdit(term: Term) { setEditing(term); form.setFieldsValue({ name: term.name, startDate: dateInput(term.startDate), endDate: dateInput(term.endDate), sortOrder: term.sortOrder }); setFormOpen(true); }

  if (loading) return <Card className="!rounded-2xl !border-[#dadce0]"><div className="h-40 animate-pulse rounded-xl bg-[#f1f3f4]" /></Card>;
  if (!year) return <Alert type="error" showIcon message={error || "We couldn't find that academic year."} />;

  return <div className="space-y-5">
    {error ? <Alert type="error" showIcon message={error} /> : null}
    <Card className="!rounded-2xl !border-[#dadce0]" title="Terms" extra={<Button type="primary" onClick={openAdd}>Add term</Button>}>
      {terms.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No terms yet"><Button type="primary" onClick={openAdd}>Add term</Button></Empty> : <div className="divide-y divide-[#dadce0]">{terms.map((term) => <div key={term.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><p className="m-0 font-medium text-[#202124]">{term.name}</p><Tag>{term.status === "ACTIVE" ? "Active" : "Archived"}</Tag></div><p className="m-0 mt-1 text-sm text-[#5f6368]">{date(term.startDate)} – {date(term.endDate)}</p></div><div className="flex gap-2"><Button size="small" disabled={term.status === "ARCHIVED"} onClick={() => openEdit(term)}>Edit</Button>{term.status === "ACTIVE" ? <Button danger size="small" loading={saving} onClick={() => Modal.confirm({ title: `Archive ${term.name}?`, content: "The term will be kept for historical records.", okText: "Archive", okButtonProps: { danger: true }, onOk: () => archive(term) })}>Archive</Button> : null}</div></div>)}</div>}
    </Card>
    <Modal open={formOpen} title={editing ? "Edit term" : "Add term"} onCancel={() => setFormOpen(false)} footer={null} destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={save} className="pt-3" requiredMark="optional">
        <Form.Item name="name" label="Term name" rules={[{ required: true, message: "Enter a term name." }]}><Input placeholder="Example: Semester 1" size="large" /></Form.Item>
        <div className="grid gap-4 sm:grid-cols-2"><Form.Item name="startDate" label="Start date" rules={[{ required: true, message: "Choose a start date." }]}><Input type="date" size="large" /></Form.Item><Form.Item name="endDate" label="End date" rules={[{ required: true, message: "Choose an end date." }]}><Input type="date" size="large" /></Form.Item></div>
        <Form.Item name="sortOrder" label="Order" rules={[{ required: true, message: "Enter the order." }]}><Input type="number" min={1} size="large" /></Form.Item>
        <div className="flex justify-end gap-3"><Button onClick={() => setFormOpen(false)}>Cancel</Button><Button type="primary" htmlType="submit" loading={saving}>Save term</Button></div>
      </Form>
    </Modal>
  </div>;
}
