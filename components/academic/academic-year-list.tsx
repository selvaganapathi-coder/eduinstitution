"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, Button, Card, Empty, Skeleton, Tag } from "antd";

type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: "ACTIVE" | "ARCHIVED";
  _count: { terms: number };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function AcademicYearList() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/academic/years", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { academicYears?: AcademicYear[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to load academic years");
        setYears(result.academicYears ?? []);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load academic years"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card className="!rounded-2xl !border-[#dadce0]"><Skeleton active /></Card>;
  if (error) return <Alert type="error" showIcon message={error} />;
  if (years.length === 0) return <Card className="!rounded-2xl !border-[#dadce0]"><Empty description="No academic years yet"><Link href="/academic/years/new"><Button type="primary">Add academic year</Button></Link></Empty></Card>;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {years.map((year) => (
        <Card key={year.id} className="!rounded-2xl !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.08)]" title={<span className="font-medium text-[#202124]">{year.name}</span>} extra={year.isCurrent ? <Tag color="success">Current year</Tag> : null}>
          <p className="text-sm text-[#5f6368]">{formatDate(year.startDate)} – {formatDate(year.endDate)}</p>
          <p className="mt-2 text-sm text-[#5f6368]">{year._count.terms} {year._count.terms === 1 ? "term" : "terms"}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/academic/years/${year.id}`} className="text-sm font-medium text-[#1a73e8]">View details</Link>
            <Link href={`/academic/years/${year.id}/terms`} className="text-sm font-medium text-[#1a73e8]">Manage terms</Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
