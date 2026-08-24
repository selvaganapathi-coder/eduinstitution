import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearList } from "@/components/academic/academic-year-list";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";

export default async function AcademicYearsPage() {
  try {
    await requirePermission("academic_year:view");
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    if (error instanceof AuthorizationError) {
      return (
        <ApplicationShell pageTitle="Academic years" pageContext="Create and manage academic years and terms" selectedKey="academic">
          <div className="mx-auto max-w-3xl py-10">
            <Result status="403" title="You don't have access" subTitle="You don't have permission to view academic years. Contact your institution administrator if you need access." />
          </div>
        </ApplicationShell>
      );
    }
    throw error;
  }

  return (
    <ApplicationShell pageTitle="Academic years" pageContext="Create and manage academic years and terms" selectedKey="academic">
      <main className="academic-years-page">
        <section className="academic-years-intro">
          <div className="academic-years-title-group">
            <span className="academic-years-title-icon"><CalendarOutlined /></span>
            <div>
              <h1>Academic years</h1>
              <p>Create and manage the academic years your institution uses for classes, terms and academic planning.</p>
            </div>
          </div>
          <Link href="/academic/years/new">
            <Button type="primary" size="large" icon={<PlusOutlined />} className="academic-years-create-button">
              Add academic year
            </Button>
          </Link>
        </section>

        <section className="academic-years-help" aria-label="Academic year setup guide">
          <div className="academic-years-help-icon"><InfoCircleOutlined /></div>
          <div className="academic-years-help-copy">
            <h2>How academic years work</h2>
            <p>Create an academic year, add the terms your institution uses, then make the year currently in use <strong>Current</strong>.</p>
          </div>
          <div className="academic-years-example">
            <span><CalendarOutlined /> Example: 2026–2027</span>
            <small>01 Jun 2026 – 31 May 2027</small>
          </div>
        </section>

        <AcademicYearList />
      </main>
    </ApplicationShell>
  );
}
