"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarOutlined, EditOutlined, SettingOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Tag } from "antd";

type Term = { id: string; name: string; startDate: string; endDate: string; sortOrder: number; status: string };
type AcademicYear = { id: string; name: string; startDate: string; endDate: string; isCurrent: boolean; status: string; terms: Term[] };
function date(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }

export function AcademicYearDetails({ id }: { id: string }) {
  const [year, setYear] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadYear() {
      try {
        const response = await fetch(`/api/academic/years/${id}`, { cache: "no-store" });
        const result = (await response.json()) as { academicYear?: AcademicYear; error?: string };
        if (!response.ok || !result.academicYear) throw new Error(result.error ?? "Unable to load the academic year");
        if (!cancelled) setYear(result.academicYear);
      } catch (reason: unknown) { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load the academic year"); }
      finally { if (!cancelled) setLoading(false); }
    }
    void loadYear();
    return () => { cancelled = true; };
  }, [id]);

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

  if (loading) return <div className="academic-redesign"><div className="academic-detail-summary animate-pulse"><div className="h-20 rounded-xl bg-[#f1f3f4]" /><div className="h-10 w-56 rounded-xl bg-[#f1f3f4]" /></div></div>;
  if (!year) return <Alert type="error" showIcon message={error || "We couldn't find that academic year."} />;

  const status = year.isCurrent ? "Current" : year.status === "ARCHIVED" ? "Archived" : "Active";
  const statusClass = year.isCurrent ? "academic-status-current" : year.status === "ARCHIVED" ? "academic-status-archived" : "academic-status-active";

  return (
    <div className="academic-redesign">
      {error ? <Alert type="error" showIcon message={error} /> : null}
      {message ? <Alert type="success" showIcon message={message} /> : null}
      <section className="academic-detail-summary">
        <div>
          <div className="academic-detail-name"><span className="management-card-icon management-card-icon-blue"><CalendarOutlined /></span><div><Tag className={statusClass}>{status}</Tag><h2>{year.name}</h2></div></div>
          <p className="academic-detail-period">{date(year.startDate)} – {date(year.endDate)} · {year.terms.length} {year.terms.length === 1 ? "term" : "terms"}</p>
        </div>
        <div className="academic-detail-actions">
          <Link href={`/academic/years/${id}/edit`}><Button icon={<EditOutlined />}>Edit</Button></Link>
          <Link href={`/academic/years/${id}/terms`}><Button type="primary" icon={<SettingOutlined />}>Manage terms</Button></Link>
          {!year.isCurrent && year.status === "ACTIVE" ? <Button loading={working} onClick={() => void action("make-current")}>Make current</Button> : null}
          {!year.isCurrent && year.status === "ACTIVE" ? <Button danger loading={working} onClick={() => Modal.confirm({ title: "Archive this academic year?", content: "The record will stay available for historical reference, but it will no longer be active.", okText: "Archive", okButtonProps: { danger: true }, onOk: () => action("archive") })}>Archive</Button> : null}
        </div>
      </section>
      <section className="academic-terms-panel">
        <div className="academic-terms-panel-head"><div><h2>Terms</h2><p>Semesters or teaching periods inside {year.name}.</p></div><Link href={`/academic/years/${id}/terms`}><Button type="primary">Manage terms</Button></Link></div>
        {year.terms.length === 0 ? <div className="academic-empty"><div className="academic-empty-icon"><CalendarOutlined /></div><h3>No terms added yet</h3><p>Example: add Semester 1 and Semester 2. You can manage their dates and display order from the terms page.</p><Link href={`/academic/years/${id}/terms`}><Button type="primary">Add first term</Button></Link></div> : <div className="term-list">{year.terms.map((term) => <div key={term.id} className="term-row"><div className="term-order">{String(term.sortOrder).padStart(2, "0")}</div><div className="term-main"><div className="term-title-row"><strong>{term.name}</strong><Tag className={term.status === "ACTIVE" ? "academic-status-active" : "academic-status-archived"}>{term.status === "ACTIVE" ? "Active" : "Archived"}</Tag></div><span>{date(term.startDate)} – {date(term.endDate)}</span></div></div>)}</div>}
      </section>
    </div>
  );
}
