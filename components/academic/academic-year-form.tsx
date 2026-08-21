"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, DatePicker, Form, Input } from "antd";
import dayjs, { Dayjs } from "dayjs";

export function AcademicYearForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(values: { name: string; dates: [Dayjs, Dayjs] }) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/academic/years", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: values.name, startDate: values.dates[0].toISOString(), endDate: values.dates[1].toISOString() }),
      });
      const result = (await response.json()) as { academicYear?: { id: string }; error?: string };
      if (!response.ok || !result.academicYear) {
        setError(result.error ?? "We couldn't create the academic year.");
        return;
      }
      router.push(`/academic/years/${result.academicYear.id}`);
    } catch {
      setError("We couldn't create the academic year. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="!rounded-2xl !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.08)]">
      {error ? <Alert type="error" showIcon message={error} className="mb-5" /> : null}
      <Form layout="vertical" onFinish={submit} requiredMark="optional">
        <Form.Item name="name" label="Academic year" rules={[{ required: true, message: "Enter an academic year name." }, { min: 2, message: "Use at least 2 characters." }]}>
          <Input size="large" placeholder="Example: 2026–2027" />
        </Form.Item>
        <Form.Item name="dates" label="Dates" rules={[{ required: true, message: "Choose the start and end dates." }]}>
          <DatePicker.RangePicker size="large" className="w-full" format="DD MMM YYYY" disabledDate={(date) => date.isBefore(dayjs().subtract(2, "year"), "day")} />
        </Form.Item>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button size="large" onClick={() => router.push("/academic/years")}>Cancel</Button>
          <Button type="primary" htmlType="submit" size="large" loading={saving}>Save academic year</Button>
        </div>
      </Form>
    </Card>
  );
}
