"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, MoreOutlined, RightOutlined, BookOutlined, InboxOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Skeleton, Tag } from "antd";

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

function getYearState(year: AcademicYear) {
  if (year.isCurrent) {
    return {
      label: "Current",
      className: "academic-year-state-current",
      statusLabel: "Active",
      statusText: "Current year",
      StatusIcon: CheckCircleOutlined,
    };
  }

  if (year.status === "ARCHIVED") {
    return {
      label: "Archived",
      className: "academic-year-state-archived",
      statusLabel: "Archived",
      statusText: "Completed",
      StatusIcon: InboxOutlined,
    };
  }

  return {
    label: "Active",
    className: "academic-year-state-active",
    statusLabel: "Active",
    statusText: "Ready to use",
    StatusIcon: ClockCircleOutlined,
  };
}

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

  if (loading) {
    return (
      <div className="academic-year-list-grid">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="academic-year-card">
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        className="feedback-error !rounded-xl"
        type="error"
        showIcon
        message="We couldn't load your academic years."
        description="Please try again. If the problem continues, contact your institution administrator."
        action={<Button size="small" onClick={() => window.location.reload()}>Try again</Button>}
      />
    );
  }

  if (years.length === 0) {
    return (
      <Card className="academic-empty">
        <div className="academic-empty-icon"><CalendarOutlined /></div>
        <h3>Create your first academic year</h3>
        <p>Start with the academic year your institution is using now. For example, <strong>2026–2027</strong>. You can add semesters or other terms after saving it.</p>
        <Link href="/academic/years/new"><Button type="primary" size="large">Add academic year</Button></Link>
      </Card>
    );
  }

  return (
    <section className="academic-years-content" aria-label="Academic years">
      <div className="academic-year-list-grid">
        {years.map((year) => {
          const termCount = year._count.terms;
          const state = getYearState(year);
          const StatusIcon = state.StatusIcon;

          return (
            <Card key={year.id} className={`academic-year-card ${year.isCurrent ? "current" : ""}`} styles={{ body: { padding: 22 } }}>
              <div className="academic-year-card-state-row">
                <Tag className={`academic-year-state ${state.className}`}>{state.label}</Tag>
                <Button type="text" size="small" icon={<MoreOutlined />} className="academic-year-more-button" aria-label={`More options for ${year.name}`} />
              </div>

              <div className="academic-year-card-main">
                <span className={`academic-year-calendar-icon ${state.className}`}><CalendarOutlined /></span>
                <div>
                  <h2>{year.name}</h2>
                  <p>{formatDate(year.startDate)} – {formatDate(year.endDate)}</p>
                </div>
              </div>

              <div className="academic-year-card-metrics">
                <div className="academic-year-metric">
                  <BookOutlined />
                  <div>
                    <span>Terms</span>
                    <strong>{termCount}</strong>
                    <small>{termCount === 1 ? "Term" : termCount === 0 ? "Not added" : "Terms"}</small>
                  </div>
                </div>
                <div className="academic-year-metric academic-year-metric-status">
                  <StatusIcon />
                  <div>
                    <span>Status</span>
                    <strong>{state.statusLabel}</strong>
                    <small>{state.statusText}</small>
                  </div>
                </div>
              </div>

              <div className="academic-year-card-footer">
                <Link href={`/academic/years/${year.id}`} className="academic-year-view-link">
                  View details <RightOutlined />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="academic-years-add-more">
        <span className="academic-years-add-more-icon"><CalendarOutlined /></span>
        <div>
          <h3>Need another academic year?</h3>
          <p>Add a new academic year when you are ready to continue your institution&apos;s academic planning.</p>
        </div>
        <Link href="/academic/years/new"><Button icon={<CalendarOutlined />}>Add academic year</Button></Link>
      </div>

      <div className="academic-years-tip">
        <InfoCircleOutlined />
        <span><strong>Tip:</strong> Set one academic year as Current before using it for attendance, examinations and other academic features.</span>
      </div>
    </section>
  );
}
