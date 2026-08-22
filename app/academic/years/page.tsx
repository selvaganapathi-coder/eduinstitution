import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Result } from "antd";
import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearList } from "@/components/academic/academic-year-list";
import { Paragraph, Title } from "@/components/ui/typography";
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
    <ApplicationShell pageTitle="Academic years" pageContext="Create and manage the academic periods used by your institution" selectedKey="academic">
      <div className="management-page academic-years-page">
        <div className="management-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Academic</span><span>/</span><strong>Academic years</strong></div>
        <section className="management-page-hero">
          <div className="management-page-hero-copy">
            <div className="management-hero-icon management-hero-icon-blue"><CalendarOutlined /></div>
            <div><Title level={2} className="!mb-1 !text-[30px] !font-semibold">Academic years</Title><Paragraph type="secondary" className="!mb-0 management-page-description">Create the years your institution uses for classes, terms, records, and academic planning.</Paragraph></div>
          </div>
          <Link href="/academic/years/new"><Button type="primary" size="large" icon={<PlusOutlined />}>Add academic year</Button></Link>
        </section>
        <div className="management-info-grid">
          <Alert className="feedback-info management-guide-box" type="info" showIcon message="How academic years work" description="Example: You can create “2026–2027” and then add terms such as Semester 1 and Semester 2. Mark the year currently in use as Current." />
          <div className="management-next-box"><span className="management-next-label">NEXT STEP</span><strong>Add terms inside each academic year</strong><p>Terms help you organize semesters or other teaching periods.</p></div>
        </div>
        <AcademicYearList />
      </div>
    </ApplicationShell>
  );
}
