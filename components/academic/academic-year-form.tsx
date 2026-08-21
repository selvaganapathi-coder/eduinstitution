"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App, Alert, Button, Card, Form, Input } from "antd";

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
      const response = await fetch("/api/academic/years", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { academicYear?: { id: string }; error?: string };
      if (!response.ok || !result.academicYear) {
        setError("We couldn't create the academic year. Please review the details and try again.");
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
    <Card className="!rounded-2xl !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.06)]">
      {error ? <Alert type="error" showIcon message="We couldn't save your academic year." description={error} className="mb-5 feedback-error" /> : null}
      <Form layout="vertical" onFinish={submit} requiredMark="optional">
        <Form.Item name="name" label="Academic year name" extra="Use the name your institution uses for this teaching period." rules={[{ required: true, message: "Enter an academic year name." }, { min: 2, message: "Use at least 2 characters." }]}>
          <Input size="large" placeholder="Example: 2026–2027" />
        </Form.Item>
        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item name="startDate" label="Start date" extra="The first day of the academic year." rules={[{ required: true, message: "Choose a start date." }]}>
            <Input type="date" size="large" />
          </Form.Item>
          <Form.Item name="endDate" label="End date" extra="The last day of the academic year." rules={[{ required: true, message: "Choose an end date." }]}>
            <Input type="date" size="large" />
          </Form.Item>
        </div>
        <div className="mb-5 rounded-xl bg-[#e8f0fe] px-4 py-3 text-sm leading-6 text-[#174ea6]">Your academic year will be available only to this institution.</div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button size="large" onClick={() => router.push("/academic/years")}>Cancel</Button>
          <Button type="primary" htmlType="submit" size="large" loading={saving}>Save academic year</Button>
        </div>
      </Form>
    </Card>
  );
}
