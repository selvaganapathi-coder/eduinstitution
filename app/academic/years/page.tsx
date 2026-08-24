import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarOutlined, CheckCircleFilled, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearList } from "@/components/academic/academic-year-list";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";

export default async function AcademicYearsPage() {
  try { await requirePermission("academic_year:view"); }
  catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    if (error instanceof AuthorizationError) return <ApplicationShell pageTitle="Academic years" pageContext="Academic setup" selectedKey="academic"><div className="mx-auto max-w-3xl py-10"><Result status="403" title="You don't have access" subTitle="You don't have permission to view academic years. Contact your institution administrator if you need access." /></div></ApplicationShell>;
    throw error;
  }

  return (
    <ApplicationShell pageTitle="Academic years" pageContext="Set up your institution's teaching years and terms" selectedKey="academic">
      <main className="academic-redesign">
        <section className="academic-redesign-hero">
          <div className="academic-redesign-eyebrow"><CalendarOutlined /> Academic setup</div>
          <div className="academic-redesign-hero-main">
            <div>
              <h1 className="academic-redesign-title">Academic years</h1>
              <p className="academic-redesign-description">Create the academic years your institution uses. After creating a year, add terms such as Semester 1 and Semester 2.</p>
            </div>
            <Link href="/academic/years/new"><Button type="primary" icon={<PlusOutlined />} className="academic-redesign-primary">Add academic year</Button></Link>
          </div>
        </section>

        <section className="academic-redesign-guide">
          <div className="academic-redesign-guide-card info">
            <span className="academic-redesign-guide-icon"><InfoCircleOutlined /></span>
            <h3>How it works</h3>
            <p>Create <strong>2026–2027</strong>, set its start and end dates, then add terms inside it. Mark the year currently being used by your institution as <strong>Current</strong>.</p>
          </div>
          <div className="academic-redesign-guide-card">
            <span className="academic-redesign-guide-icon"><CheckCircleFilled /></span>
            <h3>Simple setup order</h3>
            <p><strong>1.</strong> Add academic year &nbsp; <strong>2.</strong> Add terms &nbsp; <strong>3.</strong> Use them for academic records</p>
          </div>
        </section>

        <AcademicYearList />
      </main>
    </ApplicationShell>
  );
}
