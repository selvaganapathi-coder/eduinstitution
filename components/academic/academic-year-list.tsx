"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarOutlined, RightOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Skeleton, Tag } from "antd";

type AcademicYear = { id: string; name: string; startDate: string; endDate: string; isCurrent: boolean; status: "ACTIVE" | "ARCHIVED"; _count: { terms: number } };
function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }

export function AcademicYearList() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/academic/years", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as { academicYears?: AcademicYear[] };
        if (!response.ok) throw new Error();
        setYears(result.academicYears ?? []);
      })
      .catch(() => setError("We couldn't load the academic years. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="academic-year-list-grid">{[1, 2, 3].map((item) => <Card key={item} className="academic-year-card"><Skeleton active paragraph={{ rows: 6 }} /></Card>)}</div>;

  if (error) return <Alert className="feedback-error !rounded-xl" type="error" showIcon message="We couldn't load your academic years." description="Please try again. If the problem continues, contact your institution administrator." action={<Button size="small" onClick={() => window.location.reload()}>Try again</Button>} />;

  if (years.length === 0) return (
    <Card className="academic-empty">
      <div className="academic-empty-icon"><CalendarOutlined /></div>
      <h3>Create your first academic year</h3>
      <p>Start with the year your institution is using now. A common example is <strong>2026–2027</strong>. You can add semesters or terms after saving it.</p>
      <Link href="/academic/years/new"><Button type="primary" size="large">Add academic year</Button></Link>
    </Card>
  );

  return (
    <div className="academic-year-list-grid">
      {years.map((year) => {
        const termCount = year._count.terms;
        const status = year.isCurrent ? "Current" : year.status === "ARCHIVED" ? "Archived" : "Active";
        const statusClass = year.isCurrent ? "academic-status-current" : year.status === "ARCHIVED" ? "academic-status-archived" : "academic-status-active";
        const summary = year.isCurrent ? "This is the academic year currently being used by your institution." : year.status === "ARCHIVED" ? "This year is kept for previous records and reporting." : "This academic year is ready to use when needed.";

        return <Card key={year.id} className={`academic-year-card ${year.isCurrent ? "current" : ""}`} styles={{ body: { padding: 20 } }}>
          <div className="management-card-top">
            <div className="management-card-title">
              <span className="management-card-icon management-card-icon-blue"><CalendarOutlined /></span>
              <div><p>ACADEMIC YEAR</p><h3>{year.name}</h3></div>
            </div>
            <Tag className={statusClass}>{status}</Tag>
          </div>

          <p className="academic-year-card-summary">{summary}</p>

          <div className="academic-year-dates">
            <div><span>Starts</span><strong>{formatDate(year.startDate)}</strong></div>
            <div><span>Ends</span><strong>{formatDate(year.endDate)}</strong></div>
          </div>

          <div className="academic-year-meta">
            <span><strong>{termCount}</strong> {termCount === 1 ? "term" : "terms"}</span>
            <span>{termCount === 0 ? "No terms yet" : "Ready to manage"}</span>
          </div>

          <div className="academic-year-actions">
            <Link href={`/academic/years/${year.id}`}><Button block>Open year <RightOutlined /></Button></Link>
            <Link href={`/academic/years/${year.id}/terms`}><Button type="primary">{termCount === 0 ? "Add terms" : "Terms"}</Button></Link>
          </div>
        </Card>;
      })}
    </div>
  );
}
