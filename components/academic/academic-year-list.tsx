"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarOutlined, RightOutlined } from "@ant-design/icons";
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
        const result = (await response.json()) as { academicYears?: AcademicYear[] };
        if (!response.ok) throw new Error("We couldn't load the academic years. Please try again.");
        setYears(result.academicYears ?? []);
      })
      .catch(() => setError("We couldn't load the academic years. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Card className="!rounded-2xl !border-[#dadce0]"><Skeleton active /></Card><Card className="!rounded-2xl !border-[#dadce0]"><Skeleton active /></Card></div>;

  if (error) {
    return <Alert className="feedback-error !rounded-xl" type="error" showIcon message="We couldn't load your academic years." description="Please try again. If the problem continues, contact your institution administrator." action={<Button size="small" onClick={() => window.location.reload()}>Try again</Button>} />;
  }

  if (years.length === 0) {
    return (
      <Card className="!rounded-2xl !border-[#dadce0] !shadow-none">
        <Empty image={<CalendarOutlined className="!text-4xl !text-[#188038]" />} description={false}>
          <div className="mx-auto max-w-md"><h3 className="text-base font-medium text-[#202124]">No academic years have been added yet</h3><p className="mt-1 text-sm leading-6 text-[#5f6368]">Add your first academic year to define the teaching period used by your institution.</p><Link href="/academic/years/new"><Button type="primary">Add academic year</Button></Link></div>
        </Empty>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {years.map((year) => (
        <Card key={year.id} className="!rounded-2xl !border-[#dadce0] !shadow-[0_1px_2px_rgba(60,64,67,.06)]" styles={{ body: { padding: 20 } }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="mb-1 text-xs text-[#5f6368]">Academic year</p><h3 className="m-0 truncate text-lg font-medium text-[#202124]">{year.name}</h3></div>
            {year.isCurrent ? <Tag color="success" className="!rounded-full">Current</Tag> : null}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#f8f9fa] p-3"><div><p className="mb-1 text-xs text-[#5f6368]">Starts</p><p className="m-0 text-sm font-medium text-[#202124]">{formatDate(year.startDate)}</p></div><div><p className="mb-1 text-xs text-[#5f6368]">Ends</p><p className="m-0 text-sm font-medium text-[#202124]">{formatDate(year.endDate)}</p></div></div>
          <p className="mt-4 text-sm text-[#5f6368]">{year._count.terms} {year._count.terms === 1 ? "term" : "terms"}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2"><Link href={`/academic/years/${year.id}`} className="text-sm font-medium text-[#1a73e8]">View details <RightOutlined className="text-[10px]" /></Link><Link href={`/academic/years/${year.id}/terms`} className="text-sm font-medium text-[#1a73e8]">Manage terms</Link></div>
        </Card>
      ))}
    </div>
  );
}
