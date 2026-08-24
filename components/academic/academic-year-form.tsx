"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App, Alert, Button, Card, Form, Input } from "antd";
import { BulbOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";

type FormValues = { name: string; startDate: string; endDate: string };

export function AcademicYearForm() {
  const router = useRouter();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(values: FormValues) {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/academic/years", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const result = (await response.json()) as { academicYear?: { id: string }; error?: string };
      if (!response.ok || !result.academicYear) { setError(result.error ?? "We couldn't create the academic year. Please review the details and try again."); return; }
      message.success("Academic year created successfully.");
      router.push(`/academic/years/${result.academicYear.id}`);
    } catch { setError("We couldn't create the academic year. Check your connection and try again."); } finally { setSaving(false); }
  }

  return (
    <div className="academic-form-layout">
      <Card className="academic-form-card">
        {error ? <Alert type="error" showIcon message="We couldn't save your academic year." description={error} className="mb-5 feedback-error" /> : null}
        <div className="academic-form-heading"><span className="academic-form-heading-icon"><CalendarOutlined /></span><div><h2>Academic year details</h2><p>Use the same year name and dates your institution uses for classes, terms and academic records.</p></div></div>
        <Form layout="vertical" onFinish={submit} requiredMark="optional">
          <Form.Item name="name" label="Academic year name" extra="Example: 2026–2027" rules={[{ required: true, message: "Enter an academic year name." }, { min: 2, message: "Use at least 2 characters." }]}><Input size="large" placeholder="Example: 2026–2027" prefix={<CalendarOutlined className="text-[#137333]" />} /></Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name="startDate" label="Start date" extra="Example: 01 Jun 2026" rules={[{ required: true, message: "Choose a start date." }]}><Input type="date" size="large" /></Form.Item>
            <Form.Item name="endDate" label="End date" extra="Example: 31 May 2027" rules={[{ required: true, message: "Choose an end date." }]}><Input type="date" size="large" /></Form.Item>
          </div>
          <div className="mt-2 rounded-xl border border-[#dcebe0] bg-[#f7fbf8] px-4 py-3 text-sm leading-6 text-[#374151]"><CheckCircleOutlined className="mr-2 text-[#137333]" />After saving, you can add terms such as Semester 1 and Semester 2.</div>
          <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end"><Button size="large" onClick={() => router.push("/academic/years")}>Cancel</Button><Button type="primary" htmlType="submit" size="large" loading={saving}>Create academic year</Button></div>
        </Form>
      </Card>

      <aside className="space-y-4">
        <Card className="academic-side-card academic-example-card" styles={{ body: { padding: 20 } }}>
          <div className="mb-3 flex items-center gap-2 font-semibold text-[#202124]"><BulbOutlined className="text-[#137333]" /> Example</div>
          <div className="academic-example-value"><strong>2026–2027</strong><span>01 Jun 2026 to 31 May 2027</span></div>
        </Card>
        <Card className="academic-side-card" styles={{ body: { padding: 20 } }}>
          <div className="mb-3 flex items-center gap-2 font-semibold text-[#202124]"><CheckCircleOutlined className="text-[#1a73e8]" /> What happens next?</div>
          <p className="m-0 text-sm leading-6 text-[#4b5563]">Open the new academic year, then create the terms your institution uses. You can make the active year current when needed.</p>
        </Card>
      </aside>
    </div>
  );
}
