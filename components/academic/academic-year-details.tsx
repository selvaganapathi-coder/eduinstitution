"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Button, Card, Empty, Modal, Tag } from "antd";

type Term = { id: string; name: string; startDate: string; endDate: string; sortOrder: number; status: string };
type AcademicYear = { id: string; name: string; startDate: string; endDate: string; isCurrent: boolean; status: string; terms: Term[] };

function date(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }

export function AcademicYearDetails({ id }: { id: string }) {
  const [year, setYear] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch(`/api/academic/years/${id}`, { cache: "no-store" });
    const result = (await response.json()) as { academicYear?: AcademicYear; error?: string };
    if (!response.ok || !result.academicYear) throw new Error(result.error ?? "Unable to load the academic year");
    setYear(result.academicYear);
  }

  useEffect(() => { load().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load the academic year")).finally(() => setLoading(false)); }, [id]);

  async function action(actionName: "make-current" | "archive") {
    setWorking(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/academic/years/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: actionName }) });
      const result = (await response.json()) as { academicYear?: AcademicYear; error?: string };
      if (!response.ok || !result.academicYear) { setError(result.error ?? "We couldn't update the academic year."); return; }
      setYear(result.academicYear);
      setMessage(actionName === "make-current" ? "Academic year is now current." : "Academic year archived.");
    } catch { setError("We couldn't update the academic year. Try again."); } finally { setWorking(false); }
  }

  if (loading) return <Card className="!rounded-2xl !border-[#dadce0]"><div className="h-32 animate-pulse rounded-xl bg-[#f1f3f4]" /></Card>;
  if (!year) return <Alert type="error" showIcon message={error || "We couldn't find that academic year."} />;

  return (
    <div className="space-y-5">
      {error ? <Alert type="error" showIcon message={error} /> : null}
      {message ? <Alert type="success" showIcon message={message} /> : null}
      <Card className="!rounded-2xl !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.08)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div><p className="mb-2 text-sm text-[#5f6368]">Academic year</p><h2 className="m-0 text-2xl font-normal text-[#202124]">{year.name}</h2><p className="mt-2 text-sm text-[#5f6368]">{date(year.startDate)} – {date(year.endDate)}</p><div className="mt-3 flex gap-2"><Tag color={year.isCurrent ? "success" : undefined}>{year.isCurrent ? "Current year" : year.status === "ARCHIVED" ? "Archived" : "Active"}</Tag></div></div>
          <div className="flex flex-wrap gap-2"><Link href={`/academic/years/${id}/edit`}><Button>Edit</Button></Link>{!year.isCurrent && year.status === "ACTIVE" ? <Button loading={working} onClick={() => void action("make-current")}>Make current</Button> : null}{!year.isCurrent && year.status === "ACTIVE" ? <Button danger loading={working} onClick={() => Modal.confirm({ title: "Archive this academic year?", content: "You can keep the record for historical reference, but it will no longer be active.", okText: "Archive", okButtonProps: { danger: true }, onOk: () => action("archive") })}>Archive</Button> : null}</div>
        </div>
      </Card>
      <Card className="!rounded-2xl !border-[#dadce0]" title="Terms" extra={<Link href={`/academic/years/${id}/terms`} className="text-sm font-medium text-[#1a73e8]">Manage terms</Link>}>
        {year.terms.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No terms yet"><Link href={`/academic/years/${id}/terms`}><Button type="primary">Add term</Button></Link></Empty> : <div className="divide-y divide-[#dadce0]">{year.terms.map((term) => <div key={term.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="m-0 font-medium text-[#202124]">{term.name}</p><p className="m-0 text-sm text-[#5f6368]">{date(term.startDate)} – {date(term.endDate)}</p></div><Tag>{term.status === "ACTIVE" ? "Active" : "Archived"}</Tag></div>)}</div>}
      </Card>
    </div>
  );
}
