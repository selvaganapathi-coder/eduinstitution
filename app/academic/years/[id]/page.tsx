import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarOutlined } from "@ant-design/icons";
import { ApplicationShell } from "@/components/application-shell";
import { AcademicYearDetails } from "@/components/academic/academic-year-details";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function AcademicYearPage({ params }: { params: Promise<{ id: string }> }) {
  try { await requireTenantContext(); } catch (error) { if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login"); throw error; }
  const { id } = await params;
  return <ApplicationShell pageTitle="Academic year" pageContext="View dates, status, and terms" selectedKey="academic"><div className="management-page management-detail-page"><div className="management-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/academic/years">Academic years</Link><span>/</span><strong>Details</strong></div><section className="management-page-hero"><div className="management-page-hero-copy"><div className="management-hero-icon management-hero-icon-blue"><CalendarOutlined /></div><div><h1>Academic year details</h1><p>Review this academic year, update its dates, and manage its terms.</p></div></div></section><AcademicYearDetails id={id} /></div></ApplicationShell>;
}
