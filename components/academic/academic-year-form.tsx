"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App, Alert, Button, Card, Form, Input } from "antd";
import { BulbOutlined, CalendarOutlined } from "@ant-design/icons";

type FormValues = { name: string; startDate: string; endDate: string };

export function AcademicYearForm() {
  const router = useRouter();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(values: FormValues) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/academic/years", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const result = (await response.json()) as { academicYear?: { id: string }; error?: string };
      if (!response.ok || !result.academicYear) {
        setError(result.error ?? "We couldn't create the academic year. Please review the details and try again.");
        return;
      }
      message.success("Academic year created successfully.");
      router.push(`/academic/years/${result.academicYear.id}`);
    } catch {
      setError("We couldn't create the academic year. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="!rounded-2xl !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.06)]">
        {error ? <Alert type="error" showIcon message="We couldn't save your academic year." description={error} className="mb-5 feedback-error" /> : null}
        <div className="mb-6"><h2 className="mb-1 text-xl font-semibold text-[#202124]">Academic year details</h2><p className="m-0 text-sm leading-6 text-[#4b5563]">Enter the name and dates your institution uses for this teaching period.</p></div>
        <Form layout="vertical" onFinish={submit} requiredMark="optional">
          <Form.Item name="name" label="Academic year name" extra="Example: 2026–2027" rules={[{ required: true, message: "Enter an academic year name." }, { min: 2, message: "Use at least 2 characters." }]}><Input size="large" placeholder="Example: 2026–2027" prefix={<CalendarOutlined className="text-[#5f6368]" />} /></Form.Item>
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name="startDate" label="Start date" extra="Example: 01 Jun 2026" rules={[{ required: true, message: "Choose a start date." }]}><Input type="date" size="large" /></Form.Item>
            <Form.Item name="endDate" label="End date" extra="Example: 31 May 2027" rules={[{ required: true, message: "Choose an end date." }]}><Input type="date" size="large" /></Form.Item>
          </div>
          <div className="mb-5 rounded-xl border border-[#d2e3fc] bg-[#f8fbff] px-4 py-3 text-sm leading-6 text-[#374151]">This academic year belongs only to your institution. You can add terms after saving it.</div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button size="large" onClick={() => router.push("/academic/years")}>Cancel</Button><Button type="primary" htmlType="submit" size="large" loading={saving}>Save academic year</Button></div>
        </Form>
      </Card>
      <aside className="space-y-4">
        <Card className="!rounded-2xl !border-[#d2e3fc] !bg-[#f8fbff]" styles={{ body: { padding: 20 } }}>
          <div className="mb-3 flex items-center gap-2 font-semibold text-[#202124]"><BulbOutlined className="text-[#1a73e8]" /> Quick example</div>
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-4"><strong className="block text-[#202124]">2026–2027</strong><span className="mt-1 block text-sm text-[#4b5563]">01 Jun 2026 to 31 May 2027</span></div>
        </Card>
        <Card className="!rounded-2xl !border-[#dadce0]" styles={{ body: { padding: 20 } }}>
          <h3 className="mb-2 text-base font-semibold text-[#202124]">What happens next?</h3>
          <p className="m-0 text-sm leading-6 text-[#4b5563]">After saving, open the academic year and add terms such as Semester 1 and Semester 2.</p>
        </Card>
      </aside>
    </div>
  );
}
