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
  return (
    <ApplicationShell pageTitle="Terms" pageContext="Create and manage semesters or teaching periods" selectedKey="academic">
      <main className="academic-redesign">
        <div className="management-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/academic/years">Academic years</Link><span>/</span><Link href={`/academic/years/${id}`}>Academic year</Link><span>/</span><strong>Terms</strong></div>
        <section className="academic-redesign-hero">
          <div className="academic-redesign-eyebrow"><CalendarOutlined /> Academic structure</div>
          <div className="academic-redesign-hero-main"><div><h1 className="academic-redesign-title">Terms</h1><p className="academic-redesign-description">Add the semesters or teaching periods used inside this academic year. Keep the names simple and familiar to your staff and students.</p></div></div>
        </section>
        <TermManagement id={id} />
      </main>
    </ApplicationShell>
  );
}
