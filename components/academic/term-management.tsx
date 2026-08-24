"use client";

import { useEffect, useState } from "react";
import { CalendarOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Alert, Button, Card, Form, Input, Modal, Skeleton, Tag } from "antd";

type Term = { id: string; name: string; startDate: string; endDate: string; sortOrder: number; status: "ACTIVE" | "ARCHIVED" };
type Year = { id: string; name: string; startDate: string; endDate: string };
type Values = { name: string; startDate: string; endDate: string; sortOrder: number };
function date(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
function dateInput(value: string) { return new Date(value).toISOString().slice(0, 10); }

export function TermManagement({ id }: { id: string }) {
  const { message } = App.useApp();
  const [year, setYear] = useState<Year | null>(null); const [terms, setTerms] = useState<Term[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [editing, setEditing] = useState<Term | null>(null); const [formOpen, setFormOpen] = useState(false); const [form] = Form.useForm<Values>();
  useEffect(() => { async function load() { try { const response = await fetch(`/api/academic/years/${id}/terms`, { cache: "no-store" }); const result = (await response.json()) as { academicYear?: Year; terms?: Term[] }; if (!response.ok || !result.academicYear) throw new Error(); setYear(result.academicYear); setTerms(result.terms ?? []); } catch { setError("We couldn't load the terms. Please try again."); } finally { setLoading(false); } } void load(); }, [id]);
  async function reload() { const response = await fetch(`/api/academic/years/${id}/terms`, { cache: "no-store" }); const result = (await response.json()) as { academicYear?: Year; terms?: Term[] }; if (!response.ok || !result.academicYear) throw new Error(); setYear(result.academicYear); setTerms(result.terms ?? []); }
  async function save(values: Values) { setSaving(true); setError(""); try { const url = editing ? `/api/academic/years/${id}/terms/${editing.id}` : `/api/academic/years/${id}/terms`; const response = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) }); if (!response.ok) { setError("We couldn't save the term. Please review the details and try again."); return; } setEditing(null); setFormOpen(false); form.resetFields(); await reload(); message.success(editing ? "Term updated successfully." : "Term created successfully."); } catch { setError("We couldn't save the term. Check your connection and try again."); } finally { setSaving(false); } }
  async function archive(term: Term) { setSaving(true); setError(""); try { const response = await fetch(`/api/academic/years/${id}/terms/${term.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "archive" }) }); if (!response.ok) { setError("We couldn't archive the term. Please try again."); return; } await reload(); message.success("Term archived successfully."); } catch { setError("We couldn't archive the term. Check your connection and try again."); } finally { setSaving(false); } }
  function openAdd() { setEditing(null); form.resetFields(); form.setFieldValue("sortOrder", terms.length + 1); setFormOpen(true); }
  function openEdit(term: Term) { setEditing(term); form.setFieldsValue({ name: term.name, startDate: dateInput(term.startDate), endDate: dateInput(term.endDate), sortOrder: term.sortOrder }); setFormOpen(true); }

  if (loading) return <div className="academic-redesign"><Card className="academic-form-card"><Skeleton active paragraph={{ rows: 6 }} /></Card></div>;
  if (!year) return <Alert type="error" showIcon message="We couldn't open this academic year." description="Please return to the academic year list and try again." className="feedback-error" />;

  return <div className="academic-redesign">
    <section className="academic-term-year-strip"><div><span>Academic year</span><strong>{year.name}</strong></div><div className="text-sm text-[#4b5563]">{date(year.startDate)} – {date(year.endDate)}</div></section>
    {error ? <Alert type="error" showIcon message="We couldn't complete that action." description={error} className="feedback-error" /> : null}

    <section className="academic-terms-panel">
      <div className="academic-terms-panel-head">
        <div><h2>Terms in this academic year</h2><p>Add semesters or teaching periods in the order they should appear.</p></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add term</Button>
      </div>

      {terms.length === 0 ? <div className="academic-empty"><div className="academic-empty-icon"><CalendarOutlined /></div><h3>No terms yet</h3><p>Start with a term your institution already uses. Example: <strong>Semester 1</strong>. Add Semester 2 or other periods after that.</p><Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add first term</Button></div> : <div className="term-list">{terms.map((term) => <div key={term.id} className="term-row"><div className="term-order">{String(term.sortOrder).padStart(2,"0")}</div><div className="term-main"><div className="term-title-row"><strong>{term.name}</strong><Tag className={term.status === "ACTIVE" ? "academic-status-active" : "academic-status-archived"}>{term.status === "ACTIVE" ? "Active" : "Archived"}</Tag></div><span>{date(term.startDate)} – {date(term.endDate)}</span></div><div className="term-actions"><Button icon={<EditOutlined />} disabled={term.status === "ARCHIVED"} onClick={() => openEdit(term)}>Edit</Button>{term.status === "ACTIVE" ? <Button danger loading={saving} onClick={() => Modal.confirm({ title: `Archive ${term.name}?`, content: "The term will remain in historical records. You cannot edit it after archiving.", okText: "Archive term", okButtonProps: { danger: true }, onOk: () => archive(term) })}>Archive</Button> : null}</div></div>)}</div>}
    </section>

    <Modal open={formOpen} title={editing ? "Edit term" : "Add term"} onCancel={() => setFormOpen(false)} footer={null} destroyOnClose>
      <div className="term-modal-intro"><strong>{editing ? "Update this teaching period" : "Create a teaching period"}</strong><span>Example: Semester 1</span></div>
      <Form form={form} layout="vertical" onFinish={save} className="pt-4" requiredMark="optional">
        <Form.Item name="name" label="Term name" extra="Use a simple name your staff and students recognize." rules={[{ required: true, message: "Enter a term name." }]}><Input placeholder="Example: Semester 1" size="large" /></Form.Item>
        <div className="grid gap-4 sm:grid-cols-2"><Form.Item name="startDate" label="Start date" rules={[{ required: true, message: "Choose a start date." }]}><Input type="date" size="large" /></Form.Item><Form.Item name="endDate" label="End date" rules={[{ required: true, message: "Choose an end date." }]}><Input type="date" size="large" /></Form.Item></div>
        <Form.Item name="sortOrder" label="Display order" extra="Use 1 for the first term, 2 for the second term, and so on." rules={[{ required: true, message: "Enter the display order." }]}><Input type="number" min={1} size="large" /></Form.Item>
        <div className="management-form-tip">This term belongs only to <strong>{year.name}</strong>.</div>
        <div className="flex justify-end gap-3"><Button onClick={() => setFormOpen(false)}>Cancel</Button><Button type="primary" htmlType="submit" loading={saving}>{editing ? "Save changes" : "Add term"}</Button></div>
      </Form>
    </Modal>
  </div>;
}
