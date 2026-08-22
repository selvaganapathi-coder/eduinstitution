import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarOutlined } from "@ant-design/icons";

import { ApplicationShell } from "@/components/application-shell";
import { TermManagement } from "@/components/academic/term-management";
import { AuthenticationError, TenantAccessError } from "@/src/server/auth/errors";
import { requireTenantContext } from "@/src/server/auth/tenant-context";

export default async function AcademicTermsPage({ params }: { params: Promise<{ id: string }> }) {
  try { await requireTenantContext(); } catch (error) { if (error instanceof AuthenticationError || error instanceof TenantAccessError) redirect("/login"); throw error; }
  const { id } = await params;
  return <ApplicationShell pageTitle="Terms" pageContext="Manage semesters and teaching periods" selectedKey="academic"><div className="management-page academic-terms-page"><div className="management-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/academic/years">Academic years</Link><span>/</span><Link href={`/academic/years/${id}`}>Details</Link><span>/</span><strong>Terms</strong></div><section className="management-page-hero"><div className="management-page-hero-copy"><div className="management-hero-icon management-hero-icon-blue"><CalendarOutlined /></div><div><h1>Terms</h1><p>Add and manage the semesters or teaching periods used in this academic year.</p></div></div></section><TermManagement id={id} /></div></ApplicationShell>;
}
