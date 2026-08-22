"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarOutlined, RightOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, Skeleton, Tag } from "antd";

type AcademicYear = { id: string; name: string; startDate: string; endDate: string; isCurrent: boolean; status: "ACTIVE" | "ARCHIVED"; _count: { terms: number } };
function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }

export function AcademicYearList() {
  const [years, setYears] = useState<AcademicYear[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { fetch("/api/academic/years", { cache: "no-store" }).then(async (response) => { const result = (await response.json()) as { academicYears?: AcademicYear[] }; if (!response.ok) throw new Error(); setYears(result.academicYears ?? []); }).catch(() => setError("We couldn't load the academic years. Please try again.")).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="academic-year-list-grid">{[1,2,3].map((item) => <Card key={item} className="management-list-card"><Skeleton active /></Card>)}</div>;
  if (error) return <Alert className="feedback-error !rounded-xl" type="error" showIcon message="We couldn't load your academic years." description="Please try again. If the problem continues, contact your institution administrator." action={<Button size="small" onClick={() => window.location.reload()}>Try again</Button>} />;
  if (years.length === 0) return <Card className="management-empty-card"><Empty image={<CalendarOutlined className="!text-4xl !text-[#1a73e8]" />} description={false}><div className="mx-auto max-w-md"><h3>No academic years yet</h3><p>Start by adding the academic year your institution is currently using. Example: 2026–2027.</p><Link href="/academic/years/new"><Button type="primary">Add your first academic year</Button></Link></div></Empty></Card>;
  return <div className="academic-year-list-grid">{years.map((year) => <Card key={year.id} className="management-list-card academic-year-card" styles={{ body: { padding: 20 } }}>
    <div className="management-card-top"><div className="management-card-title"><span className="management-card-icon management-card-icon-blue"><CalendarOutlined /></span><div><p>ACADEMIC YEAR</p><h3>{year.name}</h3></div></div>{year.isCurrent ? <Tag className="management-current-tag">Current</Tag> : <Tag className="management-status-tag">{year.status === "ARCHIVED" ? "Archived" : "Active"}</Tag>}</div>
    <div className="management-date-grid"><div><span>Starts</span><strong>{formatDate(year.startDate)}</strong></div><div><span>Ends</span><strong>{formatDate(year.endDate)}</strong></div></div>
    <div className="management-card-meta"><span>{year._count.terms} {year._count.terms === 1 ? "term" : "terms"}</span><span>Manage dates and terms</span></div>
    <div className="management-card-actions"><Link href={`/academic/years/${year.id}`}>View details <RightOutlined /></Link><Link href={`/academic/years/${year.id}/terms`}>Manage terms</Link></div>
  </Card>)}</div>;
}
