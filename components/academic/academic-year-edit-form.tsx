"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { App, Alert, Button, Card, Form, Input, Skeleton } from "antd";

type Values = { name: string; startDate: string; endDate: string };
type Year = { id: string; name: string; startDate: string; endDate: string };

function toDate(value: string) { return new Date(value).toISOString().slice(0, 10); }

export function AcademicYearEditForm({ id }: { id: string }) {
  const router = useRouter();
  const { message } = App.useApp();
  const [initial, setInitial] = useState<Values | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/academic/years/${id}`, { cache: "no-store" });
        const result = (await response.json()) as { academicYear?: Year };
        if (!response.ok || !result.academicYear) throw new Error("We couldn't load this academic year. Please try again.");
        setInitial({ name: result.academicYear.name, startDate: toDate(result.academicYear.startDate), endDate: toDate(result.academicYear.endDate) });
      } catch { setError("We couldn't load this academic year. Please try again."); }
    }
    void load();
  }, [id]);

  async function submit(values: Values) {
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/academic/years/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      if (!response.ok) { setError("We couldn't save your changes. Please review the details and try again."); return; }
      message.success("Academic year updated successfully.");
      router.push(`/academic/years/${id}`);
    } catch { setError("We couldn't save your changes. Check your connection and try again."); } finally { setSaving(false); }
  }

  if (error && !initial) return <Alert type="error" showIcon message="We couldn't load this academic year." description={error} className="feedback-error" />;
  if (!initial) return <Card className="!rounded-2xl !border-[#dadce0]"><Skeleton active /></Card>;

  return <Card className="!rounded-2xl !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.06)]">
    {error ? <Alert type="error" showIcon message="We couldn't save your changes." description={error} className="mb-5 feedback-error" /> : null}
    <Form layout="vertical" initialValues={initial} onFinish={submit} requiredMark="optional">
      <Form.Item name="name" label="Academic year name" extra="Use the name your institution uses for this teaching period." rules={[{ required: true, message: "Enter an academic year name." }, { min: 2, message: "Use at least 2 characters." }]}><Input size="large" /></Form.Item>
      <div className="grid gap-4 sm:grid-cols-2"><Form.Item name="startDate" label="Start date" extra="The first day of the academic year." rules={[{ required: true, message: "Choose a start date." }]}><Input type="date" size="large" /></Form.Item><Form.Item name="endDate" label="End date" extra="The last day of the academic year." rules={[{ required: true, message: "Choose an end date." }]}><Input type="date" size="large" /></Form.Item></div>
      <div className="mb-5 rounded-xl bg-[#e8f0fe] px-4 py-3 text-sm leading-6 text-[#174ea6]">Changes will apply to this institution only.</div>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button size="large" onClick={() => router.push(`/academic/years/${id}`)}>Cancel</Button><Button type="primary" htmlType="submit" size="large" loading={saving}>Save changes</Button></div>
    </Form>
  </Card>;
}
