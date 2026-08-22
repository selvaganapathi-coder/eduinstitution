import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarOutlined } from "@ant-design/icons";
import { Result } from "antd";
import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearForm } from "@/components/academic/academic-year-form";
import { AuthenticationError, AuthorizationError, TenantAccessError } from "@/src/server/auth/errors";
import { requirePermission } from "@/src/server/auth/permissions";

export default async function NewAcademicYearPage() {
  try { await requirePermission("academic_year:create"); }
  catch (error) {
    if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login");
    if (error instanceof AuthorizationError) return <ApplicationShell pageTitle="Add academic year" pageContext="Academic setup" selectedKey="academic"><Result status="403" title="You don't have access" subTitle="You don't have permission to add an academic year." /></ApplicationShell>;
    throw error;
  }
  return <ApplicationShell pageTitle="Add academic year" pageContext="Create a new academic period" selectedKey="academic"><div className="management-page management-form-page"><div className="management-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/academic/years">Academic years</Link><span>/</span><strong>Add academic year</strong></div><section className="management-page-hero"><div className="management-page-hero-copy"><div className="management-hero-icon management-hero-icon-blue"><CalendarOutlined /></div><div><h1>Add academic year</h1><p>Create the academic period your institution will use for classes and terms.</p></div></div></section><AcademicYearForm /></div></ApplicationShell>;
}
